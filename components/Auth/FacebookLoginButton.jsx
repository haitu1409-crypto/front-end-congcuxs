import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_SCOPE = process.env.NEXT_PUBLIC_FACEBOOK_SCOPES || 'public_profile,email';

const sanitize = (value) => {
    if (!value) return '';
    return String(value).replace(/"/g, '&quot;');
};

const FacebookLoginButton = ({
    scope = DEFAULT_SCOPE,
    size = 'large',
    buttonType = 'continue_with',
    layout = 'default',
    autoLogoutLink = false,
    useContinueAs = true,
    onStatusChange
}) => {
    const containerRef = useRef(null);
    const handlerNameRef = useRef(`fbLoginHandler_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const { checkFacebookLoginStatus } = useAuth();

    const renderButton = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const scopeValue = sanitize(scope);
        const sizeValue = sanitize(size);
        const typeValue = sanitize(buttonType);
        const layoutValue = sanitize(layout);
        const autoLogoutValue = autoLogoutLink ? 'true' : 'false';
        const continueAsValue = useContinueAs ? 'true' : 'false';

        const handlerName = handlerNameRef.current;

        if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="fb-login-button"
                data-width=""
                data-size="${sizeValue}"
                data-button-type="${typeValue}"
                data-layout="${layoutValue}"
                data-auto-logout-link="${autoLogoutValue}"
                data-use-continue-as="${continueAsValue}"
                data-scope="${scopeValue}"
                data-onlogin="${handlerName}">
            </div>`;

            if (window.FB?.XFBML?.parse) {
                window.FB.XFBML.parse(containerRef.current);
            }
        }
    }, [scope, size, buttonType, layout, autoLogoutLink, useContinueAs]);

    useEffect(() => {
        const handlerName = handlerNameRef.current;

        window[handlerName] = (response) => {
            if (typeof onStatusChange === 'function') {
                onStatusChange(response);
            }
            if (typeof checkFacebookLoginStatus === 'function') {
                checkFacebookLoginStatus();
            }
        };

        return () => {
            delete window[handlerName];
        };
    }, [onStatusChange, checkFacebookLoginStatus]);

    useEffect(() => {
        renderButton();

        const handleReady = () => {
            renderButton();
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('facebook-sdk-ready', handleReady);
        }

        return () => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('facebook-sdk-ready', handleReady);
            }
        };
    }, [renderButton]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.FB?.XFBML?.parse && containerRef.current) {
            window.FB.XFBML.parse(containerRef.current);
        }
    }, []);

    return <div ref={containerRef} />;
};

export default FacebookLoginButton;

