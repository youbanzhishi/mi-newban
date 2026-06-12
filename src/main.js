/**
 * SecurePass Password Manager - Main Entry
 * 重构版本：将1525行拆分为多个模块，目标<150行
 */
import './styles/main.css';

// 导入加密相关
import { deriveKey, setMasterKey } from './modules/crypto.js';

// 导入存储相关
import { 
    loadPasswords,
    loadStorageConfig, saveStorageConfig, 
    loadPreferences, savePreferences, loadFavorites, saveFavorites, 
    loadRecentPasswords, saveRecentPasswords, vaultExists
} from './utils/storage.js';

// 导入导入导出
import { exportPasswords, importPasswords, processImportData, exportConfig, importConfig } from './modules/import-export.js';

// 导入模块
import { 
    initPasswordDetailModule, showPasswordDetails, togglePasswordVisibility, 
    copyPasswordToClipboard, clearPasswordDetails, toggleFavorite, updatePasswordCategory,
    recordRecentAccess
} from './modules/password-detail.js';
import { initPasswordModalModule, showPasswordModal, hidePasswordModal, savePassword, deletePassword, editPassword } from './modules/password-modal.js';
import { initPasswordFilterModule, renderPasswordList, filterPasswords, filterPasswordsByView } from './modules/password-filter.js';
import { initSecurityAuditModule, showSecurityAuditModal, hideSecurityAuditModal, runSecurityAudit } from './modules/security-audit.js';
import { initVersionModule, showVersionsModal } from './modules/version.js';
import { initStorageConfigModule, showStorageModal, hideStorageModal, saveStorageConfig as saveStorageConfigAction } from './modules/storage-config.js';
import { initEventsModule, setupEventListeners, setupModalCloseHandlers } from './modules/events.js';
import { initBookmarkViewModule, showBookmarks, showPasswordContainer, renderBookmarks } from './modules/bookmark-view.js';

// 导入设置相关
import { savePreferencesFromForm, populatePreferencesForm, showPreferencesModal, hidePreferencesModal, savePreferences as savePreferencesAction, toggleSidebar, updateStorageStatusDisplay, applySidebarState } from './modules/settings.js';

// 导入密码生成器
import { generatePassword, updateGeneratedPasswordDisplay } from './modules/generator.js';

/**
 * PasswordManager - 主应用类（精简版）
 */
class PasswordManager {
    constructor() {
        // 状态管理
        this.passwords = [];
        this.currentPasswordId = null;
        this.masterKey = null;
        this.commitMsg = null;
        this.storageConfig = { type: 'local', github: {}, webdav: {} };
        this.favorites = [];
        this.recentPasswords = [];
        this.preferences = {};
        this.bookmarks = [];
        this.folders = [];
        this.currentFolderId = null;
        this.currentBookmarkId = null;
        this.importData = null;

        this.init();
    }

    init() {
        this.loadStorageConfig();
        this.loadPreferences();
        this.loadBookmarks();
        this.loadFolders();
        this.cleanupInvalidReferences();
        // 注意：事件绑定在 DOMContentLoaded 中 initAllModules 之后调用
        applySidebarState();
    }

    cleanupInvalidReferences() {
        this.favorites = this.favorites.filter(id => this.passwords.some(p => p.id === id));
        this.recentPasswords = this.recentPasswords.filter(id => this.passwords.some(p => p.id === id));
        saveFavorites(this.favorites);
        saveRecentPasswords(this.recentPasswords);
    }

    // ========== 认证 ==========
    handleLogin() {
        const masterPassword = document.getElementById('masterPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!masterPassword) {
            this.showNotification('错误', '请输入主密码', 'error');
            return;
        }

        const isFirstLogin = !vaultExists();

        if (isFirstLogin) {
            if (masterPassword !== confirmPassword) {
                this.showNotification('错误', '两次输入的密码不一致', 'error');
                return;
            }
            this.createVault(masterPassword);
        } else {
            this.unlockVault(masterPassword);
        }
    }

    createVault(masterPassword) {
        try {
            this.masterKey = deriveKey(masterPassword);
            setMasterKey(this.masterKey);
            this.passwords = [];
            // 显示主界面
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
            this.showNotification('成功', '保险库已创建，请添加密码', 'success');
        } catch (error) {
            this.showNotification('错误', '创建保险库失败: ' + error.message, 'error');
        }
    }

    unlockVault(masterPassword) {
        try {
            this.masterKey = deriveKey(masterPassword);
            setMasterKey(this.masterKey);
            this.passwords = loadPasswords() || [];
            this.favorites = loadFavorites();
            this.recentPasswords = loadRecentPasswords();
            renderPasswordList();
            // 显示主界面
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
            if (this.preferences.autoSyncOnOpen) this.syncPasswords();
            this.showNotification('成功', '保险库已解锁', 'success');
        } catch (error) {
            this.showNotification('错误', '解锁失败: ' + error.message, 'error');
        }
    }

    // ========== 存储配置 ==========
    loadStorageConfig() {
        this.storageConfig = loadStorageConfig();
        updateStorageStatusDisplay(this.storageConfig);
    }

    // ========== 偏好设置 ==========
    loadPreferences() { this.preferences = loadPreferences(); }
    savePreferences() { this.preferences = savePreferencesFromForm(); this.showNotification('成功', '偏好设置已保存', 'success'); this.hidePreferencesModal(); }

