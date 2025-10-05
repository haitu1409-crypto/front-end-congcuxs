/**
 * Dan3DGenerator Component
 * Component logic cho tạo dàn đề 3D - Redesigned with 2D style
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Copy, Undo2, Clock, Edit3, BarChart3, Check, Dice6 } from 'lucide-react';
import styles from '../../styles/Dan3DGenerator.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Parse và chuẩn hóa input 3D
const parseInput3D = (input) => {
    if (!/^[0-9\s,;]*$/.test(input)) {
        return { normalized: '', numbers: [], error: 'Vui lòng chỉ nhập số và các ký tự phân tách (, ; hoặc khoảng trắng)' };
    }

    const normalized = input.replace(/[;\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
    const nums = normalized.split(',').map(num => num.trim()).filter(n => n);
    const validNumbers = [];

    nums.forEach(num => {
        const strNum = num.toString();
        if (strNum.length >= 3 && !isNaN(parseInt(strNum))) {
            // Tách thành các số 3D
            for (let i = 0; i <= strNum.length - 3; i++) {
                const threeDigit = strNum.slice(i, i + 3);
                validNumbers.push(threeDigit);
            }
        } else if (strNum.length === 3) {
            validNumbers.push(strNum);
        }
    });

    return { normalized, numbers: validNumbers, error: null };
};

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
    const [viewMode, setViewMode] = useState('3D');
    const [lastApiCallTime, setLastApiCallTime] = useState(0);
    const [offlineMode, setOfflineMode] = useState(false);
    
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

    // Fetch levels from API với error handling tốt hơn
    const fetchLevels = useCallback(async (input) => {
        if (!input || input.trim() === '') return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/dande/3d`, { input }, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success) {
                setLevels(response.data.data.levels);
                setTotalSelected(response.data.data.totalSelected);
                setOfflineMode(false);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('API Error:', err);
            
            if (err.response?.status === 429) {
                setOfflineMode(true);
                setError('Quá nhiều yêu cầu. Đang sử dụng tính toán offline.');
                calculateLevelsLocal(input);
            } else {
                setOfflineMode(true);
                setError('Không thể kết nối tới server. Đang sử dụng tính toán offline.');
                calculateLevelsLocal(input);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Tính toán local nếu API lỗi
    const calculateLevelsLocal = useCallback((input) => {
        const { numbers } = parseInput3D(input);
        const freq = {};
        numbers.forEach(n => freq[n] = (freq[n] || 0) + 1);

        const levels = {};
        Object.entries(freq).forEach(([num, count]) => {
            if (!levels[count]) levels[count] = [];
            levels[count].push(num);
        });

        setLevels(levels);
        setTotalSelected(numbers.length);
    }, []);

    // Calculate levels when input changes
    useEffect(() => {
        if (inputNumbers && inputNumbers.trim() !== '') {
            calculateLevelsLocal(inputNumbers);
            
            const timeoutId = setTimeout(() => {
                const now = Date.now();
                if (!offlineMode && now - lastApiCallTime > 3000) {
                    setLastApiCallTime(now);
                    fetchLevels(inputNumbers);
                }
            }, 2000);
            
            timeoutRefs.current.push(timeoutId);
        }
    }, [inputNumbers, fetchLevels, lastApiCallTime, calculateLevelsLocal, offlineMode]);

    // Handle input change - Optimized
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        if (value.length > 1000) {
            setError('Input quá dài (max 1000 ký tự)');
            return;
        }

        setDisplayInput(value);
        setError('');
    }, []);

    // Handle input blur - Optimized
    const handleInputBlur = useCallback(() => {
        const { normalized, error } = parseInput3D(displayInput);
        if (error) {
            setError(error);
            return;
        }

        setInputNumbers(normalized);
        setDisplayInput(normalized);
    }, [displayInput]);

    // Handle generate dan
    const handleGenerateDan = useCallback(() => {
        const { normalized, error } = parseInput3D(displayInput);
        if (error) {
            setError(error);
            return;
        }

        if (!normalized || normalized.trim() === '') {
            setError('Vui lòng nhập số để tạo dàn');
            return;
        }

        setInputNumbers(normalized);
        setDisplayInput(normalized);
    }, [displayInput]);

    // Handle retry online mode
    const handleRetryOnline = useCallback(() => {
        setOfflineMode(false);
        setError('');
        setLastApiCallTime(0);
        if (inputNumbers && inputNumbers.trim() !== '') {
            fetchLevels(inputNumbers);
        }
    }, [inputNumbers, fetchLevels]);

    // Xóa tất cả
    const handleClear = useCallback(() => {
        setPreviousState({
            inputNumbers,
            displayInput,
            levels,
            totalSelected
        });

        setInputNumbers('');
        setDisplayInput('');
        setLevels({});
        setTotalSelected(0);
        setSelectedLevels({});
        setShowUndo(true);
        setDeleteStatus(true);
        const timeoutId = setTimeout(() => setDeleteStatus(false), 2000);
        timeoutRefs.current.push(timeoutId);
    }, [inputNumbers, displayInput, levels, totalSelected]);

    // Hoàn tác
    const handleUndo = useCallback(() => {
        if (previousState) {
            setInputNumbers(previousState.inputNumbers);
            setDisplayInput(previousState.displayInput);
            setLevels(previousState.levels);
            setTotalSelected(previousState.totalSelected);
            setShowUndo(false);
            setPreviousState(null);
        }
    }, [previousState]);

    // Copy dàn 3D
    const handleCopy = useCallback(() => {
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
            const timeoutId = setTimeout(() => setCopyStatus(false), 2000);
            timeoutRefs.current.push(timeoutId);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    }, [levels]);

    // Handle level selection
    const handleLevelSelect = useCallback((level) => {
        setSelectedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    }, []);

    // Copy selected levels
    const handleCopySelected = useCallback(() => {
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
            const timeoutId = setTimeout(() => setCopySelectedStatus(false), 2000);
            timeoutRefs.current.push(timeoutId);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    }, [levels, selectedLevels]);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setModalMessage('');
    }, []);

    // Generate result text for textarea
    const generateResultText = useCallback(() => {
        if (totalSelected === 0) {
            return "Chưa có dàn số nào. Nhấn 'Tạo Dàn' để bắt đầu.";
        }

        let resultText = '';
        resultText += 'DÀN 3D\n';
        resultText += '='.repeat(7) + '\n';

        if (Object.keys(levels).length > 0) {
            Object.entries(levels)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .forEach(([level, nums]) => {
                    if (nums.length > 0) {
                        resultText += `\nMức ${level} (${nums.length} số):\n`;
                        resultText += nums.join(', ');
                    }
                });
        } else {
            resultText += '\nChưa có số nào được chọn';
        }

        return resultText.trim();
    }, [totalSelected, levels]);

    return (
        <div className={styles.container}>
            {/* Top Section - 2 Textareas */}
            <div className={styles.textareaSection}>
                {/* Left Column - Input */}
                <div className={styles.leftColumn}>
                    <div className={styles.inputSection}>
                        <h3 className={styles.sectionTitle}>📝 Nhập Dàn Số 3D</h3>
                        <textarea
                            value={displayInput}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            placeholder="Ví dụ: 123,456,789 hoặc 123456789 (tự động tách)"
                            className={styles.inputTextarea}
                            disabled={loading}
                        />
                        {error && (
                            <div className={styles.errorContainer}>
                                <p className={styles.errorText}>{error}</p>
                                {offlineMode && (
                                    <button
                                        onClick={handleRetryOnline}
                                        className={styles.retryButton}
                                    >
                                        Thử lại Online
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className={styles.rightColumn}>
                    <div className={styles.resultsSection}>
                        <div className={styles.resultsHeader}>
                            <h2 className={styles.resultsTitle}>Kết quả:</h2>
                            <div className={styles.tabGroup}>
                                <button
                                    className={`${styles.tab} ${styles.activeTab}`}
                                >
                                    Dàn 3D
                                </button>
                            </div>
                        </div>

                        {loading && <p className={styles.loadingText}><Clock size={16} style={{ display: 'inline', marginRight: '4px' }} />Đang xử lý...</p>}

                        <textarea
                            value={generateResultText()}
                            readOnly
                            className={styles.resultTextarea}
                            placeholder="Kết quả sẽ hiển thị ở đây..."
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.buttonSection}>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={handleGenerateDan}
                        className={`${styles.button} ${styles.primaryButton}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Clock size={16} />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <Dice6 size={16} />
                                Tạo Dàn
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleClear}
                        className={`${styles.button} ${styles.dangerButton} ${deleteStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {deleteStatus ? <Check size={16} /> : <Trash2 size={16} />}
                        <span className={styles.buttonText}>
                            {deleteStatus ? 'Đã Xóa!' : 'Xóa Tất Cả'}
                        </span>
                    </button>

                    {showUndo && (
                        <button
                            onClick={handleUndo}
                            className={`${styles.button} ${styles.undoButton}`}
                        >
                            <Undo2 size={16} />
                            Hoàn Tác
                        </button>
                    )}

                    <button
                        onClick={handleCopy}
                        className={`${styles.button} ${styles.secondaryButton} ${copyStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {copyStatus ? <Check size={16} /> : <Copy size={16} />}
                        <span className={styles.buttonText}>
                            {copyStatus ? 'Đã Copy!' : 'Copy Dàn 3D'}
                        </span>
                    </button>

                    <button
                        onClick={handleCopySelected}
                        className={`${styles.button} ${styles.infoButton} ${copySelectedStatus ? styles.successButton : ''}`}
                        disabled={loading || Object.values(selectedLevels).every(v => !v)}
                    >
                        {copySelectedStatus ? <Check size={16} /> : <Copy size={16} />}
                        <span className={styles.buttonText}>
                            {copySelectedStatus ? 'Đã Copy!' : 'Copy Đã Chọn'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Results Table - Below textareas */}
            {totalSelected > 0 && Object.keys(levels).length > 0 && (
                <div className={`${styles.section} ${styles.resultsTableSection}`}>
                    <h3 className={styles.sectionTitle}>Bảng kết quả chi tiết</h3>
                    <div className={styles.resultsTable}>
                        {Object.entries(levels)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([level, nums]) => (
                                nums.length > 0 && (
                                    <div key={level} className={styles.levelRow}>
                                        <div className={styles.levelHeader}>
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
                                        <div className={styles.numbersGrid}>
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
                </div>
            )}

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

