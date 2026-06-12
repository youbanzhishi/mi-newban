/**
 * Password Filter Module
 * 处理密码列表渲染、过滤和视图切换
 */
import { saveRecentPasswords } from '../utils/storage.js';
import { recordRecentAccess } from './password-detail.js';

// 共享状态引用
let state = null;

export function initPasswordFilterModule(appState) {
    state = appState;
}

/**
 * 渲染完整密码列表
 */
export function renderPasswordList() {
    const container = document.getElementById('passwordItems');
    const countElement = document.getElementById('passwordCount');
    if (!container) return;
    
    container.innerHTML = '';
    countElement.textContent = state.passwords.length;

    state.passwords.forEach(password => {
        if (!password) return;
        
        const item = createPasswordItemElement(password);
        item.addEventListener('click', () => {
            if (state.showPasswordDetails) state.showPasswordDetails(password.id);
            recordRecentAccess(password.id);
        });

        container.appendChild(item);
    });
}

/**
 * 根据搜索词过滤密码
 */
export function filterPasswords(searchTerm) {
    if (!searchTerm) {
        renderPasswordList();
        return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = state.passwords.filter(p =>
        p.site.toLowerCase().includes(term) ||
        p.username.toLowerCase().includes(term) ||
        (p.notes && p.notes.toLowerCase().includes(term))
    );

    const container = document.getElementById('passwordItems');
    const countElement = document.getElementById('passwordCount');
    container.innerHTML = '';
    countElement.textContent = filtered.length;

    filtered.forEach(password => {
        const item = createPasswordItemElement(password);
        item.addEventListener('click', () => {
            if (state.showPasswordDetails) state.showPasswordDetails(password.id);
            recordRecentAccess(password.id);
        });
        container.appendChild(item);
    });
}

/**
 * 根据视图类型过滤（全部/收藏/最近）
 */
export function filterPasswordsByView(view) {
    if (state.showPasswordContainer) state.showPasswordContainer();
    
    let filteredPasswords = [];

    switch (view) {
        case 'all':
            filteredPasswords = state.passwords;
            break;
        case 'favorites':
            filteredPasswords = state.passwords.filter(p => state.favorites.includes(p.id));
            break;
        case 'recent':
            filteredPasswords = state.recentPasswords
                .map(id => state.passwords.find(p => p.id === id))
                .filter(p => p);
            break;
    }

    renderFilteredPasswordList(filteredPasswords);
}

/**
 * 渲染过滤后的密码列表
 */
export function renderFilteredPasswordList(passwords) {
    const container = document.getElementById('passwordItems');
    const countElement = document.getElementById('passwordCount');
    if (!container) return;
    
    container.innerHTML = '';
    countElement.textContent = passwords.length;

    passwords.forEach(password => {
        if (!password) return;
        
        const item = createPasswordItemElement(password);
        item.addEventListener('click', () => {
            if (state.showPasswordDetails) state.showPasswordDetails(password.id);
            recordRecentAccess(password.id);
        });

        container.appendChild(item);
    });
}

/**
 * 创建密码项 DOM 元素
 */
function createPasswordItemElement(password) {
    const item = document.createElement('div');
    item.className = 'password-item';
    if (password.id === state.currentPasswordId) item.classList.add('active');
    item.dataset.id = password.id;

    const isFavorite = state.favorites.includes(password.id);
    const isRecent = state.recentPasswords.includes(password.id);

    item.innerHTML = `
        <div class="favicon"><i class="${password.icon || 'fas fa-key'}"></i></div>
        <div class="item-info">
            <h3>${escapeHtml(password.site)} 
                ${isFavorite ? '<i class="fas fa-star favorite-star" style="color: var(--warning);"></i>' : ''}
                ${isRecent ? '<span class="recent-indicator" style="color: var(--secondary); font-size: 12px;">最近</span>' : ''}
            </h3>
            <p>${escapeHtml(password.username)}</p>
        </div>
    `;

    return item;
}

/**
 * HTML 转义防止 XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
