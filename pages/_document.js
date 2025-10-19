/**
 * Custom Document
 * Tùy chỉnh HTML document structure cho SEO tối ưu
 * Tối ưu performance với preload, prefetch, và font optimization
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="vi">
            <Head>
                {/* ===== DNS PREFETCH & PRECONNECT ===== */}
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://www.googletagmanager.com" />

                {/* ===== CRITICAL RESOURCE PRELOAD ===== */}
                {/* Only preload critical resources that are used immediately above the fold */}
                {/* Removed unnecessary preloads to avoid browser warnings */}

                {/* ===== CRITICAL CSS FOR CLS PREVENTION ===== */}
                <link rel="preload" href="/styles/critical.css" as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
                <noscript><link rel="stylesheet" href="/styles/critical.css" /></noscript>

                {/* ===== GOOGLE ANALYTICS (gtag.js) - DEFER LOADING ===== */}
                <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-RLCH8J3MHR"
                    onLoad="window.gtag=window.gtag||function(){(gtag.q=gtag.q||[]).push(arguments)};gtag('js',new Date());gtag('config',{measurement_id:'G-RLCH8J3MHR'})"
                />


                {/* ===== SYSTEM FONTS ONLY - No external font loading ===== */}

                {/* ===== FAVICONS - Sử dụng favicon.ico chính thức ===== */}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="shortcut icon" href="/favicon.ico" />

                {/* ===== PWA ICONS ===== */}
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

                {/* ===== PWA MANIFEST ===== */}
                <link rel="manifest" href="/manifest.json" />

                {/* ===== THEME COLOR - Cập nhật cho thương hiệu con khỉ ===== */}
                <meta name="theme-color" content="#667eea" />
                <meta name="msapplication-TileColor" content="#667eea" />
                <meta name="msapplication-TileImage" content="/icon-192.png" />

                {/* ===== APPLE MOBILE WEB APP ===== */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Dàn Đề Wukong" />

                {/* ===== MICROSOFT TILES ===== */}
                <meta name="msapplication-config" content="/browserconfig.xml" />

                {/* ===== INLINE CRITICAL CSS - Optimized for PageSpeed ===== */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            /* Critical CSS for above-the-fold content */
            html {
              visibility: visible;
              opacity: 1;
              scroll-behavior: smooth;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              line-height: 1.6;
            }
            
            /* Critical above-the-fold styles */
            .container {
              max-width: 1280px;
              margin: 0 auto;
              padding: 0 1rem;
            }
            
            .header {
              text-align: center;
              margin-bottom: 2rem;
              padding: 1.5rem 1rem;
              background: #fff;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .mainTitle {
              font-size: 1.5rem;
              font-weight: 700;
              color: #111827;
              margin-bottom: 0.5rem;
            }
            
            .subtitle {
              font-size: 0.875rem;
              color: #6b7280;
              line-height: 1.5;
              /* ✅ Fix CLS: Reserve space to prevent layout shift */
              min-height: 60px;
              contain: layout style;
              font-display: swap;
            }
            
            /* Focus visible for accessibility */
            :focus-visible {
              outline: 2px solid #4F46E5;
              outline-offset: 2px;
            }
            
            /* Loading skeleton */
            .loadingSkeleton {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
              border-radius: 8px;
              margin: 1rem 0;
              color: #666;
              font-weight: 500;
              /* ✅ Fix CLS: Reserve space for loading states */
              min-height: 200px;
              contain: layout style;
            }
            
            /* ✅ CLS Prevention for TodayPredictions */
            .today-predictions-container,
            [class*="TodayPredictions"] {
              contain: layout style;
              min-height: 50px;
              height: auto;
            }
            
            /* ✅ CLS Prevention for dynamic components */
            [class*="dynamic"],
            [class*="lazy"] {
              min-height: 150px;
              height: 150px;
              contain: layout style;
              overflow: hidden;
            }
            
            /* ✅ CRITICAL: Prevent layout shift for subtitle element */
            [class*="subtitle"],
            p[class*="subtitle"] {
              min-height: 60px !important;
              height: 60px !important;
              contain: layout style !important;
              font-display: swap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            /* ✅ CRITICAL: Prevent layout shift for text elements */
            h1, h2, h3, h4, h5, h6 {
              font-display: swap !important;
              contain: layout style !important;
            }
            
            h1 {
              min-height: 2.5rem !important;
              height: 2.5rem !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            h2 {
              min-height: 2rem !important;
              height: 2rem !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            h3 {
              min-height: 1.75rem !important;
              height: 1.75rem !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
                }} />
            </Head>
            <body>
                {/* ===== MAIN CONTENT ===== */}
                <Main />

                {/* ===== NEXT.JS SCRIPTS ===== */}
                <NextScript />

                {/* ===== TRACKING ERROR HANDLER - EARLY INIT ===== */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        // Early tracking error prevention
                        (function() {
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
                                'cdn.tynt.com',
                                'match.adsrvr.org',
                                'adsrvr.org',
                                'crwdcntrl.net',
                                'sync.crwdcntrl.net',
                                'match?publisher_dsp_id',
                                'dsp_callback'
                            ];

                            // Kiểm tra xem URL có phải là tracking domain có vấn đề không
                            const isProblematicTrackingDomain = (url) => {
                                try {
                                    const urlObj = new URL(url);
                                    return PROBLEMATIC_TRACKING_DOMAINS.some(domain => 
                                        urlObj.hostname.includes(domain)
                                    );
                                } catch (error) {
                                    return false;
                                }
                            };

                            // Override XMLHttpRequest ngay từ đầu để tránh InvalidStateError
                            if (typeof XMLHttpRequest !== 'undefined') {
                                const OriginalXHR = XMLHttpRequest;
                                function SafeXMLHttpRequest() {
                                    const xhr = new OriginalXHR();
                                    let isBlocked = false;
                                    let blockedUrl = null;

                                    const originalOpen = xhr.open;
                                    const originalSend = xhr.send;
                                    const originalSetRequestHeader = xhr.setRequestHeader;

                                    xhr.open = function(method, url, ...args) {
                                        blockedUrl = url;
                                        isBlocked = isProblematicTrackingDomain(url);
                                        
                                        if (isBlocked) {
                                            console.warn('🚫 Early blocked XHR request to: ' + url);
                                            // Set fake response immediately
                                            Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
                                            Object.defineProperty(xhr, 'status', { value: 200, writable: false });
                                            Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false });
                                            Object.defineProperty(xhr, 'responseText', { value: '{}', writable: false });
                                            Object.defineProperty(xhr, 'response', { value: '{}', writable: false });
                                            return;
                                        }
                                        
                                        return originalOpen.call(this, method, url, ...args);
                                    };

                                    xhr.setRequestHeader = function(name, value) {
                                        if (isBlocked) {
                                            console.warn('🚫 Early blocked setRequestHeader for: ' + blockedUrl);
                                            return;
                                        }
                                        return originalSetRequestHeader.call(this, name, value);
                                    };

                                    xhr.send = function(data) {
                                        if (isBlocked) {
                                            console.warn('🚫 Early blocked send for: ' + blockedUrl);
                                            // Trigger fake load event
                                            setTimeout(() => {
                                                if (xhr.onreadystatechange) xhr.onreadystatechange();
                                                if (xhr.onload) xhr.onload();
                                            }, 0);
                                            return;
                                        }
                                        return originalSend.call(this, data);
                                    };

                                    return xhr;
                                }

                                // Replace global XMLHttpRequest
                                SafeXMLHttpRequest.prototype = OriginalXHR.prototype;
                                window.XMLHttpRequest = SafeXMLHttpRequest;
                            }

                            // Block mm.js functions early
                            if (typeof window !== 'undefined') {
                                // Override sendEvents function
                                window.sendEvents = function() {
                                    console.warn('🚫 Early blocked sendEvents call');
                                    return;
                                };
                                
                                // Block other potential tracking functions
                                ['_mm', 'mm', 'trackEvent', 'track', 'sendEvent', 'trackEvent'].forEach(funcName => {
                                    window[funcName] = function() {
                                        console.warn('🚫 Early blocked ' + funcName + ' call');
                                        return;
                                    };
                                });

                                // Block mm.js script loading
                                const originalAppendChild = Node.prototype.appendChild;
                                Node.prototype.appendChild = function(child) {
                                    if (child.tagName === 'SCRIPT' && child.src && child.src.includes('mm.js')) {
                                        console.warn('🚫 Blocked mm.js script loading');
                                        return child; // Return without appending
                                    }
                                    return originalAppendChild.call(this, child);
                                };

                                // Block dynamic script creation
                                const originalCreateElement = Document.prototype.createElement;
                                Document.prototype.createElement = function(tagName) {
                                    const element = originalCreateElement.call(this, tagName);
                                    if (tagName.toLowerCase() === 'script') {
                                        const originalSetAttribute = element.setAttribute;
                                        element.setAttribute = function(name, value) {
                                            if (name === 'src' && value && value.includes('mm.js')) {
                                                console.warn('🚫 Blocked mm.js script creation');
                                                return;
                                            }
                                            return originalSetAttribute.call(this, name, value);
                                        };
                                    }
                                    return element;
                                };
                            }
                        })();
                    `
                }} />

                {/* ===== TRACKING ERROR HANDLER ===== */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        // Initialize tracking error handling
                        if (typeof window !== 'undefined') {
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
                                'cdn.tynt.com',
                                'match.adsrvr.org',
                                'adsrvr.org',
                                'crwdcntrl.net',
                                'sync.crwdcntrl.net',
                                'match?publisher_dsp_id',
                                'dsp_callback'
                            ];

                            // Kiểm tra xem URL có phải là tracking domain có vấn đề không
                            const isProblematicTrackingDomain = (url) => {
                                try {
                                    const urlObj = new URL(url);
                                    return PROBLEMATIC_TRACKING_DOMAINS.some(domain => 
                                        urlObj.hostname.includes(domain)
                                    );
                                } catch (error) {
                                    return false;
                                }
                            };

                            // Chặn script mm.js và các function sendEvents
                            const blockMMScript = () => {
                                // Override sendEvents function nếu tồn tại
                                if (window.sendEvents) {
                                    window.sendEvents = function() {
                                        console.warn('🚫 Blocked sendEvents call from mm.js');
                                        return;
                                    };
                                }

                                // Override các function có thể liên quan đến mm.js
                                const mmFunctions = ['sendEvents', '_mm', 'mm', 'trackEvent', 'track'];
                                mmFunctions.forEach(funcName => {
                                    if (window[funcName]) {
                                        window[funcName] = function(...args) {
                                            console.warn('🚫 Blocked ' + funcName + ' call from tracking script');
                                            return;
                                        };
                                    }
                                });
                            };

                            // Override fetch để chặn lỗi tracking
                            const setupFetchErrorHandling = () => {
                                const originalFetch = window.fetch;
                                
                                window.fetch = function(url, options = {}) {
                                    // Kiểm tra nếu là tracking domain có vấn đề
                                    if (isProblematicTrackingDomain(url)) {
                                        console.warn('🚫 Blocked fetch request to problematic tracking domain: ' + url);
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
                                                console.warn('⚠️ Tracking service error (' + response.status + '): ' + url);
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
                                                console.warn('🚫 Network error for tracking service: ' + url, error.message);
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

                            // Override console.error để ẩn lỗi tracking
                            const originalConsoleError = console.error;
                            console.error = function(...args) {
                                const message = args.join(' ');
                                
                                // Kiểm tra nếu là lỗi từ tracking domains hoặc mm.js
                                if (PROBLEMATIC_TRACKING_DOMAINS.some(domain => message.includes(domain)) ||
                                    message.includes('mm.js') ||
                                    message.includes('sendEvents') ||
                                    message.includes('a.mrktmtrcs.net') ||
                                    message.includes('crwdcntrl.net') ||
                                    message.includes('publisher_dsp_id') ||
                                    message.includes('dsp_callback') ||
                                    message.includes('ERR_NAME_NOT_RESOLVED')) {
                                    console.warn('🚫 Suppressed tracking error:', ...args);
                                    return;
                                }
                                
                                // Log lỗi bình thường
                                originalConsoleError.apply(console, args);
                            };

                            // Override console.warn để ẩn cảnh báo Tracking Prevention
                            const originalConsoleWarn = console.warn;
                            console.warn = function(...args) {
                                const message = args.join(' ');

                                // Kiểm tra nếu là cảnh báo Tracking Prevention hoặc tracking domains
                                if (message.includes('Tracking Prevention blocked access to storage') || 
                                    message.includes('was preloaded using link preload but not used') ||
                                    message.includes('using deprecated parameters for the initialization function') ||
                                    message.includes('feature_collector.js') ||
                                    message.includes('mm.js') ||
                                    message.includes('sendEvents') ||
                                    message.includes('a.mrktmtrcs.net') ||
                                    message.includes('t.dtscout.com') ||
                                    message.includes('ic.tynt.com') ||
                                    message.includes('de.tynt.com') ||
                                    message.includes('cdn.tynt.com') ||
                                    message.includes('match.adsrvr.org') ||
                                    message.includes('crwdcntrl.net') ||
                                    message.includes('publisher_dsp_id') ||
                                    message.includes('dsp_callback') ||
                                    message.includes('ERR_NAME_NOT_RESOLVED')) {
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

                            // Override XMLHttpRequest để chặn lỗi tracking
                            const setupXHRErrorHandling = () => {
                                const originalXHROpen = XMLHttpRequest.prototype.open;
                                const originalXHRSend = XMLHttpRequest.prototype.send;
                                const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

                                XMLHttpRequest.prototype.open = function(method, url, ...args) {
                                    this._url = url;
                                    this._method = method;
                                    this._isBlocked = false;
                                    
                                    // Kiểm tra nếu là tracking domain có vấn đề
                                    if (isProblematicTrackingDomain(url)) {
                                        console.warn('🚫 Blocked XHR request to problematic tracking domain: ' + url);
                                        this._isBlocked = true;
                                        
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

                                // Override setRequestHeader để tránh InvalidStateError
                                XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
                                    // Nếu request đã bị chặn, không set header
                                    if (this._isBlocked) {
                                        console.warn('🚫 Blocked setRequestHeader for blocked request: ' + this._url);
                                        return;
                                    }
                                    
                                    // Kiểm tra nếu đang cố set header cho tracking domain
                                    if (this._url && isProblematicTrackingDomain(this._url)) {
                                        console.warn('🚫 Blocked setRequestHeader for tracking domain: ' + this._url);
                                        return;
                                    }
                                    
                                    return originalSetRequestHeader.call(this, name, value);
                                };

                                XMLHttpRequest.prototype.send = function(data) {
                                    // Nếu đã bị chặn ở open, không cần send
                                    if (this._isBlocked || (this._url && isProblematicTrackingDomain(this._url))) {
                                        console.warn('🚫 Blocked send for blocked request: ' + this._url);
                                        return;
                                    }
                                    
                                    // Thêm error handling cho các request khác
                                    this.addEventListener('error', (event) => {
                                        if (this._url && isProblematicTrackingDomain(this._url)) {
                                            console.warn('🚫 XHR error for tracking service: ' + this._url);
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    });
                                    
                                    this.addEventListener('load', (event) => {
                                        if (this._url && isProblematicTrackingDomain(this._url) && this.status === 400) {
                                            console.warn('⚠️ Tracking service returned 400: ' + this._url);
                                            // Không làm gì, để app tiếp tục chạy
                                        }
                                    });
                                    
                                    return originalXHRSend.call(this, data);
                                };
                            };

                            // Khởi tạo tracking error handling
                            console.log('🛡️ Initializing tracking error handling...');
                            blockMMScript();
                            setupFetchErrorHandling();
                            setupXHRErrorHandling();
                            console.log('✅ Tracking error handling initialized');
                        }
                    `
                }} />

                {/* ===== NOSCRIPT FALLBACK ===== */}
                <noscript>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        padding: '20px',
                        background: '#FEE2E2',
                        color: '#991B1B',
                        textAlign: 'center',
                        zIndex: 10000,
                        fontWeight: 'bold',
                    }}>
                        ⚠️ Vui lòng bật JavaScript để sử dụng website này.
                    </div>
                </noscript>
            </body>
        </Html>
    );
}

