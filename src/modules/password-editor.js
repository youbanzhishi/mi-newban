/**
 * Password Editor Module - Add/Edit/Delete Passwords
 */
import { calculatePasswordStrength } from './crypto.js';
import { savePasswords } from '../utils/storage.js';

/**
 * Show password modal for adding/editing
 * @param {Object|null} password - Password object for editing, null for new
 */
export function showPasswordModal(password = null) {
    const modal = document.getElementById('passwordModal');
    const title = document.getElementById('modalTitle');
    
    if (password) {
        title.textContent = '编辑密码';
        document.getElementById('passwordId').value = password.id;
        document.getElementById('siteName').value = password.site;
        document.getElementById('siteUrl').value = password.siteUrl || '';
        document.getElementById('username').value = password.username;
        document.getElementById('password').value = password.password;
        document.getElementById('notes').value = password.notes || '';
    } else {
        title.textContent = '添加新密码';
        document.getElementById('passwordId').value = '';
        document.getElementById('siteName').value = '';
        document.getElementById('siteUrl').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('notes').value = '';
    }
    
    modal.classList.add('active');
}

/**
 * Hide password modal
 */
export function hidePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
}

/**
 * Save password from form
 * @param {Array} passwords - Current passwords array
 * @param {Function} onSaved - Callback after save
 * @returns {Array} Updated passwords array
 */
export function savePassword(passwords, onSaved) {
    const id = document.getElementById('passwordId').value;
    const site = document.getElementById('siteName').value;
    const siteUrl = document.getElementById('siteUrl').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const notes = document.getElementById('notes').value;

    if (!site || !username || !password) {
        if (window.passwordManager) {
            window.passwordManager.showNotification('错误', '请填写所有必填字段', 'error');
        }
        return passwords;
    }

    const now = new Date().toISOString();
    let updatedPasswords = [...passwords];

    if (id) {
        const index = updatedPasswords.findIndex(p => p.id === id);
        if (index !== -1) {
            updatedPasswords[index] = {
                ...updatedPasswords[index],
                site,
                siteUrl,
                username,
                password,
                notes,
                updatedAt: now
            };
        }
    } else {
        const newPassword = {
            id: Date.now().toString(),
            site,
            siteUrl,
            username,
            password,
            notes,
            createdAt: now,
            updatedAt: now,
            isFavorite: false,
            category: '未分类'
        };
        updatedPasswords.push(newPassword);
    }

    savePasswords(updatedPasswords);
    hidePasswordModal();
    
    if (onSaved) onSaved(updatedPasswords);
    
    return updatedPasswords;
}

/**
 * Delete password
 * @param {string} passwordId - Password ID to delete
 * @param {Array} passwords - Current passwords array
 * @param {Function} onDeleted - Callback after delete
 * @returns {Array} Updated passwords array
 */
export function deletePassword(passwordId, passwords, onDeleted) {
    if (!confirm('确定要删除此密码吗？此操作无法撤销。')) {
        return passwords;
    }

    const updatedPasswords = passwords.filter(p => p.id !== passwordId);
    savePasswords(updatedPasswords);
    
    if (onDeleted) onDeleted(updatedPasswords);
    
    return updatedPasswords;
}

/**
 * Setup password form handlers
 * @param {Object} handlers - Event handlers
 */
export function setupPasswordFormHandlers(handlers = {}) {
    const form = document.getElementById('passwordForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (handlers.onSave) handlers.onSave();
        });
    }

    const cancelBtn = document.getElementById('cancelPasswordBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hidePasswordModal();
        });
    }

    const toggleBtn = document.getElementById('togglePasswordVisibility');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = toggleBtn.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    const generateBtn = document.getElementById('generatePasswordBtnModal');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const length = parseInt(document.getElementById('passwordLength').value) || 16;
            const uppercase = document.getElementById('uppercase').checked;
            const lowercase = document.getElementById('lowercase').checked;
            const numbers = document.getElementById('numbers').checked;
            const symbols = document.getElementById('symbols').checked;

            let charset = '';
            if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (numbers) charset += '0123456789';
            if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

            if (!charset) {
                if (window.passwordManager) {
                    window.passwordManager.showNotification('错误', '请至少选择一种字符类型', 'error');
                }
                return;
            }

            let generatedPassword = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                generatedPassword += charset[randomIndex];
            }

            document.getElementById('password').value = generatedPassword;
            document.getElementById('password').type = 'text';
        });
    }

    const lengthSlider = document.getElementById('passwordLength');
    if (lengthSlider) {
        lengthSlider.addEventListener('input', () => {
            const lengthValue = document.getElementById('lengthValue');
            if (lengthValue) lengthValue.textContent = lengthSlider.value;
        });
    }
}
