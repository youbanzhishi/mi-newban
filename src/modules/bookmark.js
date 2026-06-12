/**
 * Bookmark Module - Bookmark Management
 */
import { saveBookmarks, loadBookmarks, saveFolders, loadFolders } from '../utils/storage.js';

/**
 * Generate unique bookmark ID
 * @returns {string} Unique bookmark ID
 */
export function generateBookmarkId() {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique folder ID
 * @returns {string} Unique folder ID
 */
export function generateFolderId() {
    return `folder_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get bookmarks in folder
 * @param {string} folderId - Folder ID
 * @param {Array} bookmarks - All bookmarks
 * @returns {Array} Filtered bookmarks
 */
export function getBookmarksInFolder(folderId, bookmarks) {
    return bookmarks.filter(bookmark => bookmark.folderId === folderId);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Add bookmark
 * @param {Array} bookmarks - Current bookmarks
 * @param {Object} bookmarkData - Bookmark data
 * @returns {Array} Updated bookmarks
 */
export function addBookmark(bookmarks, bookmarkData) {
    const newBookmark = {
        id: bookmarkData.id || generateBookmarkId(),
        name: bookmarkData.name,
        url: bookmarkData.url,
        folderId: bookmarkData.folderId || null,
        description: bookmarkData.description || '',
        createdAt: bookmarkData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    bookmarks.push(newBookmark);
    return bookmarks;
}

/**
 * Update bookmark
 * @param {Array} bookmarks - Current bookmarks
 * @param {string} bookmarkId - Bookmark ID to update
 * @param {Object} bookmarkData - Updated data
 * @returns {Array} Updated bookmarks
 */
export function updateBookmark(bookmarks, bookmarkId, bookmarkData) {
    const index = bookmarks.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
        bookmarks[index] = {
            ...bookmarks[index],
            ...bookmarkData,
            updatedAt: new Date().toISOString()
        };
    }
    return bookmarks;
}

/**
 * Delete bookmark
 * @param {Array} bookmarks - Current bookmarks
 * @param {string} bookmarkId - Bookmark ID to delete
 * @returns {Array} Updated bookmarks
 */
export function deleteBookmark(bookmarks, bookmarkId) {
    return bookmarks.filter(b => b.id !== bookmarkId);
}

/**
 * Add folder
 * @param {Array} folders - Current folders
 * @param {string} name - Folder name
 * @param {string} description - Folder description
 * @returns {Array} Updated folders
 */
export function addFolder(folders, name, description = '') {
    const newFolder = {
        id: generateFolderId(),
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    folders.push(newFolder);
    return folders;
}

/**
 * Update folder
 * @param {Array} folders - Current folders
 * @param {string} folderId - Folder ID to update
 * @param {Object} folderData - Updated data
 * @returns {Array} Updated folders
 */
export function updateFolder(folders, folderId, folderData) {
    const index = folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
        folders[index] = {
            ...folders[index],
            ...folderData,
            updatedAt: new Date().toISOString()
        };
    }
    return folders;
}

/**
 * Delete folder and its bookmarks
 * @param {Array} folders - Current folders
 * @param {Array} bookmarks - Current bookmarks
 * @param {string} folderId - Folder ID to delete
 * @returns {Object} Updated folders and bookmarks
 */
export function deleteFolder(folders, bookmarks, folderId) {
    const updatedFolders = folders.filter(f => f.id !== folderId);
    const updatedBookmarks = bookmarks.filter(b => b.folderId !== folderId);
    return { folders: updatedFolders, bookmarks: updatedBookmarks };
}

/**
 * Generate bookmarks HTML for export
 * @param {Array} bookmarks - Bookmarks to export
 * @param {Array} folders - Folders
 * @returns {string} HTML content
 */
export function generateBookmarksHTML(bookmarks, folders) {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>SecurePass Bookmarks</TITLE>
<H1>SecurePass Bookmarks</H1>
<DL><p>
    <DT><H3>SecurePass Bookmarks</H3>
    <DL><p>
`;

    // Uncategorized bookmarks
    const uncategorized = bookmarks.filter(b => !b.folderId);
    if (uncategorized.length > 0) {
        html += `        <DT><H3>未分类</H3>\n        <DL><p>\n`;
        uncategorized.forEach(bookmark => {
            html += `            <DT><A HREF="${bookmark.url}">${bookmark.name}</A>\n`;
        });
        html += `        </DL><p>\n`;
    }

    // Folder bookmarks
    folders.forEach(folder => {
        const bookmarksInFolder = getBookmarksInFolder(folder.id, bookmarks);
        if (bookmarksInFolder.length > 0) {
            html += `        <DT><H3>${folder.name}</H3>\n        <DL><p>\n`;
            bookmarksInFolder.forEach(bookmark => {
                html += `            <DT><A HREF="${bookmark.url}">${bookmark.name}</A>\n`;
            });
            html += `        </DL><p>\n`;
        }
    });

    html += `    </DL><p>
</DL><p>`;

    return html;
}

/**
 * Filter bookmarks by search term
 * @param {Array} bookmarks - Bookmarks to filter
 * @param {string} query - Search query
 * @returns {Array} Filtered bookmarks
 */
export function filterBookmarks(bookmarks, query) {
    if (!query) return bookmarks;
    
    const lowerQuery = query.toLowerCase();
    return bookmarks.filter(bookmark => {
        return (
            bookmark.name.toLowerCase().includes(lowerQuery) ||
            bookmark.url.toLowerCase().includes(lowerQuery) ||
            (bookmark.description && bookmark.description.toLowerCase().includes(lowerQuery))
        );
    });
}

/**
 * Show bookmark modal
 * @param {Object|null} bookmark - Bookmark to edit, null for new
 */
export function showBookmarkModal(bookmark = null) {
    const modal = document.getElementById('bookmarkModal');
    const title = document.getElementById('bookmarkModalTitle');
    
    if (bookmark) {
        title.textContent = '编辑书签';
        document.getElementById('bookmarkName').value = bookmark.name;
        document.getElementById('bookmarkUrl').value = bookmark.url;
        document.getElementById('bookmarkFolder').value = bookmark.folderId || '';
        document.getElementById('bookmarkDescription').value = bookmark.description || '';
        window.currentBookmarkId = bookmark.id;
    } else {
        title.textContent = '添加书签';
        document.getElementById('bookmarkName').value = '';
        document.getElementById('bookmarkUrl').value = '';
        document.getElementById('bookmarkFolder').value = '';
        document.getElementById('bookmarkDescription').value = '';
        window.currentBookmarkId = null;
    }
    
    modal.classList.add('active');
}

/**
 * Hide bookmark modal
 */
export function hideBookmarkModal() {
    document.getElementById('bookmarkModal').classList.remove('active');
}

/**
 * Show folder modal
 * @param {Object|null} folder - Folder to edit, null for new
 */
export function showFolderModal(folder = null) {
    const modal = document.getElementById('folderModal');
    const title = document.getElementById('folderModalTitle');
    
    if (folder) {
        title.textContent = '编辑文件夹';
        document.getElementById('folderName').value = folder.name;
        document.getElementById('folderDescription').value = folder.description || '';
        window.currentFolderId = folder.id;
    } else {
        title.textContent = '新建文件夹';
        document.getElementById('folderName').value = '';
        document.getElementById('folderDescription').value = '';
        window.currentFolderId = null;
    }
    
    modal.classList.add('active');
}

/**
 * Hide folder modal
 */
export function hideFolderModal() {
    document.getElementById('folderModal').classList.remove('active');
}

/**
 * Populate folder options in select
 * @param {Array} folders - Folders to populate
 */
export function populateFolderOptions(folders) {
    const folderSelect = document.getElementById('bookmarkFolder');
    if (!folderSelect) return;
    
    folderSelect.innerHTML = '<option value="">无文件夹</option>';
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
    });
}
