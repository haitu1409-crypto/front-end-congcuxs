/**
 * Tracking Error Handler
 * Xử lý lỗi từ các tracking scripts bên thứ 3
 * Ngăn chặn lỗi 400 từ a.mrktmtrcs.net và các dịch vụ tương tự
 */

// Danh sách các domain tracking có thể gây lỗi
const PROBLEMATIC_TRACKING_DOMAINS = [
    'a.mrktmtrcs.net',
    'mrktmtrcs.net',
    'static.aroa.io',
    't.dtscout.com',
    'dtscout.com',
    'ic.tynt.com',
    'tynt.com',
    'de.tynt.com',
    'match.adsrvr.org',
    'adsrvr.org'
];

// Cấu hình error handling
const TRACKING_ERROR_CONFIG = {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    suppressErrors: true, // Ẩn lỗi tracking khỏi console
    fallbackMode: true // Chế độ fallback khi tracking fail
};

/**
 * Kiểm tra xem URL có phải là tracking domain có vấn đề không
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean} - True nếu là domain có vấn đề
 */
export const isProblematicTrackingDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return PROBLEMATIC_TRACKING_DOMAINS.some(domain =>
            urlObj.hostname.includes(domain)
        );
    } catch (error) {
        return false;
    }
};

/**
 * Tạo error handler cho fetch requests
 * @param {string} url - URL của request
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise với error handling
 */
export const createSafeFetch = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        // Kiểm tra nếu là tracking domain có vấn đề
        if (isProblematicTrackingDomain(url)) {
            console.warn(`🚫 Blocked problematic tracking request to: ${url}`);
            resolve({
                ok: false,
                status: 400,
                statusText: 'Blocked by tracking error handler',
                json: () => Promise.resolve({}),
                text: () => Promise.resolve('')
            });
            return;
        }

        // Thực hiện fetch bình thường
        fetch(url, options)
            .then(response => {
                // Kiểm tra lỗi 400 từ tracking domains
                if (!response.ok && response.status === 400 && isProblematicTrackingDomain(url)) {
                    console.warn(`⚠️ Tracking service error (${response.status}): ${url}`);
                    if (TRACKING_ERROR_CONFIG.suppressErrors) {
                        // Trả về response giả để không làm crash app
                        resolve({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            json: () => Promise.resolve({}),
                            text: () => Promise.resolve('')
                        });
                    } else {
                        reject(new Error(`Tracking service error: ${response.status}`));
                    }
                } else {
                    resolve(response);
                }
            })
            .catch(error => {
                if (isProblematicTrackingDomain(url)) {
                    console.warn(`🚫 Network error for tracking service: ${url}`, error.message);
                    if (TRACKING_ERROR_CONFIG.suppressErrors) {
                        resolve({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            json: () => Promise.resolve({}),
                            text: () => Promise.resolve('')
                        });
                    } else {
                        reject(error);
                    }
                } else {
                    reject(error);
                }
            });
    });
};

/**
 * Override XMLHttpRequest để chặn lỗi tracking
 */
