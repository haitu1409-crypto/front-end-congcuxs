import Script from 'next/script';

const FacebookSdkLoader = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const version = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v19.0';
    const enableCookie = (process.env.NEXT_PUBLIC_FACEBOOK_ENABLE_COOKIE || 'true').toLowerCase() !== 'false';
    const autoLogAppEvents = (process.env.NEXT_PUBLIC_FACEBOOK_AUTO_LOG_APP_EVENTS || 'true').toLowerCase() !== 'false';

    if (!appId) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[FacebookSdkLoader] Thiếu NEXT_PUBLIC_FACEBOOK_APP_ID, bỏ qua việc tải SDK');
        }
        return null;
    }

    const initScriptContent = `
        window.fbAsyncInit = function() {
            var dispatchStatusEvent = function(response) {
                try {
                    window.dispatchEvent(new CustomEvent('facebook-login-status', { detail: response }));
                } catch (err) {
                    if (typeof document !== 'undefined' && document.createEvent) {
                        var evt = document.createEvent('CustomEvent');
                        evt.initCustomEvent('facebook-login-status', false, false, response);
                        window.dispatchEvent(evt);
                    }
                }
            };

            if (typeof FB === 'undefined') {
                console.warn('[Facebook SDK] FB chưa sẵn sàng tại thời điểm khởi tạo.');
                return;
            }

            FB.init({
                appId: '${appId}',
                cookie: ${enableCookie},
                xfbml: true,
                version: '${version}'
            });

            ${autoLogAppEvents ? 'if (FB.AppEvents && typeof FB.AppEvents.logPageView === "function") { FB.AppEvents.logPageView(); }' : ''}

            FB.getLoginStatus(function(response) {
                dispatchStatusEvent(response);
            });

            FB.Event.subscribe('auth.statusChange', function(response) {
                dispatchStatusEvent(response);
            });

            if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
                try {
                    document.dispatchEvent(new Event('facebook-sdk-ready'));
                } catch (err) {
                    var readyEvent = document.createEvent('Event');
                    readyEvent.initEvent('facebook-sdk-ready', false, false);
                    document.dispatchEvent(readyEvent);
                }
            }
        };
    `;

    return (
        <>
            <div id="fb-root" />
            <Script
                id="facebook-sdk-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: initScriptContent }}
            />
            <Script
                id="facebook-jssdk"
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="lazyOnload"
                crossOrigin="anonymous"
            />
        </>
    );
};

export default FacebookSdkLoader;

