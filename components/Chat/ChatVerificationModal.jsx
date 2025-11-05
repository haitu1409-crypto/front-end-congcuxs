/**
 * Chat Verification Modal - Nhập mã bảo mật để truy cập chat
 */

import { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import styles from '../../styles/ChatVerificationModal.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatVerificationModal({ isOpen, onClose, onVerified, token }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!code.trim()) {
            setError('Vui lòng nhập mã bảo mật');
            return;
        }

        if (code.length !== 6) {
            setError('Mã bảo mật phải có 6 chữ số');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API_URL}/api/chat/verify-code`,
                { code: code.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                // Reset form
                setCode('');
                setError(null);
                // Close modal first
                onClose();
                // Call onVerified callback after closing
                if (onVerified) {
                    onVerified();
                }
            } else {
                setError(response.data.message || 'Mã bảo mật không đúng');
            }
        } catch (error) {
            console.error('Verify code error:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Lỗi khi xác thực. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only numbers
        if (value.length <= 6) {
            setCode(value);
            setError(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <Lock size={20} />
                        <h3>Mã Bảo Mật Chat</h3>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="Đóng"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.description}>
                        Để truy cập chat, vui lòng nhập mã bảo mật 6 chữ số.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="code">Mã bảo mật</label>
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={handleChange}
                                placeholder="Nhập 6 chữ số"
                                maxLength={6}
                                className={styles.codeInput}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={onClose}
                                className={styles.cancelButton}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading || !code.trim()}
                            >
                                {loading ? 'Đang xác thực...' : 'Xác thực'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

