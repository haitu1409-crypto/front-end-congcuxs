/**
 * DanDeFilter Component
 * Component cho chức năng lọc dàn số
 */

import React, { useState, useEffect, useCallback, useMemo, memo, startTransition } from 'react';
import { Clock, Dice6, Star, Copy, Check, Undo2, Filter } from 'lucide-react';
import styles from '../styles/DanDeGenerator.module.css';
import { getAllSpecialSets, getCombinedSpecialSetNumbers } from '../utils/specialSets';
import { getTouchInfo, getNumbersByTouch } from '../utils/touchSets';
import { getSumInfo, getNumbersBySum } from '../utils/sumSets';

const DanDeFilter = memo(() => {
    // States cho box Lọc dàn
    const [filterInput, setFilterInput] = useState('');
    const [filterResult, setFilterResult] = useState('');
    const [filterSelectedLevels, setFilterSelectedLevels] = useState([]);
    const [filterLoading, setFilterLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // States cho các tùy chọn bổ sung
    const [excludeDoubles, setExcludeDoubles] = useState(false);
    const [combinationNumbers, setCombinationNumbers] = useState('');
    const [excludeNumbers, setExcludeNumbers] = useState('');
    const [selectedSpecialSets, setSelectedSpecialSets] = useState([]);
    const [error, setError] = useState(null);

    // States cho validation errors
    const [combinationError, setCombinationError] = useState(null);
    const [excludeError, setExcludeError] = useState(null);

    // States cho copy và undo
    const [copyStatus, setCopyStatus] = useState(false);
    const [undoData, setUndoData] = useState(null);
    const [undoStatus, setUndoStatus] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyText, setCopyText] = useState('');

    // States cho modals
    const [showSpecialSetsModal, setShowSpecialSetsModal] = useState(false);
    const [showTouchModal, setShowTouchModal] = useState(false);
    const [showSumModal, setShowSumModal] = useState(false);
    const [showStatsDetailModal, setShowStatsDetailModal] = useState(false);
    const [statsDetailType, setStatsDetailType] = useState(null);

    // States cho touch
    const [selectedTouches, setSelectedTouches] = useState([]);

    // States cho sum
    const [selectedSums, setSelectedSums] = useState([]);

    // Memoize special sets data
    const specialSetsData = useMemo(() => getAllSpecialSets(), []);

    // Memoize touch data
    const touchData = useMemo(() => getTouchInfo(), []);

    // Memoize sum data
    const sumData = useMemo(() => getSumInfo(), []);

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


    // Mobile-optimized input handling
    const handleCombinationChange = useCallback((e) => {
        const value = e.target.value;
        setCombinationNumbers(value);

        // Use startTransition for non-urgent validation on mobile
        startTransition(() => {
            // Validate số kết hợp
            if (value.trim() !== '') {
                // Xử lý dấu câu: chấp nhận dấu phẩy, chấm phẩy, khoảng trắng
                const processedValue = value.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
                const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');

                // Loại bỏ số trùng lặp và giữ thứ tự
                const uniqueNumbers = [...new Set(numbers)];

                // Cập nhật giá trị input để loại bỏ số trùng lặp
                if (uniqueNumbers.length !== numbers.length) {
                    const cleanedValue = uniqueNumbers.join(',');
                    setCombinationNumbers(cleanedValue);
                }

                // Kiểm tra giới hạn số lượng (sau khi loại bỏ trùng lặp)
                if (uniqueNumbers.length > 40) {
                    setCombinationError(`❌ Quá nhiều số! Chỉ được thêm tối đa 40 số. Hiện tại: ${uniqueNumbers.length} số. Vui lòng xóa bớt ${uniqueNumbers.length - 40} số.`);
                    return;
                }

                const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

                if (invalidNumbers.length > 0) {
                    setCombinationError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99, cách nhau bằng dấu phẩy.`);
                } else {
                    // Kiểm tra xung đột với số loại bỏ
                    if (excludeNumbers.trim()) {
                        const excludeProcessedValue = excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
                        const excludeNums = excludeProcessedValue.split(',').map(n => n.trim()).filter(n => n !== '');
                        const validExcludeNums = excludeNums.filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));

                        const combinationNums = uniqueNumbers.filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
                        const conflicts = combinationNums.filter(num => validExcludeNums.includes(num));

                        if (conflicts.length > 0) {
                            setCombinationError(`❌ Xung đột! Số ${conflicts.join(', ')} đã được thêm vào "Loại bỏ số". Không thể vừa thêm vừa loại bỏ cùng lúc.`);
                        } else {
                            setCombinationError(null);
                        }
                    } else {
                        setCombinationError(null);
                    }
                }
            } else {
                setCombinationError(null);
            }
        });
    }, [excludeNumbers]);

    // Xử lý thay đổi input loại bỏ số mong muốn
    const handleExcludeChange = useCallback((e) => {
        const value = e.target.value;
        setExcludeNumbers(value);

        // Use startTransition for non-urgent validation on mobile
        startTransition(() => {
            // Validate số loại bỏ
            if (value.trim() !== '') {
                // Xử lý dấu câu: chấp nhận dấu phẩy, chấm phẩy, khoảng trắng
                const processedValue = value.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
                const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');

                // Loại bỏ số trùng lặp và giữ thứ tự
                const uniqueNumbers = [...new Set(numbers)];

                // Cập nhật giá trị input để loại bỏ số trùng lặp
                if (uniqueNumbers.length !== numbers.length) {
                    const cleanedValue = uniqueNumbers.join(',');
                    setExcludeNumbers(cleanedValue);
                }

                // Kiểm tra giới hạn số lượng (sau khi loại bỏ trùng lặp)
                if (uniqueNumbers.length > 10) {
                    setExcludeError(`❌ Quá nhiều số! Chỉ được loại bỏ tối đa 10 số. Hiện tại: ${uniqueNumbers.length} số. Vui lòng xóa bớt ${uniqueNumbers.length - 10} số.`);
                    return;
                }

                const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

                if (invalidNumbers.length > 0) {
                    setExcludeError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99, cách nhau bằng dấu phẩy.`);
                } else {
                    // Kiểm tra xung đột với số kết hợp
                    if (combinationNumbers.trim()) {
                        const combinationProcessedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
                        const combinationNums = combinationProcessedValue.split(',').map(n => n.trim()).filter(n => n !== '');

                        // Thêm touch numbers nếu có
                        if (selectedTouches.length > 0) {
                            const touchNumbers = getNumbersByTouch(selectedTouches);
                            combinationNums.push(...touchNumbers);
                        }

                        // Thêm sum numbers nếu có
                        if (selectedSums.length > 0) {
                            const sumNumbers = getNumbersBySum(selectedSums);
                            combinationNums.push(...sumNumbers);
                        }

                        const validCombinationNums = combinationNums.filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
                        const excludeNums = uniqueNumbers.filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
                        const conflicts = excludeNums.filter(num => validCombinationNums.includes(num));

                        if (conflicts.length > 0) {
                            setExcludeError(`❌ Xung đột! Số ${conflicts.join(', ')} đã được thêm vào "Thêm số". Không thể vừa thêm vừa loại bỏ cùng lúc.`);
                        } else {
                            setExcludeError(null);
                        }
                    } else {
                        setExcludeError(null);
                    }
                }
            } else {
                setExcludeError(null);
            }
        });
    }, [combinationNumbers, selectedTouches, selectedSums]);

    // Xử lý checkbox loại bỏ kép bằng
    const handleExcludeDoublesChange = useCallback((e) => {
        setExcludeDoubles(e.target.checked);
    }, []);

    // Parse số mong muốn thành mảng (bao gồm touch numbers)
    const parseCombinationNumbers = useCallback(() => {
        let allNumbers = [];

        // Thêm combination numbers
        if (combinationNumbers.trim()) {
            const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
            const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
            allNumbers = [...allNumbers, ...numbers];
        }

        // Thêm touch numbers
        if (selectedTouches.length > 0) {
            const touchNumbers = getNumbersByTouch(selectedTouches);
            allNumbers = [...allNumbers, ...touchNumbers];
        }
        if (selectedSums.length > 0) {
            const sumNumbers = getNumbersBySum(selectedSums);
            allNumbers = [...allNumbers, ...sumNumbers];
        }

        const uniqueNumbers = [...new Set(allNumbers)];
        return uniqueNumbers
            .filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99)
            .map(n => n.padStart(2, '0'));
    }, [combinationNumbers, selectedTouches, selectedSums]);

    // Parse số loại bỏ thành mảng
    const parseExcludeNumbers = useCallback(() => {
        if (!excludeNumbers.trim()) return [];
        const processedValue = excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
        const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
        const uniqueNumbers = [...new Set(numbers)];
        return uniqueNumbers
            .filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99)
            .map(n => n.padStart(2, '0'));
    }, [excludeNumbers]);

    // Validate input
    const validateInput = useCallback(() => {
        const combinationNums = parseCombinationNumbers();
        const excludeNums = parseExcludeNumbers();

        // Re-validate combination numbers inline
        if (combinationNumbers.trim() !== '') {
            const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
            const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
            const uniqueNumbers = [...new Set(numbers)];

            if (uniqueNumbers.length > 40) {
                setError(`❌ Quá nhiều số! Chỉ được thêm tối đa 40 số. Hiện tại: ${uniqueNumbers.length} số.`);
                return false;
            }

            const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);
            if (invalidNumbers.length > 0) {
                setError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99.`);
                return false;
            }
        }

        // Re-validate exclude numbers inline
        if (excludeNumbers.trim() !== '') {
            const processedValue = excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
            const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
            const uniqueNumbers = [...new Set(numbers)];

            if (uniqueNumbers.length > 10) {
                setError(`❌ Quá nhiều số! Chỉ được loại bỏ tối đa 10 số. Hiện tại: ${uniqueNumbers.length} số.`);
                return false;
            }

            const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);
            if (invalidNumbers.length > 0) {
                setError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99.`);
                return false;
            }
        }

        // Kiểm tra giới hạn số lượng
        if (combinationNums.length > 40) {
            setError('❌ Quá nhiều số! Chỉ được thêm tối đa 40 số vào "Thêm số mong muốn".');
            return false;
        }

        if (excludeNums.length > 10) {
            setError('❌ Quá nhiều số! Chỉ được loại bỏ tối đa 10 số trong "Loại bỏ số mong muốn".');
            return false;
        }

        if (selectedSpecialSets.length > 5) {
            setError('❌ Quá nhiều bộ số! Chỉ được chọn tối đa 5 bộ số đặc biệt.');
            return false;
        }

        // Kiểm tra xung đột giữa "Thêm số" và "Loại bỏ số"
        const conflicts = combinationNums.filter(num => excludeNums.includes(num));
        if (conflicts.length > 0) {
            setError(`❌ Xung đột! Số ${conflicts.join(', ')} không thể vừa có trong "Thêm số mong muốn" vừa có trong "Loại bỏ số mong muốn".\n\n💡 Vui lòng xóa số ${conflicts.join(', ')} khỏi một trong hai ô.`);
            return false;
        }

        // Kiểm tra xung đột giữa bộ số đặc biệt và số loại bỏ
        if (selectedSpecialSets.length > 0 && excludeNums.length > 0) {
            const specialNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
            const specialConflicts = specialNumbers.filter(num => excludeNums.includes(num));
            if (specialConflicts.length > 0) {
                setError(`❌ Xung đột! Số ${specialConflicts.join(', ')} từ bộ số đặc biệt đã được chọn không thể vừa có trong "Loại bỏ số mong muốn".\n\n💡 Vui lòng xóa số ${specialConflicts.join(', ')} khỏi ô "Loại bỏ số mong muốn".`);
                return false;
            }
        }

        setError(null);
        return true;
    }, [combinationNumbers, excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums, parseCombinationNumbers, parseExcludeNumbers]);

    // Handler cho quantity change
    const handleQuantityChange = useCallback((e) => {
        const value = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, Math.min(50, value)));
    }, []);

    // Handler cho lọc dàn
    const handleFilterInputChange = useCallback((e) => {
        const value = e.target.value;

        // Chỉ cho phép số 2 chữ số, dấu phẩy, dấu cách, dấu chấm phẩy, xuống dòng
        const sanitizedValue = value.replace(/[^0-9,;\s\r\n]/g, '');

        // Chỉ cập nhật state với giá trị đã sanitize, không xử lý thêm
        setFilterInput(sanitizedValue);
    }, []);

    const handleLevelToggle = useCallback((level) => {
        setFilterSelectedLevels(prev => {
            if (prev.includes(level)) {
                return prev.filter(l => l !== level);
            } else {
                return [...prev, level];
            }
        });
    }, []);

    // Handler cho chọn/bỏ chọn chạm
    const handleTouchToggle = useCallback((touchId) => {
        setSelectedTouches(prev => {
            if (prev.includes(touchId)) {
                return prev.filter(id => id !== touchId);
            } else if (prev.length < 10) {
                return [...prev, touchId];
            }
            return prev;
        });
    }, []);

    // Handler cho chọn/bỏ chọn tổng
    const handleSumToggle = useCallback((sumId) => {
        setSelectedSums(prev => {
            if (prev.includes(sumId)) {
                return prev.filter(id => id !== sumId);
            } else if (prev.length < 10) {
                return [...prev, sumId];
            }
            return prev;
        });
    }, []);

    // Hàm tạo số ngẫu nhiên (client-side fallback)
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const generateRandomNumbers = (count, sourcePool) => {
        const shuffled = shuffleArray(sourcePool);
        return shuffled.slice(0, Math.min(count, sourcePool.length))
            .sort((a, b) => parseInt(a) - parseInt(b));
    };

    const handleFilterDan = useCallback(() => {
        if (!filterInput.trim()) {
            setFilterResult('❌ Thiếu thông tin! Vui lòng nhập dàn số cần lọc vào ô "Nhập dàn số" bên phải.\n\n💡 Ví dụ: 12,25,38,45,67,89,01,34,56,78');
            return;
        }

        if (filterSelectedLevels.length === 0) {
            setFilterResult('❌ Thiếu lựa chọn! Vui lòng chọn ít nhất một cấp độ lọc (0X, 1X, 2X, 3X, 4X, 5X, 6X, 7X, 8X, 9X).\n\n💡 Ví dụ: Chọn 4X để lọc dàn 4 số, 3X để lọc dàn 3 số...');
            return;
        }

        // Validate các tùy chọn bổ sung trước khi xử lý
        const validationPassed = validateInput();
        if (!validationPassed) {
            // Error message đã được set trong validateInput
            const errorMessage = error || 'Có lỗi xảy ra trong quá trình validation. Vui lòng kiểm tra lại dữ liệu nhập vào.';
            setFilterResult(`❌ Lỗi cấu hình!\n\n${errorMessage}\n\n💡 Vui lòng kiểm tra lại các thông tin đã nhập và thử lại.`);
            setFilterLoading(false);
            return;
        }

        setFilterLoading(true);

        try {
            // Parse input numbers - xử lý các dấu phân cách khác nhau
            let inputNumbers = filterInput
                .replace(/[;,\s]+/g, ',')  // Thay tất cả dấu câu bằng dấu phẩy
                .replace(/,+/g, ',')       // Loại bỏ dấu phẩy trùng lặp
                .replace(/^,|,$/g, '')     // Loại bỏ dấu phẩy ở đầu và cuối
                .split(',')
                .map(n => n.trim())
                .filter(n => n !== '')
                .filter(n => {
                    // Chỉ giữ lại các số 2 chữ số hợp lệ (00-99)
                    const num = parseInt(n);
                    return !isNaN(num) && num >= 0 && num <= 99 && n.length <= 2;
                })
                .map(n => n.padStart(2, '0'));

            if (inputNumbers.length === 0) {
                setFilterResult('❌ Không tìm thấy số hợp lệ! Vui lòng kiểm tra lại:\n\n🔍 Chỉ chấp nhận số 2 chữ số từ 00-99\n🔍 Cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng\n\n💡 Ví dụ đúng: 12,25,38,45,67,89,01,34,56,78');
                setFilterLoading(false);
                return;
            }

            // Áp dụng các tùy chọn bổ sung
            const combinationNums = parseCombinationNumbers();
            const excludeNums = parseExcludeNumbers();

            // BƯỚC 1: Tạo kho dữ liệu tổng hợp
            // Kho dữ liệu = Input người dùng + Số mong muốn + Bộ đặc biệt + Chạm + Tổng
            let dataPool = [...inputNumbers];

            // Thêm số mong muốn
            if (combinationNums.length > 0) {
                dataPool = [...dataPool, ...combinationNums];
            }

            // Thêm bộ số đặc biệt
            if (selectedSpecialSets.length > 0) {
                const specialNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
                dataPool = [...dataPool, ...specialNumbers];
            }

            // Thêm chạm
            if (selectedTouches.length > 0) {
                const touchNumbers = getNumbersByTouch(selectedTouches);
                dataPool = [...dataPool, ...touchNumbers];
            }

            // Thêm tổng
            if (selectedSums.length > 0) {
                const sumNumbers = getNumbersBySum(selectedSums);
                dataPool = [...dataPool, ...sumNumbers];
            }

            // BƯỚC 2: Mức 1 - Loại bỏ kép bằng
            if (excludeDoubles) {
                const doubleNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
                dataPool = dataPool.filter(num => !doubleNumbers.includes(num));
            }

            // BƯỚC 3: Loại bỏ số exclude
            if (excludeNums.length > 0) {
                dataPool = dataPool.filter(num => !excludeNums.includes(num));
            }

            // BƯỚC 4: Tính tần suất xuất hiện
            const frequencyMap = {};
            dataPool.forEach(num => {
                frequencyMap[num] = (frequencyMap[num] || 0) + 1;
            });

            // BƯỚC 5: Tạo danh sách số duy nhất (loại bỏ trùng lặp) và sắp xếp theo tần suất
            const uniqueNumbers = [...new Set(dataPool)].sort((a, b) => {
                const freqA = frequencyMap[a] || 0;
                const freqB = frequencyMap[b] || 0;

                // Ưu tiên tần suất cao hơn
                if (freqA !== freqB) {
                    return freqB - freqA;
                }

                // Nếu tần suất bằng nhau, sắp xếp theo số
                return parseInt(a) - parseInt(b);
            });

            // BƯỚC 6: Định nghĩa cấp độ dựa trên excludeDoubles
            let levelCounts, levelMapping;
            if (excludeDoubles) {
                levelCounts = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 90 };
                levelMapping = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 90 };
            } else {
                levelCounts = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 95 };
                levelMapping = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 95 };
            }

            // BƯỚC 7: Tạo dàn theo từng cấp độ với quy tắc tập con
            const filteredResults = [];
            let usedNumbers = new Set(); // Theo dõi số đã sử dụng

            // Sắp xếp các cấp độ từ thấp lên cao
            const sortedLevels = [...filterSelectedLevels].sort((a, b) => parseInt(a) - parseInt(b));

            sortedLevels.forEach((level, levelIndex) => {
                const targetCount = levelCounts[level];
                let finalNumbers = [];

                // BƯỚC 7.1: Bao gồm tất cả số từ các bậc trước (quy tắc tập con)
                if (levelIndex > 0) {
                    const previousLevel = sortedLevels[levelIndex - 1];
                    const previousResult = filteredResults.find(r => r.level === previousLevel);
                    if (previousResult) {
                        finalNumbers = [...previousResult.result];
                    }
                }

                // BƯỚC 7.2: Tính số lượng cần thêm cho bậc hiện tại
                const additionalNeeded = targetCount - finalNumbers.length;

                if (additionalNeeded > 0) {
                    // Tạo Set để theo dõi số đã chọn trong bậc hiện tại
                    const currentLevelUsed = new Set(finalNumbers);

                    // BƯỚC 7.3: Lấy số theo tần suất từ cao xuống thấp
                    let remainingCount = additionalNeeded;
                    let selectedFromPool = [];

                    // Lọc số chưa được sử dụng trong bậc hiện tại
                    const availableNumbers = uniqueNumbers.filter(num => !currentLevelUsed.has(num));

                    if (availableNumbers.length > 0) {
                        // Phân loại theo tần suất từ cao xuống thấp
                        const maxFreq = Math.max(...Object.values(frequencyMap));
                        const freqGroups = {};

                        // Nhóm số theo tần suất
                        for (let freq = maxFreq; freq >= 1; freq--) {
                            freqGroups[freq] = availableNumbers.filter(num => (frequencyMap[num] || 0) === freq);
                        }

                        // Lấy theo thứ tự ưu tiên: tần suất cao → tần suất thấp
                        for (let freq = maxFreq; freq >= 1; freq--) {
                            if (remainingCount <= 0) break;

                            const freqNumbers = freqGroups[freq] || [];
                            if (freqNumbers.length === 0) continue;

                            if (freqNumbers.length <= remainingCount) {
                                // Lấy tất cả số có tần suất này
                                selectedFromPool = [...selectedFromPool, ...freqNumbers];
                                remainingCount -= freqNumbers.length;
                            } else {
                                // Lấy ngẫu nhiên từ số có tần suất này
                                const randomFromFreq = generateRandomNumbers(remainingCount, freqNumbers);
                                selectedFromPool = [...selectedFromPool, ...randomFromFreq];
                                remainingCount = 0;
                            }
                        }

                        // Cập nhật Set và finalNumbers
                        selectedFromPool.forEach(num => currentLevelUsed.add(num));
                        finalNumbers = [...finalNumbers, ...selectedFromPool];
                    }

                    // BƯỚC 7.4: Bù số ngẫu nhiên nếu vẫn thiếu
                    if (remainingCount > 0) {
                        // Lọc số chưa được sử dụng trong bậc hiện tại
                        const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
                        const availableRandomNumbers = allNumbers.filter(num =>
                            !currentLevelUsed.has(num) &&
                            !excludeNums.includes(num) &&
                            (!excludeDoubles || !['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'].includes(num))
                        );

                        if (availableRandomNumbers.length >= remainingCount) {
                            const randomNumbers = generateRandomNumbers(remainingCount, availableRandomNumbers);
                            finalNumbers = [...finalNumbers, ...randomNumbers];
                        } else {
                            // Trường hợp hiếm: không đủ số để bù
                            finalNumbers = [...finalNumbers, ...availableRandomNumbers];
                        }
                    }
                }

                // Sắp xếp và lưu kết quả
                const sortedNumbers = finalNumbers.sort((a, b) => parseInt(a) - parseInt(b));

                // Thống kê cho hiển thị
                const dataPoolCount = uniqueNumbers.length;
                const usedFromPool = sortedNumbers.filter(num => uniqueNumbers.includes(num)).length;
                const randomCount = sortedNumbers.length - usedFromPool;

                filteredResults.push({
                    level: level,
                    targetCount: targetCount,
                    result: sortedNumbers,
                    dataPoolCount: dataPoolCount,
                    usedFromPool: usedFromPool,
                    randomCount: randomCount
                });
            });

            if (filteredResults.length === 0) {
                setFilterResult(`❌ Không tìm thấy kết quả! Các cấp độ đã chọn (${filterSelectedLevels.join(', ')}X) không có số phù hợp.\n\n💡 Gợi ý:\n🔹 Thử chọn cấp độ khác (ví dụ: 4X, 5X, 6X)\n🔹 Thêm nhiều số hơn vào dàn input\n🔹 Bỏ bớt các điều kiện loại bỏ quá nghiêm ngặt`);
            } else {
                // Tạo kết quả hiển thị
                const sortedResults = filteredResults.sort((a, b) => {
                    const levelA = levelMapping[a.level];
                    const levelB = levelMapping[b.level];
                    return parseInt(levelB) - parseInt(levelA);
                });

                const sortedResultLines = sortedResults.map(result => {
                    const stats = [];
                    if (result.usedFromPool > 0) stats.push(`${result.usedFromPool} từ kho dữ liệu`);
                    if (result.randomCount > 0) stats.push(`${result.randomCount} ngẫu nhiên`);

                    const statsText = stats.length > 0 ? `(${stats.join(', ')})` : '';
                    // Format: "9 5 s" (tách số thành từng chữ số)
                    const actualLevel = levelMapping[result.level];
                    const levelStr = actualLevel.toString();
                    const formattedLevel = levelStr.split('').join(' ') + ' s';
                    return `${formattedLevel} ${statsText}:\n${result.result.join(',')}`;
                });

                const appliedOptions = [];
                if (excludeDoubles) appliedOptions.push('loại bỏ kép bằng');
                if (excludeNums.length > 0) appliedOptions.push(`loại bỏ ${excludeNums.length} số`);
                if (combinationNums.length > 0) appliedOptions.push(`thêm ${combinationNums.length} số mong muốn`);
                if (selectedSpecialSets.length > 0) appliedOptions.push(`${selectedSpecialSets.length} bộ đặc biệt`);
                if (selectedTouches.length > 0) appliedOptions.push(`${selectedTouches.length} chạm`);
                if (selectedSums.length > 0) appliedOptions.push(`${selectedSums.length} tổng`);

                // Tạo thống kê tần suất số ở đầu
                const frequencyStats = [];
                if (frequencyMap && Object.keys(frequencyMap).length > 0) {
                    const sortedFrequency = Object.entries(frequencyMap)
                        .sort(([, a], [, b]) => b - a); // Sắp xếp theo tần suất giảm dần

                    if (sortedFrequency.length > 0) {
                        // Hiển thị tất cả số có tần suất > 1, sau đó hiển thị một số số có tần suất = 1
                        const highFreqNumbers = sortedFrequency.filter(([, count]) => count > 1);
                        const lowFreqNumbers = sortedFrequency.filter(([, count]) => count === 1);

                        // Hiển thị tất cả số có tần suất > 1
                        if (highFreqNumbers.length > 0) {
                            frequencyStats.push('📊 THỐNG KÊ TẦN SUẤT SỐ (Tần suất > 1):');
                            const highFreqList = highFreqNumbers
                                .map(([num, count]) => `${num}(${count} lần)`)
                                .join('; ');
                            frequencyStats.push(highFreqList);
                        }

                        // Hiển thị một số số có tần suất = 1 (tối đa 30 số để không quá dài)
                        if (lowFreqNumbers.length > 0) {
                            const displayLowFreq = lowFreqNumbers.slice(0, 30);
                            frequencyStats.push('📊 THỐNG KÊ TẦN SUẤT SỐ (Tần suất = 1):');
                            const lowFreqList = displayLowFreq
                                .map(([num, count]) => `${num}(${count} lần)`)
                                .join('; ');
                            frequencyStats.push(lowFreqList);
                            if (lowFreqNumbers.length > 30) {
                                frequencyStats.push(`... và ${lowFreqNumbers.length - 30} số khác`);
                            }
                        }

                        frequencyStats.push(`📋 KẾT QUẢ LỌC (${uniqueNumbers.length} số từ kho dữ liệu):`);
                    }
                }

                const optionsText = appliedOptions.length > 0 ? `\n\nĐã áp dụng: ${appliedOptions.join(', ')}` : '';
                const resultContent = frequencyStats.length > 0
                    ? `${frequencyStats.join('\n')}\n${sortedResultLines.join('\n')}${optionsText}`
                    : `${sortedResultLines.join('\n')}${optionsText}`;

                setFilterResult(resultContent);
            }

        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu:', error);
            setFilterResult(`❌ Lỗi hệ thống! Không thể xử lý dữ liệu.\n\n🔧 Thông tin lỗi: ${error.message}\n\n💡 Vui lòng:\n🔹 Kiểm tra lại dữ liệu đầu vào\n🔹 Thử lại sau vài giây\n🔹 Liên hệ hỗ trợ nếu vấn đề tiếp tục`);
        }

        setFilterLoading(false);
    }, [filterInput, filterSelectedLevels, combinationNumbers, excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums, excludeDoubles]);

    const handleClearFilter = useCallback(() => {
        // Lưu dữ liệu trước khi xóa để có thể hoàn tác
        if (filterResult.trim()) {
            setUndoData({
                filterResult: filterResult,
                filterInput: filterInput,
                filterSelectedLevels: [...filterSelectedLevels],
                quantity: quantity,
                excludeDoubles: excludeDoubles,
                combinationNumbers: combinationNumbers,
                excludeNumbers: excludeNumbers,
                selectedSpecialSets: [...selectedSpecialSets],
                selectedTouches: [...selectedTouches]
            });
        }

        setFilterInput('');
        setFilterResult('');
        setFilterSelectedLevels([]);
        setQuantity(1);
        setExcludeDoubles(false);
        setCombinationNumbers('');
        setExcludeNumbers('');
        setSelectedSpecialSets([]);
        setSelectedTouches([]);
        setSelectedSums([]);
        setError(null);
        setCombinationError(null);
        setExcludeError(null);
    }, [filterResult, filterInput, filterSelectedLevels, quantity, excludeDoubles, combinationNumbers, excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums]);

    const handleCopyResult = useCallback(() => {
        if (!filterResult.trim()) {
            setError('Chưa có kết quả để sao chép');
            return;
        }

        try {
            // Lấy chỉ phần kết quả lọc, bỏ qua thống kê và options
            const lines = filterResult.split('\n');
            const resultLines = [];
            let inResultSection = false;

            for (const line of lines) {
                // Bắt đầu từ phần "📋 KẾT QUẢ LỌC"
                if (line.includes('📋 KẾT QUẢ LỌC')) {
                    inResultSection = true;
                    continue;
                }

                // Dừng khi gặp phần "Đã áp dụng"
                if (inResultSection && line.includes('Đã áp dụng')) {
                    break;
                }

                // Thu thập kết quả lọc
                if (inResultSection && line.trim() !== '') {
                    // Nếu dòng có format "9 5 s (stats):" và chứa số liệu
                    if (line.includes(' s') && line.includes(':')) {
                        const parts = line.split(':');
                        const levelPart = parts[0].trim();
                        const numbersPart = parts[1] ? parts[1].trim() : '';

                        // Loại bỏ thống kê trong ngoặc
                        const cleanLevelPart = levelPart.replace(/\s*\([^)]*\)\s*$/, '');

                        resultLines.push(cleanLevelPart);
                        if (numbersPart) {
                            resultLines.push(numbersPart);
                        }
                    }
                    // Nếu dòng chỉ chứa số liệu (không có level)
                    else if (!line.includes('📊') && !line.includes('THỐNG KÊ')) {
                        resultLines.push(line.trim());
                    }
                }
            }

            const finalCopyText = resultLines.join('\n').trim();

            // Debug log
            console.log('Copy text:', finalCopyText);
            console.log('Result lines:', resultLines);

            if (!finalCopyText) {
                setError('Không có nội dung để sao chép');
                return;
            }

            // Lưu text để hiển thị trong modal nếu cần
            setCopyText(finalCopyText);

            // Kiểm tra hỗ trợ Clipboard API
            console.log('Clipboard API supported:', !!navigator.clipboard);
            console.log('HTTPS:', window.location.protocol === 'https:');

            // Sử dụng Clipboard API với fallback
            if (navigator.clipboard && navigator.clipboard.writeText) {
                console.log('Using Clipboard API...');
                navigator.clipboard.writeText(finalCopyText).then(() => {
                    console.log('Copy successful via Clipboard API');
                    setCopyStatus(true);
                    setTimeout(() => setCopyStatus(false), 2000);
                }).catch((err) => {
                    console.error('Clipboard API error:', err);
                    console.log('Falling back to textarea method...');
                    // Fallback: tạo textarea và copy
                    fallbackCopyTextToClipboard(finalCopyText);
                });
            } else {
                console.log('Clipboard API not supported, using fallback...');
                // Fallback cho trình duyệt không hỗ trợ Clipboard API
                fallbackCopyTextToClipboard(finalCopyText);
            }
        } catch (error) {
            console.error('Copy error:', error);
            setError('Lỗi khi xử lý dữ liệu để sao chép');
        }
    }, [filterResult]);

    // Fallback copy function
    const fallbackCopyTextToClipboard = (text) => {
        console.log('Using fallback copy method...');

        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);

        try {
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices

            const successful = document.execCommand('copy');
            console.log('Fallback copy result:', successful);

            if (successful) {
                setCopyStatus(true);
                setTimeout(() => setCopyStatus(false), 2000);
            } else {
                console.error('Fallback copy failed');
                // Hiển thị modal với text để user copy thủ công
                setShowCopyModal(true);
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            setError('Lỗi khi sao chép kết quả');
        } finally {
            document.body.removeChild(textArea);
        }
    };

    const handleUndo = useCallback(() => {
        if (undoData) {
            setFilterInput(undoData.filterInput);
            setFilterResult(undoData.filterResult);
            setFilterSelectedLevels(undoData.filterSelectedLevels);
            setQuantity(undoData.quantity || 1);
            setExcludeDoubles(undoData.excludeDoubles);
            setCombinationNumbers(undoData.combinationNumbers);
            setExcludeNumbers(undoData.excludeNumbers);
            setSelectedSpecialSets(undoData.selectedSpecialSets);
            setSelectedTouches(undoData.selectedTouches || []);
            setSelectedSums(undoData.selectedSums || []);
            setUndoData(null);
            setUndoStatus(true);
            setTimeout(() => setUndoStatus(false), 2000);
        }
    }, [undoData]);

    // Stats Detail Modal handlers
    const handleStatsDetailClick = useCallback((type) => {
        setStatsDetailType(type);
        setShowStatsDetailModal(true);
    }, []);

    const closeStatsDetailModal = useCallback(() => {
        setShowStatsDetailModal(false);
        setStatsDetailType(null);
    }, []);

    return (
        <div className={styles.card1} style={{ marginTop: 'var(--spacing-6)' }}>

            {/* Mẹo hay section */}
            <div className={styles.tipsSection} style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: 'var(--spacing-2)',
                textAlign: 'center'
            }}>
                <h3 style={{
                    color: '#0369a1',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    margin: '0 0 6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    💡 Mẹo Hay
                </h3>
                <div style={{
                    color: '#0c4a6e',
                    fontSize: '12px',
                    lineHeight: '1.3',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <p style={{ margin: '0' }}>
                        <strong>Bạn hãy copy các dàn tùy ý từ bất cứ ai chốt dàn 4X, 3X, 2X, 1X, 0X</strong> + <strong>"loại bỏ các số đặc biệt đã ra gần đây"</strong> + <strong>loại bỏ kép bằng</strong> = <span style={{ color: '#dc2626', fontWeight: 'bold' }}>kết quả đầu ra dàn mong muốn</span>
                    </p>
                </div>
            </div>

            {/* Mobile compact tips section */}
            <div className={styles.mobileTipsSection} style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: 'var(--spacing-4)',
                textAlign: 'center',
                display: 'none'
            }}>
                <h3 style={{
                    color: '#0369a1',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    💡 Mẹo Hay
                </h3>
                <div style={{
                    color: '#0c4a6e',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0' }}>
                        <strong>Copy dàn 4X,3X,2X,1X,0X</strong> + <strong>"loại bỏ số đặc biệt gần đây"</strong> + <strong>loại bỏ kép bằng</strong> = <span style={{ color: '#dc2626', fontWeight: 'bold' }}>dàn mong muốn</span>
                    </p>
                </div>
            </div>

            <div className={styles.twoColumnLayout}>
                {/* Left Column: Inputs and Controls */}
                <div className={styles.leftColumn}>
                    {/* Inputs Section */}
                    <div className={styles.inputsSection}>
                        <h3 className={styles.sectionTitle}>Cài đặt lọc dàn</h3>

                        {/* Buttons Section */}
                        <div className={styles.buttonsSection}>
                            <h4 className={styles.sectionTitle}>Thao tác</h4>

                            <div className={styles.buttonRow}>
                                <button
                                    onClick={handleFilterDan}
                                    className={`${styles.button} ${styles.primaryButton}`}
                                    disabled={filterLoading || !filterInput.trim() || filterSelectedLevels.length === 0}
                                >
                                    {filterLoading ? (
                                        <>
                                            <Clock size={16} />
                                            Đang lọc...
                                        </>
                                    ) : (
                                        <>
                                            <Filter size={16} />
                                            Lọc Dàn
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleCopyResult}
                                    className={`${styles.button} ${styles.secondaryButton} ${copyStatus ? styles.successButton : ''}`}
                                    disabled={filterLoading || !filterResult.trim()}
                                >
                                    {copyStatus ? <Check size={16} /> : <Copy size={16} />}
                                    {copyStatus ? 'Đã Copy!' : 'Copy'}
                                </button>

                                <button
                                    onClick={handleClearFilter}
                                    className={`${styles.button} ${styles.dangerButton}`}
                                    disabled={filterLoading}
                                >
                                    Xóa Tất Cả
                                </button>

                                {undoData && (
                                    <button
                                        onClick={handleUndo}
                                        className={`${styles.button} ${styles.warningButton} ${undoStatus ? styles.successButton : ''}`}
                                        disabled={filterLoading}
                                    >
                                        {undoStatus ? <Check size={16} /> : <Undo2 size={16} />}
                                        {undoStatus ? 'Đã Hoàn Tác!' : 'Hoàn Tác'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Inputs Row: 3 inputs on same row for mobile */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="quantity" className={styles.inputLabel}>Số lượng dàn:</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    placeholder="1"
                                    title="Nhập số lượng dàn (1-50)"
                                    min="1"
                                    max="50"
                                    className={styles.input}
                                    disabled={filterLoading}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="filterCombinationNumbers" className={styles.inputLabel}>Thêm số:</label>
                                <input
                                    id="filterCombinationNumbers"
                                    type="text"
                                    value={combinationNumbers}
                                    onChange={handleCombinationChange}
                                    placeholder="45,50,67"
                                    className={styles.input}
                                    disabled={filterLoading}
                                />
                                {combinationError && (
                                    <div className={styles.inputErrorText}>
                                        {combinationError}
                                    </div>
                                )}
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="filterExcludeNumbers" className={styles.inputLabel}>Loại bỏ số:</label>
                                <input
                                    id="filterExcludeNumbers"
                                    type="text"
                                    value={excludeNumbers}
                                    onChange={handleExcludeChange}
                                    placeholder="83,84,85"
                                    className={styles.input}
                                    disabled={filterLoading}
                                />
                                {excludeError && (
                                    <div className={styles.inputErrorText}>
                                        {excludeError}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Layout: Separate rows */}
                        <div className={styles.desktopOptionsLayout}>
                            {/* Options Row: Checkbox and other options */}
                            <div className={styles.optionsRow}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Tùy chọn khác:</label>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            id="filterExcludeDoubles"
                                            type="checkbox"
                                            checked={excludeDoubles}
                                            onChange={handleExcludeDoublesChange}
                                            className={styles.checkbox}
                                            disabled={filterLoading}
                                        />
                                        <label htmlFor="filterExcludeDoubles" className={styles.checkboxLabel}>
                                            Loại bỏ kép bằng
                                        </label>
                                        <div className={styles.helpTextInline}>
                                            Chú ý: Loại bỏ kép bằng 95s sẽ thành 90s
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Desktop Selection Layout - 2 rows */}
                            <div className={styles.desktopSelectionRow}>
                                {/* Row 1: Special Sets - Full width */}
                                <div className={styles.desktopSpecialSetsRow}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            Chọn bộ số đặc biệt (tối đa 5 bộ):
                                        </label>
                                        <div className={styles.specialSetsContainer}>
                                            <div className={styles.specialSetsList}>
                                                {specialSetsData.map(set => (
                                                    <div
                                                        key={set.id}
                                                        className={`${styles.specialSetItem} ${selectedSpecialSets.includes(set.id) ? styles.selected : ''
                                                            } ${selectedSpecialSets.length >= 5 && !selectedSpecialSets.includes(set.id) ? styles.disabled : ''}`}
                                                        onClick={() => !filterLoading && handleSpecialSetToggle(set.id)}
                                                        title={`Bộ ${set.id}: ${set.numbers.join(', ')}`}
                                                    >
                                                        <div className={styles.specialSetHeader}>
                                                            <span className={styles.specialSetId}>Bộ {set.id}</span>
                                                            <span className={styles.specialSetCount}>({set.count} số)</span>
                                                        </div>
                                                        <div className={styles.specialSetNumbers}>
                                                            {set.numbers.join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedSpecialSets.length > 0 && (
                                            <div className={styles.selectedSpecialSets}>
                                                <strong>Đã chọn:</strong> {selectedSpecialSets.map(id => `Bộ ${id}`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Touch and Sum - Side by side */}
                                <div className={styles.desktopTouchSumRow}>
                                    {/* Chọn chạm - Desktop */}
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            🎯 Chọn chạm (tối đa 10 chạm):
                                        </label>
                                        <div className={styles.touchSelectionContainer}>
                                            <div className={styles.touchSelectionList}>
                                                {touchData.map(touch => (
                                                    <div
                                                        key={touch.id}
                                                        className={`${styles.touchSelectionItem} ${selectedTouches.includes(touch.id) ? styles.selected : ''
                                                            } ${selectedTouches.length >= 10 && !selectedTouches.includes(touch.id) ? styles.disabled : ''}`}
                                                        onClick={() => !filterLoading && handleTouchToggle(touch.id)}
                                                        title={`Chạm ${touch.id}: ${touch.numbers.join(', ')}`}
                                                    >
                                                        <div className={styles.touchSelectionHeader}>
                                                            <span className={styles.touchSelectionId}>Chạm {touch.id}</span>
                                                            <span className={styles.touchSelectionCount}>({touch.count} số)</span>
                                                        </div>
                                                        <div className={styles.touchSelectionNumbers}>
                                                            {touch.numbers.join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedTouches.length > 0 && (
                                            <div className={styles.selectedTouches}>
                                                <strong>Đã chọn:</strong> {selectedTouches.map(id => `Chạm ${id}`).join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Chọn tổng - Desktop */}
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            Chọn tổng (tối đa 10 tổng):
                                        </label>
                                        <div className={styles.sumSelectionContainer}>
                                            <div className={styles.sumSelectionList}>
                                                {sumData.map(sum => (
                                                    <div
                                                        key={sum.id}
                                                        className={`${styles.sumSelectionItem} ${selectedSums.includes(sum.id) ? styles.selected : ''
                                                            } ${selectedSums.length >= 10 && !selectedSums.includes(sum.id) ? styles.disabled : ''}`}
                                                        onClick={() => !filterLoading && handleSumToggle(sum.id)}
                                                        title={`Tổng ${sum.id}: ${sum.numbers.join(', ')}`}
                                                    >
                                                        <div className={styles.sumSelectionHeader}>
                                                            <span className={styles.sumSelectionId}>Tổng {sum.id}</span>
                                                            <span className={styles.sumSelectionCount}>({sum.count} số)</span>
                                                        </div>
                                                        <div className={styles.sumSelectionNumbers}>
                                                            {sum.numbers.join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedSums.length > 0 && (
                                            <div className={styles.selectedSums}>
                                                <strong>Đã chọn:</strong> {selectedSums.map(id => `Tổng ${id}`).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Layout: Combined row */}
                        <div className={styles.mobileOptionsLayout}>
                            <div className={styles.mobileOptionsRow}>
                                {/* Checkbox */}
                                <div className={styles.mobileCheckboxGroup}>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            id="filterExcludeDoublesMobile"
                                            type="checkbox"
                                            checked={excludeDoubles}
                                            onChange={handleExcludeDoublesChange}
                                            className={styles.checkbox}
                                            disabled={filterLoading}
                                        />
                                        <label htmlFor="filterExcludeDoublesMobile" className={styles.checkboxLabel}>
                                            Loại bỏ kép bằng
                                        </label>
                                    </div>
                                </div>

                                {/* Button chọn bộ số */}
                                <div className={styles.mobileSpecialSetsGroup}>
                                    <button
                                        className={styles.specialSetsButton}
                                        onClick={() => setShowSpecialSetsModal(true)}
                                        disabled={filterLoading}
                                    >
                                        {selectedSpecialSets.length > 0 ? `${selectedSpecialSets.length} bộ` : 'Chọn bộ số'}
                                    </button>
                                </div>

                                {/* Button chọn chạm */}
                                <div className={styles.mobileTouchGroup}>
                                    <button
                                        className={styles.touchButton}
                                        onClick={() => setShowTouchModal(true)}
                                        disabled={filterLoading}
                                    >
                                        {selectedTouches.length > 0 ? `${selectedTouches.length} chạm` : 'Chạm'}
                                    </button>
                                </div>

                                {/* Button chọn tổng */}
                                <div className={styles.mobileSumGroup}>
                                    <button
                                        className={styles.sumButton}
                                        onClick={() => setShowSumModal(true)}
                                        disabled={filterLoading}
                                    >
                                        {selectedSums.length > 0 ? `${selectedSums.length} tổng` : 'Tổng'}
                                    </button>
                                </div>
                            </div>
                            {/* Help text and Stats row for mobile */}
                            <div className={styles.mobileHelpStatsRow}>
                                {/* Mobile Stats Grid */}
                                <div className={styles.mobileStatsSection}>
                                    {(selectedSpecialSets.length > 0 || combinationNumbers.trim() || excludeNumbers.trim() || selectedTouches.length || selectedSums.length || excludeDoubles) ? (
                                        <div className={styles.mobileStatsGrid}>
                                            {selectedSpecialSets.length > 0 && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('specialSets')}
                                                >
                                                    <span className={styles.mobileStatIcon}>⭐</span>
                                                    <span className={styles.mobileStatText}>
                                                        {selectedSpecialSets.length}/5 bộ
                                                    </span>
                                                </div>
                                            )}

                                            {combinationNumbers.trim() && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('combinationNumbers')}
                                                >
                                                    <span className={styles.mobileStatIcon}>➕</span>
                                                    <span className={styles.mobileStatText}>
                                                        +{parseCombinationNumbers().length}
                                                    </span>
                                                </div>
                                            )}

                                            {excludeNumbers.trim() && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('excludeNumbers')}
                                                >
                                                    <span className={styles.mobileStatIcon}>➖</span>
                                                    <span className={styles.mobileStatText}>
                                                        -{parseExcludeNumbers().length}
                                                    </span>
                                                </div>
                                            )}

                                            {selectedTouches.length > 0 && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('selectedTouches')}
                                                >
                                                    <span className={styles.mobileStatIcon}>🎯</span>
                                                    <span className={styles.mobileStatText}>
                                                        {selectedTouches.length} chạm
                                                    </span>
                                                </div>
                                            )}

                                            {selectedSums.length > 0 && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('selectedSums')}
                                                >
                                                    <span className={styles.mobileStatIcon}>🔢</span>
                                                    <span className={styles.mobileStatText}>
                                                        {selectedSums.length} tổng
                                                    </span>
                                                </div>
                                            )}

                                            {excludeDoubles && (
                                                <div
                                                    className={styles.mobileStatItem}
                                                    onClick={() => handleStatsDetailClick('excludeDoubles')}
                                                >
                                                    <span className={styles.mobileStatIcon}>🚫</span>
                                                    <span className={styles.mobileStatText}>
                                                        Kép
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles.mobileStatsEmpty}>
                                            💡 Lọc dàn số
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Level Selection */}
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>
                                Chọn cấp độ lọc:
                            </label>
                            <div className={styles.levelSelectionContainer}>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                                    <div
                                        key={level}
                                        className={`${styles.levelOption} ${filterSelectedLevels.includes(level) ? styles.selected : ''}`}
                                        onClick={() => handleLevelToggle(level)}
                                    >
                                        {level}X
                                    </div>
                                ))}
                            </div>
                            {filterSelectedLevels.length > 0 && (
                                <div className={styles.selectedLevels}>
                                    <strong>Đã chọn:</strong> {filterSelectedLevels.map(level => `${level}X`).join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        {/* Thống kê lựa chọn - Desktop */}
                        <div className={styles.desktopStatsSection}>
                            <div className={styles.helpText}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px', fontWeight: 'bold' }}>
                                    📊 Thống kê lựa chọn hiện tại:
                                </h4>
                                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                    {selectedSpecialSets.length > 0 && (
                                        <div style={{ color: '#059669', marginBottom: '4px' }}>
                                            ✅ <strong>Bộ số đặc biệt:</strong> {selectedSpecialSets.length}/5 bộ ({selectedSpecialSets.map(id => `Bộ ${id}`).join(', ')})<br />
                                            <span style={{ fontSize: '12px', color: '#047857', fontFamily: 'monospace' }}>
                                                {getCombinedSpecialSetNumbers(selectedSpecialSets).join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {combinationNumbers.trim() && (
                                        <div style={{ color: '#2563eb', marginBottom: '4px' }}>
                                            ✅ <strong>Thêm số mong muốn:</strong> {parseCombinationNumbers().length}/40 số<br />
                                            <span style={{ fontSize: '12px', color: '#1e40af', fontFamily: 'monospace' }}>
                                                {parseCombinationNumbers().join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {excludeNumbers.trim() && (
                                        <div style={{ color: '#dc2626', marginBottom: '4px' }}>
                                            ✅ <strong>Loại bỏ số mong muốn:</strong> {parseExcludeNumbers().length}/5 số<br />
                                            <span style={{ fontSize: '12px', color: '#991b1b', fontFamily: 'monospace' }}>
                                                {parseExcludeNumbers().join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {selectedTouches.length > 0 && (
                                        <div style={{ color: '#f59e0b', marginBottom: '4px' }}>
                                            ✅ <strong>Chọn chạm:</strong> {selectedTouches.length}/10 chạm ({selectedTouches.map(id => `Chạm ${id}`).join(', ')})<br />
                                            <span style={{ fontSize: '12px', color: '#d97706', fontFamily: 'monospace' }}>
                                                {getNumbersByTouch(selectedTouches).join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {selectedSums.length > 0 && (
                                        <div style={{ color: '#8b5cf6', marginBottom: '4px' }}>
                                            ✅ <strong>Chọn tổng:</strong> {selectedSums.length}/10 tổng ({selectedSums.map(id => `Tổng ${id}`).join(', ')})<br />
                                            <span style={{ fontSize: '12px', color: '#7c3aed', fontFamily: 'monospace' }}>
                                                {getNumbersBySum(selectedSums).join(', ')}
                                            </span>
                                        </div>
                                    )}

                                    {excludeDoubles && (
                                        <div style={{ color: '#7c3aed', marginBottom: '4px' }}>
                                            ✅ <strong>Loại bỏ kép bằng:</strong> Đã bật (Cấp cao nhất: 90s)<br />
                                            <span style={{ fontSize: '12px', color: '#6b21a8', fontFamily: 'monospace' }}>
                                                00, 11, 22, 33, 44, 55, 66, 77, 88, 99
                                            </span>
                                        </div>
                                    )}

                                    {selectedSpecialSets.length === 0 && !combinationNumbers.trim() && !excludeNumbers.trim() && !selectedTouches.length && !selectedSums.length && !excludeDoubles && (
                                        <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                            💡 Chưa có lựa chọn nào. Lọc sẽ dựa trên dàn số đã nhập.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Textareas */}
                <div className={styles.rightColumn}>
                    {/* Input Textarea */}
                    <div className={styles.resultsSection}>
                        <h3 className={styles.resultsTitle}>Nhập dàn số</h3>
                        <textarea
                            className={styles.resultsTextarea}
                            value={filterInput}
                            onChange={handleFilterInputChange}
                            placeholder="Nhập các số 2 chữ số (00-99), cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng..."
                            style={{ minHeight: '200px' }}
                            aria-label="Nhập dàn số cần lọc"
                            aria-describedby="filter-input-description"
                        />
                        <p id="filter-input-description" className="sr-only">
                            Nhập các số 2 chữ số từ 00 đến 99, có thể lặp lại, cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng.
                        </p>
                    </div>

                    {/* Result Textarea */}
                    <div
                        className={styles.resultsSection}
                        role="region"
                        aria-live="polite"
                        aria-label="Kết quả lọc dàn số"
                    >
                        <h3 className={styles.resultsTitle}>Kết quả lọc</h3>
                        <textarea
                            className={styles.resultsTextarea}
                            value={filterResult}
                            readOnly
                            placeholder="Kết quả lọc sẽ hiển thị ở đây..."
                            style={{ minHeight: '200px' }}
                            aria-label="Kết quả lọc dàn số"
                            aria-live="polite"
                            aria-atomic="true"
                            role="status"
                            tabIndex="-1"
                        />
                    </div>
                </div>
            </div>

            {/* Special Sets Modal */}
            {showSpecialSetsModal && (
                <div className={styles.specialSetsModalOverlay} onClick={() => setShowSpecialSetsModal(false)}>
                    <div className={styles.specialSetsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.specialSetsModalHeader}>
                            <h3>Chọn bộ số đặc biệt</h3>
                            <button
                                className={styles.modalCloseButton}
                                onClick={() => setShowSpecialSetsModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.specialSetsModalContent}>
                            <div className={styles.specialSetsList}>
                                {specialSetsData.map(set => (
                                    <div
                                        key={set.id}
                                        className={`${styles.specialSetItem} ${selectedSpecialSets.includes(set.id) ? styles.selected : ''
                                            } ${selectedSpecialSets.length >= 5 && !selectedSpecialSets.includes(set.id) ? styles.disabled : ''}`}
                                        onClick={() => !filterLoading && handleSpecialSetToggle(set.id)}
                                        title={`Bộ ${set.id}: ${set.numbers.join(', ')}`}
                                    >
                                        <div className={styles.specialSetHeader}>
                                            <span className={styles.specialSetId}>Bộ {set.id}</span>
                                            <span className={styles.specialSetCount}>({set.count} số)</span>
                                        </div>
                                        <div className={styles.specialSetNumbers}>
                                            {set.numbers.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.specialSetsModalFooter}>
                            <button
                                className={`${styles.button} ${styles.primaryButton}`}
                                onClick={() => setShowSpecialSetsModal(false)}
                            >
                                Hoàn thành
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Touch Modal */}
            {showTouchModal && (
                <div className={styles.specialSetsModalOverlay} onClick={() => setShowTouchModal(false)}>
                    <div className={styles.specialSetsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.specialSetsModalHeader}>
                            <h3>Chọn chạm (0-9)</h3>
                            <button
                                className={styles.specialSetsModalClose}
                                onClick={() => setShowTouchModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.specialSetsModalContent}>
                            <div className={styles.specialSetsList}>
                                {touchData.map(touch => (
                                    <div
                                        key={touch.id}
                                        className={`${styles.specialSetItem} ${selectedTouches.includes(touch.id) ? styles.selected : ''
                                            } ${selectedTouches.length >= 10 && !selectedTouches.includes(touch.id) ? styles.disabled : ''}`}
                                        onClick={() => !filterLoading && handleTouchToggle(touch.id)}
                                        title={`Chạm ${touch.id}: ${touch.numbers.join(', ')}`}
                                    >
                                        <div className={styles.specialSetHeader}>
                                            <span className={styles.specialSetId}>Chạm {touch.id}</span>
                                            <span className={styles.specialSetCount}>({touch.count} số)</span>
                                        </div>
                                        <div className={styles.specialSetNumbers}>
                                            {touch.numbers.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.specialSetsModalFooter}>
                            <div className={styles.selectedCount}>
                                Đã chọn: {selectedTouches.length}/10 chạm
                            </div>
                            <button
                                className={styles.specialSetsModalDone}
                                onClick={() => setShowTouchModal(false)}
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sum Modal */}
            {showSumModal && (
                <div className={styles.specialSetsModalOverlay} onClick={() => setShowSumModal(false)}>
                    <div className={styles.specialSetsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.specialSetsModalHeader}>
                            <h3>Chọn tổng (0-9)</h3>
                            <button
                                className={styles.specialSetsModalClose}
                                onClick={() => setShowSumModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.specialSetsModalContent}>
                            <div className={styles.specialSetsList}>
                                {sumData.map(sum => (
                                    <div
                                        key={sum.id}
                                        className={`${styles.specialSetItem} ${selectedSums.includes(sum.id) ? styles.selected : ''
                                            } ${selectedSums.length >= 10 && !selectedSums.includes(sum.id) ? styles.disabled : ''}`}
                                        onClick={() => !filterLoading && handleSumToggle(sum.id)}
                                        title={`Tổng ${sum.id}: ${sum.numbers.join(', ')}`}
                                    >
                                        <div className={styles.specialSetHeader}>
                                            <span className={styles.specialSetId}>Tổng {sum.id}</span>
                                            <span className={styles.specialSetCount}>({sum.count} số)</span>
                                        </div>
                                        <div className={styles.specialSetNumbers}>
                                            {sum.numbers.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.specialSetsModalFooter}>
                            <div className={styles.selectedCount}>
                                Đã chọn: {selectedSums.length}/10 tổng
                            </div>
                            <button
                                className={styles.specialSetsModalDone}
                                onClick={() => setShowSumModal(false)}
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Detail Modal */}
            {showStatsDetailModal && (
                <div className={styles.statsDetailModalOverlay} onClick={closeStatsDetailModal}>
                    <div className={styles.statsDetailModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.statsDetailModalHeader}>
                            <h3>
                                {statsDetailType === 'specialSets' && '⭐ Bộ số đặc biệt'}
                                {statsDetailType === 'combinationNumbers' && '➕ Thêm số mong muốn'}
                                {statsDetailType === 'excludeNumbers' && '➖ Loại bỏ số mong muốn'}
                                {statsDetailType === 'selectedTouches' && '🎯 Chọn chạm'}
                                {statsDetailType === 'selectedSums' && '🔢 Chọn tổng'}
                                {statsDetailType === 'excludeDoubles' && '🚫 Loại bỏ kép bằng'}
                            </h3>
                            <button
                                className={styles.statsDetailModalClose}
                                onClick={closeStatsDetailModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.statsDetailModalContent}>
                            {statsDetailType === 'specialSets' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Đã chọn:</strong> {selectedSpecialSets.length}/5 bộ
                                    </div>
                                    <div className={styles.statsDetailList}>
                                        {selectedSpecialSets.map(id => {
                                            const set = specialSetsData.find(s => s.id === id);
                                            return (
                                                <div key={id} className={styles.statsDetailItem}>
                                                    <div className={styles.statsDetailItemHeader}>
                                                        <strong>Bộ {id}</strong> ({set.count} số)
                                                    </div>
                                                    <div className={styles.statsDetailNumbers}>
                                                        {set.numbers.join(', ')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {statsDetailType === 'combinationNumbers' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Số lượng:</strong> {parseCombinationNumbers().length}/40 số
                                    </div>
                                    <div className={styles.statsDetailNumbers}>
                                        {parseCombinationNumbers().join(', ')}
                                    </div>
                                </div>
                            )}

                            {statsDetailType === 'excludeNumbers' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Số lượng:</strong> {parseExcludeNumbers().length}/5 số
                                    </div>
                                    <div className={styles.statsDetailNumbers}>
                                        {parseExcludeNumbers().join(', ')}
                                    </div>
                                </div>
                            )}

                            {statsDetailType === 'selectedTouches' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Đã chọn:</strong> {selectedTouches.length}/10 chạm
                                    </div>
                                    <div className={styles.statsDetailList}>
                                        {selectedTouches.map(id => {
                                            const touch = touchData.find(t => t.id === id);
                                            return (
                                                <div key={id} className={styles.statsDetailItem}>
                                                    <div className={styles.statsDetailItemHeader}>
                                                        <strong>Chạm {id}</strong> ({touch.count} số)
                                                    </div>
                                                    <div className={styles.statsDetailNumbers}>
                                                        {touch.numbers.join(', ')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {statsDetailType === 'selectedSums' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Đã chọn:</strong> {selectedSums.length}/10 tổng
                                    </div>
                                    <div className={styles.statsDetailList}>
                                        {selectedSums.map(id => {
                                            const sum = sumData.find(s => s.id === id);
                                            return (
                                                <div key={id} className={styles.statsDetailItem}>
                                                    <div className={styles.statsDetailItemHeader}>
                                                        <strong>Tổng {id}</strong> ({sum.count} số)
                                                    </div>
                                                    <div className={styles.statsDetailNumbers}>
                                                        {sum.numbers.join(', ')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {statsDetailType === 'excludeDoubles' && (
                                <div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Trạng thái:</strong> Đã bật
                                    </div>
                                    <div className={styles.statsDetailInfo}>
                                        <strong>Cấp cao nhất:</strong> 90s (thay vì 95s)
                                    </div>
                                    <div className={styles.statsDetailNumbers}>
                                        Các số kép bằng: 00, 11, 22, 33, 44, 55, 66, 77, 88, 99
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.statsDetailModalFooter}>
                            <button
                                className={styles.statsDetailModalDone}
                                onClick={closeStatsDetailModal}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Copy Modal */}
            {showCopyModal && (
                <div className={styles.specialSetsModalOverlay} onClick={() => setShowCopyModal(false)}>
                    <div className={styles.specialSetsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.specialSetsModalHeader}>
                            <h3>Sao chép kết quả</h3>
                            <button
                                className={styles.modalCloseButton}
                                onClick={() => setShowCopyModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.specialSetsModalContent}>
                            <p style={{ marginBottom: '16px', color: '#666' }}>
                                Không thể sao chép tự động. Vui lòng chọn và copy thủ công:
                            </p>
                            <textarea
                                value={copyText}
                                readOnly
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    resize: 'vertical',
                                    backgroundColor: '#f8f9fa'
                                }}
                                onClick={(e) => e.target.select()}
                            />
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <button
                                    className={`${styles.button} ${styles.primaryButton}`}
                                    onClick={() => {
                                        const textarea = document.querySelector('textarea');
                                        textarea.select();
                                        setShowCopyModal(false);
                                    }}
                                >
                                    Chọn tất cả
                                </button>
                                <button
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                    onClick={() => setShowCopyModal(false)}
                                    style={{ marginLeft: '8px' }}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

DanDeFilter.displayName = 'DanDeFilter';

export default DanDeFilter;
