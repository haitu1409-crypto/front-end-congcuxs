/**
 * DanDeGenerator Component
 * Component chính cho chức năng tạo dàn đề
 */

import React, { useState, useCallback, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { Dice6, Copy, Trash2, Clock, Check, Undo2, Star } from 'lucide-react';
import styles from '../styles/DanDeGenerator.module.css';
import axios from 'axios';
import { getAllSpecialSets, getCombinedSpecialSetNumbers } from '../utils/specialSets';

// Lazy load DanDeFilter for better performance with error handling
const DanDeFilter = lazy(() => import('./DanDeFilter').catch(() => ({ default: () => null })));

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonInput} />
    <div className={styles.skeletonButton} />
    <div className={styles.skeletonResults} />
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized DanDeGenerator component
const DanDeGenerator = memo(() => {
  const [quantity, setQuantity] = useState(1);
  const [combinationNumbers, setCombinationNumbers] = useState('');
  const [excludeNumbers, setExcludeNumbers] = useState('');
  const [excludeDoubles, setExcludeDoubles] = useState(false);
  const [levelsList, setLevelsList] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(false);
  const [levelCopyStatus, setLevelCopyStatus] = useState({});
  const [selectedLevels, setSelectedLevels] = useState({});
  const [copySelectedStatus, setCopySelectedStatus] = useState(false);
  const [undoData, setUndoData] = useState(null);
  const [undoStatus, setUndoStatus] = useState(false);
  const [selectedSpecialSets, setSelectedSpecialSets] = useState([]);

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

  // Client-side generation với bộ số đặc biệt
  const generateClientSideWithAllLogics = (quantity, combinationNumbers = [], excludeNumbers = [], excludeDoubles = false, specialSets = []) => {
    // Điều chỉnh cấp độ khi loại bỏ kép bằng
    const levelCounts = excludeDoubles ? [90, 88, 78, 68, 58, 48, 38, 28, 18, 8] : [95, 88, 78, 68, 58, 48, 38, 28, 18, 8];
    const levelsList = [];
    let totalSelected = 0;

    for (let i = 0; i < quantity; i++) {
      const levels = {};
      let currentDanTotal = 0;

      // Khởi tạo kho số ban đầu (00-99)
      let currentPool = Array.from({ length: 100 }, (_, index) =>
        index.toString().padStart(2, '0')
      );

      // Loại bỏ số kép bằng nếu được chọn
      if (excludeDoubles) {
        const doubleNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        currentPool = currentPool.filter(num => !doubleNumbers.includes(num));
      }

      // Logic chính: Ưu tiên bộ số đặc biệt
      if (specialSets && specialSets.length > 0) {
        const combinedSpecialNumbers = getCombinedSpecialSetNumbers(specialSets);

        // Loại bỏ số loại bỏ từ pool
        if (excludeNumbers && excludeNumbers.length > 0) {
          currentPool = currentPool.filter(num => !excludeNumbers.includes(num));
        }

        // Áp dụng logic phân tầng cho bộ số đặc biệt
        levelCounts.forEach((count) => {
          let numbers;
          const specialCount = combinedSpecialNumbers.length;

          let requiredSpecialCount;
          if (count <= specialCount) {
            requiredSpecialCount = count;
          } else {
            requiredSpecialCount = specialCount;
          }

          const availableSpecial = combinedSpecialNumbers.filter(num => currentPool.includes(num));

          if (availableSpecial.length >= requiredSpecialCount) {
            const selectedSpecial = generateRandomNumbers(requiredSpecialCount, availableSpecial);
            const remainingCount = count - selectedSpecial.length;
            const otherNumbers = currentPool.filter(num => !selectedSpecial.includes(num));
            const selectedOthers = generateRandomNumbers(remainingCount, otherNumbers);
            numbers = [...selectedSpecial, ...selectedOthers].sort((a, b) => parseInt(a) - parseInt(b));
          } else {
            const selectedSpecial = [...availableSpecial];
            const remainingCount = count - selectedSpecial.length;
            const otherNumbers = currentPool.filter(num => !selectedSpecial.includes(num));
            const selectedOthers = generateRandomNumbers(remainingCount, otherNumbers);
            numbers = [...selectedSpecial, ...selectedOthers].sort((a, b) => parseInt(a) - parseInt(b));
          }

          levels[count] = numbers;
          currentDanTotal += numbers.length;
          currentPool = numbers;
        });
      } else {
        // Logic cũ cho trường hợp không có bộ số đặc biệt
        if ((!combinationNumbers || combinationNumbers.length === 0) && (!excludeNumbers || excludeNumbers.length === 0)) {
          levelCounts.forEach(count => {
            const numbers = generateRandomNumbers(count, currentPool);
            levels[count] = numbers;
            currentDanTotal += numbers.length;
            currentPool = numbers;
          });
        } else if (excludeNumbers && excludeNumbers.length > 0 && (!combinationNumbers || combinationNumbers.length === 0)) {
          currentPool = currentPool.filter(num => !excludeNumbers.includes(num));
          levelCounts.forEach(count => {
            const numbers = generateRandomNumbers(count, currentPool);
            levels[count] = numbers;
            currentDanTotal += numbers.length;
            currentPool = numbers;
          });
        } else if (combinationNumbers && combinationNumbers.length > 0) {
          if (excludeNumbers && excludeNumbers.length > 0) {
            currentPool = currentPool.filter(num => !excludeNumbers.includes(num));
          }

          levelCounts.forEach((count) => {
            let numbers;
            const combinationCount = combinationNumbers.length;

            let requiredCombinationCount;
            if (count <= combinationCount) {
              requiredCombinationCount = count;
            } else {
              requiredCombinationCount = combinationCount;
            }

            const availableCombination = combinationNumbers.filter(num => currentPool.includes(num));

            if (availableCombination.length >= requiredCombinationCount) {
              const selectedCombination = generateRandomNumbers(requiredCombinationCount, availableCombination);
              const remainingCount = count - selectedCombination.length;
              const otherNumbers = currentPool.filter(num => !selectedCombination.includes(num));
              const selectedOthers = generateRandomNumbers(remainingCount, otherNumbers);
              numbers = [...selectedCombination, ...selectedOthers].sort((a, b) => parseInt(a) - parseInt(b));
            } else {
              const selectedCombination = [...availableCombination];
              const remainingCount = count - selectedCombination.length;
              const otherNumbers = currentPool.filter(num => !selectedCombination.includes(num));
              const selectedOthers = generateRandomNumbers(remainingCount, otherNumbers);
              numbers = [...selectedCombination, ...selectedOthers].sort((a, b) => parseInt(a) - parseInt(b));
            }

            levels[count] = numbers;
            currentDanTotal += numbers.length;
            currentPool = numbers;
          });
        }
      }

      levelsList.push(levels);
      totalSelected += currentDanTotal;
    }

    return { levelsList, totalSelected };
  };

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

  const generateClientSide = (qty, excludeDoubles = false) => {
    // Điều chỉnh cấp độ khi loại bỏ kép bằng
    const levelCounts = excludeDoubles ? [90, 88, 78, 68, 58, 48, 38, 28, 18, 8] : [95, 88, 78, 68, 58, 48, 38, 28, 18, 8];
    const newLevelsList = [];
    let total = 0;

    for (let i = 0; i < qty; i++) {
      const levels = {};
      let currentPool = Array.from({ length: 100 }, (_, i) =>
        i.toString().padStart(2, '0')
      );

      levelCounts.forEach(count => {
        const numbers = generateRandomNumbers(count, currentPool);
        levels[count] = numbers;
        total += numbers.length;
        currentPool = numbers;
      });

      newLevelsList.push(levels);
    }

    return { levelsList: newLevelsList, totalSelected: total };
  };

  // Tạo dàn với số kết hợp
  const generateClientSideWithCombination = (qty, combinationNums = [], excludeDoubles = false) => {
    // Điều chỉnh cấp độ khi loại bỏ kép bằng
    const levelCounts = excludeDoubles ? [90, 88, 78, 68, 58, 48, 38, 28, 18, 8] : [95, 88, 78, 68, 58, 48, 38, 28, 18, 8];
    const newLevelsList = [];
    let total = 0;

    for (let i = 0; i < qty; i++) {
      const levels = {};
      let currentPool = Array.from({ length: 100 }, (_, i) =>
        i.toString().padStart(2, '0')
      );

      // Nếu không có số kết hợp, dùng logic cũ
      if (combinationNums.length === 0) {
        levelCounts.forEach(count => {
          const numbers = generateRandomNumbers(count, currentPool);
          levels[count] = numbers;
          total += numbers.length;
          currentPool = numbers;
        });
      } else {
        // Logic với số kết hợp
        let foundCombinationLevel = -1;

        levelCounts.forEach((count, index) => {
          let numbers;

          // Nếu chưa tìm thấy bậc chứa số kết hợp
          if (foundCombinationLevel === -1) {
            // Tạo số ngẫu nhiên
            numbers = generateRandomNumbers(count, currentPool);

            // Kiểm tra xem có chứa tất cả số kết hợp không
            const hasAllCombination = combinationNums.every(num => numbers.includes(num));

            if (hasAllCombination) {
              foundCombinationLevel = index;
            }
          } else {
            // Đã tìm thấy bậc chứa số kết hợp, các bậc sau phải chứa số kết hợp
            // Đảm bảo số kết hợp có trong pool hiện tại
            const poolWithCombination = [...new Set([...combinationNums, ...currentPool])];
            const availablePool = poolWithCombination.filter(num => currentPool.includes(num));

            // Tạo số từ pool có chứa số kết hợp
            numbers = generateRandomNumbers(count, availablePool);

            // Đảm bảo số kết hợp luôn có trong kết quả
            const missingCombination = combinationNums.filter(num => !numbers.includes(num));
            if (missingCombination.length > 0) {
              // Thay thế một số ngẫu nhiên bằng số kết hợp thiếu
              missingCombination.forEach(num => {
                if (numbers.length > 0) {
                  const randomIndex = Math.floor(Math.random() * numbers.length);
                  numbers[randomIndex] = num;
                }
              });
              // Sắp xếp lại
              numbers.sort((a, b) => parseInt(a) - parseInt(b));
            }
          }

          levels[count] = numbers;
          total += numbers.length;
          currentPool = numbers;
        });
      }

      newLevelsList.push(levels);
    }

    return { levelsList: newLevelsList, totalSelected: total };
  };

  // Tạo dàn với cả số kết hợp và số loại bỏ
  const generateClientSideWithBothLogics = (qty, combinationNums = [], excludeNums = [], excludeDoubles = false) => {
    // Điều chỉnh cấp độ khi loại bỏ kép bằng
    const levelCounts = excludeDoubles ? [90, 88, 78, 68, 58, 48, 38, 28, 18, 8] : [95, 88, 78, 68, 58, 48, 38, 28, 18, 8];
    const newLevelsList = [];
    let total = 0;

    for (let i = 0; i < qty; i++) {
      const levels = {};
      let currentPool = Array.from({ length: 100 }, (_, i) =>
        i.toString().padStart(2, '0')
      );

      // Loại bỏ số exclude từ pool ban đầu
      if (excludeNums.length > 0) {
        currentPool = currentPool.filter(num => !excludeNums.includes(num));
      }

      // Nếu không có số kết hợp, dùng logic đơn giản (chỉ loại bỏ)
      if (combinationNums.length === 0) {
        levelCounts.forEach(count => {
          const numbers = generateRandomNumbers(count, currentPool);
          levels[count] = numbers;
          total += numbers.length;
          currentPool = numbers;
        });
      } else {
        // Logic với cả số kết hợp và số loại bỏ
        let foundCombinationLevel = -1;

        levelCounts.forEach((count, index) => {
          let numbers;

          // Nếu chưa tìm thấy bậc chứa số kết hợp
          if (foundCombinationLevel === -1) {
            // Tạo số ngẫu nhiên
            numbers = generateRandomNumbers(count, currentPool);

            // Kiểm tra xem có chứa tất cả số kết hợp không
            const hasAllCombination = combinationNums.every(num => numbers.includes(num));

            if (hasAllCombination) {
              foundCombinationLevel = index;
            }
          } else {
            // Đã tìm thấy bậc chứa số kết hợp, các bậc sau phải chứa số kết hợp
            // Đảm bảo số kết hợp có trong pool hiện tại
            const availableCombination = combinationNums.filter(num => currentPool.includes(num));

            if (availableCombination.length > 0) {
              // Tạo số ngẫu nhiên từ pool hiện tại
              numbers = generateRandomNumbers(count, currentPool);

              // Đảm bảo số kết hợp luôn có trong kết quả
              const missingCombination = availableCombination.filter(num => !numbers.includes(num));

              if (missingCombination.length > 0 && numbers.length > missingCombination.length) {
                // Thay thế một số ngẫu nhiên bằng số kết hợp thiếu
                missingCombination.forEach((num, idx) => {
                  if (idx < numbers.length) {
                    // Tìm số không phải số kết hợp để thay thế
                    const replaceIndex = numbers.findIndex(n => !availableCombination.includes(n));
                    if (replaceIndex !== -1) {
                      numbers[replaceIndex] = num;
                    }
                  }
                });
                // Sắp xếp lại
                numbers.sort((a, b) => parseInt(a) - parseInt(b));
              }
            } else {
              // Không còn số kết hợp trong pool, tạo bình thường
              numbers = generateRandomNumbers(count, currentPool);
            }
          }

          levels[count] = numbers;
          total += numbers.length;
          currentPool = numbers;
        });
      }

      newLevelsList.push(levels);
    }

    return { levelsList: newLevelsList, totalSelected: total };
  };


  const handleQuantityChange = useCallback((e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      setQuantity(num);
      setError(null);
    } else {
      setError('Vui lòng nhập số từ 1 đến 50');
    }
  }, []);

  // Debounced input handler
  const debouncedCombinationChange = useMemo(
    () => debounce((value) => {
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
          const excludeNums = excludeNumbers.trim() ?
            excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '').split(',').map(n => n.trim()).filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0')) : [];
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
    }, 300),
    []
  );

  // Xử lý input số kết hợp
  const handleCombinationChange = useCallback((e) => {
    const value = e.target.value;
    setCombinationNumbers(value);
    debouncedCombinationChange(value);
  }, []);

  // Debounced exclude handler
  const debouncedExcludeChange = useMemo(
    () => debounce((value) => {
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
          const combinationNums = combinationNumbers.trim() ?
            combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '').split(',').map(n => n.trim()).filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0')) : [];
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
    }, 300),
    []
  );

  // Xử lý input số loại bỏ
  const handleExcludeChange = useCallback((e) => {
    const value = e.target.value;
    setExcludeNumbers(value);
    debouncedExcludeChange(value);
  }, []);

  // Parse số kết hợp thành mảng
  const parseCombinationNumbers = useCallback(() => {
    if (!combinationNumbers.trim()) return [];

    const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
    const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');

    // Loại bỏ số trùng lặp và giữ thứ tự
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

    // Loại bỏ số trùng lặp và giữ thứ tự
    const uniqueNumbers = [...new Set(numbers)];

    return uniqueNumbers
      .filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99)
      .map(n => n.padStart(2, '0'));
  }, [excludeNumbers]);

  // Kiểm tra tính hợp lệ của input để bật/tắt nút tạo dàn
  const isValidForCreate = useCallback(() => {
    // Nếu không có input nào, cho phép tạo dàn ngẫu nhiên
    if (!combinationNumbers.trim() && !excludeNumbers.trim() && selectedSpecialSets.length === 0) {
      return true;
    }

    // Kiểm tra bộ số đặc biệt
    if (selectedSpecialSets.length > 5) {
      return false;
    }

    // Kiểm tra số mong muốn
    if (combinationNumbers.trim()) {
      const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
      const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
      const uniqueNumbers = [...new Set(numbers)];

      // Kiểm tra số không hợp lệ
      const invalidNumbers = uniqueNumbers.filter(num => {
        const numInt = parseInt(num);
        return isNaN(numInt) || numInt < 0 || numInt > 99 || num.length > 2 || (num.length === 2 && num[0] === '0');
      });

      if (invalidNumbers.length > 0 || uniqueNumbers.length > 40) {
        return false;
      }
    }

    // Kiểm tra số loại bỏ
    if (excludeNumbers.trim()) {
      const processedValue = excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
      const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');
      const uniqueNumbers = [...new Set(numbers)];

      // Kiểm tra số không hợp lệ
      const invalidNumbers = uniqueNumbers.filter(num => {
        const numInt = parseInt(num);
        return isNaN(numInt) || numInt < 0 || numInt > 99 || num.length > 2 || (num.length === 2 && num[0] === '0');
      });

      if (invalidNumbers.length > 0 || uniqueNumbers.length > 5) {
        return false;
      }
    }

    // Kiểm tra xung đột giữa số mong muốn và số loại bỏ
    if (combinationNumbers.trim() && excludeNumbers.trim()) {
      const combinationNums = parseCombinationNumbers();
      const excludeNums = parseExcludeNumbers();
      const conflicts = combinationNums.filter(num => excludeNums.includes(num));
      if (conflicts.length > 0) {
        return false;
      }
    }

    // Kiểm tra xung đột giữa bộ số đặc biệt và số loại bỏ
    if (selectedSpecialSets.length > 0 && excludeNumbers.trim()) {
      const excludeNums = parseExcludeNumbers();
      const specialNumbers = getCombinedSpecialSetNumbers(selectedSpecialSets);
      const conflicts = specialNumbers.filter(num => excludeNums.includes(num));
      if (conflicts.length > 0) {
        return false;
      }
    }

    return true;
  }, [combinationNumbers, excludeNumbers, selectedSpecialSets]);

  // Xử lý checkbox loại bỏ kép bằng
  const handleExcludeDoublesChange = useCallback((e) => {
    setExcludeDoubles(e.target.checked);
  }, []);

  // Tạo danh sách số kép bằng (00, 11, 22, ..., 99)
  const getDoubleNumbers = useCallback(() => {
    return Array.from({ length: 10 }, (_, i) => i.toString().repeat(2));
  }, []);

  const handleGenerateDan = useCallback(async () => {
    if (!quantity || quantity < 1 || quantity > 50) {
      setError('Số lượng dàn phải từ 1 đến 50');
      return;
    }

    // Validate số kết hợp và số loại bỏ
    const combinationNums = parseCombinationNumbers();
    const excludeNums = parseExcludeNumbers();

    // Validate bộ số đặc biệt
    if (selectedSpecialSets.length > 5) {
      setError('Chỉ được chọn tối đa 5 bộ số đặc biệt');
      return;
    }

    if (combinationNumbers.trim() && combinationNums.length === 0) {
      setError('Thêm số không hợp lệ. Vui lòng nhập số 2 chữ số (00-99), cách nhau bằng dấu phẩy');
      return;
    }

    if (excludeNumbers.trim() && excludeNums.length === 0) {
      setError('Loại bỏ số mong muốn không hợp lệ. Vui lòng nhập số 2 chữ số (00-99), cách nhau bằng dấu phẩy');
      return;
    }

    // Kiểm tra xung đột
    const conflicts = combinationNums.filter(num => excludeNums.includes(num));
    if (conflicts.length > 0) {
      setError(`Số ${conflicts.join(', ')} không thể vừa là Thêm số vừa là Loại bỏ số`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Thử gọi API trước
      const requestData = {
        quantity: parseInt(quantity, 10),
        combinationNumbers: combinationNums.length > 0 ? combinationNums : undefined,
        excludeNumbers: excludeNums.length > 0 ? excludeNums : undefined,
        excludeDoubles: excludeDoubles || undefined,
        specialSets: selectedSpecialSets.length > 0 ? selectedSpecialSets : undefined
      };

      const response = await axios.post(`${API_URL}/api/dande/generate`, requestData);

      if (response.data.success) {
        setLevelsList(response.data.data.levelsList);
        setTotalSelected(response.data.data.totalSelected);
        setUndoData(null); // Xóa dữ liệu undo khi tạo dàn mới
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo dàn đề');
      }
    } catch (err) {
      console.error('API Error, falling back to client-side generation:', err);
      // Fallback: Tạo ở client-side nếu API lỗi
      const result = generateClientSideWithAllLogics(parseInt(quantity, 10), combinationNums, excludeNums, excludeDoubles, selectedSpecialSets);
      setLevelsList(result.levelsList);
      setTotalSelected(result.totalSelected);
      setUndoData(null); // Xóa dữ liệu undo khi tạo dàn mới
    } finally {
      setLoading(false);
    }
  }, [quantity, combinationNumbers, excludeNumbers, excludeDoubles, selectedSpecialSets]);

  const handleCopyDan = useCallback(() => {
    if (levelsList.length === 0) {
      setModalMessage('Chưa có dàn số để sao chép');
      setShowModal(true);
      return;
    }

    // Mapping cấp độ dựa trên excludeDoubles
    const levelMapping = excludeDoubles
      ? { 95: 90 } // Chỉ map 95 -> 90, các cấp khác giữ nguyên
      : {};

    const copyText = levelsList
      .map((levels, index) => {
        const danText = Object.keys(levels)
          .sort((a, b) => parseInt(b) - parseInt(a))
          .map(level => {
            // Format: "9 5 s" (tách số thành từng chữ số)
            const actualLevel = levelMapping[parseInt(level)] || parseInt(level);
            const levelStr = actualLevel.toString();
            const formattedLevel = levelStr.split('').join(' ') + ' s';
            return `${formattedLevel}\n${levels[level].join(',')}`;
          })
          .join('\n');
        return index > 0 ? `\n${danText}` : danText;
      })
      .join('');

    navigator.clipboard.writeText(copyText.trim()).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }).catch(() => {
      setModalMessage('Lỗi khi sao chép');
      setShowModal(true);
    });
  }, [levelsList, excludeDoubles]);

  const handleCopyLevel = useCallback((level, numbers, danIndex) => {
    const copyText = `${level}s: ${numbers.join(', ')}`;
    const levelKey = `${danIndex}-${level}`;

    navigator.clipboard.writeText(copyText).then(() => {
      setLevelCopyStatus(prev => ({
        ...prev,
        [levelKey]: true
      }));

      // Reset sau 2 giây
      setTimeout(() => {
        setLevelCopyStatus(prev => ({
          ...prev,
          [levelKey]: false
        }));
      }, 2000);
    }).catch(() => {
      setModalMessage('Lỗi khi sao chép');
      setShowModal(true);
    });
  }, []);

  const handleXoaDan = useCallback(() => {
    // Lưu tất cả dữ liệu trước khi xóa để có thể hoàn tác
    if (levelsList.length > 0 || combinationNumbers.trim() || excludeNumbers.trim() || selectedSpecialSets.length > 0 || excludeDoubles) {
      setUndoData({
        levelsList: [...levelsList],
        totalSelected: totalSelected,
        selectedLevels: { ...selectedLevels },
        quantity: quantity,
        combinationNumbers: combinationNumbers,
        excludeNumbers: excludeNumbers,
        excludeDoubles: excludeDoubles,
        selectedSpecialSets: [...selectedSpecialSets]
      });
    }

    // XÓA TẤT CẢ: cả kết quả và cài đặt
    setLevelsList([]);
    setTotalSelected(0);
    setSelectedLevels({});
    setQuantity(1);
    setCombinationNumbers('');
    setExcludeNumbers('');
    setExcludeDoubles(false);
    setSelectedSpecialSets([]);
    setError(null);
    setDeleteStatus(true);
    setTimeout(() => setDeleteStatus(false), 2000);
  }, [levelsList, combinationNumbers, excludeNumbers, selectedSpecialSets, excludeDoubles, totalSelected, selectedLevels]);

  const handleUndo = useCallback(() => {
    if (undoData) {
      setLevelsList(undoData.levelsList);
      setTotalSelected(undoData.totalSelected);
      setSelectedLevels(undoData.selectedLevels);
      setQuantity(undoData.quantity);
      setCombinationNumbers(undoData.combinationNumbers);
      setExcludeNumbers(undoData.excludeNumbers);
      setExcludeDoubles(undoData.excludeDoubles);
      setSelectedSpecialSets(undoData.selectedSpecialSets);
      setUndoData(null); // Xóa dữ liệu undo sau khi hoàn tác
      setUndoStatus(true);
      setTimeout(() => setUndoStatus(false), 2000);
    }
  }, [undoData]);

  const handleLevelSelect = useCallback((danIndex, level) => {
    const key = `${danIndex}-${level}`;
    setSelectedLevels(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const handleCopySelected = useCallback(() => {
    const selectedTexts = [];

    levelsList.forEach((levels, danIndex) => {
      const danTexts = [];
      Object.keys(levels)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .forEach(level => {
          const key = `${danIndex}-${level}`;
          if (selectedLevels[key] && levels[level].length > 0) {
            danTexts.push(`${level}s: ${levels[level].join(', ')}`);
          }
        });

      if (danTexts.length > 0) {
        selectedTexts.push(`Dàn ${danIndex + 1}\n${danTexts.join('\n')}`);
      }
    });

    if (selectedTexts.length === 0) {
      setModalMessage('Vui lòng chọn ít nhất một bậc số để copy');
      setShowModal(true);
      return;
    }

    const copyText = selectedTexts.join('\n\n=================================\n\n');

    navigator.clipboard.writeText(copyText.trim()).then(() => {
      setCopySelectedStatus(true);
      setTimeout(() => setCopySelectedStatus(false), 2000);
    }).catch(() => {
      setModalMessage('Lỗi khi sao chép');
      setShowModal(true);
    });
  }, [levelsList, selectedLevels]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalMessage('');
  }, []);

  // Tạo nội dung textarea từ kết quả
  const generateTextareaContent = useMemo(() => {
    if (levelsList.length === 0) {
      return "Chưa có dàn số nào. Nhấn \"Tạo Dàn\" để bắt đầu.";
    }

    // Mapping cấp độ dựa trên excludeDoubles
    const levelMapping = excludeDoubles
      ? { 95: 90 } // Chỉ map 95 -> 90, các cấp khác giữ nguyên
      : {};

    const content = [];
    levelsList.forEach((levels, danIndex) => {
      if (danIndex > 0) {
        content.push(''); // Dòng trống giữa các dàn
      }

      Object.keys(levels)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .forEach(level => {
          if (levels[level].length > 0) {
            // Format: 9 5 s (tách số thành từng chữ số) - làm đậm với CSS
            const actualLevel = levelMapping[parseInt(level)] || parseInt(level);
            const levelStr = actualLevel.toString();
            const formattedLevel = levelStr.split('').join(' ') + ' s';
            content.push(formattedLevel);
            content.push(levels[level].join(','));
          }
        });
    });

    return content.join('\n');
  }, [levelsList, excludeDoubles]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.twoColumnLayout}>
          {/* Left Column: Inputs and Buttons */}
          <div className={styles.leftColumn}>
            {/* Inputs Section */}
            <div className={styles.inputsSection}>
              <h2 className={styles.sectionTitle}>Cài đặt tạo dàn</h2>
              <p id="generator-description" className="sr-only">
                Công cụ tạo dàn đề 9x-0x với 10 cấp độ từ 95 số xuống 8 số, hỗ trợ thêm số mong muốn, loại bỏ số, và chọn bộ số đặc biệt.
              </p>
              {/* Buttons Section */}
              <div className={styles.buttonsSection}>
                <h3 className={styles.sectionTitle}>Thao tác</h3>

                <div className={styles.buttonRow}>
                  <button
                    onClick={handleGenerateDan}
                    className={`${styles.button} ${styles.primaryButton}`}
                    disabled={loading || !isValidForCreate()}
                    aria-label="Tạo dàn đề ngẫu nhiên"
                    aria-describedby="generator-description"
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
                    onClick={handleCopyDan}
                    className={`${styles.button} ${styles.secondaryButton} ${copyStatus ? styles.successButton : ''}`}
                    disabled={loading || levelsList.length === 0}
                  >
                    {copyStatus ? <Check size={16} /> : <Copy size={16} />}
                    {copyStatus ? 'Đã Copy!' : 'Copy'}
                  </button>

                  <button
                    onClick={handleXoaDan}
                    className={`${styles.button} ${styles.dangerButton} ${deleteStatus ? styles.successButton : ''}`}
                    disabled={loading}
                  >
                    {deleteStatus ? <Check size={16} /> : <Trash2 size={16} />}
                    {deleteStatus ? 'Đã Xóa!' : 'Xóa'}
                  </button>

                  {undoData && (
                    <button
                      onClick={handleUndo}
                      className={`${styles.button} ${styles.warningButton} ${undoStatus ? styles.successButton : ''}`}
                      disabled={loading}
                    >
                      {undoStatus ? <Check size={16} /> : <Undo2 size={16} />}
                      {undoStatus ? 'Đã Hoàn Tác!' : 'Hoàn Tác'}
                    </button>
                  )}
                </div>
              </div>
              {/* Row 1: Quantity Input and Exclude Doubles Checkbox */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="quantity" className={styles.inputLabel}>
                    Số lượng dàn (1-50):
                  </label>
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
                    disabled={loading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Tùy chọn khác:
                  </label>
                  <div className={styles.checkboxContainer}>
                    <input
                      id="excludeDoubles"
                      type="checkbox"
                      checked={excludeDoubles}
                      onChange={handleExcludeDoublesChange}
                      className={styles.checkbox}
                      disabled={loading}
                    />
                    <label htmlFor="excludeDoubles" className={styles.checkboxLabel}>
                      Loại bỏ kép bằng
                    </label>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                    Chú ý: Loại bỏ kép bằng 95s sẽ thành 90s
                  </div>
                </div>
              </div>

              {/* Row 2: Combination Numbers and Exclude Numbers */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="combinationNumbers" className={styles.inputLabel}>
                    Thêm số mong muốn (tối đa 40 số):
                  </label>
                  <input
                    id="combinationNumbers"
                    type="text"
                    value={combinationNumbers}
                    onChange={handleCombinationChange}
                    placeholder="45,50,67 hoặc 45 50 67 hoặc 45;50;67"
                    title="Nhập các số 2 chữ số (00-99), cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng. Tối đa 40 số."
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="excludeNumbers" className={styles.inputLabel}>
                    Loại bỏ số mong muốn (tối đa 5 số):
                  </label>
                  <input
                    id="excludeNumbers"
                    type="text"
                    value={excludeNumbers}
                    onChange={handleExcludeChange}
                    placeholder="83,84,85 hoặc 83 84 85 hoặc 83;84;85"
                    title="Nhập các số 2 chữ số (00-99) cần loại bỏ, cách nhau bằng dấu phẩy, chấm phẩy hoặc khoảng trắng. Tối đa 5 số."
                    className={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Special Sets Selection */}
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
                        onClick={() => !loading && handleSpecialSetToggle(set.id)}
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


              {/* Thống kê lựa chọn */}
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

                  {excludeDoubles && (
                    <div style={{ color: '#7c3aed', marginBottom: '4px' }}>
                      ✅ <strong>Loại bỏ kép bằng:</strong> Đã bật (Cấp cao nhất: 90s)<br />
                      <span style={{ fontSize: '12px', color: '#6b21a8', fontFamily: 'monospace' }}>
                        00, 11, 22, 33, 44, 55, 66, 77, 88, 99
                      </span>
                    </div>
                  )}

                  {selectedSpecialSets.length === 0 && !combinationNumbers.trim() && !excludeNumbers.trim() && !excludeDoubles && (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                      💡 Chưa có lựa chọn nào. Dàn sẽ được tạo ngẫu nhiên.
                    </div>
                  )}

                </div>
              </div>
            </div>



            {/* Error Display */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results Textarea */}
          <div className={styles.rightColumn}>
            <div
              className={styles.resultsSection}
              role="region"
              aria-live="polite"
              aria-label="Kết quả tạo dàn đề"
            >
              <h2 className={styles.resultsTitle}>Kết quả tạo dàn</h2>
              <textarea
                className={styles.resultsTextarea}
                value={generateTextareaContent}
                readOnly
                placeholder="Kết quả tạo dàn sẽ hiển thị ở đây..."
                aria-label="Kết quả tạo dàn đề"
                tabIndex="-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Box Lọc Dàn */}
      <Suspense fallback={<LoadingSkeleton />}>
        <DanDeFilter />
      </Suspense>

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
});

DanDeGenerator.displayName = 'DanDeGenerator';

export default DanDeGenerator;

