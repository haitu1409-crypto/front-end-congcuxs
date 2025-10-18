/**
 * Trang Đăng Bài Dự Đoán Xổ Số
 * 4 loại dự đoán: Lotto, Đặc biệt, Bảng lô top, Wukong
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import { Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import styles from '../../styles/PredictionEditor.module.css';

// Authentication Component
const AuthForm = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (password === '141920') {
                localStorage.setItem('admin_authenticated', 'true');
                localStorage.setItem('admin_auth_time', Date.now().toString());
                onAuthenticated();
            } else {
                setError('Mật khẩu không đúng');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <Lock size={32} className={styles.authIcon} />
                    <h2 className={styles.authTitle}>Xác Thực Quyền Truy Cập</h2>
                    <p className={styles.authSubtitle}>
                        Vui lòng nhập mật khẩu để truy cập trang đăng dự đoán
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.passwordGroup}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className={styles.passwordInput}
                            required
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.togglePassword}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className={styles.authButton}
                    >
                        {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Đang xử lý...</span>
    </div>
);

// Rich Text Editor Component for HTML
const HTMLEditor = ({ label, value, onChange, error, placeholder }) => {
    const [showPreview, setShowPreview] = useState(false);

    const insertHTML = (tag) => {
        const textarea = document.querySelector(`textarea[name="${label}"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        let html;
        switch (tag) {
            case 'h2':
                html = `<h2>${selectedText || 'Tiêu đề'}</h2>`;
                break;
            case 'h3':
                html = `<h3>${selectedText || 'Tiêu đề phụ'}</h3>`;
                break;
            case 'p':
                html = `<p>${selectedText || 'Đoạn văn'}</p>`;
                break;
            case 'strong':
                html = `<strong>${selectedText || 'Văn bản đậm'}</strong>`;
                break;
            case 'em':
                html = `<em>${selectedText || 'Văn bản nghiêng'}</em>`;
                break;
            case 'ul':
                html = `<ul>\n<li>${selectedText || 'Mục 1'}</li>\n<li>Mục 2</li>\n</ul>`;
                break;
            case 'ol':
                html = `<ol>\n<li>${selectedText || 'Mục 1'}</li>\n<li>Mục 2</li>\n</ol>`;
                break;
            case 'table':
                html = `<table border="1" style="width:100%; border-collapse:collapse;">
<tr>
<th>Cột 1</th>
<th>Cột 2</th>
<th>Cột 3</th>
</tr>
<tr>
<td>Dữ liệu 1</td>
<td>Dữ liệu 2</td>
<td>Dữ liệu 3</td>
</tr>
</table>`;
                break;
            case 'br':
                html = '<br>';
                break;
            case 'hr':
                html = '<hr>';
                break;
            default:
                html = selectedText;
        }

        const newValue = value.substring(0, start) + html + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + html.length, start + html.length);
        }, 0);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>{label}</label>

            {/* Toolbar */}
            <div className={styles.editorToolbar}>
                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('h2')} title="Tiêu đề">
                        H2
                    </button>
                    <button type="button" onClick={() => insertHTML('h3')} title="Tiêu đề phụ">
                        H3
                    </button>
                    <button type="button" onClick={() => insertHTML('p')} title="Đoạn văn">
                        P
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('strong')} title="Đậm">
                        <strong>B</strong>
                    </button>
                    <button type="button" onClick={() => insertHTML('em')} title="Nghiêng">
                        <em>I</em>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('ul')} title="Danh sách">
                        UL
                    </button>
                    <button type="button" onClick={() => insertHTML('ol')} title="Danh sách số">
                        OL
                    </button>
                    <button type="button" onClick={() => insertHTML('table')} title="Bảng">
                        Table
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('br')} title="Xuống dòng">
                        BR
                    </button>
                    <button type="button" onClick={() => insertHTML('hr')} title="Đường kẻ">
                        HR
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={showPreview ? styles.active : ''}
                        title="Xem trước"
                    >
                        👁️
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className={styles.editorContainer}>
                {!showPreview ? (
                    <textarea
                        name={label}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${styles.formTextarea} ${styles.large} ${error ? styles.error : ''}`}
                        placeholder={placeholder || 'Nhập nội dung HTML...'}
                        rows={15}
                    />
                ) : (
                    <div
                        className={`${styles.formTextarea} ${styles.large} ${styles.previewContent}`}
                        dangerouslySetInnerHTML={{ __html: value || '<p>Nhập nội dung để xem trước...</p>' }}
                    />
                )}
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

// Main Component
export default function PredictionEditor() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Get current date in Vietnam timezone
    const getCurrentDate = () => {
        const now = new Date();
        const offset = 7 * 60; // UTC+7
        const vnTime = new Date(now.getTime() + offset * 60 * 1000);
        return vnTime.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        predictionDate: getCurrentDate(),
        lottoContent: '',
        specialContent: '',
        doubleJumpContent: '',
        topTableContent: '',
        wukongContent: '',
        author: 'Admin',
        status: 'published'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const isAuth = localStorage.getItem('admin_authenticated') === 'true';
            const authTime = localStorage.getItem('admin_auth_time');
            const currentTime = Date.now();

            if (isAuth && authTime && (currentTime - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('admin_authenticated');
                localStorage.removeItem('admin_auth_time');
                setIsAuthenticated(false);
            }
            setCheckingAuth(false);
        };

        checkAuth();
    }, []);

    const handleAuthenticated = () => {
        setIsAuthenticated(true);
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.predictionDate) {
            newErrors.predictionDate = 'Ngày dự đoán là bắt buộc';
        }

        if (!formData.lottoContent.trim()) {
            newErrors.lottoContent = 'Nội dung cầu Lotto là bắt buộc';
        }

        if (!formData.specialContent.trim()) {
            newErrors.specialContent = 'Nội dung cầu Đặc biệt là bắt buộc';
        }

        if (!formData.doubleJumpContent.trim()) {
            newErrors.doubleJumpContent = 'Nội dung cầu 2 nháy là bắt buộc';
        }

        if (!formData.topTableContent.trim()) {
            newErrors.topTableContent = 'Nội dung Bảng lô top là bắt buộc';
        }

        if (!formData.wukongContent.trim()) {
            newErrors.wukongContent = 'Nội dung Dự đoán wukong là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccessMessage('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${apiUrl}/api/predictions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    password: '141920'
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccessMessage('Đăng dự đoán thành công!');
                // Reset form
                setFormData({
                    predictionDate: getCurrentDate(),
                    lottoContent: '',
                    specialContent: '',
                    doubleJumpContent: '',
                    topTableContent: '',
                    wukongContent: '',
                    author: 'Admin',
                    status: 'published'
                });

                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating prediction:', error);
            alert('Có lỗi xảy ra khi đăng dự đoán');
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // SEO Data
    const seoData = {
        title: 'Đăng Dự Đoán Xổ Số - Tạo Dàn Đề',
        description: 'Đăng bài dự đoán xổ số hàng ngày',
        canonical: `${siteUrl}/admin/dang-dudoan`
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Admin', url: `${siteUrl}/admin` },
        { name: 'Đăng Dự Đoán', url: `${siteUrl}/admin/dang-dudoan` }
    ];

    // Show loading while checking authentication
    if (checkingAuth) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                </div>
            </Layout>
        );
    }

    // Show authentication form if not authenticated
    if (!isAuthenticated) {
        return (
            <Layout>
                <AuthForm onAuthenticated={handleAuthenticated} />
            </Layout>
        );
    }

    return (
        <>
            <SEOOptimized
                pageType="admin"
                title={seoData.title}
                description={seoData.description}
                canonical={seoData.canonical}
                breadcrumbs={breadcrumbs}
            />
            <PageSpeedOptimizer />

            <Layout>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <h1 className={styles.pageTitle}>Đăng Dự Đoán Xổ Số</h1>
                        <p className={styles.pageSubtitle}>
                            Đăng bài dự đoán với 5 loại: Cầu Lotto, Cầu Đặc biệt, Cầu 2 nháy, Bảng lô top, Dự đoán Wukong
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        {successMessage && (
                            <div className={styles.successMessage}>
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formContent}>
                                {/* Date Selection */}
                                <div className={styles.formGroup}>
                                    <label className={`${styles.formLabel} ${styles.required}`}>
                                        <Calendar size={18} style={{ marginRight: '8px' }} />
                                        Ngày dự đoán
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.predictionDate}
                                        onChange={(e) => handleInputChange('predictionDate', e.target.value)}
                                        className={`${styles.formInput} ${errors.predictionDate ? styles.error : ''}`}
                                    />
                                    <div className={styles.datePreview}>
                                        Ngày hiển thị: {formatDate(formData.predictionDate)}
                                    </div>
                                    {errors.predictionDate && (
                                        <div className={styles.errorMessage}>{errors.predictionDate}</div>
                                    )}
                                </div>

                                {/* Cầu Lotto */}
                                <HTMLEditor
                                    label={`Cầu Lotto đẹp nhất hôm này ngày: ${formatDate(formData.predictionDate)}`}
                                    value={formData.lottoContent}
                                    onChange={(value) => handleInputChange('lottoContent', value)}
                                    error={errors.lottoContent}
                                    placeholder="Nhập nội dung dự đoán cầu Lotto dạng HTML..."
                                />

                                {/* Cầu Đặc biệt */}
                                <HTMLEditor
                                    label={`Cầu Đặc biệt đẹp nhất hôm nay ngày: ${formatDate(formData.predictionDate)}`}
                                    value={formData.specialContent}
                                    onChange={(value) => handleInputChange('specialContent', value)}
                                    error={errors.specialContent}
                                    placeholder="Nhập nội dung dự đoán cầu Đặc biệt dạng HTML..."
                                />

                                {/* Cầu 2 nháy */}
                                <HTMLEditor
                                    label={`Cầu 2 nháy đẹp nhất hôm nay ngày: ${formatDate(formData.predictionDate)}`}
                                    value={formData.doubleJumpContent}
                                    onChange={(value) => handleInputChange('doubleJumpContent', value)}
                                    error={errors.doubleJumpContent}
                                    placeholder="Nhập nội dung dự đoán cầu 2 nháy dạng HTML..."
                                />

                                {/* Bảng lô top */}
                                <HTMLEditor
                                    label={`Bảng lô top ngày: ${formatDate(formData.predictionDate)}`}
                                    value={formData.topTableContent}
                                    onChange={(value) => handleInputChange('topTableContent', value)}
                                    error={errors.topTableContent}
                                    placeholder="Nhập nội dung Bảng lô top dạng HTML (có thể dùng bảng table)..."
                                />

                                {/* Dự đoán Wukong */}
                                <HTMLEditor
                                    label={`Dự đoán Wukong ngày: ${formatDate(formData.predictionDate)}`}
                                    value={formData.wukongContent}
                                    onChange={(value) => handleInputChange('wukongContent', value)}
                                    error={errors.wukongContent}
                                    placeholder="Nhập nội dung dự đoán Wukong dạng HTML..."
                                />

                                {/* Author */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Tác giả</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => handleInputChange('author', e.target.value)}
                                        className={styles.formInput}
                                        placeholder="Nhập tên tác giả..."
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className={styles.actionButtons}>
                                <button
                                    type="button"
                                    className={`${styles.button} ${styles.outline}`}
                                    onClick={() => router.push('/')}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.button} ${styles.primary}`}
                                    disabled={loading}
                                >
                                    {loading ? <LoadingSpinner /> : 'Đăng Dự Đoán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
}

