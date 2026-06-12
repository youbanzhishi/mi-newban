/**
 * Version Module
 * Git 版本历史管理
 */
import { loadPasswords, savePasswords } from '../utils/storage.js';
import { loadBookmarks, saveBookmarks, loadFolders, saveFolders } from '../utils/storage.js';
import { decryptData } from './crypto.js';

// 共享状态引用
let state = null;

export function initVersionModule(appState) {
    state = appState;
}

/**
 * 显示版本历史模态框
 */
export function showVersionsModal() {
    if (state.storageConfig.type !== 'github' && state.storageConfig.type !== 'multi-git') {
        if (state.showNotification) state.showNotification('信息', '历史版本功能仅支持Git存储', 'info');
        return;
    }
    document.getElementById('versionsModal').classList.add('active');
    document.getElementById('versionsLoading').style.display = 'flex';
    fetchGitHubVersions();
}

/**
 * 隐藏版本历史模态框
 */
export function hideVersionsModal() {
    document.getElementById('versionsModal').classList.remove('active');
}

/**
 * 获取 GitHub 版本历史
 */
export async function fetchGitHubVersions() {
    try {
        const { token, repo } = state.storageConfig.github || {};
        if (!token || !repo) throw new Error('GitHub配置不完整');

        const [owner, repoName] = repo.split('/');
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/commits?path=vault.json&per_page=10`;

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) throw new Error('获取历史版本失败');
        const commits = await response.json();
        renderVersionList(commits);
    } catch (error) {
        if (state.showNotification) state.showNotification('错误', error.message, 'error');
    } finally {
        const loading = document.getElementById('versionsLoading');
        if (loading) loading.style.display = 'none';
    }
}

/**
 * 渲染版本列表
 */
export function renderVersionList(commits) {
    const container = document.getElementById('versionList');
    if (!container) return;
    container.innerHTML = '';

    commits.forEach(commit => {
        const commitDate = new Date(commit.commit.committer.date);
        const item = document.createElement('div');
        item.className = 'version-item';
        item.innerHTML = `
            <div class="version-date">${commitDate.toLocaleString()}</div>
            <div class="version-message">${escapeHtml(commit.commit.message)}</div>
        `;
        item.addEventListener('click', () => restoreVersion(commit.sha));
        container.appendChild(item);
    });
}

/**
 * 恢复指定版本
 */
export async function restoreVersion(sha) {
    if (!confirm('确定要恢复此版本吗？当前未保存的更改将会丢失。')) return;

    try {
        const { token, repo } = state.storageConfig.github;
        const [owner, repoName] = repo.split('/');
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/vault.json?ref=${sha}`;

        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) throw new Error('获取版本失败');

        const fileData = await response.json();
        const content = atob(fileData.content.replace(/\s/g, ''));
        parseDataAndRefresh(content);
        hideVersionsModal();
        if (state.showNotification) state.showNotification('成功', '版本已恢复', 'success');
    } catch (error) {
        if (state.showNotification) state.showNotification('错误', error.message, 'error');
    }
}

/**
 * 解析数据并刷新界面
 */
export function parseDataAndRefresh(gitData) {
    // gitData 是加密格式，解密后是 syncData JSON
    // 这里需要根据实际的加密方式进行解密
    let syncData;
    try {
        syncData = JSON.parse(gitData);
    } catch {
        // 如果解密后仍无法解析，可能是加密数据
        try {
            const decrypted = decryptData(gitData, state.masterKey);
            syncData = JSON.parse(decrypted);
        } catch {
            if (state.showNotification) state.showNotification('错误', '数据格式错误', 'error');
            return;
        }
    }

    if (syncData.passwords) {
        localStorage.setItem('vault', syncData.passwords);
        state.passwords = loadPasswords();
    }
    if (syncData.bookmarks) {
        localStorage.setItem('bookmarks', syncData.bookmarks);
        state.bookmarks = loadBookmarks();
    }
    if (syncData.folders) {
        localStorage.setItem('bookmarkFolders', syncData.folders);
        state.folders = loadFolders();
    }
    
    // 刷新相关视图
    if (state.renderPasswordList) state.renderPasswordList();
    if (state.renderFolders) state.renderFolders();
    if (state.renderBookmarksList) state.renderBookmarksList();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
