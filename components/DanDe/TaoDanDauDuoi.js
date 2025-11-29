/**
 * TaoDanDauDuoi Component
 * Tạo dàn đặc biệt theo đầu-đuôi
 */

import { useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { Dice6, Copy, RotateCcw, AlertTriangle, CheckCircle, XCircle, Layers, Clock } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TaoDanDauDuoi() {
    const [dauInput, setDauInput] = useState('');
    const [duoiInput, setDuoiInput] = useState('');
    const [tongInput, setTongInput] = useState('');
    const [themInput, setThemInput] = useState('');
    const [boInput, setBoInput] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Hàm parse input thành mảng số
    const parseInputNumbers = (input) => {
        if (!input || input.trim() === '') return [];
        return input
            .replace(/[;,\s]+/g, ',')
            .replace(/,+/g, ',')
            .replace(/^,|,$/g, '')
            .split(',')
            .map(n => n.trim())
            .filter(n => n !== '' && /^\d{1,2}$/.test(n) && parseInt(n) <= 99)
            .map(n => n.padStart(1, '0')); // Không pad thành 2 chữ số cho đầu/đuôi
    };

    // Hàm tạo số từ đầu và đuôi
    const generateNumbersFromDauDuoi = (dauNumbers, duoiNumbers) => {
        const result = [];

        // Nếu có đầu
        if (dauNumbers.length > 0) {
            dauNumbers.forEach(dau => {
                for (let i = 0; i <= 9; i++) {
                    const number = dau + i.toString();
                    result.push(number);
                }
            });
        }

        // Nếu có đuôi
        if (duoiNumbers.length > 0) {
            duoiNumbers.forEach(duoi => {
                for (let i = 0; i <= 9; i++) {
                    const number = i.toString() + duoi;
                    result.push(number);
                }
            });
        }

        return [...new Set(result)]; // Loại bỏ trùng lặp
    };

    // Hàm tính tổng các chữ số
    const calculateSum = (number) => {
        return number.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    };

    // Hàm lọc theo tổng
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

    // Hàm tạo dàn đầu-đuôi với logic client-side
    const generateDanDauDuoi = () => {
        // Bước 1: Parse đầu và đuôi
        const dauNumbers = parseInputNumbers(dauInput);
        const duoiNumbers = parseInputNumbers(duoiInput);

        if (dauNumbers.length === 0 && duoiNumbers.length === 0) {
            return [];
        }

        // Bước 2: Tạo số từ đầu-đuôi
        let resultNumbers = generateNumbersFromDauDuoi(dauNumbers, duoiNumbers);

        // Bước 3: Lọc theo tổng (nếu có)
        if (tongInput.trim()) {
            resultNumbers = filterBySum(resultNumbers, tongInput);
        }

        // Bước 4: Thêm số (nếu có)
        if (themInput.trim()) {
            const themNumbers = parseInputNumbers(themInput).map(n => n.padStart(2, '0'));
            resultNumbers = [...resultNumbers, ...themNumbers];
            resultNumbers = [...new Set(resultNumbers)];
        }

        // Bước 5: Bỏ số (nếu có)
        if (boInput.trim()) {
            const boNumbers = parseInputNumbers(boInput).map(n => n.padStart(2, '0'));
            resultNumbers = resultNumbers.filter(num => !boNumbers.includes(num));
        }

        // Sắp xếp kết quả
        resultNumbers.sort((a, b) => parseInt(a) - parseInt(b));

        return resultNumbers;
    };

    const handleTaoDan = () => {
        if (!dauInput.trim() && !duoiInput.trim()) {
            setModalMessage('Vui lòng nhập đầu hoặc đuôi');
            setShowModal(true);
            return;
        }

        setLoading(true);

        try {
            const result = generateDanDauDuoi();
            setResult(result);

            if (result.length === 0) {
                setModalMessage('Không có số nào phù hợp với các tiêu chí đã chọn');
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error generating dan dau duoi:', error);
            setModalMessage('Lỗi khi tạo dàn số');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLamLai = () => {
        setDauInput('');
        setDuoiInput('');
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

        const copyText = `DÀN ĐẦU-ĐUÔI (${result.length} số)\n${'='.repeat(30)}\n${result.join(',')}`;

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
        content.push(`DÀN ĐẦU-ĐUÔI (${result.length} số)`);
        content.push('='.repeat(30));
        content.push(result.join(','));

        return content.join('\n');
    }, [result]);

    return (
        <div className={styles.toolContainer}>
            <h2 className={styles.toolTitle}><Layers size={16} style={{ display: 'inline', marginRight: '8px' }} />Tạo Dàn Đầu Đuôi</h2>

            <div className={styles.twoColumnLayout}>
                {/* Left Column: Inputs and Controls */}
                <div className={styles.leftColumn}>
                    <div className={styles.inputsSection}>

                        {/* Buttons Section */}
                        <div className={styles.buttonsSection}>
                            <div className={styles.buttonRow}>
                                <button
                                    onClick={handleTaoDan}
                                    className={`${styles.button} ${styles.primaryButton}`}
                                    disabled={loading || (!dauInput.trim() && !duoiInput.trim())}
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

                        {/* Row 1: Đầu và Đuôi */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label className={styles.inputLabel}>Đầu</label>
                                <input
                                    type="text"
                                    value={dauInput}
                                    onChange={(e) => setDauInput(e.target.value)}
                                    placeholder="Ví dụ: 1,3,5 hoặc 135"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label className={styles.inputLabel}>Đuôi</label>
                                <input
                                    type="text"
                                    value={duoiInput}
                                    onChange={(e) => setDuoiInput(e.target.value)}
                                    placeholder="Ví dụ: 2,4,6 hoặc 246"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Row 2: Tổng */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Tổng (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={tongInput}
                                    onChange={(e) => setTongInput(e.target.value)}
                                    placeholder="Ví dụ: 8 hoặc 24 hoặc 246"
                                    className={styles.input}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Row 3: Thêm và Bỏ */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
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

                            <div className={styles.inputGroup} style={{ flex: 1 }}>
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
                            aria-label="Kết quả tạo dàn đầu-đuôi"
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

