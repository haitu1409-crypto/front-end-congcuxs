/**
 * Dan3DGenerator Component
 * Component logic cho tạo dàn đề 3D
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { Trash2, Copy, Undo2, Clock, Edit3, BarChart3, Check } from 'lucide-react';
import styles from '../../styles/Dan3D4DGenerator.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dan3DGenerator() {
    const [inputNumbers, setInputNumbers] = useState('');
    const [displayInput, setDisplayInput] = useState('');
    const [levels, setLevels] = useState({});
    const [totalSelected, setTotalSelected] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [previousState, setPreviousState] = useState(null);
    const [showUndo, setShowUndo] = useState(false);
    const [copyStatus, setCopyStatus] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [levelCopyStatus, setLevelCopyStatus] = useState({});
    const [selectedLevels, setSelectedLevels] = useState({});
    const [copySelectedStatus, setCopySelectedStatus] = useState(false);

    // Fetch levels from API
    const fetchLevels = useCallback(async (input) => {
        if (!input) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/dande/3d`, { input });

            if (response.data.success) {
                setLevels(response.data.data.levels);
                setTotalSelected(response.data.data.totalSelected);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Không thể kết nối tới server. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length > 1000) {
            setError('Input quá dài (max 1000 ký tự)');
            return;
        }

        setDisplayInput(value);
        setError('');

        if (value.trim() === '') {
            setLevels({});
            setTotalSelected(0);
            setInputNumbers('');
        }
    };

    // Handle input blur
    const handleInputBlur = () => {
        if (!/^[0-9\s,;]*$/.test(displayInput)) {
            setError('Vui lòng chỉ nhập số và các ký tự phân tách (, ; hoặc khoảng trắng)');
            setDisplayInput('');
            setInputNumbers('');
            setLevels({});
            setTotalSelected(0);
            return;
        }

        const nums = displayInput.split(/[,;\s]+/).map(num => num.trim()).filter(num => num);
        const validNums = [];
        const errors = [];

        nums.forEach(num => {
            if (!/^\d+$/.test(num)) {
                errors.push(`"${num}" không phải là số hợp lệ`);
            } else if (num.length < 3) {
                errors.push(`"${num}" quá ngắn (cần ít nhất 3 chữ số)`);
            } else {
                validNums.push(num);
            }
        });

        const normalizedValue = validNums.join(',');
        setDisplayInput(normalizedValue);
        setInputNumbers(normalizedValue);

        if (normalizedValue) {
            fetchLevels(normalizedValue);
        }

        if (errors.length > 0) {
            setError(errors.join('; '));
        }
    };

    // Xóa tất cả
    const handleXoaDan = () => {
        if (inputNumbers || totalSelected > 0) {
            setPreviousState({
                inputNumbers,
                displayInput,
                levels,
                totalSelected
            });
            setShowUndo(true);
        }

        setInputNumbers('');
        setDisplayInput('');
        setLevels({});
        setTotalSelected(0);
        setError('');
        setModalMessage('Đã xóa tất cả dàn số');
        setShowModal(true);
    };

    // Hoàn tác
    const handleUndo = () => {
        if (previousState) {
            setInputNumbers(previousState.inputNumbers);
            setDisplayInput(previousState.displayInput);
            setLevels(previousState.levels);
            setTotalSelected(previousState.totalSelected);
            setShowUndo(false);
            setPreviousState(null);
        }
    };

    // Copy dàn 3D
    const handleCopy = () => {
        if (Object.keys(levels).length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        let copyText = '';
        Object.entries(levels)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([level, nums]) => {
                if (nums.length > 0) {
                    copyText += `Mức ${level} (${nums.length} số)\n${nums.join(',')}\n\n`;
                }
            });

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000);
        }).catch(() => {
            setModalMessage('Lỗi khi copy. Vui lòng thử lại.');
            setShowModal(true);
        });
    };

    // Handle level selection
    const handleLevelSelect = (level) => {
        setSelectedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    // Copy selected levels
    const handleCopySelected = () => {
        const selectedTexts = [];

        Object.entries(levels)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([level, nums]) => {
                if (selectedLevels[level] && nums.length > 0) {
                    selectedTexts.push(`Mức ${level} (${nums.length} số)\n${nums.join(',')}`);
                }
            });

        if (selectedTexts.length === 0) {
            setModalMessage('Vui lòng chọn ít nhất một mức để copy');
            setShowModal(true);
            return;
        }

        const copyText = selectedTexts.join('\n\n');

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setCopySelectedStatus(true);
            setTimeout(() => setCopySelectedStatus(false), 2000);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    };

    // Handle clear with success state
    const handleClear = () => {
        setPreviousState({
            inputNumbers,
            displayInput,
            levels
        });

        setInputNumbers('');
        setDisplayInput('');
        setLevels({});
        setSelectedLevels({});
        setShowUndo(true);
        setDeleteStatus(true);
        setTimeout(() => setDeleteStatus(false), 2000);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <div className={styles.container}>
            {/* Input Section */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}><Edit3 size={16} style={{ display: 'inline', marginRight: '8px' }} />Nhập Dàn Số 3D</h3>
                <textarea
                    value={displayInput}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="Ví dụ: 123,456,789 hoặc 12345678 (tự động tách)"
                    className={styles.textarea}
                    disabled={loading}
                />
                {error && <p className={styles.errorText}>{error}</p>}
                <p className={styles.helpText}>
                    Nhập số có 3 chữ số trở lên. Hệ thống sẽ tự động tách thành các số 3 chữ số.
                </p>
            </div>

            {/* Stats */}
            <div className={styles.statsBar}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Tổng số:</span>
                    <span className={styles.statValue}>{totalSelected}</span>
                </div>
                {loading && <span className={styles.loadingBadge}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Đang xử lý...</span>}
            </div>

            {/* Action Buttons */}
            <div className={styles.section}>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleClear}
                        className={`${styles.button} ${styles.deleteButton} ${deleteStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {deleteStatus ? <Check size={14} /> : <Trash2 size={14} />}
                        <span className={styles.buttonText}>
                            {deleteStatus ? 'Đã Xóa!' : 'Xóa Tất Cả'}
                        </span>
                    </button>

                    {showUndo && (
                        <button
                            onClick={handleUndo}
                            className={`${styles.button} ${styles.undoButton}`}
                        >
                            <Undo2 size={14} style={{ marginRight: '4px' }} />Hoàn Tác
                        </button>
                    )}

                    <button
                        onClick={handleCopy}
                        className={`${styles.button} ${styles.copyButton} ${copyStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {copyStatus ? <Check size={14} /> : <Copy size={14} />}
                        <span className={styles.buttonText}>
                            {copyStatus ? 'Đã Copy!' : 'Copy Dàn 3D'}
                        </span>
                    </button>

                    <button
                        onClick={handleCopySelected}
                        className={`${styles.button} ${styles.infoButton} ${copySelectedStatus ? styles.successButton : ''}`}
                        disabled={loading || Object.values(selectedLevels).every(v => !v)}
                    >
                        {copySelectedStatus ? <Check size={14} /> : <Copy size={14} />}
                        <span className={styles.buttonText}>
                            {copySelectedStatus ? 'Đã Copy!' : 'Copy Đã Chọn'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}><BarChart3 size={16} style={{ display: 'inline', marginRight: '8px' }} />Kết Quả</h3>

                {totalSelected > 0 && Object.keys(levels).length > 0 ? (
                    <div className={styles.resultsContainer}>
                        {Object.entries(levels)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([level, nums]) => (
                                nums.length > 0 && (
                                    <div key={level} className={styles.levelBox}>
                                        <div className={styles.levelHeader}>
                                            <div className={styles.levelTitleContainer}>
                                                <input
                                                    type="checkbox"
                                                    id={`level-3d-${level}`}
                                                    checked={selectedLevels[level] || false}
                                                    onChange={() => handleLevelSelect(level)}
                                                    className={styles.levelCheckbox}
                                                />
                                                <label htmlFor={`level-3d-${level}`} className={styles.levelTitle}>
                                                    Mức {level} ({nums.length} số)
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.numbersList}>
                                            {nums.map((num, idx) => (
                                                <span key={idx} className={styles.numberBadge}>
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                    </div>
                ) : (
                    <p className={styles.noResults}>
                        {loading ? <><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />Đang xử lý...</> : 'Chưa có số nào được nhập'}
                    </p>
                )}
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

