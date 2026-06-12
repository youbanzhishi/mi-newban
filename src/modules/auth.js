/**
 * Auth Module - Master Password Authentication
 */
import { deriveKey, setMasterKey } from './crypto.js';
import { savePasswords, loadPasswords, vaultExists } from '../utils/storage.js';

/**
 * Handle login attempt
 * @param {string} masterPassword - Master password
 * @param {string} confirmPassword - Confirmation password (for new vault)
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {boolean} True if login successful
 */
export function handleLogin(masterPassword, confirmPassword, onSuccess, onError) {
    if (!masterPassword) {
        if (onError) onError('请输入主密码');
        return false;
    }

    const isFirstLogin = !vaultExists();

    if (isFirstLogin) {
        if (masterPassword !== confirmPassword) {
            if (onError) onError('两次输入的密码不一致');
            return false;
        }
        return createVault(masterPassword, onSuccess, onError);
    } else {
        return unlockVault(masterPassword, onSuccess, onError);
    }
}

/**
 * Create new vault
 * @param {string} masterPassword - Master password
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {boolean} True if vault created successfully
 */
function createVault(masterPassword, onSuccess, onError) {
    try {
        const key = deriveKey(masterPassword);
        setMasterKey(key);
        savePasswords([]);
        
        if (onSuccess) onSuccess();
        return true;
    } catch (error) {
        if (onError) onError('创建保险库失败: ' + error.message);
        return false;
    }
}

/**
 * Unlock existing vault
 * @param {string} masterPassword - Master password
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {boolean} True if vault unlocked successfully
 */
function unlockVault(masterPassword, onSuccess, onError) {
    try {
        const key = deriveKey(masterPassword);
        setMasterKey(key);
        
        // Try to load passwords to verify key
        const passwords = loadPasswords();
        if (passwords === null) {
            // Decryption failed
            if (onError) onError('密码错误，请重试');
            return false;
        }
        
        if (onSuccess) onSuccess();
        return true;
    } catch (error) {
        if (onError) onError('解锁失败: ' + error.message);
        return false;
    }
}

/**
 * Get login form elements and setup handlers
 * @param {Object} handlers - Event handlers
 */
export function setupLoginHandlers(handlers = {}) {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const masterPassword = document.getElementById('masterPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (handlers.onLogin) {
            handlers.onLogin(masterPassword, confirmPassword);
        }
    });
}
