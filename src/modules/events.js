/**
 * Events Module
 * 所有事件监听器设置
 */
import { generatePassword, showGeneratorModal, hideGeneratorModal, copyToClipboard } from './generator.js';
import { showPasswordModal, generatePasswordInModal } from './password-modal.js';
import { filterPasswords, filterPasswordsByView } from './password-filter.js';
import { showSecurityAuditModal, hideSecurityAuditModal, runSecurityAudit } from './security-audit.js';
import { showVersionsModal } from './version.js';
import { showStorageModal, hideStorageModal, saveStorageConfig as saveStorageConfigAction } from './storage-config.js';
import { 
    showPreferencesModal, 
    hidePreferencesModal, 
    toggleSidebar,
    savePreferences
} from './settings.js';
import { 
    showBookmarkModal, 
    hideBookmarkModal, 
    showFolderModal, 
    hideFolderModal
} from './bookmark.js';
import { addGitRepoItem } from './storage-config.js';

// 共享状态引用
let state = null;

export function initEventsModule(appState) {
    state = appState;
}

/**
 * 设置所有事件监听器
 */
export function setupEventListeners() {
    // 每个子setup函数独立try-catch，防止单个失败阻断其余
    const setupFns = [
        ['Login', setupLoginEvents],
        ['Navigation', setupNavigationEvents],
        ['Password', setupPasswordEvents],
        ['Search', setupSearchEvents],
        ['Sync', setupSyncEvents],
        ['ImportExport', setupImportExportEvents],
        ['Storage', setupStorageEvents],
        ['Preferences', setupPreferencesEvents],
        ['Generator', setupGeneratorEvents],
        ['SecurityAudit', setupSecurityAuditEvents],
        ['Bookmark', setupBookmarkEvents],
        ['Other', setupOtherEvents],
    ];
    for (const [name, fn] of setupFns) {
        try {
            fn();
        } catch (err) {
            console.error(`[MI] setup${name}Events failed:`, err);
        }
    }
}

/**
 * 设置模态框关闭处理
 */
export function setupModalCloseHandlers() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ========== Login Events ==========
function setupLoginEvents() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('[MI] loginForm not found in DOM');
        return;
    }
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.handleLogin) {
            state.handleLogin();
        }
    });
}

// ========== Navigation Events ==========
function setupNavigationEvents() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            filterPasswordsByView(view);
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            if (state.showPasswordContainer) state.showPasswordContainer();
        });
    });
}

// ========== Password Events ==========
function setupPasswordEvents() {
    // Add password
    document.getElementById('addPasswordBtn').addEventListener('click', () => showPasswordModal());

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.savePassword) state.savePassword();
    });
    document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
        if (state.hidePasswordModal) state.hidePasswordModal();
    });

    // Password detail actions
    document.getElementById('revealPasswordBtn').addEventListener('click', () => {
        if (state.togglePasswordVisibility) state.togglePasswordVisibility();
    });
    document.getElementById('copyPasswordBtn').addEventListener('click', () => {
        if (state.copyPasswordToClipboard) state.copyPasswordToClipboard();
    });
    document.getElementById('editPasswordBtn').addEventListener('click', () => {
        if (state.editPassword) state.editPassword();
    });
    document.getElementById('deletePasswordBtn').addEventListener('click', () => {
        if (state.deletePassword) state.deletePassword();
    });

    // Toggle password visibility in form
    document.getElementById('togglePasswordVisibility')?.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = document.querySelector('#togglePasswordVisibility i');
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

    // Generate password in modal
    document.getElementById('generatePasswordBtnModal')?.addEventListener('click', () => generatePasswordInModal());

    // Password length slider
    document.getElementById('passwordLength')?.addEventListener('input', () => {
        const lengthValue = document.getElementById('lengthValue');
        if (lengthValue) lengthValue.textContent = document.getElementById('passwordLength').value;
    });

    // Favorite toggle
    document.getElementById('toggleFavoriteBtn').addEventListener('click', () => {
        if (state.toggleFavorite) state.toggleFavorite();
    });

    // Category save
    document.getElementById('saveCategoryBtn')?.addEventListener('click', () => {
        const newCategory = document.getElementById('categorySelect')?.value;
        if (state.updatePasswordCategory && state.currentPasswordId) {
            state.updatePasswordCategory(state.currentPasswordId, newCategory);
        }
    });
}

