/**
 * Edit Article Page - Sửa bài viết tin tức
 * Dựa trên dang-bai.js nhưng có chức năng load và update bài viết
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from '../../styles/PostEditor.module.css';

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
                        Vui lòng nhập mật khẩu để truy cập trang sửa bài
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

// API functions
const getArticleById = async (id) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/articles/id/${id}?password=141920`);
    return response.json();
};

const updateArticle = async (id, articleData) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Create FormData for multipart request
    const formData = new FormData();

    // Add all text fields
    formData.append('password', '141920');
    formData.append('title', articleData.title);
    formData.append('excerpt', articleData.excerpt);
    formData.append('content', articleData.content);
    formData.append('category', articleData.category);
    formData.append('metaDescription', articleData.metaDescription);
    formData.append('author', articleData.author);
    formData.append('status', articleData.status);
    formData.append('isFeatured', articleData.isFeatured);
    formData.append('isTrending', articleData.isTrending);

    // Add arrays as JSON strings
    formData.append('tags', JSON.stringify(articleData.tags));
    formData.append('keywords', JSON.stringify(articleData.keywords));

    // Add featuredImage as JSON string if exists
    if (articleData.featuredImage) {
        formData.append('featuredImage', JSON.stringify(articleData.featuredImage));
    }

    // Add additional images if any
    if (articleData.images && articleData.images.length > 0) {
        articleData.images.forEach((image, index) => {
            formData.append('images', JSON.stringify(image));
        });
    }

    const response = await fetch(`${apiUrl}/api/articles/${id}`, {
        method: 'PUT',
        body: formData,
    });
    return response.json();
};

const uploadImage = async (file) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
    });
    const result = await response.json();

    // Cloudinary URL is already full URL (secure_url), no need to prepend apiUrl
    return result;
};

// Utility functions
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Components
const LoadingSpinner = () => (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Đang xử lý...</span>
    </div>
);

const ImageUpload = ({ value, onChange, error }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImage(file);
            if (result.success) {
                onChange({
                    ...result.data,
                    manualSet: true,
                    autoExtracted: false
                });
            } else {
                alert('Lỗi khi upload hình ảnh: ' + result.message);
            }
        } catch (error) {
            alert('Lỗi khi upload hình ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const removeImage = () => {
        onChange(null);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>Hình ảnh đại diện</label>
            {value ? (
                <div className={styles.imagePreview}>
                    {value.autoExtracted && (
                        <div className={styles.autoExtractedBadge}>
                            ✨ Tự động lấy từ nội dung
                        </div>
                    )}
                    {value?.url ? (
                        <Image
                            src={value.url}
                            alt={value.alt || 'Preview'}
                            width={400}
                            height={200}
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                                aspectRatio: '2/1'
                            }}
                            unoptimized={value.url.includes('cloudinary')}
                        />
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Không có ảnh</div>
                    )}
                    <div className={styles.imagePreviewActions}>
                        <button
                            type="button"
                            className={styles.imagePreviewButton}
                            onClick={removeImage}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`${styles.fileUpload} ${dragOver ? styles.dragover : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className={styles.fileUploadInput}
                        disabled={uploading}
                    />
                    <label className={styles.fileUploadLabel}>
                        {uploading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <div className={styles.fileUploadIcon}>📷</div>
                                <div className={styles.fileUploadText}>
                                    <div className={styles.fileUploadTitle}>
                                        Tải lên hình ảnh
                                    </div>
                                    <div className={styles.fileUploadSubtitle}>
                                        Kéo thả hoặc click để chọn file (JPG, PNG, GIF - tối đa 5MB)
                                    </div>
                                </div>
                            </>
                        )}
                    </label>
                </div>
            )}
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

const TagsInput = ({ value, onChange, error }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tag) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !value.includes(trimmedTag)) {
            onChange([...value, trimmedTag]);
        }
    };

    const removeTag = (tagToRemove) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
            setInputValue('');
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tags</label>
            <div className={styles.tagsContainer}>
                {value.map((tag) => (
                    <div key={tag} className={styles.tag}>
                        <span>{tag}</span>
                        <button
                            type="button"
                            className={styles.tagRemove}
                            onClick={() => removeTag(tag)}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tag và nhấn Enter..."
                    className={styles.tagsInput}
                />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

// Image Upload Dialog Component for Editor
const ImageUploadDialog = ({ isOpen, onClose, onInsertImage, uploadImage }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [currentImageCaption, setCurrentImageCaption] = useState('');
    const [currentImageAlt, setCurrentImageAlt] = useState('');
    const [showCaptionForm, setShowCaptionForm] = useState(false);
    const [pendingImage, setPendingImage] = useState(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImage(file);
            if (result.success) {
                const imageData = result.data;
                setPendingImage(imageData);
                setCurrentImageAlt(imageData.alt || '');
                setCurrentImageCaption('');
                setShowCaptionForm(true);
            } else {
                alert('Lỗi khi upload hình ảnh: ' + result.message);
            }
        } catch (error) {
            alert('Lỗi khi upload hình ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveImageWithCaption = () => {
        if (!pendingImage) return;

        const imageData = {
            ...pendingImage,
            caption: currentImageCaption.trim(),
            alt: currentImageAlt.trim() || currentImageCaption.trim() || 'Hình ảnh'
        };

        setUploadedImages(prev => [...prev, imageData]);
        setShowCaptionForm(false);
        setPendingImage(null);
        setCurrentImageCaption('');
        setCurrentImageAlt('');
    };

    const handleInsertImageWithCaption = (imageData) => {
        onInsertImage(imageData.url, imageData.alt || '', imageData.caption || '');
    };

    const handleUpdateCaption = (index, newCaption) => {
        setUploadedImages(prev => prev.map((img, i) => 
            i === index ? { ...img, caption: newCaption } : img
        ));
    };

    const handleUpdateAlt = (index, newAlt) => {
        setUploadedImages(prev => prev.map((img, i) => 
            i === index ? { ...img, alt: newAlt } : img
        ));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const insertExistingImage = (imageData) => {
        handleInsertImageWithCaption(imageData);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.imageDialogOverlay} onClick={onClose}>
            <div className={styles.imageDialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.imageDialogHeader}>
                    <h3>Chèn hình ảnh</h3>
                    <button className={styles.imageDialogClose} onClick={onClose}>×</button>
                </div>
                <div className={styles.imageDialogContent}>
                    {!showCaptionForm && (
                        <div
                            className={`${styles.imageUploadArea} ${dragOver ? styles.dragover : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className={styles.fileUploadInput}
                                disabled={uploading}
                                id="editor-image-upload"
                            />
                            <label htmlFor="editor-image-upload" className={styles.imageUploadLabel}>
                                {uploading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <>
                                        <div className={styles.imageUploadIcon}>📷</div>
                                        <div className={styles.imageUploadText}>
                                            <div className={styles.imageUploadTitle}>
                                                Tải lên hình ảnh mới
                                            </div>
                                            <div className={styles.imageUploadSubtitle}>
                                                Kéo thả hoặc click để chọn file (JPG, PNG, GIF - tối đa 5MB)
                                            </div>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    )}

                    {showCaptionForm && pendingImage && (
                        <div className={styles.captionForm}>
                            <h4>Thông tin hình ảnh</h4>
                            <div className={styles.imagePreviewSmall}>
                                {pendingImage?.url ? (
                                    <Image
                                        src={pendingImage.url}
                                        alt="Preview"
                                        width={200}
                                        height={150}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px'
                                        }}
                                        unoptimized={pendingImage.url.includes('cloudinary')}
                                    />
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>Không có ảnh</div>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Alt Text (mô tả ảnh)</label>
                                <input
                                    type="text"
                                    value={currentImageAlt}
                                    onChange={(e) => setCurrentImageAlt(e.target.value)}
                                    className={styles.formInput}
                                    placeholder="Nhập mô tả ảnh cho SEO..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Caption (chú thích hiển thị)</label>
                                <textarea
                                    value={currentImageCaption}
                                    onChange={(e) => setCurrentImageCaption(e.target.value)}
                                    className={styles.formTextarea}
                                    placeholder="Nhập chú thích cho hình ảnh (sẽ hiển thị dưới ảnh)..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.captionFormActions}>
                                <button
                                    type="button"
                                    className={`${styles.button} ${styles.secondary}`}
                                    onClick={() => {
                                        setShowCaptionForm(false);
                                        setPendingImage(null);
                                        setCurrentImageCaption('');
                                        setCurrentImageAlt('');
                                    }}
                                >
                                    Bỏ qua
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.button} ${styles.primary}`}
                                    onClick={handleSaveImageWithCaption}
                                >
                                    Lưu và thêm vào gallery
                                </button>
                            </div>
                        </div>
                    )}

                    {uploadedImages.length > 0 && !showCaptionForm && (
                        <div className={styles.uploadedImagesGallery}>
                            <h4>Ảnh đã upload ({uploadedImages.length}):</h4>
                            <div className={styles.uploadedImagesGrid}>
                                {uploadedImages.map((image, index) => (
                                    <div key={index} className={styles.uploadedImageCard}>
                                        <div
                                            className={styles.uploadedImageItem}
                                            onClick={() => insertExistingImage(image)}
                                        >
                                            {image?.url ? (
                                                <Image
                                                    src={image.url}
                                                    alt={image.alt || `Image ${index + 1}`}
                                                    width={150}
                                                    height={100}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        aspectRatio: '3/2',
                                                        cursor: 'pointer'
                                                    }}
                                                    unoptimized={image.url.includes('cloudinary')}
                                                />
                                            ) : (
                                                <div style={{ padding: '20px', textAlign: 'center' }}>Không có ảnh</div>
                                            )}
                                            <div className={styles.uploadedImageOverlay}>
                                                <span>Click để chèn</span>
                                            </div>
                                        </div>
                                        <div className={styles.imageCardInfo}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabelSmall}>Alt Text:</label>
                                                <input
                                                    type="text"
                                                    value={image.alt || ''}
                                                    onChange={(e) => handleUpdateAlt(index, e.target.value)}
                                                    className={styles.formInputSmall}
                                                    placeholder="Alt text..."
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabelSmall}>Caption:</label>
                                                <input
                                                    type="text"
                                                    value={image.caption || ''}
                                                    onChange={(e) => handleUpdateCaption(index, e.target.value)}
                                                    className={styles.formInputSmall}
                                                    placeholder="Chú thích..."
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RichTextEditor = ({ value, onChange, error }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);

    const insertHTML = (tag, placeholder = '') => {
        const textarea = document.querySelector(`textarea[name="content"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const replacement = placeholder || selectedText;

        let html;
        switch (tag) {
            case 'h1':
                html = `<h1>${replacement}</h1>`;
                break;
            case 'h2':
                html = `<h2>${replacement}</h2>`;
                break;
            case 'h3':
                html = `<h3>${replacement}</h3>`;
                break;
            case 'p':
                html = `<p>${replacement}</p>`;
                break;
            case 'strong':
                html = `<strong>${replacement}</strong>`;
                break;
            case 'em':
                html = `<em>${replacement}</em>`;
                break;
            case 'ul':
                html = `<ul>\n<li>${replacement}</li>\n</ul>`;
                break;
            case 'ol':
                html = `<ol>\n<li>${replacement}</li>\n</ol>`;
                break;
            case 'blockquote':
                html = `<blockquote>${replacement}</blockquote>`;
                break;
            case 'hr':
                html = '<hr>';
                break;
            case 'br':
                html = '<br>';
                break;
            default:
                html = replacement;
        }

        const newValue = value.substring(0, start) + html + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + html.length, start + html.length);
        }, 0);
    };

    const insertImage = (imageUrl, alt = '', caption = '') => {
        const textarea = document.querySelector(`textarea[name="content"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        const imageHTML = `\n<div style="text-align: center; margin: 20px 0;">
    <img src="${imageUrl}" alt="${alt || caption || 'Hình ảnh'}" style="max-width: 100%; height: auto; border-radius: 8px;" />
    ${caption ? `<p style="font-size: 14px; color: #666; margin-top: 8px; font-style: italic;">${caption}</p>` : ''}
</div>\n`;

        const newValue = value.substring(0, start) + imageHTML + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageHTML.length, start + imageHTML.length);
        }, 0);

        setShowImageDialog(false);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nội dung bài viết</label>

            <div className={styles.editorToolbar}>
                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('h1', 'Tiêu đề chính')} title="Tiêu đề chính">
                        H1
                    </button>
                    <button type="button" onClick={() => insertHTML('h2', 'Tiêu đề phụ')} title="Tiêu đề phụ">
                        H2
                    </button>
                    <button type="button" onClick={() => insertHTML('h3', 'Tiêu đề nhỏ')} title="Tiêu đề nhỏ">
                        H3
                    </button>
                    <button type="button" onClick={() => insertHTML('p', 'Đoạn văn')} title="Đoạn văn">
                        P
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('strong', 'Văn bản đậm')} title="Đậm">
                        <strong>B</strong>
                    </button>
                    <button type="button" onClick={() => insertHTML('em', 'Văn bản nghiêng')} title="Nghiêng">
                        <em>I</em>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('ul', 'Danh sách không thứ tự')} title="Danh sách">
                        UL
                    </button>
                    <button type="button" onClick={() => insertHTML('ol', 'Danh sách có thứ tự')} title="Danh sách số">
                        OL
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button type="button" onClick={() => insertHTML('blockquote', 'Trích dẫn')} title="Trích dẫn">
                        Quote
                    </button>
                    <button type="button" onClick={() => insertHTML('hr')} title="Đường kẻ ngang">
                        HR
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => setShowImageDialog(true)}
                        title="Chèn hình ảnh"
                    >
                        🖼️
                    </button>
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

            <ImageUploadDialog
                isOpen={showImageDialog}
                onClose={() => setShowImageDialog(false)}
                onInsertImage={insertImage}
                uploadImage={uploadImage}
            />

            <div className={styles.editorContainer}>
                {!showPreview ? (
                    <textarea
                        name="content"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${styles.formTextarea} ${styles.large} ${styles.htmlEditor} ${error ? styles.error : ''}`}
                        placeholder="Nhập nội dung bài viết... Bạn có thể sử dụng HTML hoặc các nút trên để format text."
                        rows={20}
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
export default function EditArticle() {
    const router = useRouter();
    const { id } = router.query;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loadingArticle, setLoadingArticle] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: [],
        keywords: [],
        metaDescription: '',
        author: 'Admin',
        status: 'published',
        featuredImage: null,
        images: [],
        isFeatured: false,
        isTrending: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

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

    // Load article when id is available
    useEffect(() => {
        if (id && isAuthenticated) {
            loadArticle();
        }
    }, [id, isAuthenticated]);

    const loadArticle = async () => {
        if (!id) return;

        setLoadingArticle(true);
        try {
            const result = await getArticleById(id);
            if (result.success) {
                const article = result.data;
                setFormData({
                    title: article.title || '',
                    excerpt: article.excerpt || '',
                    content: article.content || '',
                    category: article.category || '',
                    tags: article.tags || [],
                    keywords: article.keywords || [],
                    metaDescription: article.metaDescription || '',
                    author: article.author || 'Admin',
                    status: article.status || 'published',
                    featuredImage: article.featuredImage ? {
                        url: article.featuredImage.url,
                        alt: article.featuredImage.alt || article.title,
                        publicId: article.featuredImage.publicId
                    } : null,
                    images: article.images || [],
                    isFeatured: article.isFeatured || false,
                    isTrending: article.isTrending || false
                });
            } else {
                alert('Không tìm thấy bài viết: ' + result.message);
                router.push('/admin/quan-ly-tin-tuc');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            alert('Có lỗi xảy ra khi tải bài viết');
            router.push('/admin/quan-ly-tin-tuc');
        } finally {
            setLoadingArticle(false);
        }
    };

    const handleAuthenticated = () => {
        setIsAuthenticated(true);
    };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const categories = [
        { value: 'lien-minh-huyen-thoai', label: 'Liên Minh Huyền Thoại' },
        { value: 'lien-quan-mobile', label: 'Liên Quân Mobile' },
        { value: 'dau-truong-chan-ly-tft', label: 'Đấu Trường Chân Lý TFT' },
        { value: 'trending', label: 'Trending' }
    ];

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

        if (field === 'title') {
            const slug = generateSlug(value);
            setFormData(prev => ({
                ...prev,
                slug
            }));
        }

        if (field === 'excerpt' && !formData.metaDescription) {
            setFormData(prev => ({
                ...prev,
                metaDescription: value.length > 160 ? value.substring(0, 157) + '...' : value
            }));
        }

        if (field === 'content') {
            const readingTime = calculateReadingTime(value);
            setFormData(prev => ({
                ...prev,
                readingTime
            }));

            if (!formData.featuredImage || !formData.featuredImage.manualSet) {
                const firstImageMatch = value.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (firstImageMatch && firstImageMatch[1]) {
                    const imageUrl = firstImageMatch[1];
                    const altMatch = value.match(/<img[^>]+alt=["']([^"']*)["']/i);
                    const altText = altMatch ? altMatch[1] : '';
                    
                    setFormData(prev => ({
                        ...prev,
                        featuredImage: {
                            url: imageUrl,
                            alt: altText || prev.title || 'Featured Image',
                            autoExtracted: true
                        }
                    }));
                }
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.excerpt.trim()) {
            newErrors.excerpt = 'Tóm tắt là bắt buộc';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Nội dung là bắt buộc';
        }

        if (!formData.category) {
            newErrors.category = 'Danh mục là bắt buộc';
        }

        if (formData.excerpt.length > 500) {
            newErrors.excerpt = 'Tóm tắt không được vượt quá 500 ký tự';
        }

        if (formData.metaDescription && formData.metaDescription.length > 160) {
            newErrors.metaDescription = 'Meta description không được vượt quá 160 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (status) => {
        if (!validateForm()) {
            return;
        }

        if (!id) {
            alert('Không tìm thấy ID bài viết');
            return;
        }

        setLoading(true);
        try {
            const cleanedFeaturedImage = formData.featuredImage ? {
                url: formData.featuredImage.url,
                alt: formData.featuredImage.alt || formData.title || 'Featured Image',
                publicId: formData.featuredImage.publicId
            } : null;

            const articleData = {
                ...formData,
                featuredImage: cleanedFeaturedImage,
                images: [],
                status,
                publishedAt: status === 'published' ? new Date().toISOString() : null,
                slug: generateSlug(formData.title)
            };

            const result = await updateArticle(id, articleData);

            if (result.success) {
                alert(`Bài viết đã được ${status === 'published' ? 'cập nhật và xuất bản' : 'cập nhật'} thành công!`);
                router.push('/admin/quan-ly-tin-tuc');
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Có lỗi xảy ra khi cập nhật bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        setPreviewMode(true);
    };

    const closePreview = () => {
        setPreviewMode(false);
    };

    const seoData = {
        title: 'Sửa Bài Viết - Admin',
        description: 'Chỉnh sửa bài viết tin tức',
        canonical: `${siteUrl}/admin/sua-bai`
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Admin', url: `${siteUrl}/admin` },
        { name: 'Quản Lý Tin Tức', url: `${siteUrl}/admin/quan-ly-tin-tuc` },
        { name: 'Sửa Bài', url: `${siteUrl}/admin/sua-bai` }
    ];

    if (checkingAuth || loadingArticle) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>{loadingArticle ? 'Đang tải bài viết...' : 'Đang kiểm tra quyền truy cập...'}</p>
                </div>
            </Layout>
        );
    }

    if (!isAuthenticated) {
        return (
            <Layout>
                <AuthForm onAuthenticated={handleAuthenticated} />
            </Layout>
        );
    }

    if (!id) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <p>Không tìm thấy ID bài viết</p>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <SEOOptimized
                pageType="post-editor"
                title={seoData.title}
                description={seoData.description}
                canonical={seoData.canonical}
                breadcrumbs={breadcrumbs}
            />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <h1 className={styles.pageTitle}>Sửa Bài Viết</h1>
                        <p className={styles.pageSubtitle}>
                            Chỉnh sửa bài viết tin tức
                        </p>
                    </div>
                </div>

                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Thông tin bài viết</h2>
                        </div>

                        <div className={styles.formContent}>
                            <div className={styles.formGrid}>
                                <div className={styles.mainForm}>
                                    <div className={styles.formGroup}>
                                        <label className={`${styles.formLabel} ${styles.required}`}>
                                            Tiêu đề
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
                                            placeholder="Nhập tiêu đề bài viết..."
                                            maxLength={200}
                                        />
                                        {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={`${styles.formLabel} ${styles.required}`}>
                                            Tóm tắt
                                        </label>
                                        <textarea
                                            value={formData.excerpt}
                                            onChange={(e) => handleInputChange('excerpt', e.target.value)}
                                            className={`${styles.formTextarea} ${errors.excerpt ? styles.error : ''}`}
                                            placeholder="Nhập tóm tắt bài viết..."
                                            maxLength={500}
                                        />
                                        <div className={styles.characterCount}>
                                            {formData.excerpt.length}/500 ký tự
                                        </div>
                                        {errors.excerpt && <div className={styles.errorMessage}>{errors.excerpt}</div>}
                                    </div>

                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => handleInputChange('content', value)}
                                        error={errors.content}
                                    />

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Hình ảnh đại diện
                                        </label>
                                        <ImageUpload
                                            value={formData.featuredImage}
                                            onChange={(value) => handleInputChange('featuredImage', value)}
                                            error={errors.featuredImage}
                                        />
                                    </div>

                                    <TagsInput
                                        value={formData.tags}
                                        onChange={(value) => handleInputChange('tags', value)}
                                        error={errors.tags}
                                    />
                                </div>

                                <div className={styles.sidebar}>
                                    <div className={styles.sidebarCard}>
                                        <h3 className={styles.sidebarCardTitle}>Danh mục</h3>
                                        <div className={styles.formGroup}>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                className={`${styles.formSelect} ${errors.category ? styles.error : ''}`}
                                            >
                                                <option value="">Chọn danh mục</option>
                                                {categories.map((category) => (
                                                    <option key={category.value} value={category.value}>
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && <div className={styles.errorMessage}>{errors.category}</div>}
                                        </div>
                                    </div>

                                    <div className={styles.sidebarCard}>
                                        <h3 className={styles.sidebarCardTitle}>Trạng thái</h3>
                                        <div className={styles.radioGroup}>
                                            <label className={styles.radioItem}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="draft"
                                                    checked={formData.status === 'draft'}
                                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                                    className={styles.radioInput}
                                                />
                                                <span className={styles.radioLabel}>Bản nháp</span>
                                            </label>
                                            <label className={styles.radioItem}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="published"
                                                    checked={formData.status === 'published'}
                                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                                    className={styles.radioInput}
                                                />
                                                <span className={styles.radioLabel}>Xuất bản</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.sidebarCard}>
                                        <h3 className={styles.sidebarCardTitle}>Tùy chọn</h3>
                                        <div className={styles.checkboxGroup}>
                                            <label className={styles.checkboxItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isFeatured}
                                                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                                                    className={styles.checkboxInput}
                                                />
                                                <span className={styles.checkboxLabel}>Bài viết nổi bật</span>
                                            </label>
                                            <label className={styles.checkboxItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isTrending}
                                                    onChange={(e) => handleInputChange('isTrending', e.target.checked)}
                                                    className={styles.checkboxInput}
                                                />
                                                <span className={styles.checkboxLabel}>Tin nổi bật</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.sidebarCard}>
                                        <h3 className={styles.sidebarCardTitle}>SEO</h3>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Meta Description</label>
                                            <textarea
                                                value={formData.metaDescription}
                                                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                                                className={`${styles.formTextarea} ${errors.metaDescription ? styles.error : ''}`}
                                                placeholder="Mô tả ngắn cho SEO..."
                                                maxLength={160}
                                            />
                                            <div className={styles.characterCount}>
                                                {formData.metaDescription.length}/160 ký tự
                                            </div>
                                            {errors.metaDescription && <div className={styles.errorMessage}>{errors.metaDescription}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.actionButtons}>
                            <button
                                type="button"
                                className={`${styles.button} ${styles.outline}`}
                                onClick={handlePreview}
                                disabled={loading}
                            >
                                Xem trước
                            </button>
                            <button
                                type="button"
                                className={`${styles.button} ${styles.secondary}`}
                                onClick={() => handleSubmit('draft')}
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : 'Lưu bản nháp'}
                            </button>
                            <button
                                type="button"
                                className={`${styles.button} ${styles.primary}`}
                                onClick={() => handleSubmit('published')}
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner /> : 'Cập nhật và xuất bản'}
                            </button>
                        </div>
                    </div>
                </div>

                {previewMode && (
                    <div className={styles.previewModal} onClick={closePreview}>
                        <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.previewHeader}>
                                <h3 className={styles.previewTitle}>Xem trước bài viết</h3>
                                <button className={styles.previewClose} onClick={closePreview}>
                                    ×
                                </button>
                            </div>
                            <div className={styles.previewBody}>
                                <h1>{formData.title || 'Tiêu đề bài viết'}</h1>
                                <p><strong>Tóm tắt:</strong> {formData.excerpt || 'Chưa có tóm tắt'}</p>
                                <p><strong>Danh mục:</strong> {categories.find(c => c.value === formData.category)?.label || 'Chưa chọn'}</p>
                                <p><strong>Tags:</strong> {formData.tags.join(', ') || 'Chưa có tags'}</p>
                                <div>
                                    <strong>Nội dung:</strong>
                                    <div style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                                        {formData.content || 'Chưa có nội dung'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}

