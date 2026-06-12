/**
 * Password Detail Module
 * 处理密码详情展示、查看、复制等操作
 */
import { calculatePasswordStrength, checkPasswordBreach } from './crypto.js';
import { saveFavorites } from '../utils/storage.js';

// 共享状态引用（由 main.js 初始化时注入）
let state = null;

export function initPasswordDetailModule(appState) {
    state = appState;
}

/**
 * 显示密码详情
 */
export function showPasswordDetails(id) {
    const password = state.passwords.find(p => p.id === id);
    if (!password) return;

    state.currentPasswordId = id;

    document.getElementById('detailTitle').textContent = password.site;
    document.getElementById('detailUsername').textContent = password.username;
    document.getElementById('detailPassword').textContent = '••••••••••••';
    document.getElementById('detailNotes').textContent = password.notes || '-';
    document.getElementById('detailCreated').textContent = new Date(password.createdAt).toLocaleString();
    document.getElementById('detailUpdated').textContent = new Date(password.updatedAt).toLocaleString();
    
    const urlElement = document.getElementById('detailUrl');
    if (urlElement) {
        urlElement.textContent = password.siteUrl || '-';
        urlElement.href = formatUrl(password.siteUrl);
    }
    
    document.getElementById('detailCategory').textContent = password.category || '未分类';
    document.getElementById('editPasswordBtn').disabled = false;
    document.getElementById('deletePasswordBtn').disabled = false;
    document.getElementById('revealPasswordBtn').innerHTML = '<i class="fas fa-eye"></i>';

    // 更新收藏按钮
    const favoriteBtn = document.getElementById('toggleFavoriteBtn');
    if (state.favorites.includes(id)) {
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i> 已收藏';
    } else {
        favoriteBtn.innerHTML = '<i class="far fa-star"></i> 添加到收藏夹';
    }

    // 密码强度
    const strength = calculatePasswordStrength(password.password);
    document.getElementById('detailStrength').textContent = strength.text;
    document.getElementById('detailStrength').style.color = strength.color;

    // 密码复用检查
    const reuseCount = state.passwords.filter(p => p.password === password.password).length;
    document.getElementById('detailReused').textContent = reuseCount > 1 ? `${reuseCount}个账户使用相同密码` : '未重复使用';
    document.getElementById('detailReused').style.color = reuseCount > 1 ? 'var(--danger)' : 'var(--secondary)';

    // 泄露检查
    const isBreached = checkPasswordBreach(password.password);
    document.getElementById('detailBreached').textContent = isBreached ? '已泄露（高风险）' : '安全（未泄露）';
    document.getElementById('detailBreached').style.color = isBreached ? 'var(--danger)' : 'var(--secondary)';

    // 更新列表选中状态
    document.querySelectorAll('.password-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });
}

/**
 * 切换密码可见性
 */
export function togglePasswordVisibility() {
    if (!state.currentPasswordId) return;
    const password = state.passwords.find(p => p.id === state.currentPasswordId);
    if (!password) return;

    const passwordText = document.getElementById('detailPassword');
    const revealBtn = document.getElementById('revealPasswordBtn');

    if (passwordText.textContent === '••••••••••••') {
        passwordText.textContent = password.password;
        revealBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordText.textContent = '••••••••••••';
        revealBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

/**
 * 复制密码到剪贴板
 */
export function copyPasswordToClipboard() {
    if (!state.currentPasswordId) return;
    const password = state.passwords.find(p => p.id === state.currentPasswordId);
    if (!password) return;

    navigator.clipboard.writeText(password.password).then(() => {
        if (state.showNotification) {
            state.showNotification('成功', '密码已复制到剪贴板', 'success');
        }
    }).catch(() => {
        if (state.showNotification) {
            state.showNotification('错误', '复制失败', 'error');
        }
    });
}

/**
 * 格式化 URL
 */
export function formatUrl(url) {
    if (!url) return '#';
    if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
    }
    return url;
}

/**
 * 清空密码详情
 */
export function clearPasswordDetails() {
    state.currentPasswordId = null;
    document.getElementById('detailTitle').textContent = '-';
    document.getElementById('detailUsername').textContent = '-';
    document.getElementById('detailPassword').textContent = '-';
    document.getElementById('detailNotes').textContent = '-';
    document.getElementById('detailCreated').textContent = '-';
    document.getElementById('detailUpdated').textContent = '-';
    document.getElementById('detailUrl').textContent = '-';
    document.getElementById('detailUrl').href = '#';
    document.getElementById('detailCategory').textContent = '-';
    document.getElementById('detailStrength').textContent = '-';
    document.getElementById('detailStrength').style.color = '';
    document.getElementById('detailReused').textContent = '-';
    document.getElementById('detailReused').style.color = '';
    document.getElementById('detailBreached').textContent = '-';
    document.getElementById('detailBreached').style.color = '';
    document.getElementById('editPasswordBtn').disabled = true;
    document.getElementById('deletePasswordBtn').disabled = true;
}

/**
 * 切换收藏状态
 */
export function toggleFavorite() {
    if (!state.currentPasswordId) return;
    const id = state.currentPasswordId;

    if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(fId => fId !== id);
        if (state.showNotification) {
            state.showNotification('成功', '已取消收藏', 'success');
        }
    } else {
        state.favorites.push(id);
        if (state.showNotification) {
            state.showNotification('成功', '已添加到收藏夹', 'success');
        }
    }

    saveFavorites(state.favorites);

    // 更新按钮状态
    const favoriteBtn = document.getElementById('toggleFavoriteBtn');
    if (state.favorites.includes(id)) {
        favoriteBtn.innerHTML = '<i class="fas fa-star"></i> 已收藏';
    } else {
        favoriteBtn.innerHTML = '<i class="far fa-star"></i> 添加到收藏夹';
    }
}

/**
 * 更新密码分类
 */
export function updatePasswordCategory(passwordId, newCategory) {
    const password = state.passwords.find(p => p.id === passwordId);
    if (!password) return;

    password.category = newCategory;
    password.updatedAt = new Date().toISOString();
    
    document.getElementById('detailCategory').textContent = newCategory || '未分类';
    
    if (state.showNotification) {
        state.showNotification('成功', '分类已更新', 'success');
    }
}

/**
 * 记录最近访问
 */
export function recordRecentAccess(id) {
    state.recentPasswords = state.recentPasswords.filter(rid => rid !== id);
    state.recentPasswords.unshift(id);
    if (state.recentPasswords.length > 10) {
        state.recentPasswords = state.recentPasswords.slice(0, 10);
    }
}
