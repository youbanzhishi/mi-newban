/**
 * Settings Module - Preferences and Storage Settings
 */
import { loadPreferences, saveStorageConfig, loadStorageConfig, saveSidebarState, loadSidebarState } from '../utils/storage.js';
export { savePreferences } from '../utils/storage.js';

/**
 * Load and apply preferences
 * @returns {Object} Loaded preferences
 */
export function loadAndApplyPreferences() {
    const preferences = loadPreferences();
    
    // Apply dark mode
    if (preferences.darkMode === false) {
        document.documentElement.style.setProperty('--dark', '#ffffff');
        document.documentElement.style.setProperty('--dark-light', '#f5f5f5');
        document.documentElement.style.setProperty('--text', '#333333');
    }
    
    return preferences;
}

/**
 * Save preferences from form
 * @returns {Object} Saved preferences
 */
export function savePreferencesFromForm() {
    const preferences = {
        autoSyncOnOpen: document.getElementById('autoSyncOnOpen')?.checked || false,
        autoLockTime: document.getElementById('autoLockTime')?.value || '30',
        backupFrequency: document.getElementById('backupFrequency')?.value || 'daily',
        themePreference: document.getElementById('themePreference')?.value || 'dark',
        defaultUppercase: document.getElementById('defaultUppercase')?.checked || true,
        defaultLowercase: document.getElementById('defaultLowercase')?.checked || true,
        defaultNumbers: document.getElementById('defaultNumbers')?.checked || true,
        defaultSymbols: document.getElementById('defaultSymbols')?.checked || true
    };

    savePreferences(preferences);
    return preferences;
}

/**
 * Populate preferences form
 * @param {Object} preferences - Preferences to populate
 */
export function populatePreferencesForm(preferences) {
    if (!preferences) return;
    
    const fields = [
        'autoLockTime',
        'backupFrequency', 
        'themePreference',
        'defaultUppercase',
        'defaultLowercase',
        'defaultNumbers',
        'defaultSymbols'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = preferences[field] !== undefined ? preferences[field] : true;
        } else if (element.type === 'select-one' || element.tagName === 'SELECT') {
            if (preferences[field]) {
                element.value = preferences[field];
            }
        } else {
            if (preferences[field]) {
                element.value = preferences[field];
            }
        }
    });
    
    const autoSyncCheckbox = document.getElementById('autoSyncOnOpen');
    if (autoSyncCheckbox) {
        autoSyncCheckbox.checked = preferences.autoSyncOnOpen || false;
    }
}

/**
 * Load storage configuration
 * @returns {Object} Storage configuration
 */
export function loadStorageSettings() {
    return loadStorageConfig();
}

/**
 * Save storage configuration from form
 * @param {string} type - Storage type
 * @returns {Object} Updated storage configuration
 */
export function saveStorageSettingsFromForm(type) {
    const config = loadStorageConfig();
    config.type = type;
    
    if (type === 'github') {
        config.github = {
            token: document.getElementById('githubToken')?.value || '',
            repo: document.getElementById('githubRepo')?.value || ''
        };
    } else if (type === 'webdav') {
        config.webdav = {
            url: document.getElementById('webdavUrl')?.value || '',
            username: document.getElementById('webdavUsername')?.value || '',
            password: document.getElementById('webdavPassword')?.value || ''
        };
    } else if (type === 'multi-git') {
        config.gitRepos = saveGitReposConfig();
    }
    
    saveStorageConfig(config);
    return config;
}

/**
 * Save Git repositories configuration
 * @returns {Array} Git repositories array
 */
function saveGitReposConfig() {
    const repoItems = document.querySelectorAll('.git-repo-item');
    const repos = [];
    
    repoItems.forEach((item) => {
        const name = item.querySelector('.repo-name')?.value || '';
        const type = item.querySelector('.repo-type')?.value || 'github';
        const token = item.querySelector('.repo-token')?.value || '';
        const repo = item.querySelector('.repo-path')?.value || '';
        const serverUrl = type === 'gitea' ? (item.querySelector('.gitea-url')?.value || '') : '';
        const isPrimary = item.querySelector('.primary-repo-radio')?.checked || false;

        if (token && repo) {
            repos.push({
                name: name || `${type} 仓库 ${repos.length + 1}`,
                type,
                token,
                repo,
                serverUrl,
                isPrimary
            });
        }
    });
    
    return repos;
}

/**
 * Toggle sidebar collapsed state
 * @returns {boolean} New collapsed state
 */
