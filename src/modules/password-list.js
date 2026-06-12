/**
 * Password List Module - Password List Display
 */
import { calculatePasswordStrength, checkPasswordReuse, checkPasswordBreach } from './crypto.js';
import { loadFavorites, loadRecentPasswords } from '../utils/storage.js';

/**
 * Render password list
 * @param {Array} passwords - Array of password objects
 * @param {string} currentId - Currently selected password ID
 * @param {Array} favorites - Array of favorite password IDs
 * @param {Array} recentPasswords - Array of recent password IDs
 */
export function renderPasswordList(passwords, currentId, favorites, recentPasswords) {
    const container = document.getElementById('passwordItems');
    const countElement = document.getElementById('passwordCount');
    
    if (!container) return;
    
    container.innerHTML = '';
    countElement.textContent = passwords.length;

    passwords.forEach(password => {
        if (!password) return;

        const item = document.createElement('div');
        item.className = 'password-item';
        if (password.id === currentId) {
            item.classList.add('active');
        }
        item.dataset.id = password.id;

        const isFavorite = favorites.includes(password.id);
        const isRecent = recentPasswords.includes(password.id);

        item.innerHTML = `
            <div class="favicon">
                <i class="${password.icon || 'fas fa-key'}"></i>
            </div>
            <div class="item-info">
                <h3>${password.site} 
                    ${isFavorite ? '<i class="fas fa-star favorite-star" style="color: var(--warning);"></i>' : ''}
                    ${isRecent ? '<span class="recent-indicator" style="color: var(--secondary); font-size: 12px;">最近</span>' : ''}
                </h3>
                <p>${password.username}</p>
            </div>
        `;

        item.addEventListener('click', () => {
            if (window.passwordManager) {
                window.passwordManager.showPasswordDetails(password.id);
                window.passwordManager.recordRecentAccess(password.id);
            }
        });

        container.appendChild(item);
    });
}

/**
 * Filter passwords by search term
 * @param {Array} passwords - Array of password objects
 * @param {string} searchTerm - Search term
 * @param {Function} onFiltered - Callback with filtered passwords
 */
export function filterPasswordsBySearch(passwords, searchTerm, onFiltered) {
    if (!searchTerm) {
        if (onFiltered) onFiltered(passwords);
        return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = passwords.filter(password => {
        return (
            password.site.toLowerCase().includes(term) ||
            password.username.toLowerCase().includes(term) ||
            (password.notes && password.notes.toLowerCase().includes(term))
        );
    });

    if (onFiltered) onFiltered(filtered);
}

/**
 * Filter passwords by view type
 * @param {Array} passwords - Array of password objects
 * @param {string} view - View type (all, favorites, recent)
 * @param {Array} favorites - Array of favorite password IDs
 * @param {Array} recentPasswords - Array of recent password IDs
 * @returns {Array} Filtered passwords
 */
export function filterPasswordsByView(passwords, view, favorites, recentPasswords) {
    switch (view) {
        case 'all':
            return passwords;
        case 'favorites':
            return passwords.filter(p => favorites.includes(p.id) && p !== undefined);
        case 'recent':
            return recentPasswords
                .map(id => passwords.find(p => p.id === id))
                .filter(p => p !== undefined);
        default:
            return passwords;
    }
}

/**
 * Setup password list event listeners
 * @param {Object} handlers - Event handlers
 */
export function setupPasswordListHandlers(handlers = {}) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && handlers.onSearch) {
        searchInput.addEventListener('input', (e) => {
            handlers.onSearch(e.target.value);
        });
    }
}

/**
 * Update password list item selection
 * @param {string} passwordId - Selected password ID
 */
export function updateSelection(passwordId) {
    const items = document.querySelectorAll('.password-item');
    items.forEach(item => {
        if (item.dataset.id === passwordId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
