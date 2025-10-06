/**
 * Admin Post Article Page - Form đăng bài cho admin
 * Có mật khẩu bảo vệ và upload ảnh lên Cloudinary
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { 
    Upload, 
    Image, 
    Save, 
    Eye, 
    Lock, 
    AlertCircle,
    CheckCircle,
    X,
    Plus,
    Trash2
} from 'lucide-react';
import styles from '../../styles/AdminPost.module.css';

export default function AdminPostPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        keywords: '',
        metaDescription: '',
        author: 'Admin',
        isFeatured: false,
        isTrending: false
    });
    
    // File uploads
    const [featuredImage, setFeaturedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);
    const imagesInputRef = useRef(null);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const categories = [
        { value: 'giai-ma-giac-mo', label: 'Giải Mã Giấc Mơ' },
        { value: 'kinh-nghiem-choi-lo-de', label: 'Kinh Nghiệm Chơi Lô Đề' },
        { value: 'thong-ke-xo-so', label: 'Thống Kê Xổ Số' },
        { value: 'meo-vat-xo-so', label: 'Mẹo Vặt Xổ Số' },
        { value: 'tin-tuc-xo-so', label: 'Tin Tức Xổ Số' },
        { value: 'huong-dan-choi', label: 'Hướng Dẫn Chơi' },
        { value: 'phuong-phap-soi-cau', label: 'Phương Pháp Soi Cầu' },
        { value: 'dan-de-chuyen-nghiep', label: 'Dàn Đề Chuyên Nghiệp' }
    ];

    // Handle authentication
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '141920') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Mật khẩu không đúng');
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle featured image upload
    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Kích thước file không được vượt quá 10MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Chỉ cho phép upload file ảnh');
                return;
            }
            setFeaturedImage(file);
            setError('');
        }
    };

    // Handle additional images upload
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                setError('Kích thước file không được vượt quá 10MB');
                return false;
            }
            if (!file.type.startsWith('image/')) {
                setError('Chỉ cho phép upload file ảnh');
                return false;
            }
            return true;
        });
        
        setImages(prev => [...prev, ...validFiles]);
        setError('');
    };

    // Remove image from list
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            
            // Add form data
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            
            // Add password
            formDataToSend.append('password', '141920');
            
            // Add featured image
            if (featuredImage) {
                formDataToSend.append('featuredImage', featuredImage);
            }
            
            // Add additional images
            images.forEach((image, index) => {
                formDataToSend.append('images', image);
            });

            const response = await fetch(`${apiUrl}/api/articles/create`, {
                method: 'POST',
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Đăng bài thành công!');
                // Reset form
                setFormData({
                    title: '',
                    excerpt: '',
                    content: '',
                    category: '',
                    tags: '',
                    keywords: '',
                    metaDescription: '',
                    author: 'Admin',
                    isFeatured: false,
                    isTrending: false
                });
                setFeaturedImage(null);
                setImages([]);
                // Redirect to article
                setTimeout(() => {
                    router.push(`/tin-tuc/${data.data.slug}`);
                }, 2000);
            } else {
                setError(data.message || 'Có lỗi xảy ra khi đăng bài');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Có lỗi xảy ra khi đăng bài');
        } finally {
            setLoading(false);
        }
    };

    // Preview content
    const previewContent = () => {
        if (!formData.title || !formData.content) {
            setError('Vui lòng nhập tiêu đề và nội dung để xem trước');
            return;
        }
        
        // Open preview in new tab
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <html>
                <head>
                    <title>${formData.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #333; }
                        .excerpt { color: #666; font-style: italic; margin: 20px 0; }
                        .content { line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <h1>${formData.title}</h1>
                    <div class="excerpt">${formData.excerpt}</div>
                    <div class="content">${formData.content.replace(/\n/g, '<br>')}</div>
                </body>
            </html>
        `);
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.authHeader}>
                            <Lock size={32} />
                            <h1>Đăng Nhập Admin</h1>
                            <p>Nhập mật khẩu để truy cập trang đăng bài</p>
                        </div>
                        
                        <form onSubmit={handleLogin} className={styles.authForm}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>
                            
                            {error && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            
                            <button type="submit" className={styles.authButton}>
                                Đăng Nhập
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>Đăng Bài - Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <Layout>
                <div className={styles.pageContainer}>
                    <div className={styles.pageHeader}>
                        <h1>Đăng Bài Mới</h1>
                        <p>Tạo bài viết mới cho trang tin tức</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Success/Error Messages */}
                        {success && (
                            <div className={styles.successMessage}>
                                <CheckCircle size={16} />
                                {success}
                            </div>
                        )}
                        
                        {error && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Thông Tin Cơ Bản</h2>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="title">Tiêu đề bài viết *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tiêu đề bài viết"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="excerpt">Tóm tắt bài viết *</label>
                                <textarea
                                    id="excerpt"
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="category">Danh mục *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="author">Tác giả</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    placeholder="Tên tác giả"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Nội Dung Bài Viết</h2>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="content">Nội dung chính *</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Nhập nội dung bài viết (có thể sử dụng HTML)"
                                    rows="15"
                                    required
                                />
                                <small className={styles.helpText}>
                                    Bạn có thể sử dụng HTML để định dạng nội dung. Ví dụ: &lt;h2&gt;Tiêu đề&lt;/h2&gt;, &lt;p&gt;Đoạn văn&lt;/p&gt;
                                </small>
                            </div>
                        </div>

                        {/* Images */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Hình Ảnh</h2>
                            
                            <div className={styles.inputGroup}>
                                <label>Ảnh đại diện *</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFeaturedImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={styles.uploadButton}
                                    >
                                        <Upload size={16} />
                                        {featuredImage ? 'Thay đổi ảnh' : 'Chọn ảnh đại diện'}
                                    </button>
                                    {featuredImage && (
                                        <div className={styles.filePreview}>
                                            <Image size={16} />
                                            <span>{featuredImage.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Ảnh bổ sung</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        ref={imagesInputRef}
                                        onChange={handleImagesChange}
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => imagesInputRef.current?.click()}
                                        className={styles.uploadButton}
                                    >
                                        <Plus size={16} />
                                        Thêm ảnh
                                    </button>
                                </div>
                                
                                {images.length > 0 && (
                                    <div className={styles.imagesList}>
                                        {images.map((image, index) => (
                                            <div key={index} className={styles.imageItem}>
                                                <Image size={16} />
                                                <span>{image.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className={styles.removeButton}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>SEO & Tối Ưu</h2>
                            
                            <div className={styles.inputGroup}>
                                <label htmlFor="metaDescription">Meta Description</label>
                                <textarea
                                    id="metaDescription"
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả ngắn cho SEO (tối đa 160 ký tự)"
                                    rows="2"
                                    maxLength="160"
                                />
                                <small className={styles.helpText}>
                                    {formData.metaDescription.length}/160 ký tự
                                </small>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="keywords">Từ khóa (phân cách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    id="keywords"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleInputChange}
                                    placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Tùy Chọn</h2>
                            
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                    />
                                    <span className={styles.checkboxText}>Bài viết nổi bật</span>
                                </label>

                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="isTrending"
                                        checked={formData.isTrending}
                                        onChange={handleInputChange}
                                    />
                                    <span className={styles.checkboxText}>Bài viết trending</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={previewContent}
                                className={styles.previewButton}
                            >
                                <Eye size={16} />
                                Xem trước
                            </button>
                            
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className={styles.submitButton}
                            >
                                {loading ? (
                                    <>
                                        <div className={styles.spinner}></div>
                                        Đang đăng bài...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Đăng Bài
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        </>
    );
}
