/**
 * Security Audit Module
 * 安全审计功能
 */
import { checkPasswordBreach } from './crypto.js';

// 共享状态引用
let state = null;

export function initSecurityAuditModule(appState) {
    state = appState;
}

/**
 * 显示安全审计模态框
 */
export function showSecurityAuditModal() {
    document.getElementById('securityAuditModal').classList.add('active');
}

/**
 * 隐藏安全审计模态框
 */
export function hideSecurityAuditModal() {
    document.getElementById('securityAuditModal').classList.remove('active');
}

/**
 * 运行安全审计
 */
export function runSecurityAudit() {
    let weakCount = 0;
    let reusedCount = 0;
    let expiredCount = 0;
    let breachedCount = 0;

    // 用于检测重复密码的辅助集合
    const passwordCounts = {};
    state.passwords.forEach(password => {
        passwordCounts[password.password] = (passwordCounts[password.password] || 0) + 1;
    });

    state.passwords.forEach(password => {
        // 弱密码（长度小于8）
        if (password.password.length < 8) weakCount++;
        
        // 重复使用
        if (passwordCounts[password.password] > 1) reusedCount++;
        
        // 过期（超过1年未更新）
        const updatedDate = new Date(password.updatedAt);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (updatedDate < oneYearAgo) expiredCount++;
        
        // 泄露检查
        if (checkPasswordBreach(password.password)) breachedCount++;
    });

    document.getElementById('weakPasswordsCount').textContent = `${weakCount} 个弱密码`;
    document.getElementById('reusedPasswordsCount').textContent = `${reusedCount} 个重复使用的密码`;
    document.getElementById('expiredPasswordsCount').textContent = `${expiredCount} 个过期密码`;
    document.getElementById('breachedPasswordsCount').textContent = `${breachedCount} 个可能泄露的密码`;

    document.getElementById('auditModal').classList.add('active');
}

/**
 * 获取安全统计摘要
 */
export function getSecuritySummary() {
    const passwordCounts = {};
    state.passwords.forEach(password => {
        passwordCounts[password.password] = (passwordCounts[password.password] || 0) + 1;
    });

    let weakCount = 0;
    let reusedCount = 0;
    let breachedCount = 0;

    state.passwords.forEach(password => {
        if (password.password.length < 8) weakCount++;
        if (passwordCounts[password.password] > 1) reusedCount++;
        if (checkPasswordBreach(password.password)) breachedCount++;
    });

    return {
        total: state.passwords.length,
        weak: weakCount,
        reused: reusedCount,
        breached: breachedCount
    };
}