export function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    const collapsed = sidebar?.classList.contains('collapsed');
    
    if (sidebar) {
        if (collapsed) {
            sidebar.classList.remove('collapsed');
            if (collapseBtn) collapseBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            sidebar.classList.add('collapsed');
            if (collapseBtn) collapseBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    }
    
    saveSidebarState(!collapsed);
    return !collapsed;
}

/**
 * Apply sidebar state from storage
 */
export function applySidebarState() {
    const collapsed = loadSidebarState();
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    
    if (sidebar) {
        if (collapsed) {
            sidebar.classList.add('collapsed');
            if (collapseBtn) collapseBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        } else {
            sidebar.classList.remove('collapsed');
            if (collapseBtn) collapseBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
    }
}

/**
 * Update storage status display
 * @param {Object} config - Storage configuration
 */
export function updateStorageStatusDisplay(config) {
    const statusElement = document.getElementById('storageStatus');
    if (!statusElement) return;
    
    switch (config.type) {
        case 'local':
            statusElement.textContent = '使用本地存储';
            break;
        case 'github':
            statusElement.textContent = '使用 GitHub 存储';
            break;
        case 'webdav':
            statusElement.textContent = '使用 WebDAV 存储';
            break;
        case 'multi-git':
            statusElement.textContent = '使用Git多点存储';
            break;
        default:
            statusElement.textContent = '未配置远程存储';
    }
}

/**
 * Setup settings handlers
 * @param {Object} handlers - Event handlers
 */
export function setupSettingsHandlers(handlers = {}) {
    // Preferences
    const preferencesBtn = document.getElementById('preferencesBtn');
    if (preferencesBtn && handlers.onPreferencesClick) {
        preferencesBtn.addEventListener('click', handlers.onPreferencesClick);
    }
    
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn && handlers.onSavePreferences) {
        savePreferencesBtn.addEventListener('click', handlers.onSavePreferences);
    }
    
    const cancelPreferencesBtn = document.getElementById('cancelPreferencesBtn');
    if (cancelPreferencesBtn) {
        cancelPreferencesBtn.addEventListener('click', () => {
            document.getElementById('preferencesModal')?.classList.remove('active');
        });
    }
    
    // Storage settings
    const storageBtn = document.getElementById('storageSettingsBtn');
    if (storageBtn && handlers.onStorageClick) {
        storageBtn.addEventListener('click', handlers.onStorageClick);
    }
    
    const configureStorageBtn = document.getElementById('configureStorageBtn');
    if (configureStorageBtn && handlers.onStorageClick) {
        configureStorageBtn.addEventListener('click', handlers.onStorageClick);
    }
    
    const saveStorageBtn = document.getElementById('saveStorageBtn');
    if (saveStorageBtn && handlers.onSaveStorage) {
        saveStorageBtn.addEventListener('click', handlers.onSaveStorage);
    }
    
    const cancelStorageBtn = document.getElementById('cancelStorageBtn');
    if (cancelStorageBtn) {
        cancelStorageBtn.addEventListener('click', () => {
            document.getElementById('storageModal')?.classList.remove('active');
        });
    }
    
    // Storage type selection
    document.querySelectorAll('.storage-type').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            handlers.onStorageTypeChange?.(type);
        });
    });
    
    // Sidebar collapse
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            handlers.onToggleSidebar?.();
        });
    }
    
    // Export/Import config
    const exportConfigBtn = document.getElementById('exportConfigBtn');
    if (exportConfigBtn && handlers.onExportConfig) {
        exportConfigBtn.addEventListener('click', handlers.onExportConfig);
    }
    
    const importConfigBtn = document.getElementById('importConfigBtn');
    if (importConfigBtn && handlers.onImportConfigClick) {
        importConfigBtn.addEventListener('click', handlers.onImportConfigClick);
    }
    
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    if (confirmImportBtn && handlers.onImportConfig) {
        confirmImportBtn.addEventListener('click', handlers.onImportConfig);
    }
    
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            document.getElementById('importConfigModal')?.classList.remove('active');
        });
    }
}


/**
 * Show preferences modal
 */
export function showPreferencesModal() {
    populatePreferencesForm(window.passwordManager?.preferences || {});
    document.getElementById('preferencesModal')?.classList.add('active');
}

/**
 * Hide preferences modal
 */
export function hidePreferencesModal() {
    document.getElementById('preferencesModal')?.classList.remove('active');
}
