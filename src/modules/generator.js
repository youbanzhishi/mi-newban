/**
 * Generator Module - Password Generator
 */

/**
 * Generate random password
 * @param {number} length - Password length
 * @param {Object} options - Generation options
 * @param {boolean} options.uppercase - Include uppercase letters
 * @param {boolean} options.lowercase - Include lowercase letters
 * @param {boolean} options.numbers - Include numbers
 * @param {boolean} options.symbols - Include symbols
 * @returns {string} Generated password
 */
export function generatePassword(length, options = {}) {
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
        return '请至少选择一种字符类型';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

/**
 * Copy generated password to clipboard
 * @param {string} password - Password to copy
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export function copyToClipboard(password, onSuccess, onError) {
    if (!password) return;

    const textArea = document.createElement('textarea');
    textArea.value = password;
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.opacity = 0;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful && onSuccess) {
            onSuccess();
        } else if (onError) {
            onError('复制失败');
        }
    } catch (err) {
        if (navigator.clipboard && onSuccess) {
            navigator.clipboard.writeText(password).then(onSuccess).catch(onError);
        } else if (onError) {
            onError(err);
        }
    } finally {
        document.body.removeChild(textArea);
    }
}

/**
 * Setup generator handlers
 * @param {Object} handlers - Event handlers
 */
export function setupGeneratorHandlers(handlers = {}) {
    // Main generator button
    const generateBtn = document.getElementById('generatePasswordBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            handlers.onShowModal?.();
        });
    }

    // Regenerate button
    const regenerateBtn = document.getElementById('regeneratePasswordBtn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
            handlers.onGenerate?.();
        });
    }

    // Copy button
    const copyBtn = document.getElementById('copyGeneratedPassword');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const password = document.getElementById('generatedPassword')?.value;
            handlers.onCopy?.(password);
        });
    }

    // Length slider
    const lengthSlider = document.getElementById('genPasswordLength');
    if (lengthSlider) {
        lengthSlider.addEventListener('input', () => {
            const lengthValue = document.getElementById('genLengthValue');
            if (lengthValue) lengthValue.textContent = lengthSlider.value;
            handlers.onGenerate?.();
        });
    }

    // Option checkboxes
    const optionIds = ['genUppercase', 'genLowercase', 'genNumbers', 'genSymbols'];
    optionIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                handlers.onGenerate?.();
            });
        }
    });

    // Close modal
    const closeBtn = document.getElementById('closeGeneratePasswordModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            handlers.onCloseModal?.();
        });
    }
}

/**
 * Show generator modal
 */
export function showGeneratorModal() {
    const modal = document.getElementById('generatePasswordModal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Hide generator modal
 */
export function hideGeneratorModal() {
    const modal = document.getElementById('generatePasswordModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Update generated password display
 * @param {string} password - Generated password
 */
export function updateGeneratedPasswordDisplay(password) {
    const display = document.getElementById('generatedPassword');
    if (display) {
        display.value = password;
    }
}
