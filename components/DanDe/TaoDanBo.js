/**
 * TaoDanBo Component
 * Tạo dàn đặc biệt theo bộ (kép)
 */

import { useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { Dice6, Copy, RotateCcw, AlertTriangle, CheckCircle, XCircle, Layers, Star, Clock } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';
import { getAllSpecialSets, getCombinedSpecialSetNumbers } from '../../utils/specialSets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TaoDanBo() {
    const [selectedSpecialSets, setSelectedSpecialSets] = useState([]);
    const [tongInput, setTongInput] = useState('');
    const [themInput, setThemInput] = useState('');
    const [boInput, setBoInput] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Memoize special sets data
    const specialSetsData = useMemo(() => getAllSpecialSets(), []);

    // Handler cho chọn/bỏ chọn bộ số đặc biệt
    const handleSpecialSetToggle = useCallback((setId) => {
        setSelectedSpecialSets(prev => {
            if (prev.includes(setId)) {
                return prev.filter(id => id !== setId);
            } else if (prev.length < 5) {
                return [...prev, setId];
            }
            return prev;
        });
    }, []);

    // Hàm tính tổng các chữ số của một số
    const calculateSum = (number) => {
        return number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    };

    // Hàm lọc số theo tổng
    const filterBySum = (numbers, targetSum) => {
        if (!targetSum || targetSum.trim() === '') return numbers;

        const sums = targetSum.split(',').map(s => s.trim()).filter(s => s !== '');
        if (sums.length === 0) return numbers;

        return numbers.filter(number => {
            const sum = calculateSum(number);
            return sums.some(targetSumStr => {
                const target = parseInt(targetSumStr);
                return sum === target || sum === (target + 10);
            });
        });
    };

    // Hàm parse input thành mảng số
    const parseInputNumbers = (input) => {
        if (!input || input.trim() === '') return [];
        return input
            .replace(/[;,\s]+/g, ',')
            .replace(/,+/g, ',')
            .replace(/^,|,$/g, '')
            .split(',')
            .map(n => n.trim())
            .filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99)
            .map(n => n.padStart(2, '0'));
    };

    // Hàm tạo dàn bộ với logic client-side
    const generateDanBo = () => {
        // Bước 1: Lấy tất cả số từ các bộ đã chọn
        let resultNumbers = [];

        selectedSpecialSets.forEach(setId => {
            const setNumbers = getCombinedSpecialSetNumbers([setId]);
            resultNumbers = [...resultNumbers, ...setNumbers];
        });

        // Loại bỏ trùng lặp
        resultNumbers = [...new Set(resultNumbers)];

        // Bước 2: Lọc theo tổng (nếu có)
        if (tongInput.trim()) {
            resultNumbers = filterBySum(resultNumbers, tongInput);
        }

        // Bước 3: Thêm số (nếu có)
        if (themInput.trim()) {
            const themNumbers = parseInputNumbers(themInput);
            resultNumbers = [...resultNumbers, ...themNumbers];
            // Loại bỏ trùng lặp sau khi thêm
            resultNumbers = [...new Set(resultNumbers)];
        }

        // Bước 4: Bỏ số (nếu có)
        if (boInput.trim()) {
            const boNumbers = parseInputNumbers(boInput);
            resultNumbers = resultNumbers.filter(num => !boNumbers.includes(num));
        }

        // Sắp xếp kết quả
        resultNumbers.sort((a, b) => parseInt(a) - parseInt(b));

        return resultNumbers;
    };

    const handleTaoDan = () => {
        if (selectedSpecialSets.length === 0) {
            setModalMessage('Vui lòng chọn ít nhất một bộ số đặc biệt');
            setShowModal(true);
            return;
        }

        setLoading(true);

        try {
            // Sử dụng logic client-side thay vì gọi API
            const result = generateDanBo();
            setResult(result);

            if (result.length === 0) {
                setModalMessage('Không có số nào phù hợp với các tiêu chí đã chọn');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error generating dan bo:', error);
            setModalMessage('Lỗi khi tạo dàn số');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLamLai = () => {
        setSelectedSpecialSets([]);
        setTongInput('');
        setThemInput('');
        setBoInput('');
        setResult([]);
    };

    const handleCopy = () => {
        if (result.length === 0) {
            setModalMessage('Chưa có dàn số để copy');
            setShowModal(true);
            return;
        }

        const copyText = `DÀN BỘ (${result.length} số)\n${'='.repeat(30)}\n${result.join(',')}`;

        navigator.clipboard.writeText(copyText).then(() => {
            setModalMessage('Đã copy dàn số thành công!');
            setShowModal(true);
        }).catch(() => {
            setModalMessage('Lỗi khi sao chép');
            setShowModal(true);
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    // Tạo nội dung textarea từ kết quả
    const generateTextareaContent = useMemo(() => {
        if (result.length === 0) {
            return "Chưa có dàn số nào. Nhấn \"Tạo Dàn\" để bắt đầu.";
        }

        const content = [];

        // Tiêu đề
        content.push(`DÀN BỘ (${result.length} số)`);
        content.push('='.repeat(30));
        content.push(result.join(','));

        return content.join('\n');
    }, [result]);

    return (
        <div className={styles.toolContainer}>
            <h2 className={styles.toolTitle}><Layers size={16} style={{ display: 'inline', marginRight: '8px' }} />Tạo Dàn Bộ</h2>

            <div className={styles.twoColumnLayout}>
                {/* Left Column: Inputs and Controls */}
                <div className={styles.leftColumn}>
                    <div className={styles.inputsSection}>
                        <h3 className={styles.sectionTitle}>Cài đặt tạo dàn</h3>

                        {/* Buttons Section */}
                        <div className={styles.buttonsSection}>
                            <h4 className={styles.sectionTitle}>Thao tác</h4>
                            <div className={styles.buttonRow}>
                                <button
                                    onClick={handleTaoDan}
                                    className={`${styles.button} ${styles.primaryButton}`}
                                    disabled={loading || selectedSpecialSets.length === 0}
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
                                    onClick={handleCopy}
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    disabled={loading || result.length === 0}
                                >
                                    <Copy size={16} />
                                    Copy
                                </button>
                                <button
                                    onClick={handleLamLai}
                                    className={`${styles.button} ${styles.dangerButton}`}
                                    disabled={loading}
                                >
                                    <RotateCcw size={16} />
                                    Làm Lại
                                </button>
                            </div>
                        </div>

                        {/* Special Sets Selection */}
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>
                                <Star size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Chọn Bộ Số Đặc Biệt * (tối đa 5 bộ)
                            </label>
                            <div className={styles.compactSpecialSetsContainer}>
                                <div className={styles.compactSpecialSetsList}>
                                    {specialSetsData.map(set => (
                                        <div
                                            key={set.id}
                                            className={`${styles.compactSpecialSetItem} ${selectedSpecialSets.includes(set.id) ? styles.selected : ''
                                                } ${selectedSpecialSets.length >= 5 && !selectedSpecialSets.includes(set.id) ? styles.disabled : ''}`}
                                            onClick={() => !loading && handleSpecialSetToggle(set.id)}
                                            title={`Bộ ${set.id}: ${set.numbers.join(', ')}`}
                                        >
                                            <span className={styles.compactSetId}>Bộ {set.id}</span>
                                            <span className={styles.compactSetCount}>({set.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {selectedSpecialSets.length > 0 && (
                                <div className={styles.compactSelectedSets}>
                                    <strong>Đã chọn:</strong> {selectedSpecialSets.map(id => `Bộ ${id}`).join(', ')}
                                    <br />
                                    <span className={styles.compactNumbers}>
                                        {getCombinedSpecialSetNumbers(selectedSpecialSets).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Additional Options */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Tổng (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={tongInput}
                                    onChange={(e) => setTongInput(e.target.value)}
                                    placeholder="Ví dụ: 5,7,9"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Thêm (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={themInput}
                                    onChange={(e) => setThemInput(e.target.value)}
                                    placeholder="Ví dụ: 12,34,56"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Bỏ (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={boInput}
                                    onChange={(e) => setBoInput(e.target.value)}
                                    placeholder="Ví dụ: 1 (bỏ số chứa 1)"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className={styles.rightColumn}>
                    <div className={styles.resultsSection}>
                        <h2 className={styles.resultsTitle}>Kết quả tạo dàn</h2>
                        <textarea
                            className={styles.resultsTextarea}
                            value={generateTextareaContent}
                            readOnly
                            placeholder="Kết quả tạo dàn sẽ hiển thị ở đây..."
                            aria-label="Kết quả tạo dàn số"
                            tabIndex="-1"
                        />
                    </div>
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

