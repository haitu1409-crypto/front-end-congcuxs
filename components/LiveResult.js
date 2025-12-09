/**
 * LiveResult Component - Hiển thị kết quả xổ số real-time
 * Layout giống LatestXSMBResults với tính năng real-time từ kqxs LiveResult
 * Sử dụng Socket.io để nhận updates từ backend
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import lotterySocketClient from '../services/lotterySocketClient';
import {
    formatResultForDisplay,
    createEmptyResult,
    getFilteredNumber,
    isWithinLiveWindow,
    getTodayFormatted,
    getVietnamTime
} from '../utils/lotteryUtils';
import styles from '../styles/LiveResult.module.css';

const ChatPreview = dynamic(() => import('./Chat/ChatPreview'), {
    ssr: false
});

const LiveResult = ({ station = 'xsmb', isModal = false, showChatPreview = false }) => {
    const [liveData, setLiveData] = useState(createEmptyResult());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [animatingPrize, setAnimatingPrize] = useState(null);
    const [filterType] = useState('all');
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [randomSeed, setRandomSeed] = useState(0); // Seed để randomize số mỗi lần render

    const mountedRef = useRef(false);
    const animationTimeoutsRef = useRef(new Map());
    const animationThrottleRef = useRef(null);
    const lastAnimatingPrizeRef = useRef(null);
    const prizeUpdateTimeoutRef = useRef(null); // ✅ Ref cho debounce prize updates
    
    // Animation queue - thứ tự xuất hiện 27 phần tử giải
    const animationQueueRef = useRef([
        'firstPrize_0',
        'secondPrize_0', 'secondPrize_1',
        'threePrizes_0', 'threePrizes_1', 'threePrizes_2', 
        'threePrizes_3', 'threePrizes_4', 'threePrizes_5',
        'fourPrizes_0', 'fourPrizes_1', 'fourPrizes_2', 'fourPrizes_3',
        'fivePrizes_0', 'fivePrizes_1', 'fivePrizes_2', 
        'fivePrizes_3', 'fivePrizes_4', 'fivePrizes_5',
        'sixPrizes_0', 'sixPrizes_1', 'sixPrizes_2',
        'sevenPrizes_0', 'sevenPrizes_1', 'sevenPrizes_2', 'sevenPrizes_3',
        'specialPrize_0',
    ]);

    // ✅ FIX: today được tính trực tiếp - formatDate sẽ tự tính khi cần để tránh vòng lặp
    const today = getTodayFormatted();
    const inLiveWindow = isWithinLiveWindow();

    // ✅ OPTIMIZED: Memoize getDayOfWeek với cache để tránh tính toán lại
    const getDayOfWeekCache = useRef(new Map());
    const getDayOfWeek = useCallback((dateString) => {
        if (!dateString) return '';
        
        // ✅ Cache kết quả để tránh parse lại cùng một dateString
        if (getDayOfWeekCache.current.has(dateString)) {
            return getDayOfWeekCache.current.get(dateString);
        }
        
        try {
            let date;
            // Xử lý cả ISO string và format DD/MM/YYYY
            if (dateString.includes('T') || dateString.includes('Z')) {
                // ISO string format
                date = new Date(dateString);
            } else if (dateString.includes('/')) {
                // DD/MM/YYYY format
                date = new Date(dateString.split('/').reverse().join('-'));
            } else {
                // Try direct parse
                date = new Date(dateString);
            }
            if (isNaN(date.getTime())) return '';
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const result = days[date.getDay()];
            
            // ✅ Cache kết quả (giới hạn cache size để tránh memory leak)
            if (getDayOfWeekCache.current.size > 100) {
                const firstKey = getDayOfWeekCache.current.keys().next().value;
                getDayOfWeekCache.current.delete(firstKey);
            }
            getDayOfWeekCache.current.set(dateString, result);
            
            return result;
        } catch {
            return '';
        }
    }, []);

    // ✅ FIX: Throttled useEffect - findNextAnimatingPrize được định nghĩa trong useEffect để tránh dependency loop
    useEffect(() => {
        // Clear throttle cũ
        if (animationThrottleRef.current) {
            clearTimeout(animationThrottleRef.current);
        }

        // ✅ FIX: findNextAnimatingPrize được định nghĩa trong useEffect để tránh dependency loop
        const findNextAnimatingPrize = () => {
            if (!liveData) return null;
            
            const queue = animationQueueRef.current;
            for (const prize of queue) {
                const value = liveData[prize];
                if (value === '...' || value === '***') {
                    return prize;
                }
            }
            return null;
        };

        // ✅ Tăng throttle từ 200ms lên 300ms để giảm số lần check (từ 5 lần/giây xuống ~3 lần/giây)
        // Vẫn đủ mượt cho animation nhưng giảm overhead đáng kể
        animationThrottleRef.current = setTimeout(() => {
            if (!mountedRef.current) return;

            const nextPrize = findNextAnimatingPrize();
            
            // ✅ Chỉ update nếu khác giá trị hiện tại (tránh re-render không cần thiết)
            if (nextPrize !== lastAnimatingPrizeRef.current) {
                lastAnimatingPrizeRef.current = nextPrize;
                setAnimatingPrize(nextPrize);
            }
        }, 300); // ✅ Tăng từ 200ms lên 300ms

        return () => {
            if (animationThrottleRef.current) {
                clearTimeout(animationThrottleRef.current);
                animationThrottleRef.current = null;
            }
        };
    }, [liveData]); // ✅ FIX: Chỉ phụ thuộc vào liveData, không cần findNextAnimatingPrize

    // ✅ OPTIMIZED: Proper cleanup khi mount/unmount
    useEffect(() => {
        mountedRef.current = true;
        
        // ✅ Reset state khi mount (tránh state cũ từ cache/reload)
        setAnimatingPrize(null);
        lastAnimatingPrizeRef.current = null;
        animationThrottleRef.current = null;

        return () => {
            mountedRef.current = false;

            // ✅ Cleanup throttle
            if (animationThrottleRef.current) {
                clearTimeout(animationThrottleRef.current);
                animationThrottleRef.current = null;
            }

            // ✅ Cleanup animation timeouts
            animationTimeoutsRef.current.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            animationTimeoutsRef.current.clear();

            // ✅ Reset animation state
            setAnimatingPrize(null);
            lastAnimatingPrizeRef.current = null;
        };
    }, []); // ← Empty deps để cleanup khi unmount

    // ✅ FIX: Pause animation khi tab không active - tính toán trực tiếp để tránh dependency loop
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab không active → Pause animation
                setAnimatingPrize(null);
                lastAnimatingPrizeRef.current = null;
            } else {
                // Tab active lại → Resume animation
                if (mountedRef.current && liveData) {
                    // ✅ FIX: Tính toán trực tiếp trong handler thay vì dùng findNextAnimatingPrize
                    const queue = animationQueueRef.current;
                    let nextPrize = null;
                    for (const prize of queue) {
                        const value = liveData[prize];
                        if (value === '...' || value === '***') {
                            nextPrize = prize;
                            break;
                        }
                    }
                    if (nextPrize !== lastAnimatingPrizeRef.current) {
                        lastAnimatingPrizeRef.current = nextPrize;
                        setAnimatingPrize(nextPrize);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [liveData]); // ✅ FIX: Chỉ phụ thuộc vào liveData

    // Setup Socket.io connection
    useEffect(() => {
        // Chỉ kết nối nếu trong live window hoặc là modal
        if (!inLiveWindow && !isModal) {
            console.log('🛑 Ngoài khung live, không kết nối socket');
            setIsLoading(false);
            // ✅ FIX: Giống XSMN - vẫn giữ emptyResult để hiển thị bảng rỗng
            setError(null);
            return;
        }

        console.log('🔄 Setting up lottery socket connection...');

        // ✅ Reference counting: Tăng reference khi component mount
        lotterySocketClient.incrementRef();

        // ✅ OPTIMIZED: Kiểm tra kỹ để tránh duplicate connections (React Strict Mode)
        const connectionStatus = lotterySocketClient.getConnectionStatus();
        
        // Nếu đã connected, request latest data
        if (connectionStatus.socket && connectionStatus.connected) {
            console.log('✅ Socket already connected, requesting latest data...');
            lotterySocketClient.requestLatest();
        }
        // incrementRef() sẽ tự động connect nếu chưa connected

        // Listen to events
        const handleLatest = (data) => {
            if (!mountedRef.current) return;

            if (data) {
                const formatted = formatResultForDisplay(data);
                setLiveData(formatted);
                setIsComplete(formatted.isComplete || false);
            }
            setIsLoading(false);
            setError(null);
        };

        // ✅ FIX: prizeUpdateTimeoutRef đã được khai báo ở trên component level
        const handlePrizeUpdate = (data) => {
            if (!mountedRef.current) return;

            console.log('📡 Prize update received:', data);

            // ✅ Clear timeout cũ nếu có
            if (prizeUpdateTimeoutRef.current) {
                clearTimeout(prizeUpdateTimeoutRef.current);
            }

            // ✅ Debounce 50ms để batch multiple updates cùng lúc
            prizeUpdateTimeoutRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                
                setLiveData(prev => {
                    const updated = { ...prev, [data.prizeType]: data.prizeData, lastUpdated: data.timestamp };
                    // ✅ Animation sẽ được tự động set bởi useEffect (không cần setAnimationWithTimeout)
                    return updated;
                });

                setIsLoading(false);
                setError(null);
            }, 50); // ✅ Debounce 50ms để batch updates
        };

        const handleComplete = (data) => {
            if (!mountedRef.current) return;

            const formatted = formatResultForDisplay(data);
            setLiveData(formatted);
            setIsComplete(true);
            setIsLoading(false);
            setError(null);
        };

        const handleFullUpdate = (data) => {
            if (!mountedRef.current) return;

            const formatted = formatResultForDisplay(data);
            setLiveData(formatted);
            setIsComplete(formatted.isComplete || false);
            setIsLoading(false);
            setError(null);
        };

        const handleError = (error) => {
            if (!mountedRef.current) return;
            console.error('Lottery socket error:', error);
            setError(error.message || 'Lỗi kết nối');
        };

        const handleConnected = () => {
            if (!mountedRef.current) return;
            setSocketStatus('connected');
            console.log('✅ Lottery socket connected');
        };

        const handleDisconnected = () => {
            if (!mountedRef.current) return;
            setSocketStatus('disconnected');
            console.log('❌ Lottery socket disconnected');
        };

        // Register listeners
        lotterySocketClient.on('lottery:latest', handleLatest);
        lotterySocketClient.on('lottery:prize-update', handlePrizeUpdate);
        lotterySocketClient.on('lottery:complete', handleComplete);
        lotterySocketClient.on('lottery:full-update', handleFullUpdate);
        lotterySocketClient.on('lottery:error', handleError);
        lotterySocketClient.on('connected', handleConnected);
        lotterySocketClient.on('disconnected', handleDisconnected);

        // Cleanup
        return () => {
            // ✅ Clear debounce timeout khi cleanup
            if (prizeUpdateTimeoutRef.current) {
                clearTimeout(prizeUpdateTimeoutRef.current);
                prizeUpdateTimeoutRef.current = null;
            }
            
            // Remove listeners
            lotterySocketClient.off('lottery:latest', handleLatest);
            lotterySocketClient.off('lottery:prize-update', handlePrizeUpdate);
            lotterySocketClient.off('lottery:complete', handleComplete);
            lotterySocketClient.off('lottery:full-update', handleFullUpdate);
            lotterySocketClient.off('lottery:error', handleError);
            lotterySocketClient.off('connected', handleConnected);
            lotterySocketClient.off('disconnected', handleDisconnected);
            
            // ✅ Reference counting: Giảm reference khi component unmount
            // Tự động disconnect nếu không còn component nào sử dụng
            lotterySocketClient.decrementRef();
        };
    }, [inLiveWindow, isModal]);

    // ✅ OPTIMIZED: Memoize helper functions để tránh recreate
    const getLastTwoDigits = useCallback((num) => {
        if (!num || num === '...' || num === '***') return null;
        const numStr = String(num);
        return numStr.slice(-2).padStart(2, '0');
    }, []);

    // ✅ FIX: formatDate không cần today trong dependencies - tính today trực tiếp khi cần
    // Điều này tránh vòng lặp vô hạn khi today thay đổi mỗi render
    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return getTodayFormatted(); // ✅ Tính trực tiếp, không dùng today từ closure
        try {
            let d;
            // Xử lý ISO string (2025-11-25T17:00:00.000Z)
            if (typeof dateStr === 'string' && (dateStr.includes('T') || dateStr.includes('Z'))) {
                d = new Date(dateStr);
            } else if (typeof dateStr === 'string' && dateStr.includes('-')) {
                // Format YYYY-MM-DD
                d = new Date(dateStr);
            } else {
                d = new Date(dateStr);
            }

            if (isNaN(d.getTime())) return getTodayFormatted(); // ✅ Tính trực tiếp

            // Format thành DD/MM/YYYY
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return getTodayFormatted(); // ✅ Tính trực tiếp
        }
    }, []); // ✅ Empty deps - không phụ thuộc vào today

    // Convert liveData to format compatible with XSMBSimpleTable
    const convertToTableFormat = useMemo(() => {
        if (!liveData) return null;

        const lotoNumbers = {
            heads: Array(10).fill().map(() => []),
            tails: Array(10).fill().map(() => [])
        };

        // Collect all numbers from prizes
        const allNumbers = [];

        // Special prize
        if (liveData.specialPrize_0 && liveData.specialPrize_0 !== '...') {
            allNumbers.push(getLastTwoDigits(liveData.specialPrize_0));
        }

        // First prize
        if (liveData.firstPrize_0 && liveData.firstPrize_0 !== '...') {
            allNumbers.push(getLastTwoDigits(liveData.firstPrize_0));
        }

        // Second prize
        [0, 1].forEach(i => {
            const key = `secondPrize_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Three prizes
        [0, 1, 2, 3, 4, 5].forEach(i => {
            const key = `threePrizes_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Four prizes
        [0, 1, 2, 3].forEach(i => {
            const key = `fourPrizes_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Five prizes
        [0, 1, 2, 3, 4, 5].forEach(i => {
            const key = `fivePrizes_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Six prizes
        [0, 1, 2].forEach(i => {
            const key = `sixPrizes_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Seven prizes
        [0, 1, 2, 3].forEach(i => {
            const key = `sevenPrizes_${i}`;
            if (liveData[key] && liveData[key] !== '...') {
                allNumbers.push(getLastTwoDigits(liveData[key]));
            }
        });

        // Filter out nulls and organize by head/tail
        const validNumbers = allNumbers.filter(n => n !== null);

        validNumbers.forEach(num => {
            const head = parseInt(num[0]);
            const tail = parseInt(num[1]);
            if (!isNaN(head) && !isNaN(tail)) {
                lotoNumbers.heads[head].push(num);
                lotoNumbers.tails[tail].push(num);
            }
        });

        // Format loto object for table - giống XSMBSimpleTable format
        // XSMBSimpleTable sử dụng format: { "0": "03, 04, 08", "1": "15, 16", ... }
        // Tạo 2 object riêng cho đầu và đuôi
        const lotoDau = {};
        const lotoDuoi = {};
        for (let i = 0; i < 10; i++) {
            const headNums = lotoNumbers.heads[i].sort((a, b) => parseInt(a) - parseInt(b));
            const tailNums = lotoNumbers.tails[i].sort((a, b) => parseInt(a) - parseInt(b));
            if (headNums.length > 0) {
                lotoDau[i] = headNums.join(', ');
            }
            if (tailNums.length > 0) {
                lotoDuoi[i] = tailNums.join(', ');
            }
        }

        return {
            date: formatDate(liveData.drawDate),
            // Luôn trả về giá trị, kể cả khi là "..." để hiển thị loading state
            specialPrize: liveData.specialPrize_0 || '...',
            firstPrize: liveData.firstPrize_0 || '...',
            secondPrize: [
                liveData.secondPrize_0 || '...',
                liveData.secondPrize_1 || '...'
            ],
            threePrizes: [
                liveData.threePrizes_0 || '...',
                liveData.threePrizes_1 || '...',
                liveData.threePrizes_2 || '...',
                liveData.threePrizes_3 || '...',
                liveData.threePrizes_4 || '...',
                liveData.threePrizes_5 || '...'
            ],
            fourPrizes: [
                liveData.fourPrizes_0 || '...',
                liveData.fourPrizes_1 || '...',
                liveData.fourPrizes_2 || '...',
                liveData.fourPrizes_3 || '...'
            ],
            fivePrizes: [
                liveData.fivePrizes_0 || '...',
                liveData.fivePrizes_1 || '...',
                liveData.fivePrizes_2 || '...',
                liveData.fivePrizes_3 || '...',
                liveData.fivePrizes_4 || '...',
                liveData.fivePrizes_5 || '...'
            ],
            sixPrizes: [
                liveData.sixPrizes_0 || '...',
                liveData.sixPrizes_1 || '...',
                liveData.sixPrizes_2 || '...'
            ],
            sevenPrizes: [
                liveData.sevenPrizes_0 || '...',
                liveData.sevenPrizes_1 || '...',
                liveData.sevenPrizes_2 || '...',
                liveData.sevenPrizes_3 || '...'
            ],
            maDB: liveData.maDB || '...',
            lotoDau: lotoDau, // Format: { "0": "03, 04, 08", ... }
            lotoDuoi: lotoDuoi // Format: { "0": "15, 16", ... }
        };
    }, [liveData, getLastTwoDigits, formatDate]); // ✅ FIX: Remove today from deps (formatDate handles it internally)

    // ✅ OPTIMIZED: Randomize số mỗi khi animating - giảm frequency để cải thiện performance
    useEffect(() => {
        if (animatingPrize) {
            // ✅ Tăng interval từ 100ms lên 200ms để giảm số lần re-render (từ 10 lần/giây xuống 5 lần/giây)
            const interval = setInterval(() => {
                setRandomSeed(prev => prev + 1); // Trigger re-render để random lại
            }, 200); // Thay đổi mỗi 200ms để tạo hiệu ứng random (vẫn mượt nhưng ít re-render hơn)
            
            return () => clearInterval(interval);
        } else {
            setRandomSeed(0); // Reset khi không animate
        }
    }, [animatingPrize]);

    // ✅ FIX: Memoize renderPrizeValue - remove styles from deps (styles object is stable)
    const renderPrizeValue = useCallback((value, isAnimating = false, digits = 5, isMaDB = false) => {
        const className = `${styles.running_number} ${styles[`running_${digits}`]}`;

        // Xác định số chữ số cần hiển thị dựa trên bộ lọc
        let displayDigits = digits;
        if (filterType === 'last2') {
            displayDigits = 2;
        } else if (filterType === 'last3') {
            displayDigits = Math.min(digits, 3);
        }

        const finalClassName = isMaDB ? `${className} ${styles.maDBText}` : className;

        // ✅ OPTIMIZED: Số ngẫu nhiên đứng yên (không scroll, random mỗi lần render)
        if (isAnimating && (value === '...' || value === '***' || !value)) {
            // Sử dụng randomSeed để đảm bảo random mỗi lần re-render
            const seed = randomSeed;
            return (
                <span className={finalClassName} data-status="animating">
                    <span className={styles.digit_container}>
                        {Array.from({ length: displayDigits }).map((_, i) => {
                            // Mỗi digit hiển thị 1 số ngẫu nhiên (đứng yên, random mỗi lần render)
                            // Sử dụng seed + index để đảm bảo mỗi digit có số khác nhau
                            const randomNum = Math.floor(Math.random() * 10);
                            return (
                                <span key={`${i}-${seed}`} className={styles.digit_rolling}>
                                    <span className={styles.digit_number}>
                                        {randomNum}
                                    </span>
                                </span>
                            );
                        })}
                    </span>
                </span>
            );
        }

        // Placeholder khi chưa có số
        if (value === '...' || value === '***' || !value) {
            return (
                <span className={finalClassName} data-status="pending">
                    {isMaDB ? <span className={styles.ellipsis}>...</span> : <span className={styles.cellSpinner}></span>}
                </span>
            );
        }

        // Hiển thị số thật
        const filtered = getFilteredNumber(value, filterType) || '';
        const displayValue = filtered.padStart(displayDigits, '0');

        return (
            <span className={finalClassName} data-status="static">
                {displayValue}
            </span>
        );
    }, [filterType, randomSeed]); // ✅ FIX: Remove styles from deps (styles is stable import)

    // ✅ FIX: Giờ liveData luôn có emptyResult từ đầu, nên check error nhưng vẫn hiển thị bảng
    if (error && !liveData) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <h3>Lỗi kết nối</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    {inLiveWindow ? '🔴 Tường Thuật Trực Tiếp XSMB' : 'Kết Quả Xổ Số Miền Bắc Mới Nhất'}
                </h2>
                {inLiveWindow && (
                    <span className={styles.liveBadge}>
                        <span className={styles.liveDot}></span>
                        Đang phát trực tiếp
                    </span>
                )}
            </div>

            {socketStatus === 'disconnected' && inLiveWindow && (
                <div className={styles.warning}>
                    ⚠️ Kết nối không ổn định, đang thử kết nối lại...
                </div>
            )}

            {isLoading && !liveData && (
                <div className={styles.loadingMessage}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu kết quả xổ số...</p>
                </div>
            )}

            <div className={styles.content}>
                {convertToTableFormat && (
                    <div className={styles.tableWrapper}>
                        {/* Main Results Table - giống XSMBSimpleTable với horizontal layout */}
                        <div className={styles.horizontalLayout}>
                            <div className={styles.mainTableContainer}>
                                <table className={styles.ketqua} cellSpacing="1" cellPadding="9">
                                    <thead>
                                        <tr>
                                            <th colSpan="13" className={styles.kqcell + ' ' + styles.kq_ngay}>
                                                {convertToTableFormat.date ? `${getDayOfWeek(convertToTableFormat.date)} - ${convertToTableFormat.date}` : 'Kết quả XSMB'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Giải đặc biệt - Luôn hiển thị, kể cả khi là "..." */}
                                        <tr>
                                            <td className={styles.leftcol}>ĐB</td>
                                            <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_0}>
                                                {renderPrizeValue(
                                                    convertToTableFormat.specialPrize,
                                                    animatingPrize === 'specialPrize_0',
                                                    5
                                                )}
                                            </td>
                                        </tr>

                                        {/* Giải nhất - Luôn hiển thị */}
                                        <tr>
                                            <td className={styles.leftcol}>1</td>
                                            <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_1}>
                                                {renderPrizeValue(
                                                    convertToTableFormat.firstPrize,
                                                    animatingPrize === 'firstPrize_0',
                                                    5
                                                )}
                                            </td>
                                        </tr>

                                        {/* Giải nhì - Luôn hiển thị 2 giải */}
                                        <tr>
                                            <td className={styles.leftcol}>2</td>
                                            {convertToTableFormat.secondPrize.map((number, index) => (
                                                <td key={index} colSpan={12 / convertToTableFormat.secondPrize.length} className={styles.kqcell + ' ' + styles[`kq_${index + 2}`]}>
                                                    {renderPrizeValue(
                                                        number,
                                                        animatingPrize === `secondPrize_${index}`,
                                                        5
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Giải ba - Luôn hiển thị 6 giải */}
                                        <>
                                            <tr>
                                                <td rowSpan="2" className={styles.leftcol}>3</td>
                                                {convertToTableFormat.threePrizes.slice(0, 3).map((number, index) => (
                                                    <td key={index} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${index + 4}`]}>
                                                        {renderPrizeValue(
                                                            number,
                                                            animatingPrize === `threePrizes_${index}`,
                                                            5
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                {convertToTableFormat.threePrizes.slice(3, 6).map((number, index) => (
                                                    <td key={index} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${index + 7}`]}>
                                                        {renderPrizeValue(
                                                            number,
                                                            animatingPrize === `threePrizes_${index + 3}`,
                                                            5
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        </>

                                        {/* Giải tư - Luôn hiển thị 4 giải */}
                                        <tr>
                                            <td className={styles.leftcol}>4</td>
                                            {convertToTableFormat.fourPrizes.map((number, index) => (
                                                <td key={index} colSpan="3" className={styles.kqcell + ' ' + styles[`kq_${index + 10}`]}>
                                                    {renderPrizeValue(
                                                        number,
                                                        animatingPrize === `fourPrizes_${index}`,
                                                        4
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Giải năm - Luôn hiển thị 6 giải */}
                                        <>
                                            <tr>
                                                <td rowSpan="2" className={styles.leftcol}>5</td>
                                                {convertToTableFormat.fivePrizes.slice(0, 3).map((number, index) => (
                                                    <td key={index} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${index + 14}`]}>
                                                        {renderPrizeValue(
                                                            number,
                                                            animatingPrize === `fivePrizes_${index}`,
                                                            4
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                {convertToTableFormat.fivePrizes.slice(3, 6).map((number, index) => (
                                                    <td key={index} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${index + 17}`]}>
                                                        {renderPrizeValue(
                                                            number,
                                                            animatingPrize === `fivePrizes_${index + 3}`,
                                                            4
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        </>

                                        {/* Giải sáu - Luôn hiển thị 3 giải */}
                                        <tr>
                                            <td className={styles.leftcol}>6</td>
                                            {convertToTableFormat.sixPrizes.map((number, index) => (
                                                <td key={index} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${index + 20}`]}>
                                                    {renderPrizeValue(
                                                        number,
                                                        animatingPrize === `sixPrizes_${index}`,
                                                        3
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Giải bảy - Luôn hiển thị 4 giải */}
                                        <tr>
                                            <td className={styles.leftcol}>7</td>
                                            {convertToTableFormat.sevenPrizes.map((number, index) => (
                                                <td key={index} colSpan="3" className={styles.kqcell + ' ' + styles[`kq_${index + 23}`]}>
                                                    {renderPrizeValue(
                                                        number,
                                                        animatingPrize === `sevenPrizes_${index}`,
                                                        2
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Mã đặc biệt - Luôn hiển thị */}
                                        <tr>
                                            <td className={styles.leftcol}>ĐB</td>
                                            <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_maDB}>
                                                {renderPrizeValue(
                                                    convertToTableFormat.maDB,
                                                    animatingPrize === 'maDB',
                                                    2,
                                                    true // isMaDB = true để không hiển thị spinner
                                                )}
                                            </td>
                                        </tr>

                                        <tr className={styles.lastrow}>
                                            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Loto Tables - Đầu và Đuôi - giống XSMBSimpleTable */}
                            <div className={styles.sideTablesContainer}>
                                {/* Loto Đầu Table */}
                                <table className={styles.dau} cellSpacing="0" cellPadding="0" style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                    <tbody>
                                        <tr>
                                            <th>Đầu</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                        {Array.from({ length: 10 }, (_, i) => i.toString()).map((digit) => (
                                            <tr key={digit}>
                                                <td className={styles.dauDigitCol}>
                                                    {digit}
                                                </td>
                                                <td className={styles[`dau_${digit}`] + ' ' + styles.dauDataCol}>
                                                    {convertToTableFormat.lotoDau[digit] || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Loto Đuôi Table */}
                                <table className={styles.dit} cellSpacing="0" cellPadding="0" style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                    <tbody>
                                        <tr>
                                            <th>Đuôi</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                        {Array.from({ length: 10 }, (_, i) => i.toString()).map((digit) => (
                                            <tr key={digit}>
                                                <td className={styles.ditDigitCol}>
                                                    {digit}
                                                </td>
                                                <td className={styles[`dit_${digit}`] + ' ' + styles.ditDataCol}>
                                                    {convertToTableFormat.lotoDuoi[digit] || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Preview - chỉ hiển thị khi showChatPreview = true */}
                {showChatPreview && (
                    <div className={styles.chatPreviewWrapper}>
                        <ChatPreview />
                    </div>
                )}
            </div>
        </div>
    );
};

// ✅ OPTIMIZED: Custom comparison function để tránh re-render không cần thiết
const arePropsEqual = (prevProps, nextProps) => {
    // Chỉ re-render nếu props quan trọng thay đổi
    return (
        prevProps.station === nextProps.station &&
        prevProps.isModal === nextProps.isModal &&
        prevProps.showChatPreview === nextProps.showChatPreview
    );
};

export default React.memo(LiveResult, arePropsEqual);
