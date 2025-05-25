/**
 * 生成设备指纹并存储
 * @returns {string} 设备ID
 */
export function getDeviceId() {
    // 从本地存储获取已有设备ID
    let deviceId = localStorage.getItem('device_fingerprint');

    // 如果不存在则生成新的
    if (!deviceId) {
        // 基于时间戳、随机数和浏览器信息创建唯一标识
        const timestamp = new Date().getTime();
        const randomNum = Math.random().toString(36).substring(2);
        const browserInfo = navigator.userAgent + navigator.language +
            (window.screen ? `${window.screen.width}x${window.screen.height}` : '');

        deviceId = btoa(`${timestamp}-${randomNum}-${browserInfo}`);
        // 保存到本地存储
        localStorage.setItem('device_fingerprint', deviceId);
    }

    return deviceId;
}