export const setupXHRErrorHandling = () => {
    if (typeof window === 'undefined') return;

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
        this._url = url;
        this._method = method;

        // Kiểm tra nếu là tracking domain có vấn đề
        if (isProblematicTrackingDomain(url)) {
            console.warn(`🚫 Blocked XHR request to problematic tracking domain: ${url}`);
            // Tạo một fake response
            this.readyState = 4;
            this.status = 200;
            this.statusText = 'OK';
            this.responseText = '{}';
            this.response = '{}';

            // Trigger events để không làm crash app
            setTimeout(() => {
                if (this.onreadystatechange) {
                    this.onreadystatechange();
                }
                if (this.onload) {
                    this.onload();
                }
            }, 0);

            return;
        }

        return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (data) {
        // Nếu đã bị chặn ở open, không cần send
        if (this._url && isProblematicTrackingDomain(this._url)) {
            return;
        }

        // Thêm error handling cho các request khác
        this.addEventListener('error', (event) => {
            if (this._url && isProblematicTrackingDomain(this._url)) {
                console.warn(`🚫 XHR error for tracking service: ${this._url}`);
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.addEventListener('load', (event) => {
            if (this._url && isProblematicTrackingDomain(this._url) && this.status === 400) {
                console.warn(`⚠️ Tracking service returned 400: ${this._url}`);
                // Không làm gì, để app tiếp tục chạy
            }
        });

        return originalXHRSend.call(this, data);
    };
};

/**
 * Chặn script mm.js và các function sendEvents
 */
export const blockMMScript = () => {
    if (typeof window === 'undefined') return;

    // Override sendEvents function nếu tồn tại
    if (window.sendEvents) {
        window.sendEvents = function () {
            console.warn('🚫 Blocked sendEvents call from mm.js');
            return;
        };
    }

    // Override các function có thể liên quan đến mm.js
    const mmFunctions = ['sendEvents', '_mm', 'mm', 'trackEvent', 'track'];
    mmFunctions.forEach(funcName => {
        if (window[funcName]) {
            const originalFunc = window[funcName];
            window[funcName] = function (...args) {
                console.warn(`🚫 Blocked ${funcName} call from tracking script`);
                return;
            };
        }
    });

    // Chặn tạo script mm.js
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
        const element = originalCreateElement.call(this, tagName);

        if (tagName.toLowerCase() === 'script') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function (name, value) {
                if (name === 'src' && value && value.includes('mm.js')) {
                    console.warn('🚫 Blocked mm.js script creation');
                    return;
                }
                return originalSetAttribute.call(this, name, value);
            };
        }

        return element;
    };
};

/**
 * Override fetch để chặn lỗi tracking
 */
export const setupFetchErrorHandling = () => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    window.fetch = function (url, options = {}) {
        // Kiểm tra nếu là tracking domain có vấn đề
        if (isProblematicTrackingDomain(url)) {
            console.warn(`🚫 Blocked fetch request to problematic tracking domain: ${url}`);
            return Promise.resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(''),
                blob: () => Promise.resolve(new Blob()),
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
            });
        }

        // Thực hiện fetch bình thường với error handling
        return originalFetch.call(this, url, options)
            .then(response => {
                // Kiểm tra lỗi 400 từ tracking domains
                if (!response.ok && response.status === 400 && isProblematicTrackingDomain(url)) {
                    console.warn(`⚠️ Tracking service error (${response.status}): ${url}`);
                    // Trả về response giả để không làm crash app
                    return {
                        ok: true,
                        status: 200,
                        statusText: 'OK',
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve(''),
                        blob: () => Promise.resolve(new Blob()),
                        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
                    };
                }
                return response;
            })
            .catch(error => {
                if (isProblematicTrackingDomain(url)) {
                    console.warn(`🚫 Network error for tracking service: ${url}`, error.message);
                    // Trả về response giả để không làm crash app
                    return {
                        ok: true,
                        status: 200,
                        statusText: 'OK',
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve(''),
                        blob: () => Promise.resolve(new Blob()),
                        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
                    };
                }
                throw error;
            });
    };
};

/**
 * Khởi tạo error handling cho tất cả tracking services
 */
export const initTrackingErrorHandling = () => {
    if (typeof window === 'undefined') return;

    console.log('🛡️ Initializing tracking error handling...');

    // Setup error handling
    setupXHRErrorHandling();
    setupFetchErrorHandling();
    blockMMScript();

    // Override console.error để ẩn lỗi tracking
    const originalConsoleError = console.error;
    console.error = function (...args) {
        const message = args.join(' ');

        // Kiểm tra nếu là lỗi từ tracking domains hoặc mm.js
        if (PROBLEMATIC_TRACKING_DOMAINS.some(domain => message.includes(domain)) ||
            message.includes('mm.js') ||
            message.includes('sendEvents') ||
            message.includes('a.mrktmtrcs.net')) {
            console.warn('🚫 Suppressed tracking error:', ...args);
            return;
        }

        // Log lỗi bình thường
        originalConsoleError.apply(console, args);
    };

    // Override console.warn để ẩn cảnh báo Tracking Prevention
    const originalConsoleWarn = console.warn;
    console.warn = function (...args) {
        const message = args.join(' ');

        // Kiểm tra nếu là cảnh báo Tracking Prevention hoặc mm.js
        if (message.includes('Tracking Prevention blocked access to storage') ||
            message.includes('was preloaded using link preload but not used') ||
            message.includes('using deprecated parameters for the initialization function') ||
            message.includes('feature_collector.js') ||
            message.includes('mm.js') ||
            message.includes('sendEvents') ||
            message.includes('a.mrktmtrcs.net')) {
            // Chỉ log một lần để tránh spam
            if (!window._trackingWarningLogged) {
                console.info('🔒 Browser tracking prevention is active - this is normal and expected');
                window._trackingWarningLogged = true;
            }
            return;
        }

        // Log cảnh báo bình thường
        originalConsoleWarn.apply(console, args);
    };

    console.log('✅ Tracking error handling initialized');
};

/**
 * Kiểm tra trạng thái tracking services
 * @returns {Object} - Trạng thái của các tracking services
 */
export const getTrackingStatus = () => {
    return {
        errorHandlingActive: true,
        blockedDomains: PROBLEMATIC_TRACKING_DOMAINS,
        config: TRACKING_ERROR_CONFIG,
        timestamp: new Date().toISOString()
    };
};

// Auto-initialize khi module được import
if (typeof window !== 'undefined') {
    // Chờ DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTrackingErrorHandling);
    } else {
        initTrackingErrorHandling();
    }
}
