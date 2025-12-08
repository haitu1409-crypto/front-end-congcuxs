/**
 * Chat Page - Groupchat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import ChatRoom from '../components/Chat/ChatRoom';
import ChatVerificationModal from '../components/Chat/ChatVerificationModal';
import AuthModal from '../components/Auth/AuthModal';
import axios from 'axios';
import styles from '../styles/ChatPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatPage() {
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [roomId, setRoomId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVerification, setShowVerification] = useState(false);
    const [accessChecked, setAccessChecked] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    const isDev = process.env.NODE_ENV !== 'production';
    const roomIdRef = useRef(null);
    const groupchatAbortRef = useRef(null);
    const groupchatRetryTimeoutRef = useRef(null);

    useEffect(() => {
        roomIdRef.current = roomId;
    }, [roomId]);

    // Ensure viewport height units behave correctly on mobile browsers
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        const setAppHeight = () => {
            const viewport = window.visualViewport;
            const height = viewport?.height ?? window.innerHeight;
            root.style.setProperty('--app-height', `${height}px`);
        };

        setAppHeight();

        const viewport = window.visualViewport;

        window.addEventListener('resize', setAppHeight);
        window.addEventListener('orientationchange', setAppHeight);

        if (viewport) {
            viewport.addEventListener('resize', setAppHeight);
            viewport.addEventListener('scroll', setAppHeight);
        }

        return () => {
            window.removeEventListener('resize', setAppHeight);
            window.removeEventListener('orientationchange', setAppHeight);

            if (viewport) {
                viewport.removeEventListener('resize', setAppHeight);
                viewport.removeEventListener('scroll', setAppHeight);
            }
        };
    }, []);

    // Watch for room query param changes
    useEffect(() => {
        if (router.isReady) {
            if (router.query.room) {
                if (isDev) {
                    console.log('🔄 Room query param detected:', router.query.room);
                }
                setRoomId(router.query.room);
                setLoading(false);
                setError(null);
            } else {
                // No query param - need to fetch groupchat
                if (isDev) {
                    console.log('🔄 No room param, resetting to fetch groupchat');
                }
                setRoomId(null);
                setAccessChecked(false); // Reset to trigger fetch
            }
        }
    }, [router.isReady, router.query.room, isDev]);

    // Don't redirect, just show login message

    // Set loading to false when auth check is done and user is not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated]);

    // Get groupchat room
    const getGroupchatRoom = useCallback(async () => {
        if (!token) return;

        if (groupchatRetryTimeoutRef.current) {
            clearTimeout(groupchatRetryTimeoutRef.current);
            groupchatRetryTimeoutRef.current = null;
        }

        if (groupchatAbortRef.current) {
            groupchatAbortRef.current.abort();
            groupchatAbortRef.current = null;
        }

        const abortController = new AbortController();
        groupchatAbortRef.current = abortController;

        try {
            if (isDev) {
                console.log('🔍 Fetching groupchat room...');
            }
            const response = await axios.get(`${API_URL}/api/chat/groupchat`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: abortController.signal
            });

            if (isDev) {
                console.log('📦 Response:', response.data);
            }

            if (response.data.success && response.data.data?.room?.roomId) {
                if (isDev) {
                    console.log('✅ Room ID:', response.data.data.room.roomId);
                }
                setRoomId(response.data.data.room.roomId);
                setError(null);
            } else {
                const errorMsg = 'Không thể lấy thông tin phòng chat';
                console.error('❌ Invalid response structure:', response.data);
                setError(errorMsg);
            }
        } catch (error) {
            if (axios.isCancel(error) || error.name === 'AbortError') {
                return;
            }

            console.error('❌ Get groupchat room error:', error.message || error);
            let errorMsg = 'Lỗi khi kết nối đến server';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                } else if (error.response.status === 403) {
                    if (error.response.data?.requiresVerification) {
                        setShowVerification(true);
                        return;
                    }
                    errorMsg = error.response.data?.message || 'Bạn không có quyền truy cập chat';
                } else if (error.response.status === 429) {
                    errorMsg = 'Quá nhiều yêu cầu. Vui lòng đợi 1-2 phút rồi thử lại.';
                    groupchatRetryTimeoutRef.current = setTimeout(() => {
                        if (!roomIdRef.current) {
                            getGroupchatRoom();
                        } else {
                            groupchatRetryTimeoutRef.current = null;
                        }
                    }, 120000);
                } else if (error.response.data?.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.request) {
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }

            setError(errorMsg);
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(false);
            }

            if (groupchatAbortRef.current === abortController) {
                groupchatAbortRef.current = null;
            }
        }
    }, [token, isDev]);

    // Check chat access first
    useEffect(() => {
        if (!token || !isAuthenticated || accessChecked) {
            return;
        }

        // Skip access check if we have a direct room ID from query params
        if (router.isReady && router.query.room) {
            setAccessChecked(true);
            return;
        }

        let isMounted = true;
        const abortController = new AbortController();

        const checkAccess = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/chat/check-access`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    signal: abortController.signal
                });

                if (!isMounted) return;

                if (response.data.success) {
                    if (!response.data.hasAccess) {
                        if (response.data.reason === 'banned') {
                            setError('Tài khoản của bạn đã bị cấm sử dụng chat');
                            setLoading(false);
                            setAccessChecked(true);
                        } else if (response.data.reason === 'not_verified') {
                            setShowVerification(true);
                            setLoading(false);
                            setAccessChecked(true);
                        }
                    } else {
                        // User has access, proceed to get room
                        setAccessChecked(true);
                        getGroupchatRoom();
                    }
                }
            } catch (error) {
                if (axios.isCancel(error) || error.name === 'AbortError') {
                    return;
                }
                if (isMounted) {
                    console.error('Check access error:', error.message || error);
                    
                    // Handle 429 error
                    if (error.response?.status === 429) {
                        setError('Quá nhiều yêu cầu. Vui lòng đợi 1-2 phút rồi thử lại.');
                    } else {
                        setError('Lỗi khi kiểm tra quyền truy cập');
                    }
                    setLoading(false);
                }
            }
        };

        checkAccess();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [token, isAuthenticated, accessChecked, router.isReady, router.query.room, getGroupchatRoom]);

    const handleVerified = () => {
        setShowVerification(false);
        setAccessChecked(false); // Reset to check again
        getGroupchatRoom();
    };

    useEffect(() => {
        return () => {
            if (groupchatRetryTimeoutRef.current) {
                clearTimeout(groupchatRetryTimeoutRef.current);
                groupchatRetryTimeoutRef.current = null;
            }
            if (groupchatAbortRef.current) {
                groupchatAbortRef.current.abort();
                groupchatAbortRef.current = null;
            }
        };
    }, []);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <>
                <Head>
                    <title>Chat - Group Chat | Dàn Đề Wukong</title>
                </Head>
                <div className={styles.chatPage}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải...</p>
                    </div>
                </div>
            </>
        );
    }

    // Show login message if not authenticated (only after auth check is done)
    if (!isAuthenticated) {
        return (
            <>
                <Head>
                    <title>Chat - Đăng nhập | Dàn Đề Wukong</title>
                    <meta name="description" content="Bạn cần đăng nhập để sử dụng chat" />
                </Head>
                <div className={styles.chatPage}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorMessage}>
                            <h3>🔒 Yêu cầu đăng nhập</h3>
                            <p>Bạn cần đăng nhập để sử dụng tính năng chat. Vui lòng đăng nhập để tiếp tục.</p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                                <button 
                                    onClick={() => {
                                        setAuthModalMode('login');
                                        setShowLoginModal(true);
                                    }}
                                    className={styles.loginButton}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <span>Đăng Nhập</span>
                                </button>
                                <button 
                                    onClick={() => router.push('/')}
                                    className={styles.cancelButton}
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                    <AuthModal 
                        isOpen={showLoginModal} 
                        onClose={() => setShowLoginModal(false)}
                        initialMode={authModalMode}
                    />
                </div>
            </>
        );
    }

    // Show error if exists
    if (error && !loading) {
        return (
            <>
                <Head>
                    <title>Chat - Group Chat | Dàn Đề Wukong</title>
                </Head>
                <div className={styles.chatPage}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorMessage}>
                            <h3>⚠️ Lỗi</h3>
                            <p>{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className={styles.retryButton}
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Get chat URL for sharing
    const chatUrl = typeof window !== 'undefined' 
        ? (process.env.NODE_ENV === 'production' 
            ? 'https://taodandewukong.pro/chat' 
            : `${window.location.origin}/chat`)
        : 'https://taodandewukong.pro/chat';

    const defaultOrigin = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://taodandewukong.pro';

    const ogImage = process.env.NODE_ENV === 'production'
        ? 'https://taodandewukong.pro/imgs/monkey.png'
        : `${defaultOrigin}/imgs/monkey.png`;
    
    const ogTitle = 'Group Chat Chốt Dàn 3 Miền Wukong';
    const ogDescription = 'Tham gia Group Chat để chia sẻ và thảo luận về dàn đề chốt số 3 miền cùng cộng đồng Wukong';

    return (
        <>
            <Head>
                <title>Chat - Group Chat | Dàn Đề Wukong</title>
                <meta name="description" content="Group chat - Trò chuyện với mọi người trong cộng đồng Dàn Đề Wukong" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={chatUrl} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Group Chat Chốt Dàn 3 Miền Wukong" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={chatUrl} />
                <meta name="twitter:title" content={ogTitle} />
                <meta name="twitter:description" content={ogDescription} />
                <meta name="twitter:image" content={ogImage} />
            </Head>
            <div className={styles.chatPage}>
                <div className={styles.chatLayout}>
                    {/* Cột trái - để trống, có thể thêm nội dung sau */}
                    <div className={styles.leftColumn}></div>
                    
                    {/* Cột giữa - Chat */}
                    <div className={styles.centerColumn}>
                        {showVerification && (
                            <ChatVerificationModal
                                isOpen={showVerification}
                                onClose={() => {
                                    // Only close modal, don't redirect
                                    setShowVerification(false);
                                }}
                                onVerified={handleVerified}
                                token={token}
                            />
                        )}
                        {!showVerification && roomId && (
                            <ChatRoom roomId={roomId} />
                        )}
                    </div>
                    
                    {/* Cột phải - để trống, có thể thêm nội dung sau */}
                    <div className={styles.rightColumn}></div>
                </div>
            </div>
        </>
    );
}