// ========== Search Events ==========
function setupSearchEvents() {
    document.getElementById('searchInput').addEventListener('input', (e) => filterPasswords(e.target.value));
}

// ========== Sync Events ==========
function setupSyncEvents() {
    document.getElementById('syncBtn').addEventListener('click', () => {
        if (state.syncPasswords) state.syncPasswords();
    });
    document.getElementById('confirmSyncBtn')?.addEventListener('click', () => {
        state.commitMsg = document.getElementById('syncCommitMessage')?.value;
        if (state.syncPasswords) state.syncPasswords();
        document.getElementById('syncModal')?.classList.remove('active');
    });
    document.getElementById('cancelSyncBtn')?.addEventListener('click', () => {
        document.getElementById('syncModal')?.classList.remove('active');
    });
}

// ========== Import/Export Events ==========
function setupImportExportEvents() {
    document.getElementById('importBtn').addEventListener('click', () => {
        if (state.importPasswords) state.importPasswords();
    });
    document.getElementById('exportBtn').addEventListener('click', () => {
        document.getElementById('exportOptionsModal')?.classList.add('active');
    });
    document.getElementById('confirmExportOptionsBtn')?.addEventListener('click', () => {
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'plaintext';
        const includePasswords = document.getElementById('includePasswords')?.checked ?? true;
        const includeNotes = document.getElementById('includeNotes')?.checked ?? true;
        const includeMetadata = document.getElementById('includeMetadata')?.checked ?? true;
        if (state.exportPasswords) state.exportPasswords(format, includePasswords, includeNotes, includeMetadata);
        document.getElementById('exportOptionsModal')?.classList.remove('active');
    });
    document.getElementById('cancelExportOptionsBtn')?.addEventListener('click', () => {
        document.getElementById('exportOptionsModal')?.classList.remove('active');
    });
    document.getElementById('confirmImportOptionsBtn')?.addEventListener('click', () => {
        const importMode = document.querySelector('input[name="importMode"]:checked')?.value || 'merge';
        const conflictResolution = document.querySelector('input[name="conflictResolution"]:checked')?.value || 'rename';
        if (state.processImportData) state.processImportData(state.importData, importMode, conflictResolution);
        document.getElementById('importOptionsModal')?.classList.remove('active');
    });
    document.getElementById('cancelImportOptionsBtn')?.addEventListener('click', () => {
        document.getElementById('importOptionsModal')?.classList.remove('active');
    });

    // Config import/export
    document.getElementById('exportConfigBtn').addEventListener('click', () => {
        if (state.exportConfig) state.exportConfig();
    });
    document.getElementById('importConfigBtn').addEventListener('click', () => {
        document.getElementById('importConfigModal')?.classList.add('active');
    });
    document.getElementById('confirmImportBtn')?.addEventListener('click', () => {
        if (state.importConfigFromFile) state.importConfigFromFile();
    });
    document.getElementById('cancelImportBtn')?.addEventListener('click', () => {
        document.getElementById('importConfigModal')?.classList.remove('active');
    });

    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal')?.classList.remove('active');
        });
    });
}

// ========== Storage Events ==========
function setupStorageEvents() {
    document.getElementById('storageSettingsBtn').addEventListener('click', () => showStorageModal());
    document.getElementById('configureStorageBtn').addEventListener('click', () => showStorageModal());
    document.querySelectorAll('.storage-type').forEach(btn => {
        btn.addEventListener('click', () => {
            // 动态导入以避免循环依赖
            import('./storage-config.js').then(module => {
                module.selectStorageType(btn.dataset.type);
            });
        });
    });
    document.getElementById('saveStorageBtn').addEventListener('click', () => saveStorageConfigAction());
    document.getElementById('cancelStorageBtn').addEventListener('click', () => hideStorageModal());
    document.getElementById('addGithubRepoBtn')?.addEventListener('click', () => addGitRepoItem());
}

