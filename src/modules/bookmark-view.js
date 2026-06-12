/**
 * Bookmark View Module
 * 处理书签列表的渲染和交互
 */
import { generateBookmarkId, generateFolderId, getBookmarksInFolder, filterBookmarks, generateBookmarksHTML, deleteBookmark as deleteBookmarkById } from './bookmark.js';
import { saveBookmarks, loadBookmarks, saveFolders, loadFolders } from '../utils/storage.js';
import { showBookmarkModal, hideBookmarkModal, showFolderModal, hideFolderModal } from './bookmark.js';

// 共享状态引用
let state = null;

export function initBookmarkViewModule(appState) {
    state = appState;
}

/**
 * 显示书签视图
 */
export function showBookmarks() {
    document.querySelectorAll('.password-content').forEach(area => area.style.display = 'none');
    document.getElementById('bookmarks-container').style.display = 'block';
    renderBookmarks();
}

/**
 * 显示密码容器
 */
export function showPasswordContainer() {
    document.querySelectorAll('.password-content').forEach(area => area.style.display = 'block');
    document.getElementById('bookmarks-container').style.display = 'none';
}

/**
 * 渲染书签（包含文件夹和列表）
 */
export function renderBookmarks() {
    renderFolders();
    renderBookmarksList();
}

/**
 * 渲染文件夹列表
 */
export function renderFolders() {
    const container = document.getElementById('bookmarksFolders');
    if (!container) return;
    container.innerHTML = '';

    // 所有书签
    const allItem = document.createElement('div');
    allItem.className = `folder-item ${state.currentFolderId === null ? 'active' : ''}`;
    allItem.innerHTML = `
        <div class="folder-icon"><i class="fas fa-star"></i></div>
        <div class="folder-info"><h3>所有书签</h3><p>${state.bookmarks.length} 个书签</p></div>
    `;
    allItem.addEventListener('click', () => {
        state.currentFolderId = null;
        renderBookmarksList();
        updateActiveFolder();
    });
    container.appendChild(allItem);

    // 文件夹列表
    state.folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = `folder-item ${state.currentFolderId === folder.id ? 'active' : ''}`;
        folderItem.innerHTML = `
            <div class="folder-icon"><i class="fas fa-folder"></i></div>
            <div class="folder-info"><h3>${escapeHtml(folder.name)}</h3><p>${getBookmarksInFolder(folder.id, state.bookmarks).length} 个书签</p></div>
            <div class="folder-actions">
                <button class="edit-folder"><i class="fas fa-edit"></i></button>
                <button class="delete-folder"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        folderItem.addEventListener('click', (e) => {
            if (!e.target.closest('.folder-actions')) {
                state.currentFolderId = folder.id;
                renderBookmarksList();
                updateActiveFolder();
            }
        });
        folderItem.querySelector('.edit-folder')?.addEventListener('click', (e) => {
            e.stopPropagation();
            showFolderModal(folder);
        });
        folderItem.querySelector('.delete-folder')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('确定要删除此文件夹及其所有书签吗？')) {
                deleteFolderAndContents(folder.id);
            }
        });
        container.appendChild(folderItem);
    });
}

/**
 * 更新文件夹选中状态
 */
export function updateActiveFolder() {
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('active');
        if ((item.dataset.id === 'all' || !item.dataset.id) && state.currentFolderId === null) {
            item.classList.add('active');
        } else if (item.dataset.id === state.currentFolderId) {
            item.classList.add('active');
        }
    });
}

/**
 * 渲染书签列表
 */
export function renderBookmarksList() {
    const container = document.getElementById('bookmarksList');
    if (!container) return;
    container.innerHTML = '';

    const bookmarksToShow = state.currentFolderId
        ? getBookmarksInFolder(state.currentFolderId, state.bookmarks)
        : state.bookmarks;

    if (bookmarksToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-bookmarks">
                <i class="fas fa-bookmark"></i>
                <p>没有书签</p>
                <button class="btn" id="addFirstBookmarkBtn">添加第一个书签</button>
            </div>
        `;
        document.getElementById('addFirstBookmarkBtn')?.addEventListener('click', () => showBookmarkModal());
        return;
    }

    bookmarksToShow.forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <div class="favicon"><i class="fas fa-bookmark"></i></div>
            <div class="bookmark-info">
                <h3>${escapeHtml(bookmark.name)}</h3>
                <a href="${bookmark.url}" target="_blank">${escapeHtml(bookmark.url)}</a>
                ${bookmark.description ? `<p>${escapeHtml(bookmark.description)}</p>` : ''}
            </div>
            <div class="bookmark-actions">
                <button class="edit-bookmark"><i class="fas fa-edit"></i></button>
                <button class="delete-bookmark"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        item.querySelector('.bookmark-info').addEventListener('click', () => window.open(bookmark.url, '_blank'));
        item.querySelector('.edit-bookmark')?.addEventListener('click', (e) => {
            e.stopPropagation();
            showBookmarkModal(bookmark);
        });
        item.querySelector('.delete-bookmark')?.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBookmarkByIdFromState(bookmark.id);
        });
        container.appendChild(item);
    });
}

