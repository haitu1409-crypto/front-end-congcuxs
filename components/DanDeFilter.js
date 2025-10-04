/**
 * DanDeFilter Component
 * Component cho chức năng lọc dàn đề
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Clock, Dice6, Star, Copy, Check, Undo2, Filter } from 'lucide-react';
import styles from '../styles/DanDeGenerator.module.css';
import { getAllSpecialSets, getCombinedSpecialSetNumbers } from '../utils/specialSets';

const DanDeFilter = memo(() => {
    // States cho box Lọc dàn
    const [filterInput, setFilterInput] = useState('');
    const [filterResult, setFilterResult] = useState('');
    const [filterSelectedLevels, setFilterSelectedLevels] = useState([]);
    const [filterLoading, setFilterLoading] = useState(false);

    // States cho các tùy chọn bổ sung
    const [excludeDoubles, setExcludeDoubles] = useState(false);
    const [combinationNumbers, setCombinationNumbers] = useState('');
    const [excludeNumbers, setExcludeNumbers] = useState('');
    const [selectedSpecialSets, setSelectedSpecialSets] = useState([]);
    const [error, setError] = useState(null);

    // States cho copy và undo
    const [copyStatus, setCopyStatus] = useState(false);
    const [undoData, setUndoData] = useState(null);
    const [undoStatus, setUndoStatus] = useState(false);

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

    // Xử lý thay đổi input số mong muốn
    const handleCombinationChange = useCallback((e) => {
        const value = e.target.value;
        setCombinationNumbers(value);

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
                setError('Thêm số mong muốn không được quá 40 số (đã loại bỏ số trùng lặp)');
                return;
            }

            const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

            if (invalidNumbers.length > 0) {
                setError('Thêm số phải là số 2 chữ số (00-99), cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng');
            } else {
                // Kiểm tra xung đột với số loại bỏ
                const excludeNums = parseExcludeNumbers();
                const combinationNums = uniqueNumbers.filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
                const conflicts = combinationNums.filter(num => excludeNums.includes(num));

                if (conflicts.length > 0) {
                    setError(`Số ${conflicts.join(', ')} không thể vừa là Thêm số vừa là Loại bỏ số`);
                } else {
                    setError(null);
                }
            }
        } else {
            setError(null);
        }
    }, []);

    // Xử lý thay đổi input loại bỏ số mong muốn
    const handleExcludeChange = useCallback((e) => {
        const value = e.target.value;
        setExcludeNumbers(value);

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
            if (uniqueNumbers.length > 5) {
                setError('Loại bỏ số mong muốn không được quá 5 số (đã loại bỏ số trùng lặp)');
                return;
            }

            const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

            if (invalidNumbers.length > 0) {
                setError('Loại bỏ số phải là số 2 chữ số (00-99), cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng');
            } else {
                // Kiểm tra xung đột với số kết hợp
                const combinationNums = parseCombinationNumbers();
                const excludeNums = uniqueNumbers.filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
                const conflicts = combinationNums.filter(num => excludeNums.includes(num));

                if (conflicts.length > 0) {
                    setError(`Số ${conflicts.join(', ')} không thể vừa là Thêm số vừa là Loại bỏ số`);
                } else {
                    setError(null);
                }
            }
        } else {
            setError(null);
        }
    }, []);

    // Xử lý checkbox loại bỏ kép bằng
    const handleExcludeDoublesChange = useCallback((e) => {
        setExcludeDoubles(e.target.checked);
    }, []);

    // Parse số mong muốn thành mảng
    const parseCombinationNumbers = useCallback(() => {
        if (!combinationNumbers.trim()) return [];
        const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
        const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
        const uniqueNumbers = [...new Set(numbers)];
        return uniqueNumbers
            .filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99)
            .map(n => n.padStart(2, '0'));
    }, [combinationNumbers]);

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

        // Kiểm tra giới hạn số lượng
        if (combinationNums.length > 40) {
            setError('Thêm số mong muốn không được quá 40 số');
            return false;
        }

        if (excludeNums.length > 5) {
            setError('Loại bỏ số mong muốn không được quá 5 số');
            return false;
        }

        if (selectedSpecialSets.length > 5) {
            setError('Chỉ được chọn tối đa 5 bộ số đặc biệt');
            return false;
        }

        // Kiểm tra xung đột
        const conflicts = combinationNums.filter(num => excludeNums.includes(num));
        if (conflicts.length > 0) {
            setError(`Số ${conflicts.join(', ')} không thể vừa là số mong muốn vừa là loại bỏ số`);
            return false;
        }

        // Kiểm tra xung đột giữa bộ số đặc biệt và số loại bỏ
        if (selectedSpecialSets.length > 0 && excludeNums.length > 0) {
            const specialNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
            const specialConflicts = specialNumbers.filter(num => excludeNums.includes(num));
            if (specialConflicts.length > 0) {
                setError(`Số ${specialConflicts.join(', ')} từ bộ số đặc biệt không thể vừa là số mong muốn vừa là loại bỏ số`);
                return false;
            }
        }

        setError(null);
        return true;
    }, [combinationNumbers, excludeNumbers, selectedSpecialSets]);

    // Handler cho lọc dàn
    const handleFilterInputChange = useCallback((e) => {
        const value = e.target.value;

        // Chỉ cho phép số 2 chữ số, dấu phẩy, dấu cách, dấu chấm phẩy
        const sanitizedValue = value.replace(/[^0-9,;\s]/g, '');

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

    const handleFilterDan = useCallback(() => {
        if (!filterInput.trim()) {
            setFilterResult('Vui lòng nhập dàn số cần lọc.');
            return;
        }

        if (filterSelectedLevels.length === 0) {
            setFilterResult('Vui lòng chọn ít nhất một cấp độ (0X, 1X, 2X, ...).');
            return;
        }

        // Validate các tùy chọn bổ sung
        if (!validateInput()) {
            setFilterResult(`Lỗi: ${error}`);
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

            // KHÔNG loại bỏ số trùng lặp - cho phép số xuất hiện nhiều lần

            if (inputNumbers.length === 0) {
                setFilterResult('Không tìm thấy số hợp lệ trong input.');
                setFilterLoading(false);
                return;
            }

            // Áp dụng các tùy chọn bổ sung
            const combinationNums = parseCombinationNumbers();
            const excludeNums = parseExcludeNumbers();

            // Loại bỏ kép bằng nếu được chọn
            if (excludeDoubles) {
                const doubleNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
                inputNumbers = inputNumbers.filter(num => !doubleNumbers.includes(num));
            }

            // Loại bỏ số exclude
            if (excludeNums.length > 0) {
                inputNumbers = inputNumbers.filter(num => !excludeNums.includes(num));
            }

            // Ưu tiên số mong muốn hoặc bộ số đặc biệt
            if (combinationNums.length > 0 || selectedSpecialSets.length > 0) {
                let priorityNumbers = [];

                if (selectedSpecialSets.length > 0) {
                    priorityNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
                } else if (combinationNums.length > 0) {
                    priorityNumbers = combinationNums;
                }

                // Tìm các số có trong input
                const availablePriorityNumbers = priorityNumbers.filter(num => inputNumbers.includes(num));

                if (availablePriorityNumbers.length > 0) {
                    // Ưu tiên các số này
                    inputNumbers = [...availablePriorityNumbers, ...inputNumbers.filter(num => !availablePriorityNumbers.includes(num))];
                }
            }

            // Logic lọc theo cấp độ với thứ tự ưu tiên mới
            // Điều chỉnh cấp độ khi loại bỏ kép bằng
            let levelCounts, levelMapping;
            if (excludeDoubles) {
                // Khi loại bỏ kép bằng, chỉ còn 90 số, điều chỉnh cấp 95s thành 90s
                levelCounts = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 90 };
                levelMapping = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 90 };
            } else {
                // Bình thường với đầy đủ 100 số
                levelCounts = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 95 };
                levelMapping = { 0: 8, 1: 18, 2: 28, 3: 38, 4: 48, 5: 58, 6: 68, 7: 78, 8: 88, 9: 95 };
            }
            const filteredResults = [];

            // Đếm tần suất xuất hiện của mỗi số (chỉ cần đếm 1 lần)
            const frequencyMap = {};
            inputNumbers.forEach(num => {
                frequencyMap[num] = (frequencyMap[num] || 0) + 1;
            });

            filterSelectedLevels.forEach(level => {
                const targetCount = levelCounts[level];
                const selectedNumbers = [];

                // Bước 1: Ưu tiên số mong muốn (nếu có)
                if (combinationNums.length > 0) {
                    const availableCombination = combinationNums.filter(num => inputNumbers.includes(num));
                    selectedNumbers.push(...availableCombination);
                }

                // Bước 2: Ưu tiên bộ số đặc biệt (nếu có và chưa có số mong muốn)
                if (selectedNumbers.length === 0 && selectedSpecialSets.length > 0) {
                    const specialNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
                    const availableSpecial = specialNumbers.filter(num => inputNumbers.includes(num));
                    selectedNumbers.push(...availableSpecial);
                }

                // Bước 3: Ưu tiên số lặp lại từ input (sắp xếp theo tần suất giảm dần)
                const repeatNumbers = [];
                const singleNumbers = [];

                Object.keys(frequencyMap).forEach(num => {
                    if (frequencyMap[num] > 1) {
                        repeatNumbers.push(num);
                    } else {
                        singleNumbers.push(num);
                    }
                });

                // Loại bỏ các số đã được chọn ở bước 1, 2
                const remainingRepeatNumbers = repeatNumbers.filter(num => !selectedNumbers.includes(num));
                const remainingSingleNumbers = singleNumbers.filter(num => !selectedNumbers.includes(num));

                // Sắp xếp số lặp lại theo tần suất giảm dần
                remainingRepeatNumbers.sort((a, b) => frequencyMap[b] - frequencyMap[a]);

                // Thêm số lặp lại vào kết quả
                selectedNumbers.push(...remainingRepeatNumbers);

                // Bước 4: Bổ sung các số đơn lẻ từ input
                const remainingCount = targetCount - selectedNumbers.length;
                if (remainingCount > 0 && remainingSingleNumbers.length > 0) {
                    const shuffledSingles = [...remainingSingleNumbers].sort(() => Math.random() - 0.5);
                    selectedNumbers.push(...shuffledSingles.slice(0, remainingCount));
                }

                // Bước 5: Nếu vẫn thiếu, thêm số ngẫu nhiên từ 00-99
                const finalCount = selectedNumbers.length;
                if (finalCount < targetCount) {
                    const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
                    const availableNumbers = allNumbers.filter(num => !inputNumbers.includes(num));
                    const shuffledAvailable = [...availableNumbers].sort(() => Math.random() - 0.5);
                    const neededCount = targetCount - finalCount;
                    selectedNumbers.push(...shuffledAvailable.slice(0, neededCount));
                }

                // Sắp xếp kết quả theo thứ tự tăng dần
                const finalResult = selectedNumbers.slice(0, targetCount).sort((a, b) => parseInt(a) - parseInt(b));

                // Thống kê cho hiển thị
                const priorityCount = combinationNums.length > 0 ? combinationNums.length :
                    (selectedSpecialSets.length > 0 ? getCombinedSpecialSetNumbers(selectedSpecialSets).length : 0);
                const repeatCount = remainingRepeatNumbers.length;
                const singleCount = Math.min(remainingCount, remainingSingleNumbers.length);
                const randomCount = Math.max(0, targetCount - priorityCount - repeatCount - singleCount);

                filteredResults.push({
                    level: level,
                    targetCount: targetCount,
                    result: finalResult,
                    priorityCount: priorityCount,
                    repeatCount: repeatCount,
                    singleCount: singleCount,
                    randomCount: randomCount
                });
            });

            if (filteredResults.length === 0) {
                setFilterResult(`Không tìm thấy số nào phù hợp với các cấp độ đã chọn: ${filterSelectedLevels.join(', ')}X`);
            } else {
                // Tạo kết quả hiển thị
                const resultLines = filteredResults.map(result => {
                    const stats = [];
                    if (result.priorityCount > 0) {
                        const priorityType = combinationNums.length > 0 ? 'ưu tiên' : 'bộ đặc biệt';
                        stats.push(`${result.priorityCount} ${priorityType}`);
                    }
                    if (result.repeatCount > 0) stats.push(`${result.repeatCount} lặp lại`);
                    if (result.singleCount > 0) stats.push(`${result.singleCount} đơn lẻ`);
                    if (result.randomCount > 0) stats.push(`${result.randomCount} ngẫu nhiên`);

                    const statsText = stats.length > 0 ? `(${stats.join(', ')})` : '';
                    // Format: "9 5 s" (tách số thành từng chữ số)
                    const actualLevel = levelMapping[result.level];
                    const levelStr = actualLevel.toString();
                    const formattedLevel = levelStr.split('').join(' ') + ' s';
                    return `${formattedLevel} ${statsText}:\n${result.result.join(',')}`;
                });

                // Sắp xếp kết quả theo thứ tự giảm dần (cao nhất xuống thấp nhất)
                const sortedResults = filteredResults.sort((a, b) => {
                    const levelA = levelMapping[a.level];
                    const levelB = levelMapping[b.level];
                    return parseInt(levelB) - parseInt(levelA);
                });

                // Tạo lại resultLines với thứ tự đã sắp xếp
                const sortedResultLines = sortedResults.map(result => {
                    const stats = [];
                    if (result.priorityCount > 0) {
                        const priorityType = combinationNums.length > 0 ? 'ưu tiên' : 'bộ đặc biệt';
                        stats.push(`${result.priorityCount} ${priorityType}`);
                    }
                    if (result.repeatCount > 0) stats.push(`${result.repeatCount} lặp lại`);
                    if (result.singleCount > 0) stats.push(`${result.singleCount} đơn lẻ`);
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
                if (combinationNums.length > 0) appliedOptions.push(`ưu tiên ${combinationNums.length} số`);
                if (selectedSpecialSets.length > 0) appliedOptions.push(`ưu tiên ${selectedSpecialSets.length} bộ đặc biệt`);

                // Tạo thống kê tần suất số ở đầu
                const frequencyStats = [];
                if (frequencyMap && Object.keys(frequencyMap).length > 0) {
                    const sortedFrequency = Object.entries(frequencyMap)
                        .sort(([, a], [, b]) => b - a) // Sắp xếp theo tần suất giảm dần
                        .slice(0, 20); // Chỉ hiển thị top 20 số xuất hiện nhiều nhất

                    if (sortedFrequency.length > 0) {
                        frequencyStats.push('📊 THỐNG KÊ TẦN SUẤT SỐ (Top 20):');
                        frequencyStats.push('');

                        const frequencyList = sortedFrequency
                            .map(([num, count]) => `${num}(${count} lần)`)
                            .join('; ');

                        frequencyStats.push(frequencyList);
                        frequencyStats.push('');
                        frequencyStats.push('📋 KẾT QUẢ LỌC:');
                        frequencyStats.push('');
                    }
                }

                const optionsText = appliedOptions.length > 0 ? `\n\nĐã áp dụng: ${appliedOptions.join(', ')}` : '';
                const resultContent = frequencyStats.length > 0
                    ? `${frequencyStats.join('\n')}${sortedResultLines.join('\n\n')}${optionsText}`
                    : `${sortedResultLines.join('\n\n')}${optionsText}`;

                setFilterResult(resultContent);
            }

        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu:', error);
            setFilterResult('Lỗi khi xử lý dữ liệu: ' + error.message);
        }

        setFilterLoading(false);
    }, [filterInput, filterSelectedLevels, combinationNumbers, excludeNumbers, selectedSpecialSets, excludeDoubles]);

    const handleClearFilter = useCallback(() => {
        // Lưu dữ liệu trước khi xóa để có thể hoàn tác
        if (filterResult.trim()) {
            setUndoData({
                filterResult: filterResult,
                filterInput: filterInput,
                filterSelectedLevels: [...filterSelectedLevels],
                excludeDoubles: excludeDoubles,
                combinationNumbers: combinationNumbers,
                excludeNumbers: excludeNumbers,
                selectedSpecialSets: [...selectedSpecialSets]
            });
        }

        setFilterInput('');
        setFilterResult('');
        setFilterSelectedLevels([]);
        setExcludeDoubles(false);
        setCombinationNumbers('');
        setExcludeNumbers('');
        setSelectedSpecialSets([]);
        setError(null);
    }, [filterResult, filterInput, filterSelectedLevels, excludeDoubles, combinationNumbers, excludeNumbers, selectedSpecialSets]);

    const handleCopyResult = useCallback(() => {
        if (!filterResult.trim()) {
            setError('Chưa có kết quả để sao chép');
            return;
        }

        // Lấy chỉ phần kết quả lọc, bỏ qua thống kê và options
        const lines = filterResult.split('\n');
        const resultLines = [];
        let inResultSection = false;

        for (const line of lines) {
            // Bắt đầu từ phần "📋 KẾT QUẢ LỌC:"
            if (line.includes('📋 KẾT QUẢ LỌC:')) {
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

        const copyText = resultLines.join('\n');

        navigator.clipboard.writeText(copyText.trim()).then(() => {
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000);
        }).catch(() => {
            setError('Lỗi khi sao chép kết quả');
        });
    }, [filterResult]);

    const handleUndo = useCallback(() => {
        if (undoData) {
            setFilterInput(undoData.filterInput);
            setFilterResult(undoData.filterResult);
            setFilterSelectedLevels(undoData.filterSelectedLevels);
            setExcludeDoubles(undoData.excludeDoubles);
            setCombinationNumbers(undoData.combinationNumbers);
            setExcludeNumbers(undoData.excludeNumbers);
            setSelectedSpecialSets(undoData.selectedSpecialSets);
            setUndoData(null);
            setUndoStatus(true);
            setTimeout(() => setUndoStatus(false), 2000);
        }
    }, [undoData]);

    return (
        <div className={styles.card} style={{ marginTop: 'var(--spacing-6)' }}>
            <h2 className={styles.sectionTitles} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                <Filter size={20} style={{ display: 'inline', marginRight: '8px' }} />
                Lọc Dàn Đề Siêu Cấp
            </h2>
            <p className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                {/* <Filter size={20} style={{ display: 'inline', marginRight: '8px' }} /> */}
                Đây là công cụ lọc dàn chuyên nghiệp, bạn có thể nhập tổng hợp dàn đề của các cao thủ khác nhau, với công cụ này sẽ cho bạn dàn đề cuối cùng tốt nhất
            </p>
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

                        {/* Row 1: Combination Numbers and Exclude Numbers */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="filterCombinationNumbers" className={styles.inputLabel}>
                                    Thêm số mong muốn (tối đa 40 số):
                                </label>
                                <input
                                    id="filterCombinationNumbers"
                                    type="text"
                                    value={combinationNumbers}
                                    onChange={handleCombinationChange}
                                    placeholder="45,50,67 hoặc 45 50 67 hoặc 45;50;67"
                                    title="Nhập các số 2 chữ số (00-99) muốn ưu tiên trong kết quả lọc"
                                    className={styles.input}
                                    disabled={filterLoading}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="filterExcludeNumbers" className={styles.inputLabel}>
                                    Loại bỏ số mong muốn (tối đa 5 số):
                                </label>
                                <input
                                    id="filterExcludeNumbers"
                                    type="text"
                                    value={excludeNumbers}
                                    onChange={handleExcludeChange}
                                    placeholder="83,84,85 hoặc 83 84 85 hoặc 83;84;85"
                                    title="Nhập các số 2 chữ số (00-99) cần loại bỏ khỏi kết quả lọc"
                                    className={styles.input}
                                    disabled={filterLoading}
                                />
                            </div>
                        </div>

                        {/* Row 2: Exclude Doubles and Special Sets */}
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    Tùy chọn khác:
                                </label>
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
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                                    Chú ý: Loại bỏ kép bằng 95s sẽ thành 90s
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    <Star size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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

                        {/* Help Text */}
                        <div className={styles.helpText}>
                            <strong>Hướng dẫn:</strong> Nhập các số cần lọc vào ô bên phải, chọn cấp độ muốn lọc (0X-9X), có thể thêm các tùy chọn bổ sung, sau đó nhấn "Lọc Dàn" để xem kết quả.
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
                        aria-label="Kết quả lọc dàn đề"
                    >
                        <h3 className={styles.resultsTitle}>Kết quả lọc</h3>
                        <textarea
                            className={styles.resultsTextarea}
                            value={filterResult}
                            readOnly
                            placeholder="Kết quả lọc sẽ hiển thị ở đây..."
                            style={{ minHeight: '200px' }}
                            aria-label="Kết quả lọc dàn đề"
                            tabIndex="-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

DanDeFilter.displayName = 'DanDeFilter';

export default DanDeFilter;
