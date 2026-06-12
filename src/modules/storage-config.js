/**
 * Storage Config Module
 * 存储配置管理（GitHub、WebDAV等）
 */
import { loadStorageConfig, saveStorageConfig as saveStorageToFile } from '../utils/storage.js';
import { updateStorageStatusDisplay } from './settings.js';

// 共享状态引用
let state = null;

export function initStorageConfigModule(appState) {
    state = appState;
}

/**
 * 加载存储配置
 */
export function loadStorageConfigFromModule() {
    state.storageConfig = loadStorageConfig();
    updateStorageStatusDisplayModule();
}

/**
 * 显示存储配置模态框
 */
export function showStorageModal() {
    selectStorageType(state.storageConfig.type);
    document.getElementById('storageModal').classList.add('active');
}

/**
 * 隐藏存储配置模态框
 */
export function hideStorageModal() {
    document.getElementById('storageModal').classList.remove('active');
}

/**
 * 选择存储类型
 */
export function selectStorageType(type) {
    state.storageConfig.type = type;
    
    document.querySelectorAll('.storage-type').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    document.getElementById('githubConfig').style.display = type === 'github' ? 'block' : 'none';
    document.getElementById('multiGithubConfig').style.display = type === 'multi-git' ? 'block' : 'none';
    document.getElementById('webdavConfig').style.display = type === 'webdav' ? 'block' : 'none';

    if (type === 'github') {
        document.getElementById('githubToken').value = state.storageConfig.github?.token || '';
        document.getElementById('githubRepo').value = state.storageConfig.github?.repo || '';
    } else if (type === 'multi-git') {
        renderGitReposList();
    } else if (type === 'webdav') {
        document.getElementById('webdavUrl').value = state.storageConfig.webdav?.url || '';
        document.getElementById('webdavUsername').value = state.storageConfig.webdav?.username || '';
        document.getElementById('webdavPassword').value = state.storageConfig.webdav?.password || '';
    }
}

/**
 * 保存存储配置
 */
export function saveStorageConfig() {
    if (state.storageConfig.type === 'github') {
        state.storageConfig.github = {
            token: document.getElementById('githubToken').value,
            repo: document.getElementById('githubRepo').value
        };
    } else if (state.storageConfig.type === 'webdav') {
        state.storageConfig.webdav = {
            url: document.getElementById('webdavUrl').value,
            username: document.getElementById('webdavUsername').value,
            password: document.getElementById('webdavPassword').value
        };
    } else if (state.storageConfig.type === 'multi-git') {
        saveGitReposConfig();
    }

    saveStorageToFile(state.storageConfig);
    updateStorageStatusDisplayModule();
    hideStorageModal();
    if (state.showNotification) state.showNotification('成功', '存储配置已保存', 'success');
}

/**
 * 保存 Git 仓库配置
 */
export function saveGitReposConfig() {
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
            repos.push({ name: name || `${type} 仓库 ${repos.length + 1}`, type, token, repo, serverUrl, isPrimary });
        }
    });
    
    if (repos.length > 0 && !repos.some(r => r.isPrimary)) {
        repos[0].isPrimary = true;
    }
    
    state.storageConfig.gitRepos = repos;
}

/**
 * 渲染 Git 仓库列表
 */
export function renderGitReposList() {
    const container = document.getElementById('gitReposList');
    if (!container) return;
    container.innerHTML = '';
    
    const repos = state.storageConfig.gitRepos || [];
    
    if (repos.length === 0) {
        addGitRepoItem();
        return;
    }
    
    repos.forEach(repo => addGitRepoItem(repo));
}

/**
 * 添加一个 Git 仓库配置项
 */
export function addGitRepoItem(repoData = {}) {
    const template = document.getElementById('gitRepoItemTemplate');
    if (!template) return;
    
    const clone = template.content.cloneNode(true);
    const repoItem = clone.querySelector('.git-repo-item');

    if (repoData.name) repoItem.querySelector('.repo-name').value = repoData.name;
    if (repoData.type) repoItem.querySelector('.repo-type').value = repoData.type;
    if (repoData.token) repoItem.querySelector('.repo-token').value = repoData.token;
    if (repoData.repo) repoItem.querySelector('.repo-path').value = repoData.repo;
    if (repoData.serverUrl) repoItem.querySelector('.gitea-url').value = repoData.serverUrl;
    if (repoData.isPrimary) repoItem.querySelector('.primary-repo-radio').checked = true;

    repoItem.querySelector('.repo-type').addEventListener('change', (e) => {
        const giteaServer = repoItem.querySelector('.gitea-server');
        giteaServer.style.display = e.target.value === 'gitea' ? 'block' : 'none';
    });

    repoItem.querySelector('.remove-repo-btn')?.addEventListener('click', () => repoItem.remove());

    document.getElementById('gitReposList')?.appendChild(repoItem);
}

/**
 * 更新存储状态显示
 */
function updateStorageStatusDisplayModule() {
    updateStorageStatusDisplay(state.storageConfig);
}
