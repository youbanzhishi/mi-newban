/**
 * Storage Module - localStorage Wrapper
 * Handles data persistence with encryption
 */
import { encryptData, decryptData } from '../modules/crypto.js';

const STORAGE_KEYS = {
    VAULT: 'vault',
    BOOKMARKS: 'bookmarks',
    FOLDERS: 'bookmarkFolders',
    STORAGE_CONFIG: 'storageConfig',
    PREFERENCES: 'preferences',
    FAVORITES: 'favorites',
    RECENT_PASSWORDS: 'recentPasswords',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed'
};

/**
 * Save passwords to encrypted storage
 * @param {Array} passwords - Array of password objects
 */
export function savePasswords(passwords) {
    const data = JSON.stringify(passwords);
    const encrypted = encryptData(data);
    localStorage.setItem(STORAGE_KEYS.VAULT, encrypted);
}

/**
 * Load passwords from encrypted storage
 * @returns {Array|null} Array of password objects or null
 */
export function loadPasswords() {
    const vault = localStorage.getItem(STORAGE_KEYS.VAULT);
    if (!vault) return null;

    try {
        const decrypted = decryptData(vault);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Failed to decrypt passwords:', error);
        return null;
    }
}

/**
 * Save bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 */
export function saveBookmarks(bookmarks) {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

/**
 * Load bookmarks
 * @returns {Array} Array of bookmark objects
 */
export function loadBookmarks() {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
}

/**
 * Save folders
 * @param {Array} folders - Array of folder objects
 */
export function saveFolders(folders) {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
}

/**
 * Load folders
 * @returns {Array} Array of folder objects
 */
export function loadFolders() {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return data ? JSON.parse(data) : [];
}

/**
 * Save storage configuration
 * @param {Object} config - Storage configuration object
 */
export function saveStorageConfig(config) {
    localStorage.setItem(STORAGE_KEYS.STORAGE_CONFIG, JSON.stringify(config));
}

/**
 * Load storage configuration
 * @returns {Object} Storage configuration object
 */
export function loadStorageConfig() {
    const data = localStorage.getItem(STORAGE_KEYS.STORAGE_CONFIG);
    return data ? JSON.parse(data) : { type: 'local', github: {}, webdav: {} };
}

/**
 * Save preferences
 * @param {Object} preferences - Preferences object
 */
export function savePreferences(preferences) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
}

/**
 * Load preferences
 * @returns {Object} Preferences object
 */
export function loadPreferences() {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : {};
}

/**
 * Save favorites
 * @param {Array} favorites - Array of password IDs
 */
export function saveFavorites(favorites) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

/**
 * Load favorites
 * @returns {Array} Array of password IDs
 */
export function loadFavorites() {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
}

/**
 * Save recent passwords
 * @param {Array} recent - Array of recent password IDs
 */
export function saveRecentPasswords(recent) {
    localStorage.setItem(STORAGE_KEYS.RECENT_PASSWORDS, JSON.stringify(recent));
}

/**
 * Load recent passwords
 * @returns {Array} Array of recent password IDs
 */
export function loadRecentPasswords() {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_PASSWORDS);
    return data ? JSON.parse(data) : [];
}

/**
 * Save sidebar collapsed state
 * @param {boolean} collapsed - Collapsed state
 */
export function saveSidebarState(collapsed) {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString());
}

/**
 * Load sidebar collapsed state
 * @returns {boolean} Collapsed state
 */
export function loadSidebarState() {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
}

/**
 * Check if vault exists (first time setup check)
 * @returns {boolean} True if vault exists
 */
export function vaultExists() {
    return localStorage.getItem(STORAGE_KEYS.VAULT) !== null;
}

/**
 * Clear all storage
 */
export function clearAllStorage() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

export { STORAGE_KEYS };
