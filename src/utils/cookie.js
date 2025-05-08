/**
 * Cookie工具类
 */

/**
 * 设置Cookie
 * @param {string} name - Cookie名称
 * @param {string} value - Cookie值
 * @param {number} days - 过期天数
 */
export function setCookie(name, value, days = 30) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/`
}

/**
 * 获取Cookie
 * @param {string} name - Cookie名称
 * @returns {string} - Cookie值
 */
export function getCookie(name) {
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

/**
 * 删除Cookie
 * @param {string} name - Cookie名称
 */
export function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/**
 * 保存历史账号到Cookie
 * @param {string} phone - 手机号
 * @param {number} days - 过期天数
 */
export function saveHistoryAccount(phone, days = 30) {
    // 获取现有历史账号
    const historyAccounts = getHistoryAccounts()

    // 如果账号已存在，先删除它（为了把它放到最前面）
    const index = historyAccounts.indexOf(phone)
    if (index !== -1) {
        historyAccounts.splice(index, 1)
    }

    // 将新账号添加到最前面
    historyAccounts.unshift(phone)

    // 限制最多保存5个历史账号
    if (historyAccounts.length > 5) {
        historyAccounts.pop()
    }

    // 保存回Cookie
    setCookie('history_accounts', JSON.stringify(historyAccounts), days)

    // 同时保存最新账号
    setCookie('last_phone', phone, days)
}

/**
 * 获取历史账号列表
 * @returns {Array} - 历史账号列表
 */
export function getHistoryAccounts() {
    const historyData = getCookie('history_accounts')
    if (historyData) {
        try {
            return JSON.parse(historyData)
        } catch (e) {
            return []
        }
    }
    return []
}

/**
 * 删除历史账号
 * @param {string} phone - 要删除的手机号
 */
export function removeHistoryAccount(phone) {
    const historyAccounts = getHistoryAccounts()
    const index = historyAccounts.indexOf(phone)

    if (index !== -1) {
        historyAccounts.splice(index, 1)
        setCookie('history_accounts', JSON.stringify(historyAccounts))

        // 如果删除的是最后使用的账号，更新last_phone
        if (getCookie('last_phone') === phone) {
            if (historyAccounts.length > 0) {
                setCookie('last_phone', historyAccounts[0])
            } else {
                deleteCookie('last_phone')
            }
        }
    }
} 