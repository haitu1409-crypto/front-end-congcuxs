/**
 * Auth Modal Component - Đăng ký/Đăng nhập
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Lock, Eye, EyeOff, Facebook } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import FacebookLoginButton from './FacebookLoginButton';
import styles from '../../styles/AuthModal.module.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const { login, register, facebookStatus, checkFacebookLoginStatus } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [portalContainer, setPortalContainer] = useState(null);
    const scrollPositionRef = useRef(0);
    const overlayRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        password: '',
        confirmPassword: ''
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError('');
            setFormData({
                username: '',
                displayName: '',
                password: '',
                confirmPassword: ''
            });

            if (typeof checkFacebookLoginStatus === 'function') {
                checkFacebookLoginStatus();
            }
        }
    }, [isOpen, initialMode, checkFacebookLoginStatus]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let container = document.getElementById('auth-modal-root');
        if (!container) {
            container = document.createElement('div');
            container.setAttribute('id', 'auth-modal-root');
            container.setAttribute('role', 'presentation');
            container.style.position = 'relative';
            container.style.zIndex = '1500';
            document.body.appendChild(container);
        }
        setPortalContainer(container);
    }, []);

    useEffect(() => {
        if (!portalContainer) return;

        if (!isOpen) {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('width');
            document.body.style.removeProperty('touch-action');
            document.documentElement.style.removeProperty('overscroll-behavior');
            document.documentElement.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('height');

            const scrollY = scrollPositionRef.current;
            if (typeof window !== 'undefined' && Number.isFinite(scrollY)) {
                window.scrollTo(0, scrollY);
            }
            return;
        }

        if (typeof window !== 'undefined') {
            scrollPositionRef.current = window.scrollY || window.pageYOffset || 0;
        }

        const previousOverflow = document.body.style.overflow;
        const previousPosition = document.body.style.position;
        const previousTop = document.body.style.top;
        const previousWidth = document.body.style.width;
        const previousTouchAction = document.body.style.touchAction;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
        const previousHtmlHeight = document.documentElement.style.height;

        document.documentElement.style.overscrollBehavior = 'contain';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = '100%';
        document.body.style.touchAction = 'none';

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.position = previousPosition;
            document.body.style.top = previousTop;
            document.body.style.width = previousWidth;
            document.body.style.touchAction = previousTouchAction;
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
            document.documentElement.style.height = previousHtmlHeight;

            if (typeof window !== 'undefined') {
                window.scrollTo(0, scrollPositionRef.current);
            }
        };
    }, [isOpen, portalContainer]);

    useEffect(() => {
        if (!isOpen) return;
        const overlayEl = overlayRef.current;
        if (!overlayEl) return;

        const preventDefault = (event) => {
            if (event.cancelable) {
                event.preventDefault();
            }
        };

        overlayEl.addEventListener('touchmove', preventDefault, { passive: false });
        overlayEl.addEventListener('wheel', preventDefault, { passive: false });

        return () => {
            overlayEl.removeEventListener('touchmove', preventDefault);
            overlayEl.removeEventListener('wheel', preventDefault);
        };
    }, [isOpen]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.username || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        const result = await login(formData.username, formData.password);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.message || 'Đăng nhập thất bại');
        }
    };

    const handleFacebookLogin = useCallback(() => {
        if (typeof window === 'undefined') return;

        setLoading(true);

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const successRedirect = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI || `${window.location.origin}/auth/facebook/callback`;
        const stateValue = `${window.location.pathname}${window.location.search}`;

        const params = new URLSearchParams();
        params.set('success_redirect', successRedirect);
        if (stateValue) {
            params.set('state', stateValue);
        }

        window.location.href = `${apiBase}/api/auth/facebook?${params.toString()}`;
    }, []);

    const handleFacebookStatusChange = useCallback((response) => {
        if (response?.status === 'connected') {
            handleFacebookLogin();
        }
    }, [handleFacebookLogin]);

    // Handle register
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.username || !formData.displayName || !formData.password || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            setLoading(false);
            return;
        }

        if (formData.username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.message || 'Đăng ký thất bại');
        }
    };

    // Switch mode
    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setFormData({
            username: '',
            displayName: '',
            password: '',
            confirmPassword: ''
        });
    };

    if (!isOpen || !portalContainer) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className={styles.modalOverlay}
            onClick={onClose}
        >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                    </h2>
                    <p className={styles.modalSubtitle}>
                        {mode === 'login'
                            ? 'Chào mừng bạn trở lại!'
                            : 'Tạo tài khoản mới để bắt đầu'}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.socialLogin}>
                    <button
                        type="button"
                        className={styles.facebookButton}
                        onClick={handleFacebookLogin}
                        disabled={loading}
                    >
                        <Facebook size={18} />
                        <span>Đăng nhập bằng Facebook</span>
                    </button>
                    <div className={styles.facebookOfficialButton}>
                        <FacebookLoginButton onStatusChange={handleFacebookStatusChange} />
                    </div>
                    <div className={styles.facebookStatus}>
                        {facebookStatus === 'connected' && 'Facebook đã sẵn sàng kết nối với ứng dụng.'}
                        {facebookStatus === 'not_authorized' && 'Bạn đã đăng nhập Facebook nhưng chưa cấp quyền cho ứng dụng.'}
                        {facebookStatus === 'unknown' && 'Bạn chưa đăng nhập Facebook hoặc phiên đã hết hạn.'}
                        <button
                            type="button"
                            className={styles.facebookStatusRefresh}
                            onClick={() => checkFacebookLoginStatus?.()}
                            disabled={loading}
                        >
                            Kiểm tra lại
                        </button>
                    </div>
                </div>

                <div className={styles.sectionDivider}>
                    <span>Hoặc</span>
                </div>

                {/* Form */}
                <form
                    className={styles.authForm}
                    onSubmit={mode === 'login' ? handleLogin : handleRegister}
                >
                    {/* Username */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <User size={16} />
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập"
                            className={styles.input}
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* Display Name (only for register) */}
                    {mode === 'register' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <User size={16} />
                                Tên người dùng
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="Nhập tên hiển thị"
                                className={styles.input}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Lock size={16} />
                            Mật khẩu
                        </label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                className={styles.input}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (only for register) */}
                    {mode === 'register' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Lock size={16} />
                                Nhắc lại mật khẩu
                            </label>
                            <div className={styles.passwordInput}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    className={styles.input}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
                    </button>
                </form>

                {/* Switch mode */}
                <div className={styles.switchMode}>
                    {mode === 'login' ? (
                        <>
                            <span>Chưa có tài khoản? </span>
                            <button onClick={switchMode} className={styles.switchButton}>
                                Đăng ký ngay
                            </button>
                        </>
                    ) : (
                        <>
                            <span>Đã có tài khoản? </span>
                            <button onClick={switchMode} className={styles.switchButton}>
                                Đăng nhập
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        portalContainer
    );
}

