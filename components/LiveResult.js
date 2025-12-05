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

    const today = getTodayFormatted();
    const inLiveWindow = isWithinLiveWindow();

    // Get day of week - giống XSMBSimpleTable (di chuyển ra ngoài để dùng trong JSX)
    const getDayOfWeek = useCallback((dateString) => {
        if (!dateString) return '';
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
            return days[date.getDay()];
        } catch {
            return '';
        }
    }, []);

    // ✅ OPTIMIZED: Memoize findNextAnimatingPrize function
    const findNextAnimatingPrize = useCallback(() => {
        if (!liveData) return null;
        
        const queue = animationQueueRef.current;
        for (const prize of queue) {
            const value = liveData[prize];
            if (value === '...' || value === '***') {
                return prize;
            }
        }
        return null;
    }, [liveData]);

    // ✅ OPTIMIZED: Throttled useEffect để tự động tìm phần tử sắp xuất hiện
    useEffect(() => {
        // Clear throttle cũ
        if (animationThrottleRef.current) {
            clearTimeout(animationThrottleRef.current);
        }

        // Throttle: 200ms (đủ mượt, không quá nhiều updates)
        animationThrottleRef.current = setTimeout(() => {
            if (!mountedRef.current) return;

            const nextPrize = findNextAnimatingPrize();
            
            // ✅ Chỉ update nếu khác giá trị hiện tại (tránh re-render không cần thiết)
            if (nextPrize !== lastAnimatingPrizeRef.current) {
                lastAnimatingPrizeRef.current = nextPrize;
                setAnimatingPrize(nextPrize);
            }
        }, 200);

        return () => {
            if (animationThrottleRef.current) {
                clearTimeout(animationThrottleRef.current);
                animationThrottleRef.current = null;
            }
        };
    }, [liveData, findNextAnimatingPrize]); // ← Bỏ animatingPrize khỏi deps

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

    // ✅ OPTIMIZED: Pause animation khi tab không active
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab không active → Pause animation
                setAnimatingPrize(null);
                lastAnimatingPrizeRef.current = null;
            } else {
                // Tab active lại → Resume animation
                if (mountedRef.current) {
                    const nextPrize = findNextAnimatingPrize();
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
    }, [findNextAnimatingPrize]);

    // Setup Socket.io connection
    useEffect(() => {
        // Chỉ kết nối nếu trong live window hoặc là modal
        if (!inLiveWindow && !isModal) {
            console.log('🛑 Ngoài khung live, không kết nối socket');
            setIsLoading(false);
            return;
        }

        console.log('🔄 Setting up lottery socket connection...');

        // ✅ OPTIMIZED: Kiểm tra kỹ để tránh duplicate connections (React Strict Mode)
        const connectionStatus = lotterySocketClient.getConnectionStatus();
        
        // Chỉ connect nếu:
        // 1. Chưa có socket HOẶC
        // 2. Có socket nhưng chưa connected
        if (!connectionStatus.socket || !connectionStatus.connected) {
            console.log('🔌 Connecting to socket...');
            lotterySocketClient.connect();
        } else {
            // Nếu đã connected, chỉ request latest (không connect lại)
            console.log('✅ Socket already connected, requesting latest data...');
            lotterySocketClient.requestLatest();
        }

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

        const handlePrizeUpdate = (data) => {
            if (!mountedRef.current) return;

            console.log('📡 Prize update received:', data);

            setLiveData(prev => {
                const updated = { ...prev, [data.prizeType]: data.prizeData, lastUpdated: data.timestamp };
                // ✅ Animation sẽ được tự động set bởi useEffect (không cần setAnimationWithTimeout)
                return updated;
            });

            setIsLoading(false);
            setError(null);
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
            // Remove listeners
            lotterySocketClient.off('lottery:latest', handleLatest);
            lotterySocketClient.off('lottery:prize-update', handlePrizeUpdate);
            lotterySocketClient.off('lottery:complete', handleComplete);
            lotterySocketClient.off('lottery:full-update', handleFullUpdate);
            lotterySocketClient.off('lottery:error', handleError);
            lotterySocketClient.off('connected', handleConnected);
            lotterySocketClient.off('disconnected', handleDisconnected);
        };
    }, [inLiveWindow, isModal]);

    // Convert liveData to format compatible with XSMBSimpleTable
    const convertToTableFormat = useMemo(() => {
        if (!liveData) return null;

        // Calculate loto (đầu đuôi) từ các giải
        const getLastTwoDigits = (num) => {
            if (!num || num === '...' || num === '***') return null;
            const numStr = String(num);
            return numStr.slice(-2).padStart(2, '0');
        };

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

        // Format date - giống XSMBSimpleTable
        const formatDate = (dateStr) => {
            if (!dateStr) return today;
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

                if (isNaN(d.getTime())) return today;

                // Format thành DD/MM/YYYY
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
            } catch {
                return today;
            }
        };

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
    }, [liveData, today]);

    // ✅ Randomize số mỗi khi animating (tạo hiệu ứng số thay đổi ngẫu nhiên)
    useEffect(() => {
        if (animatingPrize) {
            const interval = setInterval(() => {
                setRandomSeed(prev => prev + 1); // Trigger re-render để random lại
            }, 100); // Thay đổi mỗi 100ms để tạo hiệu ứng random
            
            return () => clearInterval(interval);
        } else {
            setRandomSeed(0); // Reset khi không animate
        }
    }, [animatingPrize]);

    // ✅ OPTIMIZED: Render prize value với số ngẫu nhiên đứng yên
    const renderPrizeValue = (value, isAnimating = false, digits = 5, isMaDB = false) => {
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
    };

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

export default React.memo(LiveResult);
