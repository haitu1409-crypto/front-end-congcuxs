/**
 * Modern Post Editor - Optimized for SEO and User Experience
 * Responsive design with accessibility features
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

        // Simulate API call delay
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
                        Vui lòng nhập mật khẩu để truy cập trang đăng bài
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
const createArticle = async (articleData) => {
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

    const response = await fetch(`${apiUrl}/api/articles/create`, {
        method: 'POST',
        body: formData, // Don't set Content-Type, let browser set it for FormData
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

    // Convert relative URL to full URL for Next.js Image component
    // Only prepend apiUrl if the URL is relative (starts with /)
    if (result.success && result.data.url) {
        let imageUrl = result.data.url;

        // Fix malformed URLs where apiUrl was incorrectly prepended to absolute URLs
        // Example: "http://localhost:5000https://res.cloudinary.com/..."
        const malformedPattern = /^(https?:\/\/[^\/]+)(https?:\/\/.+)$/;
        const malformedMatch = imageUrl.match(malformedPattern);
        if (malformedMatch) {
            // Extract the correct absolute URL (the second part)
            imageUrl = malformedMatch[2];
            console.warn('Fixed malformed URL in uploadImage:', result.data.url, '->', imageUrl);
        }

        // Only prepend apiUrl if URL is relative (starts with /) and not already absolute
        if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
            // Relative path - prepend apiUrl
            result.data.url = `${apiUrl}${imageUrl}`;
        } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Already absolute URL - use as is
            result.data.url = imageUrl;
        } else if (imageUrl.startsWith('//')) {
            // Protocol-relative URL - add https:
            result.data.url = `https:${imageUrl}`;
        } else {
            // Unknown format - try to use as relative path
            result.data.url = `${apiUrl}/${imageUrl}`;
        }
    }

    return result;
};

// Utility functions
const validateImageUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url === '') {
        return null;
    }

    let urlString = String(url).trim();
    if (!urlString) {
        return null;
    }

    // Fix malformed URLs where apiUrl was incorrectly prepended to absolute URLs
    const malformedPattern = /^(https?:\/\/[^\/]+)(https?:\/\/.+)$/;
    const malformedMatch = urlString.match(malformedPattern);
    if (malformedMatch) {
        urlString = malformedMatch[2];
        console.warn('Fixed malformed URL:', url, '->', urlString);
    }

    // Validate URL format
    try {
        // Try to create URL object to validate
        const urlObj = new URL(urlString.startsWith('//') ? `https:${urlString}` : urlString);
        return urlObj.href;
    } catch {
        // If URL is invalid, return null to use fallback
        console.warn('Invalid image URL:', urlString);
        return null;
    }
};

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
                // Đánh dấu là được set thủ công
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
                    {validateImageUrl(value.url) ? (
                        <Image
                            src={validateImageUrl(value.url)}
                            alt={value.alt || 'Preview'}
                            width={400}
                            height={200}
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                                aspectRatio: '2/1'
                            }}
                            unoptimized={validateImageUrl(value.url)?.includes('cloudinary.com')}
                        />
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <span>URL hình ảnh không hợp lệ</span>
                        </div>
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

const MultipleImageUpload = ({ value = [], onChange, error }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileInput = async (e) => {
        const files = Array.from(e.target.files);
        await uploadFiles(files);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        await uploadFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const uploadFiles = async (files) => {
        setUploading(true);
        try {
            const uploadPromises = files.map(file => uploadImage(file));
            const results = await Promise.all(uploadPromises);

            const newImages = results
                .filter(result => result.success)
                .map(result => result.data);

            onChange([...value, ...newImages]);
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        const newImages = value.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>Hình ảnh bổ sung</label>

            {/* Upload Area */}
            <div
                className={`${styles.fileUpload} ${dragOver ? styles.dragover : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
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
                                    Tải lên nhiều hình ảnh
                                </div>
                                <div className={styles.fileUploadSubtitle}>
                                    Kéo thả hoặc click để chọn nhiều file (JPG, PNG, GIF - tối đa 5MB mỗi file)
                                </div>
                            </div>
                        </>
                    )}
                </label>
            </div>

            {/* Images Preview */}
            {value.length > 0 && (
                <div className={styles.imagesGrid}>
                    {value.map((image, index) => (
                        <div key={index} className={styles.imagePreview}>
                            {validateImageUrl(image.url) ? (
                                <Image
                                    src={validateImageUrl(image.url)}
                                    alt={image.alt || `Image ${index + 1}`}
                                    width={150}
                                    height={100}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        aspectRatio: '3/2'
                                    }}
                                    unoptimized={validateImageUrl(image.url)?.includes('cloudinary.com')}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <span>URL không hợp lệ</span>
                                </div>
                            )}
                            <button
                                type="button"
                                className={styles.imagePreviewButton}
                                onClick={() => removeImage(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
                // Hiển thị form nhập caption
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
                    {/* Upload Area */}
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

                    {/* Caption Form */}
                    {showCaptionForm && pendingImage && (
                        <div className={styles.captionForm}>
                            <h4>Thông tin hình ảnh</h4>
                            <div className={styles.imagePreviewSmall}>
                                {validateImageUrl(pendingImage.url) ? (
                                    <Image
                                        src={validateImageUrl(pendingImage.url)}
                                        alt="Preview"
                                        width={200}
                                        height={150}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px'
                                        }}
                                        unoptimized={validateImageUrl(pendingImage.url)?.includes('cloudinary.com')}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <span>URL không hợp lệ</span>
                                    </div>
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

                    {/* Uploaded Images Gallery */}
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
                                            {validateImageUrl(image.url) ? (
                                                <Image
                                                    src={validateImageUrl(image.url)}
                                                    alt={image.alt || `Image ${index + 1}`}
                                                    width={150}
                                                    height={100}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        aspectRatio: '3/2',
                                                        cursor: 'pointer'
                                                    }}
                                                    unoptimized={validateImageUrl(image.url)?.includes('cloudinary.com')}
                                                />
                                            ) : (
                                                <div className={styles.imagePlaceholder}>
                                                    <span>URL không hợp lệ</span>
                                                </div>
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
    const [selectedText, setSelectedText] = useState('');
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
    const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });
    const textareaRef = useRef(null);

    // Get textarea element
    const getTextarea = () => {
        return textareaRef.current || document.querySelector(`textarea[name="content"]`);
    };

    // Update selection info
    const updateSelection = () => {
        const textarea = getTextarea();
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);

        setSelectionStart(start);
        setSelectionEnd(end);
        setSelectedText(selected);

        // Show floating toolbar if text is selected
        if (selected.length > 0 && start !== end) {
            const rect = textarea.getBoundingClientRect();
            const scrollTop = textarea.scrollTop;
            const scrollLeft = textarea.scrollLeft;

            // Calculate position for floating toolbar
            const textBeforeSelection = value.substring(0, start);
            const lines = textBeforeSelection.split('\n');
            const lineNumber = lines.length - 1;
            const lineHeight = 20; // Approximate line height

            setFloatingToolbarPosition({
                top: rect.top + (lineNumber * lineHeight) - 50 + scrollTop,
                left: rect.left + scrollLeft + 20
            });
            setShowFloatingToolbar(true);
        } else {
            setShowFloatingToolbar(false);
        }
    };

    // Insert HTML with better cursor positioning
    const insertHTML = (tag, placeholder = '', wrapSelected = true) => {
        const textarea = getTextarea();
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);

        let html;
        let newCursorPos = start;

        if (wrapSelected && selected.length > 0) {
            // Wrap selected text
            switch (tag) {
                case 'h1':
                    html = `<h1>${selected}</h1>`;
                    newCursorPos = start + html.length;
                    break;
                case 'h2':
                    html = `<h2>${selected}</h2>`;
                    newCursorPos = start + html.length;
                    break;
                case 'h3':
                    html = `<h3>${selected}</h3>`;
                    newCursorPos = start + html.length;
                    break;
                case 'p':
                    html = `<p>${selected}</p>`;
                    newCursorPos = start + html.length;
                    break;
                case 'strong':
                    html = `<strong>${selected}</strong>`;
                    newCursorPos = start + html.length;
                    break;
                case 'em':
                    html = `<em>${selected}</em>`;
                    newCursorPos = start + html.length;
                    break;
                case 'ul':
                    html = `<ul>\n<li>${selected}</li>\n</ul>`;
                    newCursorPos = start + html.length;
                    break;
                case 'ol':
                    html = `<ol>\n<li>${selected}</li>\n</ol>`;
                    newCursorPos = start + html.length;
                    break;
                case 'blockquote':
                    html = `<blockquote>${selected}</blockquote>`;
                    newCursorPos = start + html.length;
                    break;
                default:
                    html = selected;
                    newCursorPos = start + html.length;
            }
        } else {
            // Insert new element
            const replacement = placeholder || selected;
            switch (tag) {
                case 'h1':
                    html = `<h1>${replacement}</h1>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'h2':
                    html = `<h2>${replacement}</h2>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'h3':
                    html = `<h3>${replacement}</h3>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'p':
                    html = `<p>${replacement}</p>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'strong':
                    html = `<strong>${replacement}</strong>`;
                    newCursorPos = start + html.length;
                    break;
                case 'em':
                    html = `<em>${replacement}</em>`;
                    newCursorPos = start + html.length;
                    break;
                case 'ul':
                    html = `<ul>\n<li>${replacement}</li>\n</ul>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'ol':
                    html = `<ol>\n<li>${replacement}</li>\n</ol>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'blockquote':
                    html = `<blockquote>${replacement}</blockquote>\n`;
                    newCursorPos = start + html.length - 1;
                    break;
                case 'hr':
                    html = '<hr>\n';
                    newCursorPos = start + html.length;
                    break;
                case 'br':
                    html = '<br>';
                    newCursorPos = start + html.length;
                    break;
                default:
                    html = replacement;
                    newCursorPos = start + html.length;
            }
        }

        const newValue = value.substring(0, start) + html + value.substring(end);
        onChange(newValue);

        // Focus back to textarea and set cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            updateSelection();
        }, 0);
    };

    // Quick insert templates
    const insertTemplate = (templateType) => {
        const textarea = getTextarea();
        if (!textarea) return;

        const start = textarea.selectionStart;
        let template = '';

        switch (templateType) {
            case 'article-structure':
                template = `<h1>Tiêu đề chính</h1>

<p>Đoạn giới thiệu ngắn gọn về chủ đề...</p>

<h2>Tiêu đề phụ 1</h2>

<p>Nội dung chi tiết cho phần này...</p>

<ul>
<li>Điểm 1</li>
<li>Điểm 2</li>
<li>Điểm 3</li>
</ul>

<h2>Tiêu đề phụ 2</h2>

<p>Nội dung tiếp theo...</p>

<h3>Tiêu đề nhỏ</h3>

<p>Nội dung chi tiết hơn...</p>`;
                break;
            case 'list-template':
                template = `<ul>
<li>Mục 1</li>
<li>Mục 2</li>
<li>Mục 3</li>
</ul>`;
                break;
            case 'numbered-list':
                template = `<ol>
<li>Bước 1</li>
<li>Bước 2</li>
<li>Bước 3</li>
</ol>`;
                break;
            case 'section':
                template = `<h2>Tiêu đề phần</h2>

<p>Nội dung của phần này...</p>`;
                break;
            default:
                template = '';
        }

        const newValue = value.substring(0, start) + template + value.substring(start);
        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + template.length;
            textarea.setSelectionRange(newPos, newPos);
            updateSelection();
        }, 0);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        // Handle markdown shortcuts first
        if (handleMarkdownShortcut(e)) {
            return;
        }

        // Don't interfere with default browser shortcuts when Ctrl/Cmd is pressed
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    insertHTML('strong', '', true);
                    break;
                case 'i':
                    e.preventDefault();
                    insertHTML('em', '', true);
                    break;
                case '1':
                    e.preventDefault();
                    insertHTML('h1', '', true);
                    break;
                case '2':
                    e.preventDefault();
                    insertHTML('h2', '', true);
                    break;
                case '3':
                    e.preventDefault();
                    insertHTML('h3', '', true);
                    break;
                default:
                    break;
            }
        }

        // Update selection on any key press
        setTimeout(updateSelection, 0);
    };

    // Handle markdown shortcuts in keydown
    const handleMarkdownShortcut = (e) => {
        const textarea = e.target;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastLine = textBeforeCursor.split('\n').pop() || '';

        // Markdown shortcuts: ## + Space for H2, ### + Space for H3
        if (e.key === ' ' && (lastLine.match(/^##\s*$/) || lastLine.match(/^###\s*$/))) {
            e.preventDefault();
            const level = lastLine.trim().length;
            const newValue = value.substring(0, cursorPos - lastLine.length) +
                `<h${level}></h${level}>` +
                value.substring(cursorPos);
            onChange(newValue);
            setTimeout(() => {
                textarea.focus();
                const newPos = cursorPos - lastLine.length + `<h${level}></h${level}>`.length - 1;
                textarea.setSelectionRange(newPos, newPos);
                updateSelection();
            }, 0);
            return true;
        }
        return false;
    };

    const insertImage = (imageUrl, alt = '', caption = '') => {
        const textarea = document.querySelector(`textarea[name="content"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Tạo HTML cho ảnh với style responsive và caption
        const imageHTML = `\n<div style="text-align: center; margin: 20px 0;">
    <img src="${imageUrl}" alt="${alt || caption || 'Hình ảnh'}" style="max-width: 100%; height: auto; border-radius: 8px;" />
    ${caption ? `<p style="font-size: 14px; color: #666; margin-top: 8px; font-style: italic;">${caption}</p>` : ''}
</div>\n`;

        const newValue = value.substring(0, start) + imageHTML + value.substring(end);
        onChange(newValue);

        // Focus back to textarea
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageHTML.length, start + imageHTML.length);
        }, 0);

        setShowImageDialog(false);
    };

    return (
        <div className={styles.formGroup}>
            <label className={styles.formLabel}>
                Nội dung bài viết
                <span className={styles.helpText}>
                    (Phím tắt: Ctrl+B = Đậm, Ctrl+I = Nghiêng, Ctrl+1/2/3 = H1/H2/H3)
                </span>
            </label>

            {/* Main Toolbar */}
            <div className={styles.editorToolbar}>
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => insertHTML('h1', 'Tiêu đề chính', false)}
                        title="Tiêu đề chính (Ctrl+1)"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>H1</span>
                        <span className={styles.toolbarLabel}>H1</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('h2', 'Tiêu đề phụ', false)}
                        title="Tiêu đề phụ (Ctrl+2)"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>H2</span>
                        <span className={styles.toolbarLabel}>H2</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('h3', 'Tiêu đề nhỏ', false)}
                        title="Tiêu đề nhỏ (Ctrl+3)"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>H3</span>
                        <span className={styles.toolbarLabel}>H3</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('p', 'Đoạn văn', false)}
                        title="Đoạn văn"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>P</span>
                        <span className={styles.toolbarLabel}>P</span>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => insertHTML('strong', '', true)}
                        title="Đậm (Ctrl+B)"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}><strong>B</strong></span>
                        <span className={styles.toolbarLabel}>Đậm</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('em', '', true)}
                        title="Nghiêng (Ctrl+I)"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}><em>I</em></span>
                        <span className={styles.toolbarLabel}>Nghiêng</span>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => insertHTML('ul', 'Mục danh sách', false)}
                        title="Danh sách không thứ tự"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>•</span>
                        <span className={styles.toolbarLabel}>Danh sách</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('ol', 'Mục danh sách', false)}
                        title="Danh sách có thứ tự"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>1.</span>
                        <span className={styles.toolbarLabel}>Số thứ tự</span>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => insertHTML('blockquote', 'Trích dẫn', false)}
                        title="Trích dẫn"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>"</span>
                        <span className={styles.toolbarLabel}>Trích dẫn</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('hr', '', false)}
                        title="Đường kẻ ngang"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>─</span>
                        <span className={styles.toolbarLabel}>Kẻ ngang</span>
                    </button>
                </div>

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => setShowImageDialog(true)}
                        title="Chèn hình ảnh"
                        className={styles.toolbarButton}
                    >
                        <span className={styles.toolbarIcon}>🖼️</span>
                        <span className={styles.toolbarLabel}>Ảnh</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`${styles.toolbarButton} ${showPreview ? styles.active : ''}`}
                        title="Xem trước"
                    >
                        <span className={styles.toolbarIcon}>👁️</span>
                        <span className={styles.toolbarLabel}>Xem trước</span>
                    </button>
                </div>

                {/* Quick Templates Dropdown */}
                <div className={styles.toolbarGroup}>
                    <div className={styles.templateDropdown}>
                        <button
                            type="button"
                            className={styles.toolbarButton}
                            title="Mẫu nhanh"
                        >
                            <span className={styles.toolbarIcon}>📋</span>
                            <span className={styles.toolbarLabel}>Mẫu</span>
                        </button>
                        <div className={styles.templateMenu}>
                            <button
                                type="button"
                                onClick={() => insertTemplate('article-structure')}
                                className={styles.templateItem}
                            >
                                📄 Cấu trúc bài viết
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTemplate('list-template')}
                                className={styles.templateItem}
                            >
                                • Danh sách
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTemplate('numbered-list')}
                                className={styles.templateItem}
                            >
                                1. Danh sách số
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTemplate('section')}
                                className={styles.templateItem}
                            >
                                📑 Phần mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Toolbar (appears when text is selected) */}
            {showFloatingToolbar && selectedText.length > 0 && (
                <div
                    className={styles.floatingToolbar}
                    style={{
                        position: 'fixed',
                        top: `${floatingToolbarPosition.top}px`,
                        left: `${floatingToolbarPosition.left}px`,
                        zIndex: 1000
                    }}
                >
                    <button
                        type="button"
                        onClick={() => insertHTML('strong', '', true)}
                        title="Đậm (Ctrl+B)"
                        className={styles.floatingButton}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('em', '', true)}
                        title="Nghiêng (Ctrl+I)"
                        className={styles.floatingButton}
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('h1', '', true)}
                        title="H1"
                        className={styles.floatingButton}
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('h2', '', true)}
                        title="H2"
                        className={styles.floatingButton}
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => insertHTML('h3', '', true)}
                        title="H3"
                        className={styles.floatingButton}
                    >
                        H3
                    </button>
                </div>
            )}

            {/* Image Upload Dialog */}
            <ImageUploadDialog
                isOpen={showImageDialog}
                onClose={() => setShowImageDialog(false)}
                onInsertImage={insertImage}
                uploadImage={uploadImage}
            />

            {/* Editor */}
            <div className={styles.editorContainer}>
                {!showPreview ? (
                    <textarea
                        ref={textareaRef}
                        name="content"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setTimeout(updateSelection, 0);
                        }}
                        onKeyDown={handleKeyDown}
                        onSelect={updateSelection}
                        onMouseUp={updateSelection}
                        onKeyUp={updateSelection}
                        onClick={updateSelection}
                        className={`${styles.formTextarea} ${styles.large} ${styles.htmlEditor} ${error ? styles.error : ''}`}
                        placeholder="Nhập nội dung bài viết... 

