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
                
                {/* ===== GOOGLE ANALYTICS (gtag.js) ===== */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-RLCH8J3MHR"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-RLCH8J3MHR', {
                            page_title: document.title,
                            page_location: window.location.href,
                            custom_map: {
                                'custom_parameter_1': 'dande_tool',
                                'custom_parameter_2': 'vietnam_lottery'
                            }
                        });
                    `
                }} />

                {/* ===== SYSTEM FONTS ONLY - No external font loading ===== */}

                {/* ===== FAVICONS - Sử dụng ảnh từ thư mục imgs ===== */}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
                <link rel="shortcut icon" href="/favicon.ico" />

                {/* ===== PWA ICONS ===== */}
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
                <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />

                {/* ===== PWA MANIFEST ===== */}
                <link rel="manifest" href="/manifest.json" />

                {/* ===== THEME COLOR - Cập nhật cho thương hiệu con khỉ ===== */}
                <meta name="theme-color" content="#667eea" />
                <meta name="msapplication-TileColor" content="#667eea" />
                <meta name="msapplication-TileImage" content="/icon-192.png" />

                {/* ===== APPLE MOBILE WEB APP ===== */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Dàn Đề Tôn Ngộ Không" />

                {/* ===== MICROSOFT TILES ===== */}
                <meta name="msapplication-config" content="/browserconfig.xml" />

                {/* ===== INLINE CRITICAL CSS - Font loading optimization ===== */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            /* System fonts fallback for instant render */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            /* Prevent FOUC (Flash of Unstyled Content) */
            html {
              visibility: visible;
              opacity: 1;
            }
            
            /* Smooth scrolling */
            html {
              scroll-behavior: smooth;
            }
            
            /* Focus visible for accessibility */
            :focus-visible {
              outline: 2px solid #4F46E5;
              outline-offset: 2px;
            }
          `
                }} />
            </Head>
            <body>
                {/* ===== PRELOADER ===== */}
                <div id="__next_preloader" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'opacity 0.3s ease-out',
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid rgba(255,255,255,0.3)',
                        borderTop: '5px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{
                        color: 'white',
                        marginTop: '20px',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                    }}>
                        Đang tải...
                    </p>
                    <style dangerouslySetInnerHTML={{
                        __html: `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
                    }} />
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <Main />

                {/* ===== NEXT.JS SCRIPTS ===== */}
                <NextScript />

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

