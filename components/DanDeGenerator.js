/**
 * DanDeGenerator Component
 * Component chính cho chức năng tạo dàn số
 */

import React, { useState, useCallback, useEffect, useMemo, memo, lazy, Suspense, useDeferredValue, startTransition } from 'react';
import { Dice6, Copy, Trash2, Clock, Check, Undo2, Star, Filter, Info } from 'lucide-react';
import styles from '../styles/DanDeGenerator.module.css';
import axios from 'axios';
import { getAllSpecialSets, getCombinedSpecialSetNumbers } from '../utils/specialSets';
import { getTouchInfo, getNumbersByTouch } from '../utils/touchSets';
import { getSumInfo, getNumbersBySum } from '../utils/sumSets';


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
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(false);
  const [levelCopyStatus, setLevelCopyStatus] = useState({});
  const [selectedLevels, setSelectedLevels] = useState({});
  const [copySelectedStatus, setCopySelectedStatus] = useState(false);
  const [undoData, setUndoData] = useState(null);
  const [undoStatus, setUndoStatus] = useState(false);
  const [selectedSpecialSets, setSelectedSpecialSets] = useState([]);
  const [showSpecialSetsModal, setShowSpecialSetsModal] = useState(false);
  const [showStatsDetailModal, setShowStatsDetailModal] = useState(false);
  const [statsDetailType, setStatsDetailType] = useState(null);
  const [showTouchModal, setShowTouchModal] = useState(false);
  const [showSumModal, setShowSumModal] = useState(false);

  // States cho touch
  const [selectedTouches, setSelectedTouches] = useState([]);

  // States cho sum
  const [selectedSums, setSelectedSums] = useState([]);

  // States cho validation errors
  const [combinationError, setCombinationError] = useState(null);
  const [excludeError, setExcludeError] = useState(null);

  // States cho mobile navbar
  const [activeNavItem, setActiveNavItem] = useState('generator');

  // Auto update active nav item based on scroll position - Mobile optimized
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'generator', element: document.querySelector('[data-section="generator"]') },
        { id: 'filter', element: document.querySelector('[data-section="filter"]') },
        { id: 'guide', element: document.querySelector('[data-section="guide"]') }
      ];

      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveNavItem(section.id);
          break;
        }
      }
    };

    // Mobile-optimized scroll throttling with passive listeners
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listeners for better mobile performance
    const scrollOptions = { passive: true };
    window.addEventListener('scroll', throttledHandleScroll, scrollOptions);

    return () => window.removeEventListener('scroll', throttledHandleScroll, scrollOptions);
  }, []);

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

  // Client-side generation với thuật toán mới - 5 mức độ ưu tiên theo yêu cầu
  const generateClientSideWithAllLogics = (quantity, combinationNumbers = [], excludeNumbers = [], excludeDoubles = false, specialSets = [], touches = [], sums = []) => {
    // Tính số lượng số thực tế có thể sử dụng
    let availableNumbers = 100; // Tổng số từ 00-99

    // Mức 1: Loại bỏ kép bằng (10 số)
    if (excludeDoubles) {
      availableNumbers -= 10;
    }

    // Mức 2: Loại bỏ số mong muốn
    if (excludeNumbers && excludeNumbers.length > 0) {
      availableNumbers -= excludeNumbers.length;
    }

    // Định nghĩa cấp độ dựa trên số lượng số thực tế
    let levelCounts;
    if (availableNumbers >= 95) {
      levelCounts = excludeDoubles ? [8, 18, 28, 38, 48, 58, 68, 78, 88, 90] : [8, 18, 28, 38, 48, 58, 68, 78, 88, 95];
    } else if (availableNumbers >= 90) {
      levelCounts = [8, 18, 28, 38, 48, 58, 68, 78, 88, availableNumbers];
    } else if (availableNumbers >= 80) {
      levelCounts = [8, 18, 28, 38, 48, 58, 68, 78, availableNumbers];
    } else if (availableNumbers >= 70) {
      levelCounts = [8, 18, 28, 38, 48, 58, 68, availableNumbers];
    } else if (availableNumbers >= 60) {
      levelCounts = [8, 18, 28, 38, 48, 58, availableNumbers];
    } else if (availableNumbers >= 50) {
      levelCounts = [8, 18, 28, 38, 48, availableNumbers];
    } else if (availableNumbers >= 40) {
      levelCounts = [8, 18, 28, 38, availableNumbers];
    } else if (availableNumbers >= 30) {
      levelCounts = [8, 18, 28, availableNumbers];
    } else if (availableNumbers >= 20) {
      levelCounts = [8, 18, availableNumbers];
    } else if (availableNumbers >= 10) {
      levelCounts = [8, availableNumbers];
    } else {
      // Trường hợp quá ít số, chỉ có bậc 8s
      levelCounts = [Math.min(8, availableNumbers)];
    }

    const levelsList = [];
    let totalSelected = 0;

    for (let i = 0; i < quantity; i++) {
      const levels = {};
      let currentDanTotal = 0;

      // Khởi tạo kho số ban đầu (00-99)
      let currentPool = Array.from({ length: 100 }, (_, index) =>
        index.toString().padStart(2, '0')
      );

      // Mức 1: Loại bỏ kép bằng
      if (excludeDoubles) {
        const doubleNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        currentPool = currentPool.filter(num => !doubleNumbers.includes(num));
      }

      // Mức 2: Loại bỏ số mong muốn
      if (excludeNumbers && excludeNumbers.length > 0) {
        currentPool = currentPool.filter(num => !excludeNumbers.includes(num));
      }

      // Chuẩn bị các tập số ưu tiên
      // Mức 3: Số mong muốn (ưu tiên cao nhất)
      let priority3Numbers = [];
      if (combinationNumbers && combinationNumbers.length > 0) {
        priority3Numbers = combinationNumbers.filter(num => currentPool.includes(num));
      }

      // Mức 4: Kết hợp Bộ đặc biệt + Chạm + Tổng
      let criteria4Numbers = [];
      let numberFrequency = {}; // Đếm tần suất xuất hiện

      // Thêm số từ Bộ đặc biệt
      if (specialSets && specialSets.length > 0) {
        const specialNumbers = getCombinedSpecialSetNumbers(specialSets);
        specialNumbers.forEach(num => {
          if (currentPool.includes(num)) {
            criteria4Numbers.push(num);
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          }
        });
      }

      // Thêm số từ Chạm
      if (touches && touches.length > 0) {
        const touchNumbers = getNumbersByTouch(touches);
        touchNumbers.forEach(num => {
          if (currentPool.includes(num)) {
            criteria4Numbers.push(num);
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          }
        });
      }

      // Thêm số từ Tổng
      if (sums && sums.length > 0) {
        const sumNumbers = getNumbersBySum(sums);
        sumNumbers.forEach(num => {
          if (currentPool.includes(num)) {
            criteria4Numbers.push(num);
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          }
        });
      }

      // Loại bỏ trùng lặp và sắp xếp theo tần suất (cao → thấp)
      const uniqueCriteria4Numbers = [...new Set(criteria4Numbers)].sort((a, b) => {
        const freqA = numberFrequency[a] || 0;
        const freqB = numberFrequency[b] || 0;

        // Ưu tiên tần suất cao hơn
        if (freqA !== freqB) {
          return freqB - freqA;
        }

        // Nếu tần suất bằng nhau, sắp xếp theo số
        return parseInt(a) - parseInt(b);
      });

      // Tạo bản sao để theo dõi số đã sử dụng
      let usedPriority3Numbers = [...priority3Numbers];
      let usedCriteria4Numbers = [...uniqueCriteria4Numbers];

      // Xử lý từ bậc thấp lên cao (8s → 95s/90s) - Đảm bảo quy tắc tập con và không trùng lặp
      levelCounts.forEach((count, levelIndex) => {
        let finalNumbers = [];

        // Bước 1: Bao gồm tất cả số từ các bậc trước (quy tắc tập con)
        if (levelIndex > 0) {
          const previousCount = levelCounts[levelIndex - 1];
          const previousNumbers = levels[previousCount] || [];
          finalNumbers = [...previousNumbers];
        }

        // Bước 2: Tính số lượng cần thêm cho bậc hiện tại
        const additionalNeeded = count - finalNumbers.length;

        if (additionalNeeded > 0) {
          // Tạo Set để theo dõi số đã chọn trong bậc hiện tại
          const currentLevelUsed = new Set(finalNumbers);

          // Bước 3: Lấy số từ Mức 3 (Số mong muốn) - ưu tiên cao nhất
          let remainingCount = additionalNeeded;
          let selectedFromPriority3 = [];

          if (usedPriority3Numbers.length > 0) {
            // Lọc số chưa được sử dụng trong bậc hiện tại
            const availablePriority3 = usedPriority3Numbers.filter(num =>
              !currentLevelUsed.has(num)
            );

            if (availablePriority3.length > 0) {
              if (availablePriority3.length >= remainingCount) {
                // Nếu số mong muốn >= số cần thiết, lấy ngẫu nhiên
                selectedFromPriority3 = generateRandomNumbers(remainingCount, availablePriority3);
              } else {
                // Nếu số mong muốn < số cần thiết, lấy tất cả
                selectedFromPriority3 = [...availablePriority3];
              }
              remainingCount -= selectedFromPriority3.length;
            }
          }

          // Cập nhật Set và finalNumbers
          selectedFromPriority3.forEach(num => currentLevelUsed.add(num));
          finalNumbers = [...finalNumbers, ...selectedFromPriority3];

          // Bước 4: Lấy số từ Mức 4 (Bộ đặc biệt + Chạm + Tổng) nếu còn thiếu
          if (remainingCount > 0 && usedCriteria4Numbers.length > 0) {
            let selectedFromCriteria4 = [];

            // Lọc số chưa được sử dụng trong bậc hiện tại
            const availableCriteria4 = usedCriteria4Numbers.filter(num =>
              !currentLevelUsed.has(num)
            );

            if (availableCriteria4.length > 0) {
              // Phân loại theo tần suất từ cao xuống thấp
              const freq3Numbers = availableCriteria4.filter(num => (numberFrequency[num] || 0) === 3);
              const freq2Numbers = availableCriteria4.filter(num => (numberFrequency[num] || 0) === 2);
              const freq1Numbers = availableCriteria4.filter(num => (numberFrequency[num] || 0) === 1);

              // Lấy theo thứ tự ưu tiên: tần suất 3 → tần suất 2 → tần suất 1
              let tempRemainingCount = remainingCount;

              // Bước 1: Lấy tất cả số có tần suất 3
              if (freq3Numbers.length > 0 && tempRemainingCount > 0) {
                if (freq3Numbers.length <= tempRemainingCount) {
                  selectedFromCriteria4 = [...selectedFromCriteria4, ...freq3Numbers];
                  tempRemainingCount -= freq3Numbers.length;
                } else {
                  const randomFromFreq3 = generateRandomNumbers(tempRemainingCount, freq3Numbers);
                  selectedFromCriteria4 = [...selectedFromCriteria4, ...randomFromFreq3];
                  tempRemainingCount = 0;
                }
              }

              // Bước 2: Lấy số có tần suất 2 nếu còn thiếu
              if (tempRemainingCount > 0 && freq2Numbers.length > 0) {
                if (freq2Numbers.length <= tempRemainingCount) {
                  selectedFromCriteria4 = [...selectedFromCriteria4, ...freq2Numbers];
                  tempRemainingCount -= freq2Numbers.length;
                } else {
                  const randomFromFreq2 = generateRandomNumbers(tempRemainingCount, freq2Numbers);
                  selectedFromCriteria4 = [...selectedFromCriteria4, ...randomFromFreq2];
                  tempRemainingCount = 0;
                }
              }

              // Bước 3: Lấy số có tần suất 1 nếu vẫn còn thiếu
              if (tempRemainingCount > 0 && freq1Numbers.length > 0) {
                const randomFromFreq1 = generateRandomNumbers(
                  Math.min(tempRemainingCount, freq1Numbers.length),
                  freq1Numbers
                );
                selectedFromCriteria4 = [...selectedFromCriteria4, ...randomFromFreq1];
              }

              // Cập nhật Set và finalNumbers
              selectedFromCriteria4.forEach(num => currentLevelUsed.add(num));
              finalNumbers = [...finalNumbers, ...selectedFromCriteria4];
              remainingCount = count - finalNumbers.length;
            }
          }

          // Bước 5: Bù số ngẫu nhiên (Mức 5) nếu vẫn thiếu
          if (remainingCount > 0) {
            // Lọc số chưa được sử dụng trong bậc hiện tại
            const availableRandomNumbers = currentPool.filter(num =>
              !currentLevelUsed.has(num)
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
        levels[count] = sortedNumbers;
        currentDanTotal += sortedNumbers.length;
      });

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

  // Mobile-optimized debounced input handler
  const debouncedCombinationChange = useMemo(
    () => debounce((value) => {
      // Use startTransition for non-urgent validation
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
          if (uniqueNumbers.length > 100) {
            setCombinationError(`❌ Quá nhiều số! Chỉ được thêm tối đa 100 số. Hiện tại: ${uniqueNumbers.length} số. Vui lòng xóa bớt ${uniqueNumbers.length - 100} số.`);
            return;
          }

          // Kiểm tra xung đột với số loại bỏ và kép bằng
          const excludeNums = excludeNumbers.trim() ?
            excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '').split(',').map(n => n.trim()).filter(n => n !== '' && /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0')) : [];

          let availableNumbers = 100;
          if (excludeDoubles) {
            availableNumbers -= 10; // Loại bỏ kép bằng
          }
          if (excludeNums.length > 0) {
            availableNumbers -= excludeNums.length; // Loại bỏ số mong muốn
          }

          if (uniqueNumbers.length > availableNumbers) {
            setCombinationError(`❌ Quá nhiều số! Chỉ được thêm tối đa ${availableNumbers} số (sau khi loại bỏ kép bằng và số loại bỏ). Hiện tại: ${uniqueNumbers.length} số.`);
            return;
          }

          const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

          if (invalidNumbers.length > 0) {
            setCombinationError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99, cách nhau bằng dấu phẩy.`);
          } else {
            setCombinationError(null);
          }
        } else {
          setCombinationError(null);
        }
      });
    }, 150), // Reduced debounce time for mobile responsiveness
    [excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums]
  );

  // Deferred values for better performance
  const deferredCombinationNumbers = useDeferredValue(combinationNumbers);
  const deferredExcludeNumbers = useDeferredValue(excludeNumbers);

  // Xử lý input số kết hợp với startTransition
  const handleCombinationChange = useCallback((e) => {
    const value = e.target.value;
    setCombinationNumbers(value);

    // Use startTransition for non-urgent updates
    startTransition(() => {
      debouncedCombinationChange(value);
    });
  }, [debouncedCombinationChange]);

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
        if (uniqueNumbers.length > 20) {
          setExcludeError(`❌ Quá nhiều số! Chỉ được loại bỏ tối đa 20 số. Hiện tại: ${uniqueNumbers.length} số. Vui lòng xóa bớt ${uniqueNumbers.length - 20} số.`);
          return;
        }

        const invalidNumbers = uniqueNumbers.filter(n => !/^\d{2}$/.test(n) || parseInt(n) > 99);

        if (invalidNumbers.length > 0) {
          setExcludeError(`❌ Số không hợp lệ: ${invalidNumbers.join(', ')}. Chỉ chấp nhận số 2 chữ số từ 00-99, cách nhau bằng dấu phẩy.`);
        } else {
          setExcludeError(null);
        }
      } else {
        setExcludeError(null);
      }
    }, 300),
    [combinationNumbers, selectedSpecialSets, selectedTouches, selectedSums]
  );

  // Xử lý input số loại bỏ với startTransition
  const handleExcludeChange = useCallback((e) => {
    const value = e.target.value;
    setExcludeNumbers(value);

    // Use startTransition for non-urgent updates
    startTransition(() => {
      debouncedExcludeChange(value);
    });
  }, [debouncedExcludeChange]);

  // Parse số kết hợp thành mảng
  const parseCombinationNumbers = useCallback(() => {
    if (!combinationNumbers.trim()) return [];

    const processedValue = combinationNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
    const numbers = processedValue.split(',').map(n => n.trim()).filter(n => n !== '');

    const uniqueNumbers = [...new Set(numbers)];

    let excludeSet = new Set();
    if (excludeNumbers.trim()) {
      const processedExclude = excludeNumbers.replace(/[;,\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
      const excludeArr = processedExclude.split(',').map(n => n.trim()).filter(n => n !== '');
      const validExclude = excludeArr.filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99).map(n => n.padStart(2, '0'));
      excludeSet = new Set(validExclude);
    }

    return uniqueNumbers
      .filter(n => /^\d{2}$/.test(n) && parseInt(n) <= 99)
      .map(n => n.padStart(2, '0'))
      .filter(n => !excludeSet.has(n));
  }, [combinationNumbers, excludeNumbers]);

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
    if (!combinationNumbers.trim() && !excludeNumbers.trim() && selectedSpecialSets.length === 0 && selectedTouches.length === 0 && selectedSums.length === 0) {
      return true;
    }

    // Kiểm tra bộ số đặc biệt
    if (selectedSpecialSets.length > 5) {
      return false;
    }

    // Kiểm tra lỗi validation
    if (combinationError || excludeError) {
      return false;
    }

    // Kiểm tra giới hạn số lượng
    const combinationNums = parseCombinationNumbers();
    const excludeNums = parseExcludeNumbers();

    if (combinationNums.length > 100 || excludeNums.length > 20) {
      return false;
    }

    return true;
  }, [combinationNumbers, excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums, combinationError, excludeError, parseCombinationNumbers, parseExcludeNumbers]);

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
      setError('❌ Số lượng dàn phải từ 1 đến 50');
      return;
    }

    // Validate số kết hợp và số loại bỏ
    const combinationNums = parseCombinationNumbers();
    const excludeNums = parseExcludeNumbers();

    // Validate bộ số đặc biệt
    if (selectedSpecialSets.length > 5) {
      setError('❌ Quá nhiều bộ số! Chỉ được chọn tối đa 5 bộ số đặc biệt.');
      return;
    }

    // Kiểm tra lỗi validation từ input handlers
    if (combinationError) {
      setError(combinationError);
      return;
    }

    if (excludeError) {
      setError(excludeError);
      return;
    }

    if (combinationNumbers.trim() && combinationNums.length === 0) {
      setError('❌ Thêm số không hợp lệ. Vui lòng nhập số 2 chữ số (00-99), cách nhau bằng dấu phẩy.');
      return;
    }

    if (excludeNumbers.trim() && excludeNums.length === 0) {
      setError('❌ Loại bỏ số mong muốn không hợp lệ. Vui lòng nhập số 2 chữ số (00-99), cách nhau bằng dấu phẩy.');
      return;
    }

    // Ngăn chặn request trùng lặp
    if (isRequestInProgress) {
      console.warn('🚫 Request already in progress, ignoring duplicate call');
      return;
    }

    setLoading(true);
    setError(null);
    setIsRequestInProgress(true);

    // Định nghĩa requestData ở scope rộng hơn để có thể sử dụng trong catch block
    const requestData = {
      quantity: parseInt(quantity, 10),
      combinationNumbers: combinationNums.length > 0 ? combinationNums : undefined,
      excludeNumbers: excludeNums.length > 0 ? excludeNums : undefined,
      excludeDoubles: excludeDoubles || undefined,
      specialSets: selectedSpecialSets.length > 0 ? selectedSpecialSets : undefined,
      touches: selectedTouches.length > 0 ? selectedTouches.map(t => t.toString()) : undefined,
      sums: selectedSums.length > 0 ? selectedSums.map(s => s.toString()) : undefined
    };

    try {

      // Debug logging
      console.log('🚀 Sending request to API:', {
        url: `${API_URL}/api/dande/generate`,
        data: requestData,
        quantityType: typeof requestData.quantity,
        quantityValue: requestData.quantity
      });

      const response = await axios.post(`${API_URL}/api/dande/generate`, requestData, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setLevelsList(response.data.data.levelsList);
        setTotalSelected(response.data.data.totalSelected);
        setUndoData(null); // Xóa dữ liệu undo khi tạo dàn mới
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo dàn số');
      }
    } catch (err) {
      console.error('API Error, falling back to client-side generation:', err);

      // Log chi tiết lỗi API
      if (err.response) {
        console.error('API Response Error:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          requestData: requestData
        });
      } else if (err.request) {
        console.error('API Request Error:', err.request);
      } else {
        console.error('API Setup Error:', err.message);
      }

      // Fallback: Tạo ở client-side nếu API lỗi
      const result = generateClientSideWithAllLogics(parseInt(quantity, 10), combinationNums, excludeNums, excludeDoubles, selectedSpecialSets, selectedTouches, selectedSums);
      setLevelsList(result.levelsList);
      setTotalSelected(result.totalSelected);
      setUndoData(null); // Xóa dữ liệu undo khi tạo dàn mới
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  }, [quantity, combinationNumbers, excludeNumbers, excludeDoubles, selectedSpecialSets, selectedTouches, selectedSums, combinationError, excludeError, parseCombinationNumbers, parseExcludeNumbers]);

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
    if (levelsList.length > 0 || combinationNumbers.trim() || excludeNumbers.trim() || selectedSpecialSets.length > 0 || selectedTouches.length > 0 || selectedSums.length > 0 || excludeDoubles) {
      setUndoData({
        levelsList: [...levelsList],
        totalSelected: totalSelected,
        selectedLevels: { ...selectedLevels },
        quantity: quantity,
        combinationNumbers: combinationNumbers,
        excludeNumbers: excludeNumbers,
        excludeDoubles: excludeDoubles,
        selectedSpecialSets: [...selectedSpecialSets],
        selectedTouches: [...selectedTouches],
        selectedSums: [...selectedSums]
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
    setSelectedTouches([]);
    setSelectedSums([]);
    setError(null);
    setDeleteStatus(true);
    setTimeout(() => setDeleteStatus(false), 2000);
  }, [levelsList, combinationNumbers, excludeNumbers, selectedSpecialSets, selectedTouches, selectedSums, excludeDoubles, totalSelected, selectedLevels]);

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
      setSelectedTouches(undoData.selectedTouches || []);
      setSelectedSums(undoData.selectedSums || []);
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

  // Handler để mở modal chi tiết thống kê
  const handleStatsDetailClick = useCallback((type) => {
    setStatsDetailType(type);
    setShowStatsDetailModal(true);
  }, []);

  const closeStatsDetailModal = useCallback(() => {
    setShowStatsDetailModal(false);
    setStatsDetailType(null);
  }, []);

  // Mobile navbar handlers
  const handleNavItemClick = useCallback((itemId) => {
    setActiveNavItem(itemId);

    // Scroll to section based on itemId
    if (itemId === 'generator') {
      // Scroll to top of generator section
      const generatorSection = document.querySelector('[data-section="generator"]');
      if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (itemId === 'filter') {
      // Scroll to filter section
      const filterSection = document.querySelector('[data-section="filter"]');
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (itemId === 'guide') {
      // Scroll to guide section
      const guideSection = document.querySelector('[data-section="guide"]');
      if (guideSection) {
        guideSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
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
      <div className={styles.card} data-section="generator">
        <div className={styles.twoColumnLayout}>
          {/* Left Column: Inputs and Buttons */}
          <div className={styles.leftColumn}>
            {/* Inputs Section */}
            <div className={styles.inputsSection}>
              <h2 className={styles.sectionTitle}>Cài đặt tạo dàn</h2>
              <p id="generator-description" className="sr-only">
                Công cụ tạo dàn số 9x-0x với 10 cấp độ từ 95 số xuống 8 số, hỗ trợ thêm số mong muốn, loại bỏ số, và chọn bộ số đặc biệt.
              </p>
              {/* Buttons Section */}
              <div className={styles.buttonsSection}>
                <h3 className={styles.sectionTitle}>Thao tác</h3>

                <div className={styles.buttonRow}>
                  <button
                    onClick={handleGenerateDan}
                    className={`${styles.button} ${styles.primaryButton}`}
                    disabled={loading || !isValidForCreate()}
                    aria-label="Tạo dàn số ngẫu nhiên"
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
              {/* Main Inputs Row: 3 inputs on same row */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="quantity" className={styles.inputLabel}>
                    Số lượng dàn:
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
                  <label htmlFor="combinationNumbers" className={styles.inputLabel}>
                    Thêm số:
                  </label>
                  <input
                    id="combinationNumbers"
                    type="text"
                    value={combinationNumbers}
                    onChange={handleCombinationChange}
                    placeholder="45,50,67"
                    className={styles.input}
                    disabled={loading}
                  />
                  {combinationError && (
                    <div className={styles.inputErrorText}>
                      {combinationError}
                    </div>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="excludeNumbers" className={styles.inputLabel}>
                    Loại bỏ số:
                  </label>
                  <input
                    id="excludeNumbers"
                    type="text"
                    value={excludeNumbers}
                    onChange={handleExcludeChange}
                    placeholder="83,84,85"
                    className={styles.input}
                    disabled={loading}
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
                        Chọn bộ số đặc biệt:
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
                  </div>

                  {/* Row 2: Touch and Sum - Side by side */}
                  <div className={styles.desktopTouchSumRow}>
                    {/* Chọn chạm - Desktop */}
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Chọn chạm (tối đa 10 chạm):
                      </label>
                      <div className={styles.touchSelectionContainer}>
                        <div className={styles.touchSelectionList}>
                          {touchData.map(touch => (
                            <div
                              key={touch.id}
                              className={`${styles.touchSelectionItem} ${selectedTouches.includes(touch.id) ? styles.selected : ''
                                } ${selectedTouches.length >= 10 && !selectedTouches.includes(touch.id) ? styles.disabled : ''}`}
                              onClick={() => !loading && handleTouchToggle(touch.id)}
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
                              onClick={() => !loading && handleSumToggle(sum.id)}
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
                        id="excludeDoublesMobile"
                        type="checkbox"
                        checked={excludeDoubles}
                        onChange={handleExcludeDoublesChange}
                        className={styles.checkbox}
                        disabled={loading}
                      />
                      <label htmlFor="excludeDoublesMobile" className={styles.checkboxLabel}>
                        Loại bỏ kép bằng
                      </label>
                    </div>
                  </div>

                  {/* Button chọn bộ số */}
                  <div className={styles.mobileSpecialSetsGroup}>
                    <button
                      className={styles.specialSetsButton}
                      onClick={() => setShowSpecialSetsModal(true)}
                      disabled={loading}
                    >
                      {selectedSpecialSets.length > 0
                        ? `${selectedSpecialSets.length} bộ`
                        : 'Chọn bộ số'
                      }
                    </button>
                  </div>

                  {/* Button chọn chạm */}
                  <div className={styles.mobileTouchGroup}>
                    <button
                      className={styles.touchButton}
                      onClick={() => setShowTouchModal(true)}
                      disabled={loading}
                    >
                      {selectedTouches.length > 0
                        ? `${selectedTouches.length} chạm`
                        : 'Chạm'
                      }
                    </button>
                  </div>

                  {/* Button chọn tổng */}
                  <div className={styles.mobileSumGroup}>
                    <button
                      className={styles.sumButton}
                      onClick={() => setShowSumModal(true)}
                      disabled={loading}
                    >
                      {selectedSums.length > 0
                        ? `${selectedSums.length} tổng`
                        : 'Tổng'
                      }
                    </button>
                  </div>
                </div>

                {/* Help text and Stats row for mobile */}
                <div className={styles.mobileHelpStatsRow}>
                  <div className={styles.mobileHelpText}>
                    Chú ý: Loại bỏ kép bằng 95s sẽ thành 90s
                  </div>

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
                        💡 Ngẫu nhiên
                      </div>
                    )}
                  </div>
                </div>
              </div>


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
                        ✅ <strong>Thêm số mong muốn:</strong> {parseCombinationNumbers().length}/100 số<br />
                        <span style={{ fontSize: '12px', color: '#1e40af', fontFamily: 'monospace' }}>
                          {parseCombinationNumbers().join(', ')}
                        </span>
                      </div>
                    )}

                    {excludeNumbers.trim() && (
                      <div style={{ color: '#dc2626', marginBottom: '4px' }}>
                        ✅ <strong>Loại bỏ số mong muốn:</strong> {parseExcludeNumbers().length}/20 số<br />
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
                        💡 Chưa có lựa chọn nào. Dàn sẽ được tạo ngẫu nhiên.
                      </div>
                    )}
                  </div>
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
              aria-label="Kết quả tạo dàn số"
            >
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

      {/* Special Sets Modal */}
      {showSpecialSetsModal && (
        <div className={styles.specialSetsModalOverlay} onClick={() => setShowSpecialSetsModal(false)}>
          <div className={styles.specialSetsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.specialSetsModalHeader}>
              <h3>Chọn bộ số đặc biệt</h3>
              <button
                className={styles.specialSetsModalClose}
                onClick={() => setShowSpecialSetsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.specialSetsModalContent}>
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
            <div className={styles.specialSetsModalFooter}>
              <div className={styles.selectedCount}>
                Đã chọn: {selectedSpecialSets.length}/5 bộ
              </div>
              <button
                className={styles.specialSetsModalDone}
                onClick={() => setShowSpecialSetsModal(false)}
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
                    <strong>Số lượng:</strong> {parseCombinationNumbers().length}/100 số
                  </div>
                  <div className={styles.statsDetailNumbers}>
                    {parseCombinationNumbers().join(', ')}
                  </div>
                </div>
              )}

              {statsDetailType === 'excludeNumbers' && (
                <div>
                  <div className={styles.statsDetailInfo}>
                    <strong>Số lượng:</strong> {parseExcludeNumbers().length}/20 số
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
                    onClick={() => !loading && handleTouchToggle(touch.id)}
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
                    onClick={() => !loading && handleSumToggle(sum.id)}
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
    </div>
  );
});

DanDeGenerator.displayName = 'DanDeGenerator';

export default DanDeGenerator;

