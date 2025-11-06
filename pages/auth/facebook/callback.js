import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

const decodeBase64UrlJson = (value) => {
    if (!value) return null;

    try {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
        const padding = (4 - (base64.length % 4)) % 4;
        const padded = base64 + '='.repeat(padding);
        const decoded = typeof window !== 'undefined' ? atob(padded) : Buffer.from(padded, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Failed to decode Facebook user payload:', error);
        return null;
    }
};

const FacebookCallbackPage = () => {
    const router = useRouter();
    const { isReady, query, replace } = router;
    const { loginWithProvider } = useAuth();
    const [status, setStatus] = useState('Đang xử lý đăng nhập Facebook...');
    const [errorMessage, setErrorMessage] = useState('');
    const [redirectDestination, setRedirectDestination] = useState('/chat');

    useEffect(() => {
        if (!isReady) return;

        const errorParam = Array.isArray(query.error) ? query.error[0] : query.error;

        if (errorParam) {
            console.error('Facebook login error:', errorParam);
            setStatus('Đăng nhập Facebook thất bại');
            setErrorMessage('Không thể hoàn thành đăng nhập bằng Facebook. Vui lòng thử lại.');
            return;
        }

        const token = Array.isArray(query.token) ? query.token[0] : query.token;
        const userPayload = Array.isArray(query.user) ? query.user[0] : query.user;
        const redirectState = Array.isArray(query.state) ? query.state[0] : query.state;

        if (!token || !userPayload) {
            setStatus('Thiếu thông tin đăng nhập Facebook');
            setErrorMessage('Không nhận được thông tin xác thực. Vui lòng thử đăng nhập lại.');
            return;
        }

        const userData = decodeBase64UrlJson(userPayload);

        if (!userData) {
            setStatus('Không thể xử lý thông tin người dùng');
            setErrorMessage('Dữ liệu người dùng trả về không hợp lệ. Vui lòng thử lại.');
            return;
        }

        loginWithProvider(token, userData);
        setStatus('Đăng nhập thành công! Đang chuyển hướng...');

        // Decode redirect state if it exists (default to chat page)
        let destination = '/chat';
        if (redirectState) {
            try {
                // Try to decode base64url JSON state
                const decoded = decodeBase64UrlJson(redirectState);
                if (decoded && typeof decoded === 'object' && decoded.originalState) {
                    destination = decoded.originalState.startsWith('/') ? decoded.originalState : destination;
                } else if (redirectState.startsWith('/')) {
                    destination = redirectState;
                }
            } catch (err) {
                console.warn('Could not decode redirect state, using default:', err);
                if (redirectState.startsWith('/')) {
                    destination = redirectState;
                }
            }
        }
        
        console.log('Redirecting to:', destination);
        setRedirectDestination(destination);

        // Redirect function - use window.location.href for hard redirect
        const performRedirect = (target) => {
            if (typeof window === 'undefined') {
                replace(target);
                return;
            }
            
            // Use window.location.href for hard redirect (works better than router)
            try {
                window.location.href = target;
            } catch (error) {
                console.error('Redirect error, trying router:', error);
                replace(target).catch(() => {
                    // Last resort: force reload to home then navigate
                    window.location.href = target;
                });
            }
        };

        // First attempt after 100ms (faster)
        const timeout1 = setTimeout(() => {
            console.log('Attempting redirect to:', destination);
            performRedirect(destination);
        }, 100);

        // Fallback after 1 second if still on page
        const timeout2 = setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/facebook/callback')) {
                console.warn('Auto redirect failed, forcing redirect to:', destination);
                performRedirect(destination);
            }
        }, 1000);

        // Last resort: force redirect after 3 seconds
        const timeout3 = setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/facebook/callback')) {
                console.error('All redirect attempts failed, forcing hard redirect to:', destination);
                window.location.replace(destination);
            }
        }, 3000);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
        };
    }, [isReady, query, loginWithProvider, replace]);

    return (
        <>
            <Head>
                <title>Đang xử lý đăng nhập Facebook...</title>
            </Head>
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 16px'
            }}>
                <div style={{ maxWidth: '420px' }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{status}</h1>
                    {errorMessage ? (
                        <>
                            <p style={{ color: '#b00020', marginBottom: '24px' }}>{errorMessage}</p>
                            <button
                                onClick={() => replace('/dang-nhap')}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '6px',
                                    background: '#1877f2',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Quay lại trang đăng nhập
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ color: '#555', marginBottom: '20px' }}>
                                Vui lòng đợi trong giây lát. Bạn sẽ được chuyển tới trang trước đó sau khi hoàn tất.
                            </p>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        window.location.href = redirectDestination;
                                    } else {
                                        replace(redirectDestination);
                                    }
                                }}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    background: '#1877f2',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#1666d9'}
                                onMouseOut={(e) => e.target.style.background = '#1877f2'}
                            >
                                Tiếp tục
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default FacebookCallbackPage;

