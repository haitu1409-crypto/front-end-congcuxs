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

        const destination = redirectState && redirectState.startsWith('/') ? redirectState : '/';

        const timeout = setTimeout(() => {
            replace(destination).catch((error) => {
                console.error('Navigation error after Facebook login:', error);
                replace('/');
            });
        }, 500);

        return () => clearTimeout(timeout);
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
                        <p style={{ color: '#555' }}>
                            Vui lòng đợi trong giây lát. Bạn sẽ được chuyển tới trang trước đó sau khi hoàn tất.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default FacebookCallbackPage;

