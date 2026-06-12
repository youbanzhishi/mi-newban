/**
 * Crypto Module - Encryption/Decryption Engine
 * Uses CryptoJS AES for secure data encryption
 */

let masterKey = null;

/**
 * Derive encryption key from master password
 * @param {string} password - Master password
 * @returns {string} Derived key (SHA256 hash)
 */
export function deriveKey(password) {
    return CryptoJS.SHA256(password).toString();
}

/**
 * Set the master encryption key
 * @param {string} key - Derived key
 */
export function setMasterKey(key) {
    masterKey = key;
}

/**
 * Get the current master encryption key
 * @returns {string|null} Current master key
 */
export function getMasterKey() {
    return masterKey;
}

/**
 * Encrypt data using AES
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted ciphertext
 */
export function encryptData(data) {
    if (!masterKey) {
        throw new Error('Master key not set');
    }
    return CryptoJS.AES.encrypt(data, masterKey).toString();
}

/**
 * Decrypt data using AES
 * @param {string} ciphertext - Encrypted data
 * @returns {string} Decrypted plaintext
 */
export function decryptData(ciphertext) {
    if (!masterKey) {
        throw new Error('Master key not set');
    }
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, masterKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {Object} Strength result with text and color
 */
export function calculatePasswordStrength(password) {
    let strength = 1;
    let hasUpper = /[A-Z]/.test(password);
    let hasLower = /[a-z]/.test(password);
    let hasDigit = /[0-9]/.test(password);
    let hasSymbol = /[^A-Za-z0-9]/.test(password);
    let length = password.length;

    // Length scoring
    if (length > 10) strength += 2;
    else if (length > 7) strength += 1;

    // Character type scoring
    if (hasUpper) strength += 1;
    if (hasLower) strength += 1;
    if (hasDigit) strength += 1;
    if (hasSymbol) strength += 1;

    // Reset strength bars
    const bars = document.querySelectorAll('.strength-bar');
    bars.forEach(bar => {
        bar.className = 'strength-bar';
    });
    const strengthText = document.getElementById('passwordStrengthText');

    // Set strength based on score
    if (strength <= 2) {
        bars[0]?.classList.add('weak');
        if (strengthText) strengthText.textContent = '弱';
        if (strengthText) strengthText.style.color = 'var(--danger)';
        return { text: '弱', color: 'var(--danger)' };
    } else if (strength <= 4) {
        bars[0]?.classList.add('moderate');
        bars[1]?.classList.add('moderate');
        if (strengthText) strengthText.textContent = '中等';
        if (strengthText) strengthText.style.color = 'var(--warning)';
        return { text: '中等', color: 'var(--warning)' };
    } else if (strength <= 6) {
        bars[0]?.classList.add('strong');
        bars[1]?.classList.add('strong');
        bars[2]?.classList.add('strong');
        if (strengthText) strengthText.textContent = '强';
        if (strengthText) strengthText.style.color = 'var(--secondary)';
        return { text: '强', color: 'var(--secondary)' };
    } else {
        bars[0]?.classList.add('very-strong');
        bars[1]?.classList.add('very-strong');
        bars[2]?.classList.add('very-strong');
        bars[3]?.classList.add('very-strong');
        if (strengthText) strengthText.textContent = '非常强';
        if (strengthText) strengthText.style.color = 'var(--primary)';
        return { text: '非常强', color: 'var(--primary)' };
    }
}

/**
 * Check if password has been compromised (simplified)
 * @param {string} password - Password to check
 * @returns {boolean} True if password is in weak passwords list
 */
export function checkPasswordBreach(password) {
    const weakPasswords = [
        'password', '123456', '12345678', '123456789', 'qwerty',
        'abc123', 'password1', '12345', '1234567', 'admin'
    ];
    return weakPasswords.includes(password.toLowerCase());
}

/**
 * Generate a random password
 * @param {number} length - Password length
 * @param {Object} options - Character set options
 * @returns {string} Generated password
 */
export function generateRandomPassword(length, options = {}) {
    const {
        uppercase = true,
        lowercase = true,
        numbers = true,
        symbols = true
    } = options;

    let charset = '';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
        return '';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

/**
 * Check password reuse count
 * @param {string} password - Password to check
 * @param {Array} passwords - Array of password objects
 * @returns {number} Number of accounts using the same password
 */
export function checkPasswordReuse(password, passwords) {
    return passwords.filter(p => p.password === password).length;
}
