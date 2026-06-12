/**
 * Import Export Module - Import/Export Passwords and Config
 */
import { decryptData } from './crypto.js';
import { savePasswords } from '../utils/storage.js';

/**
 * Export passwords
 * @param {string} format - Export format (encrypted or plaintext)
 * @param {boolean} includePasswords - Include passwords in export
 * @param {boolean} includeNotes - Include notes in export
 * @param {boolean} includeMetadata - Include metadata in export
 * @param {Function} showNotification - Notification function
 */
export function exportPasswords(format, includePasswords, includeNotes, includeMetadata, showNotification) {
    const data = localStorage.getItem('vault');
    let exportData;

    if (format === 'encrypted') {
        exportData = data;
    } else {
        try {
            const decrypted = decryptData(data);
            const passwords = JSON.parse(decrypted);

            const filteredPasswords = passwords.map(password => {
                return {
                    id: password.id,
                    site: password.site,
                    siteUrl: password.siteUrl,
                    username: password.username,
                    password: includePasswords ? password.password : undefined,
                    notes: includeNotes ? password.notes : undefined,
                    createdAt: includeMetadata ? password.createdAt : undefined,
                    updatedAt: includeMetadata ? password.updatedAt : undefined,
                    category: password.category,
                    isFavorite: password.isFavorite
                };
            });

            exportData = JSON.stringify(filteredPasswords, null, 2);
        } catch (error) {
            if (showNotification) showNotification('错误', '解密数据失败: ' + error.message, 'error');
            return;
        }
    }

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securepass-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);

    if (showNotification) showNotification('成功', '密码导出成功', 'success');
}

/**
 * Import passwords from file
 * @param {Function} showNotification - Notification function
 */
export function importPasswords(showNotification) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                window.importData = event.target.result;
                document.getElementById('importOptionsModal').classList.add('active');
            } catch (error) {
                if (showNotification) showNotification('错误', '导入失败: ' + error.message, 'error');
            }
        };

        reader.readAsText(file);
    });

    fileInput.click();
}

/**
 * Process imported data
 * @param {string} data - Import data
 * @param {string} importMode - Import mode (replace or merge)
 * @param {string} conflictResolution - Conflict resolution (overwrite, keep, rename)
 * @param {Array} currentPasswords - Current passwords
 * @param {Function} showNotification - Notification function
 * @returns {Array} Merged passwords
 */
export function processImportData(data, importMode, conflictResolution, currentPasswords, showNotification) {
    let parsedData;
    
    try {
        parsedData = JSON.parse(data);
    } catch (error) {
        try {
            const decrypted = decryptData(data);
            parsedData = JSON.parse(decrypted);
        } catch (err) {
            if (showNotification) showNotification('错误', '文件格式不正确或解密失败', 'error');
            return currentPasswords;
        }
    }

    if (!Array.isArray(parsedData)) {
        if (showNotification) showNotification('错误', '导入文件格式不正确', 'error');
        return currentPasswords;
    }

    if (importMode === 'replace') {
        savePasswords(parsedData);
        return parsedData;
    } else {
        const merged = mergePasswords(currentPasswords, parsedData, conflictResolution);
        savePasswords(merged);
        return merged;
    }
}

/**
 * Merge password arrays
 * @param {Array} current - Current passwords
 * @param {Array} imported - Imported passwords
 * @param {string} conflictResolution - Conflict resolution strategy
 * @returns {Array} Merged passwords
 */
function mergePasswords(current, imported, conflictResolution) {
    const merged = [...current];

    imported.forEach(importedPassword => {
        const existingIndex = current.findIndex(p => p.id === importedPassword.id);

        if (existingIndex !== -1) {
            switch (conflictResolution) {
                case 'overwrite':
                    merged[existingIndex] = importedPassword;
                    break;
                case 'keep':
                    break;
                case 'rename':
                    const renamedPassword = {
                        ...importedPassword,
                        id: Date.now().toString()
                    };
                    merged.push(renamedPassword);
                    break;
            }
        } else {
            merged.push(importedPassword);
        }
    });

    return merged;
}

/**
 * Export configuration
 * @param {Object} config - Configuration to export
 * @param {Function} showNotification - Notification function
 */
export function exportConfig(config, showNotification) {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'securepass_config.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);

    if (showNotification) showNotification('成功', '配置已导出', 'success');
}

/**
 * Import configuration
 * @param {Object} config - Configuration object
 * @param {Function} validateFn - Validation function
 * @param {Function} applyFn - Apply function
 * @param {Function} showNotification - Notification function
 * @returns {boolean} True if valid
 */
export function importConfig(config, validateFn, applyFn, showNotification) {
    if (!validateFn(config)) {
        if (showNotification) showNotification('错误', '配置文件格式不正确', 'error');
        return false;
    }

    applyFn(config);
    if (showNotification) showNotification('成功', '配置已导入', 'success');
    return true;
}

/**
 * Validate config format
 * @param {Object} config - Config to validate
 * @returns {boolean} True if valid
 */
export function validateConfig(config) {
    return config &&
        typeof config === 'object' &&
        config.storageConfig &&
        config.preferences;
}

/**
 * Setup import export handlers
 * @param {Object} handlers - Event handlers
 */
export function setupImportExportHandlers(handlers = {}) {
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn && handlers.onExportClick) {
        exportBtn.addEventListener('click', handlers.onExportClick);
    }

    // Import button
    const importBtn = document.getElementById('importBtn');
    if (importBtn && handlers.onImportClick) {
        importBtn.addEventListener('click', handlers.onImportClick);
    }

    // Confirm export options
    const confirmExportBtn = document.getElementById('confirmExportOptionsBtn');
    if (confirmExportBtn && handlers.onConfirmExport) {
        confirmExportBtn.addEventListener('click', handlers.onConfirmExport);
    }

    // Confirm import options
    const confirmImportBtn = document.getElementById('confirmImportOptionsBtn');
    if (confirmImportBtn && handlers.onConfirmImport) {
        confirmImportBtn.addEventListener('click', handlers.onConfirmImport);
    }

    // Cancel buttons
    const cancelExportBtn = document.getElementById('cancelExportOptionsBtn');
    if (cancelExportBtn) {
        cancelExportBtn.addEventListener('click', () => {
            document.getElementById('exportOptionsModal').classList.remove('active');
        });
    }

    const cancelImportBtn = document.getElementById('cancelImportOptionsBtn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            document.getElementById('importOptionsModal').classList.remove('active');
        });
    }
}
