/**
 * Modern Login Page - Secure Authentication
 * Optimized for user experience and security
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import styles from '../styles/LoginPage.module.css';

// API functions
const loginUser = async (credentials) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return response.json();
};

// Utility functions
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

// Components
const LoadingSpinner = () => (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Đang đăng nhập...</span>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className={styles.errorMessage}>
        <span>⚠️</span>
        <span>{message}</span>
    </div>
);

const SuccessMessage = ({ message }) => (
    <div className={styles.successMessage}>
        <span>✅</span>
        <span>{message}</span>
    </div>
);

// Main Component
export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            router.push('/admin');
        }
    }, [router]);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
        
        // Clear general message
        if (message) {
            setMessage('');
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await loginUser(formData);
            
            if (result.success) {
                // Store token
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                setMessage('Đăng nhập thành công! Đang chuyển hướng...');
                
                // Redirect after short delay
                setTimeout(() => {
                    const redirectTo = router.query.redirect || '/admin';
                    router.push(redirectTo);
                }, 1500);
            } else {
                setMessage(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Handle social login
    const handleSocialLogin = (provider) => {
        // Implement social login logic here
        console.log(`Login with ${provider}`);
        setMessage(`Tính năng đăng nhập bằng ${provider} đang được phát triển.`);
    };

    // SEO Data
    const seoData = {
        title: 'Đăng Nhập - Tạo Dàn Đề',
        description: 'Đăng nhập vào hệ thống quản lý bài viết và dàn số chuyên nghiệp',
        canonical: `${siteUrl}/dang-nhap`
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Đăng Nhập', url: `${siteUrl}/dang-nhap` }
    ];

    return (
        <>
            <SEOOptimized
                pageType="login"
                title={seoData.title}
                description={seoData.description}
                canonical={seoData.canonical}
                breadcrumbs={breadcrumbs}
            />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.pageWrapper}>
                    <div className={styles.container}>
                        <div className={styles.loginContainer}>
                            {/* Left Side - Branding */}
                            <div className={styles.brandingSection}>
                                <div className={styles.brandLogo}>
                                    🎯
                                </div>
                                <h1 className={styles.brandTitle}>
                                    Tạo Dàn Đề
                                </h1>
                                <p className={styles.brandSubtitle}>
                                    Hệ thống quản lý bài viết và công cụ tạo dàn số chuyên nghiệp
                                </p>
                                <ul className={styles.brandFeatures}>
                                    <li className={styles.brandFeature}>
                                        <div className={styles.brandFeatureIcon}>✓</div>
                                        <span>Quản lý bài viết dễ dàng</span>
                                    </li>
                                    <li className={styles.brandFeature}>
                                        <div className={styles.brandFeatureIcon}>✓</div>
                                        <span>Công cụ tạo dàn số thông minh</span>
                                    </li>
                                    <li className={styles.brandFeature}>
                                        <div className={styles.brandFeatureIcon}>✓</div>
                                        <span>Thống kê và phân tích chi tiết</span>
                                    </li>
                                    <li className={styles.brandFeature}>
                                        <div className={styles.brandFeatureIcon}>✓</div>
                                        <span>Bảo mật cao cấp</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Right Side - Login Form */}
                            <div className={styles.formSection}>
                                <div className={styles.formHeader}>
                                    <h2 className={styles.formTitle}>Đăng Nhập</h2>
                                    <p className={styles.formSubtitle}>
                                        Nhập thông tin để truy cập hệ thống
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className={styles.loginForm}>
                                    {/* Email */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                                            placeholder="Nhập email của bạn..."
                                            autoComplete="email"
                                            disabled={loading}
                                        />
                                        {errors.email && <ErrorMessage message={errors.email} />}
                                    </div>

                                    {/* Password */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Mật khẩu
                                        </label>
                                        <div className={styles.passwordInput}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                                                placeholder="Nhập mật khẩu..."
                                                autoComplete="current-password"
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
                                        {errors.password && <ErrorMessage message={errors.password} />}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className={styles.formOptions}>
                                        <div className={styles.checkboxGroup}>
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                                className={styles.checkboxInput}
                                                disabled={loading}
                                            />
                                            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                                                Ghi nhớ đăng nhập
                                            </label>
                                        </div>
                                        <Link href="/quen-mat-khau" className={styles.forgotLink}>
                                            Quên mật khẩu?
                                        </Link>
                                    </div>

                                    {/* General Message */}
                                    {message && (
                                        <div>
                                            {message.includes('thành công') ? (
                                                <SuccessMessage message={message} />
                                            ) : (
                                                <ErrorMessage message={message} />
                                            )}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? <LoadingSpinner /> : 'Đăng Nhập'}
                                    </button>

                                    {/* Divider */}
                                    <div className={styles.divider}>
                                        <span>Hoặc</span>
                                    </div>

                                    {/* Social Login */}
                                    <div className={styles.socialLogin}>
                                        <button
                                            type="button"
                                            className={`${styles.socialButton} ${styles.google}`}
                                            onClick={() => handleSocialLogin('Google')}
                                            disabled={loading}
                                        >
                                            <span className={styles.socialIcon}>🔍</span>
                                            <span>Đăng nhập bằng Google</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.socialButton} ${styles.facebook}`}
                                            onClick={() => handleSocialLogin('Facebook')}
                                            disabled={loading}
                                        >
                                            <span className={styles.socialIcon}>📘</span>
                                            <span>Đăng nhập bằng Facebook</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Sign Up Link */}
                                <div className={styles.signupSection}>
                                    <p className={styles.signupText}>
                                        Chưa có tài khoản?
                                    </p>
                                    <Link href="/dang-ky" className={styles.signupLink}>
                                        Đăng ký ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
