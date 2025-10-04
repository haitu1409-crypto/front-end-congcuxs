/**
 * TaoDanCham Component
 * Tạo dàn đặc biệt theo chạm
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dice6, Copy, Trash2, AlertTriangle, CheckCircle, XCircle, MousePointer } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TaoDanCham() {
    const [chamInput, setChamInput] = useState('');
    const [tongInput, setTongInput] = useState('');
    const [themInput, setThemInput] = useState('');
    const [boInput, setBoInput] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [copyStatus, setCopyStatus] = useState(false);
    const [clearStatus, setClearStatus] = useState(false);

    // Refs để cleanup setTimeout
    const timeoutRefs = useRef([]);

    // Cleanup timeouts khi component unmount
    useEffect(() => {
        return () => {
            timeoutRefs.current.forEach(timeoutId => {
                if (timeoutId) clearTimeout(timeoutId);
            });
            timeoutRefs.current = [];
        };
    }, []);

    const handleTaoDan = async () => {
        if (!chamInput) {
            setModalMessage('Vui lòng nhập số chạm');
            setShowModal(true);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/dande/dacbiet/cham`, {
                cham: chamInput,
                tong: tongInput,
                them: themInput,
                bo: boInput
            });

            if (response.data.success) {
                setResult(response.data.data.result);
            }
        } catch (error) {
            console.error('API Error:', error);
            setModalMessage('Lỗi khi tạo dàn số');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = () => {
        setChamInput('');
        setTongInput('');
        setThemInput('');
        setBoInput('');
        setResult([]);
        setClearStatus(true);
        const timeoutId = setTimeout(() => setClearStatus(false), 2000);
        timeoutRefs.current.push(timeoutId);
    };

    const handleCopy = () => {
        if (result.length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        const copyText = `Dàn Chạm (${result.length} số)\n${result.join(',')}`;

        navigator.clipboard.writeText(copyText).then(() => {
            setCopyStatus(true);
            const timeoutId = setTimeout(() => setCopyStatus(false), 2000);
            timeoutRefs.current.push(timeoutId);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <div className={styles.toolContainer}>
            <h2 className={styles.toolTitle}><MousePointer size={16} style={{ display: 'inline', marginRight: '8px' }} />Tạo Dàn Chạm</h2>

            <div className={styles.chamLayout}>
                {/* Left side - Inputs */}
                <div className={styles.chamInputs}>
                    {/* Chạm + Tổng trên 1 hàng */}
                    <div className={styles.chamTongRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Chạm *</label>
                            <input
                                type="text"
                                value={chamInput}
                                onChange={(e) => setChamInput(e.target.value)}
                                placeholder="Ví dụ: 8"
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tổng</label>
                            <input
                                type="text"
                                value={tongInput}
                                onChange={(e) => setTongInput(e.target.value)}
                                placeholder="Ví dụ: 5"
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Thêm trên 1 hàng riêng */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Thêm</label>
                        <input
                            type="text"
                            value={themInput}
                            onChange={(e) => setThemInput(e.target.value)}
                            placeholder="Ví dụ: 11,22,33"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    {/* Bỏ trên 1 hàng riêng */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Bỏ</label>
                        <input
                            type="text"
                            value={boInput}
                            onChange={(e) => setBoInput(e.target.value)}
                            placeholder="Ví dụ: 99"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actionButtons}>
                        <button
                            onClick={handleTaoDan}
                            className={`${styles.button} ${styles.primaryButton}`}
                            disabled={loading}
                        >
                            <Dice6 size={14} />
                            Tạo Dàn
                        </button>
                        <button
                            onClick={handleCopy}
                            className={`${styles.button} ${copyStatus ? styles.successButton : styles.secondaryButton}`}
                            disabled={result.length === 0}
                        >
                            {copyStatus ? <CheckCircle size={14} /> : <Copy size={14} />}
                            {copyStatus ? 'Đã Copy!' : 'Copy Dàn'}
                        </button>
                        <button
                            onClick={handleClearAll}
                            className={`${styles.button} ${clearStatus ? styles.successButton : styles.dangerButton}`}
                            disabled={loading}
                        >
                            {clearStatus ? <CheckCircle size={14} /> : <Trash2 size={14} />}
                            {clearStatus ? 'Đã Xóa!' : 'Xóa Tất Cả'}
                        </button>
                    </div>
                </div>

                {/* Right side - Results textarea */}
                <div className={styles.chamResults}>
                    <div className={styles.resultsHeader}>
                        <h3 className={styles.resultsTitle}>
                            Kết quả {result.length > 0 && `(${result.length} số)`}
                        </h3>
                    </div>
                    <textarea
                        value={result.length > 0 ? result.join(', ') : ''}
                        readOnly
                        placeholder="Kết quả sẽ hiển thị ở đây..."
                        className={styles.resultTextarea}
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <p className={styles.modalMessage}>{modalMessage}</p>
                        <button onClick={closeModal} className={styles.modalButton}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

