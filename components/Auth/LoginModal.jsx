/**
 * Login Modal Component
 * Modal đăng nhập đơn giản
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, X } from 'lucide-react';
import styles from '../../styles/LoginModal.module.css';

export default function LoginModal({ isOpen, onClose }) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin');
            setLoading(false);
            return;
        }

        try {
            const result = await login(username.trim(), password);
            if (result.success) {
                onClose();
                // Refresh page to update auth state
                window.location.reload();
            } else {
                setError(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className={styles.modalHeader}>
                    <div className={styles.iconWrapper}>
                        <User size={24} />
                    </div>
                    <h2 className={styles.modalTitle}>Đăng Nhập</h2>
                    <p className={styles.modalSubtitle}>Nhập thông tin để tiếp tục</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.formInput}
                            placeholder="Nhập tên đăng nhập..."
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mật khẩu</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.formInput}
                                placeholder="Nhập mật khẩu..."
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.loadingText}>Đang đăng nhập...</span>
                        ) : (
                            'Đăng Nhập'
                        )}
                    </button>
                </form>

                <div className={styles.signupSection}>
                    <p className={styles.signupText}>
                        Chưa có tài khoản?
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            // Open AuthModal with register mode
                            // This will be handled by parent component
                            if (window.openAuthModal) {
                                window.openAuthModal('register');
                            }
                        }}
                        className={styles.signupLink}
                    >
                        Đăng ký ngay
                    </button>
                </div>
            </div>
        </div>
    );
}

