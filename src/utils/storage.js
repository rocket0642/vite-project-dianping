/**
 * 本地存储工具类
 */

const HISTORY_ACCOUNTS_KEY = 'history_accounts';
const LAST_PHONE_KEY = 'last_phone';

/**
 * 保存历史账号
 * @param {string} phone - 手机号
 */
export function saveHistoryAccount(phone) {
    // 获取现有历史账号
    const historyAccounts = getHistoryAccounts();

    // 如果账号已存在，先删除它（为了把它放到最前面）
    const index = historyAccounts.indexOf(phone);
    if (index !== -1) {
        historyAccounts.splice(index, 1);
    }

    // 将新账号添加到最前面
    historyAccounts.unshift(phone);

    // 限制最多保存5个历史账号
    if (historyAccounts.length > 5) {
        historyAccounts.pop();
    }

    // 保存到localStorage
    localStorage.setItem(HISTORY_ACCOUNTS_KEY, JSON.stringify(historyAccounts));
    // 同时保存最新账号
    localStorage.setItem(LAST_PHONE_KEY, phone);
}

/**
 * 获取历史账号列表
 * @returns {Array} - 历史账号列表
 */
export function getHistoryAccounts() {
    const historyData = localStorage.getItem(HISTORY_ACCOUNTS_KEY);
    if (historyData) {
        try {
            return JSON.parse(historyData);
        } catch (e) {
            return [];
        }
    }
    return [];
}

/**
 * 获取最后使用的手机号
 * @returns {string|null} - 最后使用的手机号
 */
export function getLastPhone() {
    return localStorage.getItem(LAST_PHONE_KEY);
}

/**
 * 删除历史账号
 * @param {string} phone - 要删除的手机号
 */
export function removeHistoryAccount(phone) {
    const historyAccounts = getHistoryAccounts();
    const index = historyAccounts.indexOf(phone);

    if (index !== -1) {
        historyAccounts.splice(index, 1);
        localStorage.setItem(HISTORY_ACCOUNTS_KEY, JSON.stringify(historyAccounts));

        // 如果删除的是最后使用的账号，更新last_phone
        if (localStorage.getItem(LAST_PHONE_KEY) === phone) {
            if (historyAccounts.length > 0) {
                localStorage.setItem(LAST_PHONE_KEY, historyAccounts[0]);
            } else {
                localStorage.removeItem(LAST_PHONE_KEY);
            }
        }
    }
} 