/**
 * Dan2DGenerator Component
 * Component logic cho tạo dàn đề 2D
 */

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Trash2, Copy, Undo2, Clock, Check, Dice6 } from 'lucide-react';
import axios from 'axios';
import styles from '../../styles/Dan2DGenerator.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Parse và chuẩn hóa input
const parseInput = (input) => {
    if (!/^[0-9\s,;]*$/.test(input)) {
        return { normalized: '', pairs: [], error: 'Vui lòng chỉ nhập số và các ký tự phân tách (, ; hoặc khoảng trắng)' };
    }

    const normalized = input.replace(/[;\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
    const nums = normalized.split(',').map(num => num.trim()).filter(n => n);
    const pairs = [];

    nums.forEach(num => {
        const strNum = num.toString();
        if (strNum.length === 2 && !isNaN(parseInt(strNum))) {
            pairs.push(strNum.padStart(2, '0'));
        } else if (strNum.length >= 3 && !isNaN(parseInt(strNum))) {
            for (let i = 0; i < strNum.length - 1; i++) {
                const pair = strNum.slice(i, i + 2);
                pairs.push(pair.padStart(2, '0'));
            }
        }
    });

    return { normalized, pairs, error: null };
};

// Number Item Component - Memoized for performance
const NumberItem = memo(({ num, frequency, onClick, onDecrease }) => (
    <div
        className={`${styles.numberItem} ${frequency > 0 ? styles.selected : ''}`}
        onClick={(e) => onClick(num, e)}
    >
        {frequency > 0 && (
            <button
                onClick={(e) => onDecrease(num, e)}
                className={styles.decreaseButton}
            >
                −
            </button>
        )}
        <span className={styles.numberText}>
            {num} {frequency > 0 && `(${frequency})`}
        </span>
    </div>
));

export default function Dan2DGenerator() {
    const [inputNumbers, setInputNumbers] = useState('');
    const [displayInput, setDisplayInput] = useState('');
    const [numberFrequency, setNumberFrequency] = useState({});
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [levels2D, setLevels2D] = useState({});
    const [levels1D, setLevels1D] = useState({});
    const [viewMode, setViewMode] = useState('2D');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [previousState, setPreviousState] = useState(null);
    const [showUndo, setShowUndo] = useState(false);
    const [copy2DStatus, setCopy2DStatus] = useState(false);
    const [copy1DStatus, setCopy1DStatus] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [levelCopyStatus, setLevelCopyStatus] = useState({});
    const [lastApiCallTime, setLastApiCallTime] = useState(0);
    const [offlineMode, setOfflineMode] = useState(false);
    const [lastOfflineWarning, setLastOfflineWarning] = useState(0);
    const [inputSource, setInputSource] = useState('text'); // 'text' or 'grid'
    
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


    const allNumbers = useMemo(() =>
        Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0')),
        []
    );

    const totalSelected = Object.values(numberFrequency).reduce((sum, freq) => sum + freq, 0);

    // Tính toán levels từ API
    const fetchLevels = useCallback(async (input) => {
        if (!input || input.trim() === '') return;

        setLoading(true);
        setError(''); // Clear previous errors

        try {
            const response = await axios.post(`${API_URL}/api/dande/2d`, {
                input
            }, {
                timeout: 5000, // 5 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setLevels2D(response.data.data.levels2D);
                setLevels1D(response.data.data.levels1D);
                setError(''); // Clear any previous errors
                setOfflineMode(false); // Reset offline mode on success
            }
        } catch (err) {
            console.error('API Error:', err);

            // Check if it's rate limiting error
            if (err.response?.status === 429) {
                setOfflineMode(true);
                setError('Quá nhiều yêu cầu. Đang sử dụng tính toán offline.');
                // Use offline calculation immediately for rate limiting
                calculateLevelsLocal(input);
            } else {
                setOfflineMode(true);
                setError('Không thể kết nối tới server. Đang sử dụng tính toán offline.');
                // Fallback: tính toán ở client
                calculateLevelsLocal(input);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Tính toán local nếu API lỗi
    const calculateLevelsLocal = useCallback((input) => {
        const { pairs } = parseInput(input);
        const freq = {};
        pairs.forEach(p => freq[p] = (freq[p] || 0) + 1);

        // Calculate 2D levels
        const levels2D = {};
        allNumbers.forEach(num => {
            const f = freq[num] || 0;
            if (!levels2D[f]) levels2D[f] = [];
            levels2D[f].push(num);
        });

        // Calculate 1D levels
        const digitFreq = {};
        Object.entries(freq).forEach(([num, f]) => {
            num.split('').forEach(digit => {
                digitFreq[digit] = (digitFreq[digit] || 0) + f;
            });
        });

        const levels1D = {};
        for (let d = 0; d <= 9; d++) {
            const f = digitFreq[d.toString()] || 0;
            if (!levels1D[f]) levels1D[f] = [];
            levels1D[f].push(d);
        }

        setLevels2D(levels2D);
        setLevels1D(levels1D);
    }, [allNumbers]);

    // Calculate levels when input changes - Optimized for performance
    useEffect(() => {
        if (inputNumbers && inputNumbers.trim() !== '') {
            // Always use offline calculation for immediate response
            calculateLevelsLocal(inputNumbers);

            // Only call API for text input changes, not number grid clicks
            if (inputSource === 'text') {
                const timeoutId = setTimeout(() => {
                    const now = Date.now();

                    // If in offline mode, skip API calls
                    if (offlineMode) {
                        return;
                    }

                    // Only call API if at least 3 seconds have passed since last call
                    if (now - lastApiCallTime > 3000) {
                        setLastApiCallTime(now);
                        fetchLevels(inputNumbers);
                    }
                }, 2000); // 2s delay for API calls
                timeoutRefs.current.push(timeoutId);
            }
        }
    }, [inputNumbers, fetchLevels, lastApiCallTime, calculateLevelsLocal, offlineMode, inputSource]);

    // Handle input change - Optimized
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        if (value.length > 1000) {
            setError('Input quá dài (max 1000 ký tự)');
            return;
        }

        setDisplayInput(value);
        setError('');
        setInputSource('text'); // Mark as text input

        const { pairs, error } = parseInput(value);
        if (error) {
            setError(error);
            return;
        }

        // Batch state updates
        const newFreq = {};
        const newOrder = [];
        pairs.forEach(num => {
            newFreq[num] = (newFreq[num] || 0) + 1;
            if (!newOrder.includes(num)) newOrder.push(num);
        });

        setNumberFrequency(newFreq);
        setSelectedOrder(newOrder);
    }, []);

    // Handle input blur - Optimized
    const handleInputBlur = useCallback(() => {
        const { normalized, error } = parseInput(displayInput);
        if (error) {
            setError(error);
            return;
        }

        setInputNumbers(normalized);
        setDisplayInput(normalized);
    }, [displayInput]);

    // Handle generate dan
    const handleGenerateDan = () => {
        const { normalized, error } = parseInput(displayInput);
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
        // API call will be triggered by useEffect debounce
    };

    // Handle retry online mode
    const handleRetryOnline = () => {
        setOfflineMode(false);
        setError('');
        setLastApiCallTime(0); // Reset API call timer
        if (inputNumbers && inputNumbers.trim() !== '') {
            fetchLevels(inputNumbers);
        }
    };

    // Handle number click - Optimized with useCallback
    const handleNumberClick = useCallback((num, e) => {
        e.stopPropagation();

        setNumberFrequency(prev => {
            const newFreq = {
                ...prev,
                [num]: (prev[num] || 0) + 1,
            };

            // Update selected order
            setSelectedOrder(prevOrder => {
                if (!prevOrder.includes(num)) {
                    return [...prevOrder, num];
                }
                return prevOrder;
            });

            // Calculate new input immediately
            const currentOrder = selectedOrder.includes(num) ? selectedOrder : [...selectedOrder, num];
            const newInput = currentOrder
                .flatMap(n => Array(newFreq[n] || 0).fill(n))
                .join(',');

            // Batch state updates for better performance
            setTimeout(() => {
                setDisplayInput(newInput);
                setInputNumbers(newInput);
                setInputSource('grid'); // Mark as grid input
            }, 0);

            return newFreq;
        });
    }, [selectedOrder]);

    // Handle decrease frequency - Optimized with useCallback
    const handleDecreaseFrequency = useCallback((num, e) => {
        e.stopPropagation();

        setNumberFrequency(prev => {
            const freq = prev[num] || 0;
            if (freq <= 0) return prev;

            const newFreq = { ...prev };
            newFreq[num] = freq - 1;
            if (newFreq[num] === 0) {
                delete newFreq[num];
                setSelectedOrder(prevOrder => prevOrder.filter(n => n !== num));
            }

            const newInput = Object.entries(newFreq)
                .flatMap(([n, f]) => Array(f).fill(n))
                .join(',');

            // Batch state updates for better performance
            setTimeout(() => {
                setDisplayInput(newInput);
                setInputNumbers(newInput);
                setInputSource('grid'); // Mark as grid input
            }, 0);

            return newFreq;
        });
    }, []);

    // Xóa tất cả
    const handleXoaDan = () => {
        setPreviousState({
            inputNumbers,
            displayInput,
            numberFrequency,
            selectedOrder,
            levels2D,
            levels1D
        });

        setInputNumbers('');
        setDisplayInput('');
        setNumberFrequency({});
        setSelectedOrder([]);
        setLevels2D({});
        setLevels1D({});
        setShowUndo(true);
        setModalMessage('Đã xóa tất cả dàn số');
        setShowModal(true);
    };

    // Hoàn tác
    const handleUndo = () => {
        if (previousState) {
            setInputNumbers(previousState.inputNumbers);
            setDisplayInput(previousState.displayInput);
            setNumberFrequency(previousState.numberFrequency);
            setSelectedOrder(previousState.selectedOrder);
            setLevels2D(previousState.levels2D);
            setLevels1D(previousState.levels1D);
            setShowUndo(false);
            setPreviousState(null);
        }
    };

    // Copy dàn 2D
    const handleCopy2D = () => {
        if (Object.keys(levels2D).length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        let copyText = '';
        Object.entries(levels2D)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([level, nums]) => {
                if (nums.length > 0) {
                    copyText += `Mức ${level} (${nums.length} số)\n${nums.join(',')}\n\n`;
                }
            });

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setCopy2DStatus(true);
            const timeoutId = setTimeout(() => setCopy2DStatus(false), 2000);
            timeoutRefs.current.push(timeoutId);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    };

    // Copy dàn 1D
    const handleCopy1D = () => {
        if (Object.keys(levels1D).length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        let copyText = '';
        Object.entries(levels1D)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([level, digits]) => {
                if (digits.length > 0) {
                    copyText += `Mức ${level} (${digits.length} số)\n${digits.join(',')}\n\n`;
                }
            });

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setCopy1DStatus(true);
            const timeoutId = setTimeout(() => setCopy1DStatus(false), 2000);
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


    // Copy selected levels

    // Copy level function (missing implementation)
    const handleCopyLevel = (level, nums, type) => {
        const copyText = `Mức ${level} (${nums.length} số)\n${nums.join(',')}`;

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setLevelCopyStatus(prev => ({
                ...prev,
                [`${type}-${level}`]: true
            }));
            setTimeout(() => {
                setLevelCopyStatus(prev => ({
                    ...prev,
                    [`${type}-${level}`]: false
                }));
            }, 2000);
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
            numberFrequency,
            selectedOrder,
            levels2D,
            levels1D
        });

        setInputNumbers('');
        setDisplayInput('');
        setNumberFrequency({});
        setSelectedOrder([]);
        setLevels2D({});
        setLevels1D({});
        setShowUndo(true);
        setDeleteStatus(true);
        const timeoutId = setTimeout(() => setDeleteStatus(false), 2000);
        timeoutRefs.current.push(timeoutId);
    };

    // Generate result text for textarea
    const generateResultText = () => {
        if (totalSelected === 0) {
            return "Chưa có dàn số nào. Nhấn 'Tạo Dàn' để bắt đầu.";
        }

        let resultText = '';
        const currentLevels = viewMode === '2D' ? levels2D : levels1D;
        const currentTitle = viewMode === '2D' ? 'DÀN 2D' : 'DÀN 1D';

        resultText += `${currentTitle}\n`;
        resultText += '='.repeat(currentTitle.length) + '\n';

        if (Object.keys(currentLevels).length > 0) {
            Object.entries(currentLevels)
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
    };


    return (
        <div className={styles.container}>
            {/* Top Section - 2 Textareas */}
            <div className={styles.textareaSection}>
                {/* Left Column - Input */}
                <div className={styles.leftColumn}>
                    <div className={styles.inputSection}>
                        <h3 className={styles.sectionTitle}>📝 Nhập Dàn Số</h3>
                        <textarea
                            value={displayInput}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            placeholder="Ví dụ: 12,34,56 hoặc 123456 (tự động tách)"
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
                                    className={`${styles.tab} ${viewMode === '2D' ? styles.activeTab : ''}`}
                                    onClick={() => setViewMode('2D')}
                                >
                                    Dàn 2D
                                </button>
                                <button
                                    className={`${styles.tab} ${viewMode === '1D' ? styles.activeTab : ''}`}
                                    onClick={() => setViewMode('1D')}
                                >
                                    Dàn 1D
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
                        onClick={handleCopy2D}
                        className={`${styles.button} ${styles.secondaryButton} ${copy2DStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {copy2DStatus ? <Check size={16} /> : <Copy size={16} />}
                        <span className={styles.buttonText}>
                            {copy2DStatus ? 'Đã Copy!' : 'Copy Dàn 2D'}
                        </span>
                    </button>

                    <button
                        onClick={handleCopy1D}
                        className={`${styles.button} ${styles.secondaryButton} ${copy1DStatus ? styles.successButton : ''}`}
                        disabled={totalSelected === 0 || loading}
                    >
                        {copy1DStatus ? <Check size={16} /> : <Copy size={16} />}
                        <span className={styles.buttonText}>
                            {copy1DStatus ? 'Đã Copy!' : 'Copy Dàn 1D'}
                        </span>
                    </button>

                </div>
            </div>

            {/* Number Grid - Below textareas */}
            <div className={`${styles.section} ${styles.desktopNumberSection}`}>
                <h3 className={styles.sectionTitle}>Hoặc Chọn Số (Click để tăng, − để giảm)</h3>
                <div className={styles.numberGrid}>
                    {allNumbers.map(num => (
                        <NumberItem
                            key={num}
                            num={num}
                            frequency={numberFrequency[num] || 0}
                            onClick={handleNumberClick}
                            onDecrease={handleDecreaseFrequency}
                        />
                    ))}
                </div>
                <p className={styles.totalText}>
                    Tổng số đã chọn: <strong>{totalSelected}</strong>
                </p>
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

