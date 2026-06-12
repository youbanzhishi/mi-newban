/**
 * Password Modal Module
 * 处理密码添加/编辑/删除模态框
 */
import { generatePassword } from './generator.js';
import { savePasswords } from '../utils/storage.js';

// 共享状态引用
let state = null;

export function initPasswordModalModule(appState) {
    state = appState;
}

// 当前编辑的密码ID（新增或编辑）
let editingPasswordId = null;

/**
 * 显示密码模态框
 */
export function showPasswordModal(passwordId = null) {
    editingPasswordId = passwordId;
    const modal = document.getElementById('passwordModal');
    const form = document.getElementById('passwordForm');
    
    // 重置表单
    form.reset();
    
    if (passwordId) {
        // 编辑模式
        const password = state.passwords.find(p => p.id === passwordId);
        if (!password) return;
        
        document.getElementById('modalTitle').textContent = '编辑密码';
        document.getElementById('site').value = password.site || '';
        document.getElementById('siteUrl').value = password.siteUrl || '';
        document.getElementById('username').value = password.username || '';
        document.getElementById('password').value = password.password || '';
        document.getElementById('categorySelect').value = password.category || '';
        document.getElementById('notes').value = password.notes || '';
        document.getElementById('iconSelect').value = password.icon || 'fas fa-key';
    } else {
        // 新增模式
        document.getElementById('modalTitle').textContent = '添加密码';
        document.getElementById('site').value = '';
        document.getElementById('siteUrl').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('categorySelect').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('iconSelect').value = 'fas fa-key';
    }
    
    modal.classList.add('active');
    document.getElementById('site').focus();
}

/**
 * 隐藏密码模态框
 */
export function hidePasswordModal() {
    editingPasswordId = null;
    document.getElementById('passwordModal').classList.remove('active');
}

/**
 * 保存密码
 */
export function savePassword() {
    const site = document.getElementById('site').value.trim();
    const siteUrl = document.getElementById('siteUrl').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const category = document.getElementById('categorySelect').value;
    const notes = document.getElementById('notes').value.trim();
    const icon = document.getElementById('iconSelect').value;

    if (!site) {
        if (state.showNotification) state.showNotification('错误', '请输入网站/应用名称', 'error');
        return;
    }
    if (!username) {
        if (state.showNotification) state.showNotification('错误', '请输入用户名', 'error');
        return;
    }
    if (!password) {
        if (state.showNotification) state.showNotification('错误', '请输入密码', 'error');
        return;
    }

    if (editingPasswordId) {
        // 更新现有密码
        const index = state.passwords.findIndex(p => p.id === editingPasswordId);
        if (index !== -1) {
            state.passwords[index] = {
                ...state.passwords[index],
                site,
                siteUrl,
                username,
                password,
                category,
                notes,
                icon,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // 新增密码
        const newPassword = {
            id: generatePasswordId(),
            site,
            siteUrl,
            username,
            password,
            category,
            notes,
            icon,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        state.passwords.push(newPassword);
    }

    savePasswords(state.passwords);
    hidePasswordModal();
    
    // 刷新列表并显示详情
    if (state.renderPasswordList) state.renderPasswordList();
    
    if (editingPasswordId) {
        if (state.showNotification) state.showNotification('成功', '密码已更新', 'success');
        if (state.showPasswordDetails) state.showPasswordDetails(editingPasswordId);
    } else {
        if (state.showNotification) state.showNotification('成功', '密码已添加', 'success');
    }
}

/**
 * 删除密码
 */
export function deletePassword() {
    if (!state.currentPasswordId) return;
    
    if (!confirm('确定要删除此密码吗？此操作不可撤销。')) return;

    state.passwords = state.passwords.filter(p => p.id !== state.currentPasswordId);
    state.favorites = state.favorites.filter(id => id !== state.currentPasswordId);
    state.recentPasswords = state.recentPasswords.filter(id => id !== state.currentPasswordId);
    
    savePasswords(state.passwords);
    if (state.saveFavorites) state.saveFavorites(state.favorites);
    if (state.saveRecentPasswords) state.saveRecentPasswords(state.recentPasswords);
    
    if (state.clearPasswordDetails) state.clearPasswordDetails();
    if (state.renderPasswordList) state.renderPasswordList();
    
    if (state.showNotification) state.showNotification('成功', '密码已删除', 'success');
}

/**
 * 编辑密码（从详情页进入编辑模式）
 */
export function editPassword() {
    if (!state.currentPasswordId) return;
    showPasswordModal(state.currentPasswordId);
}

/**
 * 生成密码ID
 */
function generatePasswordId() {
    return 'pwd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 模态框内生成密码
 */
export function generatePasswordInModal() {
    const length = parseInt(document.getElementById('passwordLength')?.value) || 16;
    const password = generatePassword(length, {
        uppercase: document.getElementById('uppercase')?.checked,
        lowercase: document.getElementById('lowercase')?.checked,
        numbers: document.getElementById('numbers')?.checked,
        symbols: document.getElementById('symbols')?.checked
    });
    document.getElementById('password').value = password;
    document.getElementById('password').type = 'text';
}