    // ========== 密码生成器 ==========
    showGeneratePasswordModal() { this.genPassword(); document.getElementById('generatePasswordModal').classList.add('active'); }
    genPassword() {
        const length = parseInt(document.getElementById('genPasswordLength')?.value) || 16;
        const password = generatePassword(length, {
            uppercase: document.getElementById('genUppercase')?.checked,
            lowercase: document.getElementById('genLowercase')?.checked,
            numbers: document.getElementById('genNumbers')?.checked,
            symbols: document.getElementById('genSymbols')?.checked
        });
        updateGeneratedPasswordDisplay(password);
    }

    // ========== 同步 ==========
    syncPasswords() { this.showNotification('信息', '同步功能开发中...', 'info'); }

    // ========== 导入/导出 ==========
    importPasswords() { importPasswords(); }
    exportPasswords(...args) { exportPasswords(...args); }
    processImportData(...args) { processImportData(...args); }
    exportConfig() { exportConfig(); }
    importConfigFromFile() { importConfig(); }

    // ========== 书签管理 ==========
    loadBookmarks() { this.bookmarks = []; }
    loadFolders() { this.folders = []; }

    // ========== 通知 ==========
    showNotification(title, message, type = 'info') {
        const notification = document.getElementById('notification');
        document.getElementById('notificationTitle').textContent = title;
        document.getElementById('notificationMessage').textContent = message;
        notification.className = 'notification ' + type + ' show';
        setTimeout(() => notification.classList.remove('show'), 5000);
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    const app = new PasswordManager();
    
    // 创建应用状态对象，用于模块间共享
    const appState = createAppState(app);
    
    // 先初始化模块（设置 state 引用），再绑定事件
    initAllModules(appState);
    setupEventListeners();
    setupModalCloseHandlers();

    window.passwordManager = app;
});

/**
 * 创建应用状态对象
 * 关键：所有可变状态属性必须用 getter/setter 代理到 app 实例，
 * 否则 app.xxx = newValue 后 state.xxx 仍是旧值
 */
function createAppState(app) {
    return {
        // 状态引用 - 全部用 getter/setter 代理，确保与 app 实例同步
        get passwords() { return app.passwords; },
        set passwords(v) { app.passwords = v; },
        get currentPasswordId() { return app.currentPasswordId; },
        set currentPasswordId(v) { app.currentPasswordId = v; },
        get masterKey() { return app.masterKey; },
        set masterKey(v) { app.masterKey = v; },
        get storageConfig() { return app.storageConfig; },
        set storageConfig(v) { app.storageConfig = v; },
        get favorites() { return app.favorites; },
        set favorites(v) { app.favorites = v; },
        get recentPasswords() { return app.recentPasswords; },
        set recentPasswords(v) { app.recentPasswords = v; },
        get preferences() { return app.preferences; },
        set preferences(v) { app.preferences = v; },
        get bookmarks() { return app.bookmarks; },
        set bookmarks(v) { app.bookmarks = v; },
        get folders() { return app.folders; },
        set folders(v) { app.folders = v; },
        get currentFolderId() { return app.currentFolderId; },
        set currentFolderId(v) { app.currentFolderId = v; },
        get currentBookmarkId() { return app.currentBookmarkId; },
        set currentBookmarkId(v) { app.currentBookmarkId = v; },
        get importData() { return app.importData; },
        set importData(v) { app.importData = v; },
        get commitMsg() { return app.commitMsg; },
        set commitMsg(v) { app.commitMsg = v; },
        
        // 注入方法
        showNotification: (t, m, ty) => app.showNotification(t, m, ty),
        renderPasswordList,
        filterPasswords,
        filterPasswordsByView,
        showPasswordDetails,
        togglePasswordVisibility,
        copyPasswordToClipboard,
        clearPasswordDetails,
        toggleFavorite,
        updatePasswordCategory,
        recordRecentAccess,
        showPasswordModal,
        hidePasswordModal,
        savePassword,
        deletePassword,
        editPassword,
        showPreferencesModal,
        hidePreferencesModal,
        showGeneratePasswordModal: () => app.showGeneratePasswordModal(),
        genPassword: () => app.genPassword(),
        showSecurityAuditModal,
        hideSecurityAuditModal,
        runSecurityAudit,
        showVersionsModal,
        showStorageModal,
        hideStorageModal,
        saveStorageConfig: () => saveStorageConfigAction(),
        showBookmarks,
        showPasswordContainer,
        renderBookmarks,
        handleLogin: () => app.handleLogin(),
        syncPasswords: () => app.syncPasswords(),
        importPasswords: () => app.importPasswords(),
        exportPasswords: (...args) => app.exportPasswords(...args),
        processImportData: (...args) => app.processImportData(...args),
        exportConfig: () => app.exportConfig(),
        importConfigFromFile: () => app.importConfigFromFile(),
    };
}

/**
 * 初始化所有模块
 */
function initAllModules(appState) {
    initPasswordDetailModule(appState);
    initPasswordModalModule(appState);
    initPasswordFilterModule(appState);
    initSecurityAuditModule(appState);
    initVersionModule(appState);
    initStorageConfigModule(appState);
    initBookmarkViewModule(appState);
    initEventsModule(appState);
}