💡 Mẹo sử dụng nhanh:
• Chọn text → Ctrl+B (đậm) hoặc Ctrl+I (nghiêng)
• Chọn text → Ctrl+1/2/3 để tạo H1/H2/H3
• Gõ ## + Space để tạo H2, ### + Space để tạo H3
• Chọn text để hiện floating toolbar
• Click nút Mẫu để chèn cấu trúc có sẵn"
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
export default function PostEditor() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

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
        images: [], // Multiple images
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

            // Check if authentication is still valid (24 hours)
            if (isAuth && authTime && (currentTime - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                // Clear expired authentication
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

    // Categories - Đồng bộ với back-end và front-end tin-tuc.js
    const categories = [
        { value: 'lien-minh-huyen-thoai', label: 'Liên Minh Huyền Thoại' },
        { value: 'lien-quan-mobile', label: 'Liên Quân Mobile' },
        { value: 'dau-truong-chan-ly-tft', label: 'Đấu Trường Chân Lý TFT' },
        { value: 'trending', label: 'Trending' }
    ];

    // Handlers
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

        // Auto-generate slug and meta description
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

            // Tự động extract ảnh đầu tiên từ content làm featured image nếu chưa có
            // Chỉ tự động nếu người dùng chưa set featured image thủ công
            if (!formData.featuredImage || !formData.featuredImage.manualSet) {
                const firstImageMatch = value.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (firstImageMatch && firstImageMatch[1]) {
                    const imageUrl = firstImageMatch[1];
                    // Extract alt text nếu có
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

        setLoading(true);
        try {
            // Clean up featuredImage - remove internal flags
            const cleanedFeaturedImage = formData.featuredImage ? {
                url: formData.featuredImage.url,
                alt: formData.featuredImage.alt || formData.title || 'Featured Image'
            } : null;

            const articleData = {
                ...formData,
                featuredImage: cleanedFeaturedImage,
                // Remove images array since we're using content images now
                images: [],
                status,
                publishedAt: status === 'published' ? new Date().toISOString() : null,
                slug: generateSlug(formData.title)
            };

            const result = await createArticle(articleData);

            if (result.success) {
                alert(`Bài viết đã được ${status === 'published' ? 'xuất bản' : 'lưu bản nháp'} thành công!`);
                router.push('/tin-tuc');
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating article:', error);
            alert('Có lỗi xảy ra khi tạo bài viết');
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

    // SEO Data
    const seoData = {
        title: 'Đăng Bài Viết - Tạo Dàn Đề',
        description: 'Tạo và đăng bài viết mới về xổ số, lô số với công cụ soạn thảo chuyên nghiệp',
        canonical: `${siteUrl}/dang-bai`
    };

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Tin Tức', url: `${siteUrl}/tin-tuc` },
        { name: 'Đăng Bài', url: `${siteUrl}/dang-bai` }
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
                pageType="post-editor"
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
                        <h1 className={styles.pageTitle}>Đăng Bài Viết</h1>
                        <p className={styles.pageSubtitle}>
                            Tạo bài viết mới về xổ số, lô số với công cụ soạn thảo chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className={styles.container}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2 className={styles.formTitle}>Thông tin bài viết</h2>
                        </div>

                        <div className={styles.formContent}>
                            <div className={styles.formGrid}>
                                {/* Main Form */}
                                <div className={styles.mainForm}>
                                    {/* Title */}
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

                                    {/* Excerpt */}
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

                                    {/* Content */}
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => handleInputChange('content', value)}
                                        error={errors.content}
                                    />

                                    {/* Featured Image */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Hình ảnh đại diện
                                            <span className={styles.helpText}>
                                                (Tự động lấy từ ảnh đầu tiên trong nội dung nếu chưa có)
                                            </span>
                                        </label>
                                        <ImageUpload
                                            value={formData.featuredImage}
                                            onChange={(value) => handleInputChange('featuredImage', value)}
                                            error={errors.featuredImage}
                                        />
                                        {formData.featuredImage && (
                                            <div className={styles.infoMessage}>
                                                💡 Mẹo: Bạn có thể chèn ảnh vào nội dung bằng nút 🖼️ trong editor. Ảnh đầu tiên sẽ tự động được dùng làm ảnh đại diện.
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <TagsInput
                                        value={formData.tags}
                                        onChange={(value) => handleInputChange('tags', value)}
                                        error={errors.tags}
                                    />
                                </div>

                                {/* Sidebar */}
                                <div className={styles.sidebar}>
                                    {/* Category */}
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

                                    {/* Status */}
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

                                    {/* Options */}
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

                                    {/* SEO */}
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

                        {/* Action Buttons */}
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
                                {loading ? <LoadingSpinner /> : 'Xuất bản'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Modal */}
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
