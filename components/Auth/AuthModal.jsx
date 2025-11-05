/**
 * Auth Modal Component - Đăng ký/Đăng nhập
 */

import { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/AuthModal.module.css';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        }
    }, [isOpen, initialMode]);

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

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
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
        </div>
    );
}