/**
 * 过滤书签列表
 */
export function filterBookmarksList(query) {
    const container = document.getElementById('bookmarksList');
    if (!container) return;
    
    const filtered = filterBookmarks(state.bookmarks, query);
    const bookmarksToShow = state.currentFolderId
        ? filtered.filter(b => b.folderId === state.currentFolderId)
        : filtered;

    container.innerHTML = '';
    bookmarksToShow.forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <div class="favicon"><i class="fas fa-bookmark"></i></div>
            <div class="bookmark-info">
                <h3>${escapeHtml(bookmark.name)}</h3>
                <a href="${bookmark.url}" target="_blank">${escapeHtml(bookmark.url)}</a>
            </div>
            <div class="bookmark-actions">
                <button class="edit-bookmark"><i class="fas fa-edit"></i></button>
                <button class="delete-bookmark"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * 保存书签
 */
export function saveBookmark() {
    const name = document.getElementById('bookmarkName').value;
    const url = document.getElementById('bookmarkUrl').value;
    const folderId = document.getElementById('bookmarkFolder').value || null;
    const description = document.getElementById('bookmarkDescription').value;

    if (!name || !url) {
        state.showNotification('错误', '请填写名称和URL', 'error');
        return;
    }

    if (state.currentBookmarkId) {
        const index = state.bookmarks.findIndex(b => b.id === state.currentBookmarkId);
        if (index !== -1) {
            state.bookmarks[index] = { ...state.bookmarks[index], name, url, folderId, description, updatedAt: new Date().toISOString() };
        }
    } else {
        state.bookmarks.push({
            id: generateBookmarkId(),
            name, url, folderId, description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    saveBookmarks(state.bookmarks);
    renderBookmarksList();
    hideBookmarkModal();
    state.showNotification('成功', '书签已保存', 'success');
}

/**
 * 保存文件夹
 */
export function saveFolder() {
    const name = document.getElementById('folderName').value;
    const description = document.getElementById('folderDescription').value;

    if (!name) {
        state.showNotification('错误', '文件夹名称不能为空', 'error');
        return;
    }

    if (state.currentFolderId) {
        const index = state.folders.findIndex(f => f.id === state.currentFolderId);
        if (index !== -1) {
            state.folders[index] = { ...state.folders[index], name, description, updatedAt: new Date().toISOString() };
        }
    } else {
        state.folders.push({
            id: generateFolderId(),
            name, description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    saveFolders(state.folders);
    renderFolders();
    hideFolderModal();
    state.showNotification('成功', '文件夹已保存', 'success');
}

/**
 * 删除文件夹及其内容
 */
function deleteFolderAndContents(folderId) {
    state.bookmarks = state.bookmarks.filter(b => b.folderId !== folderId);
    state.folders = state.folders.filter(f => f.id !== folderId);
    saveFolders(state.folders);
    saveBookmarks(state.bookmarks);
    renderBookmarks();
    state.showNotification('成功', '文件夹已删除', 'success');
}

/**
 * 从状态中删除书签
 */
function deleteBookmarkByIdFromState(bookmarkId) {
    state.bookmarks = deleteBookmarkById(state.bookmarks, bookmarkId);
    saveBookmarks(state.bookmarks);
    renderBookmarksList();
    state.showNotification('成功', '书签已删除', 'success');
}

/**
 * 导出书签
 */
export function exportBookmarks() {
    const html = generateBookmarksHTML(state.bookmarks, state.folders);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'securepass-bookmarks.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    state.showNotification('成功', '书签导出成功', 'success');
}

/**
 * 导入书签
 */
export function importBookmarks() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html';
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(event.target.result, 'text/html');
            processImportedBookmarks(doc);
        };
        reader.readAsText(file);
    });
    fileInput.click();
}

/**
 * 处理导入的书签
 */
function processImportedBookmarks(doc) {
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
        state.bookmarks.push({
            id: generateBookmarkId(),
            name: link.textContent,
            url: link.href,
            folderId: null,
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });
    saveBookmarks(state.bookmarks);
    renderBookmarksList();
    state.showNotification('成功', `已导入 ${links.length} 个书签`, 'success');
}

/**
 * 删除所有书签
 */
export function deleteAllBookmarks() {
    if (!confirm('确定要删除所有书签和文件夹吗？此操作不可撤销！')) return;
    if (!confirm('再次确认：这将永久删除所有书签和文件夹。')) return;
    state.bookmarks = [];
    state.folders = [];
    saveBookmarks(state.bookmarks);
    saveFolders(state.folders);
    renderBookmarks();
    state.showNotification('成功', '所有书签已删除', 'success');
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