// ========== Preferences Events ==========
function setupPreferencesEvents() {
    document.getElementById('preferencesBtn').addEventListener('click', () => showPreferencesModal());
    document.getElementById('savePreferencesBtn').addEventListener('click', () => savePreferences());
    document.getElementById('cancelPreferencesBtn').addEventListener('click', () => hidePreferencesModal());
}

// ========== Generator Events ==========
function setupGeneratorEvents() {
    document.getElementById('generatePasswordBtn').addEventListener('click', () => {
        if (state.showGeneratePasswordModal) state.showGeneratePasswordModal();
    });

    // 密码生成器处理
    setupGeneratorEventHandlers();
}

// ========== Security Audit Events ==========
function setupSecurityAuditEvents() {
    document.getElementById('securityAuditBtn').addEventListener('click', () => showSecurityAuditModal());
    document.getElementById('runAuditBtn')?.addEventListener('click', () => runSecurityAudit());
    document.getElementById('closeAuditBtn')?.addEventListener('click', () => hideSecurityAuditModal());
}

// ========== Bookmark Events ==========
function setupBookmarkEvents() {
    document.getElementById('bookmarksBtn')?.addEventListener('click', () => {
        if (state.showBookmarks) state.showBookmarks();
    });
    document.getElementById('addBookmarkBtn')?.addEventListener('click', () => showBookmarkModal());
    document.getElementById('addFolderBtn')?.addEventListener('click', () => showFolderModal());
    document.getElementById('importBookmarksBtn')?.addEventListener('click', () => {
        if (state.importBookmarks) state.importBookmarks();
    });
    document.getElementById('exportBookmarksBtn')?.addEventListener('click', () => {
        if (state.exportBookmarks) state.exportBookmarks();
    });
    document.getElementById('deleteAllBookmarksBtn')?.addEventListener('click', () => {
        if (state.deleteAllBookmarks) state.deleteAllBookmarks();
    });
    document.getElementById('bookmarkSearch')?.addEventListener('input', (e) => {
        if (state.filterBookmarksList) state.filterBookmarksList(e.target.value);
    });
    document.getElementById('bookmarkForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.saveBookmark) state.saveBookmark();
    });
    document.getElementById('folderForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (state.saveFolder) state.saveFolder();
    });
    document.getElementById('cancelBookmarkBtn')?.addEventListener('click', () => hideBookmarkModal());
    document.getElementById('cancelFolderBtn')?.addEventListener('click', () => hideFolderModal());

    // History versions
    document.getElementById('versionsBtn').addEventListener('click', () => showVersionsModal());
}

// ========== Other Events ==========
function setupOtherEvents() {
    // Sidebar collapse
    document.getElementById('collapseBtn')?.addEventListener('click', () => toggleSidebar());
}

// ========== Generator Handlers ==========
function setupGeneratorEventHandlers() {
    const genModal = document.getElementById('generatePasswordModal');
    if (!genModal) return;

    // Close button
    genModal.querySelector('.close-modal')?.addEventListener('click', () => hideGeneratorModal());
    genModal.querySelector('.cancel-btn')?.addEventListener('click', () => hideGeneratorModal());

    // Generate button
    genModal.querySelector('.generate-btn')?.addEventListener('click', () => {
        if (state.genPassword) state.genPassword();
    });

    // Copy button
    genModal.querySelector('.copy-btn')?.addEventListener('click', () => {
        const displayEl = document.getElementById('generatedPasswordDisplay');
        if (displayEl) {
            copyToClipboard(displayEl.textContent,
                () => state.showNotification?.('成功', '密码已复制到剪贴板', 'success'),
                (err) => state.showNotification?.('错误', '复制失败: ' + err, 'error')
            );
        }
    });

    // Length slider
    const lengthSlider = genModal.querySelector('#genPasswordLength');
    const lengthValue = genModal.querySelector('#genLengthValue');
    if (lengthSlider && lengthValue) {
        lengthSlider.addEventListener('input', () => {
            lengthValue.textContent = lengthSlider.value;
        });
    }
}
