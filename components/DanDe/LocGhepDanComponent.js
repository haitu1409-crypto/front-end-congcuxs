/**
 * LocGhepDanComponent - Component riêng cho LỌC, GHÉP DÀN ĐẶC BIỆT
 * Tách từ Dan2DGenerator để sử dụng độc lập
 */

import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { Copy, Trash2, Undo2, Layers } from 'lucide-react';
import styles from '../../styles/LocGhepDan.module.css';

const LocGhepDanComponent = memo(function LocGhepDanComponent() {
    const [dan1, setDan1] = useState('');
    const [dan2, setDan2] = useState('');
    const [featureResult, setFeatureResult] = useState('');
    const [featureCopyStatus, setFeatureCopyStatus] = useState(false);
    const [featureClearStatus, setFeatureClearStatus] = useState(false);
    const [showFeatureUndo, setShowFeatureUndo] = useState(false);
    const [featureUndoData, setFeatureUndoData] = useState({});
    const [featureStatus, setFeatureStatus] = useState('');

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

    // Helper function to detect number type (2, 3, or 4 digits) - memoized
    const detectNumberType = useCallback((text) => {
        if (!text.trim()) return null;

        const numbers = text
            .replace(/[^0-9\s,;]/g, '')
            .replace(/[;\s]+/g, ',')
            .replace(/,+/g, ',')
            .replace(/^,|,$/g, '')
            .split(',')
            .map(num => num.trim())
            .filter(num => num.length > 0 && !isNaN(parseInt(num)));

        if (numbers.length === 0) return null;

        // Check if all numbers have the same length (2, 3, or 4 digits)
        const lengths = [...new Set(numbers.map(num => num.length))];
        if (lengths.length === 1 && (lengths[0] === 2 || lengths[0] === 3 || lengths[0] === 4)) {
            return lengths[0];
        }

        return 'mixed'; // Mixed lengths or invalid
    }, []);

    // Helper function to parse numbers from text
    const parseNumbersFromText = (text) => {
        if (!text.trim()) return [];

        const numberType = detectNumberType(text);
        if (numberType === 'mixed' || numberType === null) return [];

        return text
            .replace(/[^0-9\s,;]/g, '') // Remove non-numeric characters except separators
            .replace(/[;\s]+/g, ',')
            .replace(/,+/g, ',')
            .replace(/^,|,$/g, '')
            .split(',')
            .map(num => num.trim())
            .filter(num => {
                const numStr = num.toString();
                return numStr.length === numberType && !isNaN(parseInt(num));
            })
            .map(num => num.padStart(numberType, '0')) // Pad to correct length
            .filter((num, index, arr) => arr.indexOf(num) === index) // Remove duplicates
            .sort();
    };

    // Helper function to validate number type consistency
    const validateNumberTypeConsistency = (text1, text2) => {
        const type1 = detectNumberType(text1);
        const type2 = detectNumberType(text2);

        // If both are empty, it's valid
        if (!type1 && !type2) return { valid: true };

        // If one is empty, it's valid (will be handled by other validation)
        if (!type1 || !type2) return { valid: true };

        // If both have mixed types, it's invalid
        if (type1 === 'mixed' && type2 === 'mixed') {
            return { valid: false, message: 'Dàn 1 và dàn 2 đều có nhiều loại số khác nhau' };
        }

        // If one has mixed types, it's invalid
        if (type1 === 'mixed') {
            return { valid: false, message: 'Dàn 1 có nhiều loại số khác nhau (chỉ được nhập 2, 3 hoặc 4 chữ số)' };
        }
        if (type2 === 'mixed') {
            return { valid: false, message: 'Dàn 2 có nhiều loại số khác nhau (chỉ được nhập 2, 3 hoặc 4 chữ số)' };
        }

        // If both have valid types but different, it's invalid
        if (type1 !== type2) {
            const typeNames = { 2: '2 chữ số', 3: '3 chữ số', 4: '4 chữ số' };
            return { valid: false, message: `Dàn 1 có ${typeNames[type1]} nhưng dàn 2 có ${typeNames[type2]}. Cả 2 dàn phải cùng loại số.` };
        }

        return { valid: true };
    };

    const handleLayTrung = () => {
        const nums1 = parseNumbersFromText(dan1);
        const nums2 = parseNumbersFromText(dan2);

        // Kiểm tra tính nhất quán loại số
        const consistencyCheck = validateNumberTypeConsistency(dan1, dan2);
        if (!consistencyCheck.valid) {
            setFeatureStatus(consistencyCheck.message);
            return;
        }

        // Kiểm tra trạng thái input
        if (nums1.length === 0 && nums2.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 1 và dàn 2');
            return;
        } else if (nums1.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 1');
            return;
        } else if (nums2.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 2');
            return;
        }

        // Save for undo
        setFeatureUndoData({
            dan1,
            dan2,
            featureResult,
            operation: 'Lấy trùng'
        });

        // Tìm các số giống nhau giữa dàn 1 và dàn 2
        const trung = nums1.filter(num => nums2.includes(num));

        setFeatureResult(trung.length > 0 ? trung.join(', ') : 'Không có số trùng');
        setFeatureStatus(`Tìm thấy ${trung.length} số trùng`);
        setShowFeatureUndo(true);
    };

    const handleGhepDan = () => {
        const nums1 = parseNumbersFromText(dan1);
        const nums2 = parseNumbersFromText(dan2);

        // Kiểm tra tính nhất quán loại số
        const consistencyCheck = validateNumberTypeConsistency(dan1, dan2);
        if (!consistencyCheck.valid) {
            setFeatureStatus(consistencyCheck.message);
            return;
        }

        // Kiểm tra trạng thái input
        if (nums1.length === 0 && nums2.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 1 và dàn 2');
            return;
        } else if (nums1.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 1');
            return;
        } else if (nums2.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 2');
            return;
        }

        // Save for undo
        setFeatureUndoData({
            dan1,
            dan2,
            featureResult,
            operation: 'Ghép dàn'
        });

        // Gộp tất cả số từ dàn 1 và dàn 2, loại bỏ trùng lặp
        const ghep = [...nums1, ...nums2].filter((num, index, arr) => arr.indexOf(num) === index).sort();
        setFeatureResult(ghep.join(', '));
        setFeatureStatus(`Ghép được ${ghep.length} số`);
        setShowFeatureUndo(true);
    };

    const handleDan1LoaiDan2 = () => {
        const nums1 = parseNumbersFromText(dan1);
        const nums2 = parseNumbersFromText(dan2);

        // Kiểm tra tính nhất quán loại số
        const consistencyCheck = validateNumberTypeConsistency(dan1, dan2);
        if (!consistencyCheck.valid) {
            setFeatureStatus(consistencyCheck.message);
            return;
        }

        // Kiểm tra trạng thái input
        if (nums1.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 1');
            return;
        }

        // Save for undo
        setFeatureUndoData({
            dan1,
            dan2,
            featureResult,
            operation: 'Dàn 1 loại Dàn 2'
        });

        const loai = nums2.length > 0 ? nums1.filter(num => !nums2.includes(num)) : nums1;
        setFeatureResult(loai.length > 0 ? loai.join(', ') : 'Không có số nào');
        setFeatureStatus(`Loại được ${loai.length} số từ dàn 1`);
        setShowFeatureUndo(true);
    };

    const handleDan2LoaiDan1 = () => {
        const nums1 = parseNumbersFromText(dan1);
        const nums2 = parseNumbersFromText(dan2);

        // Kiểm tra tính nhất quán loại số
        const consistencyCheck = validateNumberTypeConsistency(dan1, dan2);
        if (!consistencyCheck.valid) {
            setFeatureStatus(consistencyCheck.message);
            return;
        }

        // Kiểm tra trạng thái input
        if (nums2.length === 0) {
            setFeatureStatus('Vui lòng nhập dàn 2');
            return;
        }

        // Save for undo
        setFeatureUndoData({
            dan1,
            dan2,
            featureResult,
            operation: 'Dàn 2 loại Dàn 1'
        });

        const loai = nums1.length > 0 ? nums2.filter(num => !nums1.includes(num)) : nums2;
        setFeatureResult(loai.length > 0 ? loai.join(', ') : 'Không có số nào');
        setFeatureStatus(`Loại được ${loai.length} số từ dàn 2`);
        setShowFeatureUndo(true);
    };

    const handleCopyFeatureResult = async () => {
        if (!featureResult.trim()) {
            setFeatureStatus('Không có kết quả để copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(featureResult);
            setFeatureCopyStatus(true);
            setFeatureStatus('Đã copy thành công');
            const timeoutId = setTimeout(() => {
                setFeatureCopyStatus(false);
                setFeatureStatus('');
            }, 2000);
            timeoutRefs.current.push(timeoutId);
        } catch (err) {
            setFeatureStatus('Không thể copy vào clipboard');
        }
    };

    const handleClearFeature = () => {
        // Save for undo
        setFeatureUndoData({
            dan1,
            dan2,
            featureResult,
            operation: 'Xóa tất cả'
        });

        setDan1('');
        setDan2('');
        setFeatureResult('');
        setFeatureClearStatus(true);
        setFeatureStatus('Đã xóa tất cả');
        const timeoutId = setTimeout(() => {
            setFeatureClearStatus(false);
            setFeatureStatus('');
        }, 2000);
        timeoutRefs.current.push(timeoutId);
        setShowFeatureUndo(true);
    };

    const handleFeatureUndo = () => {
        if (featureUndoData.dan1 !== undefined) {
            setDan1(featureUndoData.dan1);
            setDan2(featureUndoData.dan2);
            setFeatureResult(featureUndoData.featureResult);
            setShowFeatureUndo(false);
            setFeatureUndoData({});
        }
    };

    return (
        <div className={styles.newFeatureSection}>
            <h2 className={styles.toolTitle}><Layers size={16} style={{ display: 'inline', marginRight: '8px' }} />LỌC, GHÉP DÀN ĐẶC BIỆT</h2>

            <div className={styles.threeTextareaSection}>
                <div className={styles.textareaContainer}>
                    <label className={styles.textareaLabel}>Dàn 1</label>
                    <textarea
                        className={styles.featureTextarea}
                        placeholder="Nhập dàn số thứ nhất..."
                        value={dan1}
                        onChange={(e) => setDan1(e.target.value)}
                    />
                </div>
                <div className={styles.textareaContainer}>
                    <label className={styles.textareaLabel}>Dàn 2</label>
                    <textarea
                        className={styles.featureTextarea}
                        placeholder="Nhập dàn số thứ hai..."
                        value={dan2}
                        onChange={(e) => setDan2(e.target.value)}
                    />
                </div>
                <div className={styles.textareaContainer}>
                    <label className={styles.textareaLabel}>Kết quả</label>
                    <textarea
                        className={styles.featureTextarea}
                        value={featureResult}
                        readOnly
                        placeholder="Kết quả sẽ hiển thị ở đây..."
                    />
                </div>
            </div>

            <div className={styles.featureButtonSection}>
                {featureStatus && (
                    <div className={`${styles.featureStatus} ${featureStatus.includes('Tìm thấy') || featureStatus.includes('Ghép được') || featureStatus.includes('Loại được') || featureStatus.includes('Đã copy') || featureStatus.includes('Đã xóa') ? styles.success : featureStatus.includes('Vui lòng') || featureStatus.includes('Không có') || featureStatus.includes('Không thể') ? '' : styles.info}`}>
                        {featureStatus}
                    </div>
                )}
                <div className={styles.featureButtonGroup}>
                    <button
                        onClick={handleLayTrung}
                        className={`${styles.featureButton} ${styles.primaryButton}`}
                    >
                        Lấy trùng
                    </button>
                    <button
                        onClick={handleGhepDan}
                        className={`${styles.featureButton} ${styles.secondaryButton}`}
                    >
                        Ghép dàn
                    </button>
                    <button
                        onClick={handleDan1LoaiDan2}
                        className={`${styles.featureButton} ${styles.infoButton}`}
                    >
                        Dàn 1 loại Dàn 2
                    </button>
                    <button
                        onClick={handleDan2LoaiDan1}
                        className={`${styles.featureButton} ${styles.warningButton}`}
                    >
                        Dàn 2 loại Dàn 1
                    </button>
                    <button
                        onClick={handleCopyFeatureResult}
                        className={`${styles.featureButton} ${featureCopyStatus ? styles.successButton : styles.secondaryButton}`}
                    >
                        {featureCopyStatus ? '✓ Đã Copy!' : 'Copy'}
                    </button>
                    <button
                        onClick={handleClearFeature}
                        className={`${styles.featureButton} ${featureClearStatus ? styles.successButton : styles.dangerButton}`}
                    >
                        {featureClearStatus ? '✓ Đã Xóa!' : 'Xóa tất cả'}
                    </button>
                    {showFeatureUndo && (
                        <button
                            onClick={handleFeatureUndo}
                            className={`${styles.featureButton} ${styles.undoButton}`}
                        >
                            <Undo2 size={16} />
                            Hoàn tác
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

export default LocGhepDanComponent;
