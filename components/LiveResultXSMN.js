/**
 * LiveResultXSMN Component - Hiển thị kết quả xổ số miền nam real-time
 * Hỗ trợ nhiều tỉnh mỗi ngày (3-4 tỉnh)
 * Sử dụng Socket.io để nhận updates từ backend
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import React from 'react';
import xsmnSocketClient from '../services/xsmnSocketClient';
import {
    getFilteredNumber,
    isWithinLiveWindowXSMN,
    getTodayFormatted,
    getVietnamTime
} from '../utils/lotteryUtils';
import styles from '../styles/LiveResultXSMN.module.css';

const LiveResultXSMN = ({ station = 'xsmn', isModal = false, showChatPreview = false }) => {
    const today = getTodayFormatted();
    const inLiveWindow = isWithinLiveWindowXSMN();
    
    // Tỉnh theo ngày trong tuần
    const provincesByDay = useMemo(() => ({
        0: [
            { tinh: 'tien-giang', tentinh: 'Tiền Giang' },
            { tinh: 'kien-giang', tentinh: 'Kiên Giang' },
            { tinh: 'da-lat', tentinh: 'Đà Lạt' },
        ],
        1: [
            { tinh: 'tphcm', tentinh: 'TP.HCM' },
            { tinh: 'dong-thap', tentinh: 'Đồng Tháp' },
            { tinh: 'ca-mau', tentinh: 'Cà Mau' },
        ],
        2: [
            { tinh: 'ben-tre', tentinh: 'Bến Tre' },
            { tinh: 'vung-tau', tentinh: 'Vũng Tàu' },
            { tinh: 'bac-lieu', tentinh: 'Bạc Liêu' },
        ],
        3: [
            { tinh: 'dong-nai', tentinh: 'Đồng Nai' },
            { tinh: 'can-tho', tentinh: 'Cần Thơ' },
            { tinh: 'soc-trang', tentinh: 'Sóc Trăng' },
        ],
        4: [
            { tinh: 'tay-ninh', tentinh: 'Tây Ninh' },
            { tinh: 'an-giang', tentinh: 'An Giang' },
            { tinh: 'binh-thuan', tentinh: 'Bình Thuận' },
        ],
        5: [
            { tinh: 'vinh-long', tentinh: 'Vĩnh Long' },
            { tinh: 'binh-duong', tentinh: 'Bình Dương' },
            { tinh: 'tra-vinh', tentinh: 'Trà Vinh' },
        ],
        6: [
            { tinh: 'tphcm', tentinh: 'TP.HCM' },
            { tinh: 'long-an', tentinh: 'Long An' },
            { tinh: 'binh-phuoc', tentinh: 'Bình Phước' },
            { tinh: 'hau-giang', tentinh: 'Hậu Giang' },
        ],
    }), []);

    // Tạo empty result cho các tỉnh
    const emptyResult = useMemo(() => {
        const targetDate = new Date(today.split('-').reverse().join('-'));
        const dayOfWeekIndex = targetDate.getDay();
        const provinces = provincesByDay[dayOfWeekIndex] || provincesByDay[6];

        return provinces.map(province => ({
            drawDate: today,
            station: station,
            dayOfWeek: targetDate.toLocaleString('vi-VN', { weekday: 'long' }),
            tentinh: province.tentinh,
            tinh: province.tinh,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            eightPrizes_0: '...',
            sevenPrizes_0: '...',
            sixPrizes_0: '...',
            sixPrizes_1: '...',
            sixPrizes_2: '...',
            fivePrizes_0: '...',
            fourPrizes_0: '...',
            fourPrizes_1: '...',
            fourPrizes_2: '...',
            fourPrizes_3: '...',
            fourPrizes_4: '...',
            fourPrizes_5: '...',
            fourPrizes_6: '...',
            threePrizes_0: '...',
            threePrizes_1: '...',
            secondPrize_0: '...',
            firstPrize_0: '...',
            specialPrize_0: '...',
            lastUpdated: 0,
        }));
    }, [today, station, provincesByDay]);

    // ✅ FIX: Khởi tạo với emptyResult ngay từ đầu (giống XSMB) để hiển thị bảng rỗng khi chờ kết quả
    const [liveData, setLiveData] = useState(() => {
        const targetDate = new Date(today.split('-').reverse().join('-'));
        const dayOfWeekIndex = targetDate.getDay();
        const provinces = provincesByDay[dayOfWeekIndex] || provincesByDay[6];

        return provinces.map(province => ({
            drawDate: today,
            station: station,
            dayOfWeek: targetDate.toLocaleString('vi-VN', { weekday: 'long' }),
            tentinh: province.tentinh,
            tinh: province.tinh,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            eightPrizes_0: '...',
            sevenPrizes_0: '...',
            sixPrizes_0: '...',
            sixPrizes_1: '...',
            sixPrizes_2: '...',
            fivePrizes_0: '...',
            fourPrizes_0: '...',
            fourPrizes_1: '...',
            fourPrizes_2: '...',
            fourPrizes_3: '...',
            fourPrizes_4: '...',
            fourPrizes_5: '...',
            fourPrizes_6: '...',
            threePrizes_0: '...',
            threePrizes_1: '...',
            secondPrize_0: '...',
            firstPrize_0: '...',
            specialPrize_0: '...',
            lastUpdated: 0,
        }));
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [animatingPrizes, setAnimatingPrizes] = useState({});
    const [filterType] = useState('all');
    const [socketStatus, setSocketStatus] = useState('connecting');
    const [randomSeed, setRandomSeed] = useState(0); // Seed dùng chung, kết hợp hash tỉnh để khác nhau
    const storageKey = 'liveData:xsmn';

    const mountedRef = useRef(false);
    const animationTimeoutsRef = useRef(new Map());
    const prizeUpdateTimeoutRef = useRef(null);

    // Chuẩn hóa dữ liệu socket (array, object map hoặc object đơn)
    const normalizeToArray = useCallback((incoming) => {
        if (!incoming) return [];
        if (Array.isArray(incoming)) return incoming;
        if (typeof incoming === 'object') {
            if (incoming.tinh) {
                return [incoming];
            }
            return Object.values(incoming);
        }
        return [];
    }, []);

    // Quản lý animation timeout cho từng tỉnh / prizeType
    const setAnimationWithTimeout = useCallback((tinh, prizeType) => {
        const key = `${tinh}-${prizeType}`;
        
        // Clear timeout cũ nếu có
        if (animationTimeoutsRef.current.has(key)) {
            clearTimeout(animationTimeoutsRef.current.get(key));
        }

        // Set animation state
        setAnimatingPrizes(prev => ({
            ...prev,
            [tinh]: prizeType
        }));

        // Set timeout để clear animation sau 2 giây
        const timeoutId = setTimeout(() => {
            if (mountedRef.current) {
                setAnimatingPrizes(prev => {
                    const newPrizes = { ...prev };
                    if (newPrizes[tinh] === prizeType) {
                        delete newPrizes[tinh];
                    }
                    return newPrizes;
                });
            }
            animationTimeoutsRef.current.delete(key);
        }, 2000);

        animationTimeoutsRef.current.set(key, timeoutId);
    }, []);


    // Animation queue
    const animationQueue = [
        'eightPrizes_0', 'sevenPrizes_0',
        'sixPrizes_0', 'sixPrizes_1', 'sixPrizes_2',
        'fivePrizes_0',
        'fourPrizes_0', 'fourPrizes_1', 'fourPrizes_2', 'fourPrizes_3', 'fourPrizes_4', 'fourPrizes_5', 'fourPrizes_6',
        'threePrizes_0', 'threePrizes_1',
        'secondPrize_0', 'firstPrize_0', 'specialPrize_0'
    ];

    // Cleanup khi unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Clear animation timeouts
            animationTimeoutsRef.current.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            animationTimeoutsRef.current.clear();
        };
    }, []);

    // ✅ OPTIMIZED: Randomize số khi đang animate (dùng một interval chung)
    useEffect(() => {
        if (!Object.keys(animatingPrizes).length) return undefined;
        const intervalId = setInterval(() => {
            setRandomSeed(prev => prev + 1);
        }, 300); // 300ms để giảm tần suất re-render
        return () => clearInterval(intervalId);
    }, [animatingPrizes]);

    // Khôi phục dữ liệu cache khi reload / quay lại
    useEffect(() => {
        try {
            const cached = localStorage.getItem(storageKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setLiveData(parsed);
                    setIsLoading(false);
                }
            }
        } catch (err) {
            console.warn('⚠️ Không thể đọc cache xsmn:', err.message);
        }
    }, []);

    // Fallback fetch latest via REST khi không có dữ liệu (trường hợp socket chưa trả về)
    // ✅ FIX: Đơn giản hóa giống XSMB - tin tưởng backend đã filter đúng
    useEffect(() => {
        if (liveData && liveData.length > 0) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const url = `${apiUrl}/api/xsmn/results/latest10?page=1&limit=10`;
        let aborted = false;
        (async () => {
            try {
                const resp = await fetch(url);
                if (!resp.ok) return;
                const json = await resp.json();
                if (!json || !json.data || !Array.isArray(json.data)) return;
                if (aborted) return;
                
                // ✅ FIX: Giống XSMB - không filter phức tạp, tin tưởng backend đã trả về đúng
                // Backend đã query với $gte: today nên chỉ cần lấy data đầu tiên
                if (json.data.length > 0) {
                    setLiveData(json.data);
                    setIsLoading(false);
                    setError(null);
                }
            } catch (err) {
                // ignore
            }
        })();
        return () => { aborted = true; };
    }, [liveData, today]);

    // Lưu cache khi có dữ liệu mới
    useEffect(() => {
        if (!liveData || !Array.isArray(liveData) || liveData.length === 0) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(liveData));
        } catch (err) {
            console.warn('⚠️ Không thể ghi cache xsmn:', err.message);
        }
    }, [liveData]);

    // Khi đã có dữ liệu live, tắt loading để không hiển thị overlay phía trên box live
    useEffect(() => {
        if (liveData.length > 0 && isLoading) {
            setIsLoading(false);
        }
    }, [liveData, isLoading]);

    // ✅ Giống xsmb: Luôn animate prize đang chờ (giải chưa có số) từ G8 → ĐB cho từng tỉnh
    useEffect(() => {
        // Dùng displayData (fallback emptyResult) để luôn có dữ liệu cho animation
        const currentData = liveData && liveData.length > 0 ? liveData : emptyResult;
        if (!currentData || currentData.length === 0) return;

        const nextAnimating = {};
        const prizeOrder = animationQueue;

        for (const item of currentData) {
            const nextPrize = prizeOrder.find(prizeType => {
                const val = item[prizeType];
                return val === '...' || val === '***' || val === undefined || val === null || val === '';
            });
            if (nextPrize) {
                nextAnimating[item.tinh] = nextPrize;
            }
        }

        // Chỉ set state nếu khác để tránh re-render
        setAnimatingPrizes(prev => {
            const sameKeys = Object.keys(prev).length === Object.keys(nextAnimating).length &&
                Object.keys(prev).every(k => prev[k] === nextAnimating[k]);
            return sameKeys ? prev : nextAnimating;
        });
    }, [liveData, emptyResult]);

    // Setup Socket.io connection
    useEffect(() => {
        if (!inLiveWindow && !isModal) {
            console.log('🛑 Ngoài khung live, không kết nối socket');
            setIsLoading(false);
            setLiveData(emptyResult);
            setError(null);
            return;
        }

        console.log('🔄 Setting up XSMN socket connection...');

        xsmnSocketClient.incrementRef();

        const connectionStatus = xsmnSocketClient.getConnectionStatus();
        // Luôn yêu cầu dữ liệu mới nhất khi mount (kể cả khi socket chưa kịp connected)
        try {
            xsmnSocketClient.requestLatest();
        } catch (err) {
            console.warn('⚠️ Không thể requestLatest ngay:', err.message);
        }
        if (connectionStatus.socket && connectionStatus.connected) {
            console.log('✅ XSMN Socket already connected, requesting latest data...');
            xsmnSocketClient.requestLatest();
        }

        // Listen to events
        const handleLatest = (data) => {
            if (!mountedRef.current) return;
            // ✅ FIX: Merge data thay vì replace để giữ lại các tỉnh khác
            if (data && typeof data === 'object') {
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup O(1) thay vì find() O(n)
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    
                    // ✅ FIX: Luôn dùng emptyResult làm base để đảm bảo có đủ tất cả tỉnh theo ngày
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem; // O(1) lookup
                    });
                    
                    // Nếu data là object map (key = tinh), merge vào base
                    if (!Array.isArray(data) && !data.tinh) {
                        // Object map: { 'tinh1': {...}, 'tinh2': {...} }
                        const updated = base.map(item => {
                            const tinh = item.tinh;
                            if (data[tinh]) {
                                return { ...item, ...data[tinh] };
                            }
                            return item; // Giữ nguyên tỉnh chưa có data
                        });
                        setIsComplete(updated.every(item => item.isComplete));
                        return updated;
                    } else if (data.tinh) {
                        // Single province update dạng object
                        const updated = base.map(item => 
                            item.tinh === data.tinh ? { ...item, ...data } : item
                        );
                        setIsComplete(updated.every(item => item.isComplete));
                        return updated;
                    } else {
                        // Array - merge từng tỉnh
                        const normalized = normalizeToArray(data);
                        if (normalized.length > 0) {
                            // ✅ OPTIMIZATION: Dùng Map cho normalized data
                            const normalizedMap = new Map();
                            normalized.forEach(item => normalizedMap.set(item.tinh, item));
                            
                            const updated = base.map(item => {
                                const found = normalizedMap.get(item.tinh);
                                return found ? { ...item, ...found } : item;
                            });
                            setIsComplete(updated.every(item => item.isComplete));
                            return updated;
                        }
                        return base;
                    }
                });
                setIsLoading(false);
                setError(null);
            }
        };

        // Server emit khi không truyền specificTinh (map theo tỉnh)
        const handleLatestAll = (data) => {
            if (!mountedRef.current) return;
            // ✅ FIX: Merge data thay vì replace toàn bộ để giữ lại các tỉnh chưa có data
            if (data && typeof data === 'object') {
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup O(1) thay vì find() O(n)
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    
                    // ✅ FIX: Luôn dùng emptyResult làm base để đảm bảo có đủ tất cả tỉnh theo ngày
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem; // O(1) lookup
                    });
                    
                    // Nếu data là object map (key = tinh), merge vào base
                    if (!Array.isArray(data) && !data.tinh) {
                        // Object map: { 'tinh1': {...}, 'tinh2': {...} }
                        const updated = base.map(item => {
                            const tinh = item.tinh;
                            if (data[tinh]) {
                                return { ...item, ...data[tinh] };
                            }
                            return item; // Giữ nguyên tỉnh chưa có data
                        });
                        setIsComplete(updated.every(item => item.isComplete));
                        return updated;
                    } else {
                        // Array hoặc single object - normalize và merge
                        const normalized = normalizeToArray(data);
                        if (normalized.length > 0) {
                            // ✅ OPTIMIZATION: Dùng Map cho normalized data
                            const normalizedMap = new Map();
                            normalized.forEach(item => normalizedMap.set(item.tinh, item));
                            
                            const updated = base.map(item => {
                                const found = normalizedMap.get(item.tinh);
                                return found ? { ...item, ...found } : item;
                            });
                            setIsComplete(updated.every(item => item.isComplete));
                            return updated;
                        }
                        return base;
                    }
                });
                setIsLoading(false);
                setError(null);
            }
        };

        const handlePrizeUpdate = (data) => {
            if (!mountedRef.current) return;

            if (prizeUpdateTimeoutRef.current) {
                clearTimeout(prizeUpdateTimeoutRef.current);
            }

            prizeUpdateTimeoutRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                
                // ✅ Trigger animation TRƯỚC khi update value để animation có thời gian hiển thị
                if (data.prizeData && data.prizeData !== '...' && data.prizeData !== '***') {
                    setAnimationWithTimeout(data.tinh, data.prizeType);
                }
                
                // Update value ngay (không delay thêm) để giảm độ trễ và re-render thừa
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup O(1) thay vì find() O(n)
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    
                    // ✅ FIX: Luôn dùng emptyResult làm base để đảm bảo có đủ tất cả tỉnh theo ngày
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem; // O(1) lookup
                    });
                    
                    return base.map(item => {
                        if (item.tinh === data.tinh) {
                            return { ...item, [data.prizeType]: data.prizeData, lastUpdated: data.timestamp };
                        }
                        return item;
                    });
                });

                setIsLoading(false);
                setError(null);
            }, 50);
        };

        const handleComplete = (data) => {
            if (!mountedRef.current) return;
            if (data && Array.isArray(data)) {
                // ✅ FIX: Merge array vào emptyResult thay vì replace
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    const dataMap = new Map();
                    data.forEach(item => dataMap.set(item.tinh, item));
                    
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem;
                    });
                    const updated = base.map(item => {
                        const found = dataMap.get(item.tinh);
                        return found ? { ...item, ...found, isComplete: true } : item;
                    });
                    setIsComplete(updated.every(item => item.isComplete));
                    return updated;
                });
            } else if (data) {
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    
                    // ✅ FIX: Luôn dùng emptyResult làm base
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem;
                    });
                    const updated = base.map(item => 
                        item.tinh === data.tinh ? { ...item, ...data, isComplete: true } : item
                    );
                    setIsComplete(updated.every(item => item.isComplete));
                    return updated;
                });
            }
            setIsLoading(false);
            setError(null);
        };

        const handleFullUpdate = (data) => {
            if (!mountedRef.current) return;
            // ✅ FIX: Merge data thay vì replace để giữ lại các tỉnh khác
            if (data && typeof data === 'object') {
                setLiveData(prev => {
                    // ✅ OPTIMIZATION: Dùng Map để tối ưu lookup O(1) thay vì find() O(n)
                    const prevMap = new Map();
                    if (prev && prev.length > 0) {
                        prev.forEach(item => prevMap.set(item.tinh, item));
                    }
                    
                    // ✅ FIX: Luôn dùng emptyResult làm base để đảm bảo có đủ tất cả tỉnh theo ngày
                    const base = emptyResult.map(emptyItem => {
                        return prevMap.get(emptyItem.tinh) || emptyItem; // O(1) lookup
                    });
                    
                    if (data.tinh) {
                        // Single province update
                        const updated = base.map(item => 
                            item.tinh === data.tinh ? { ...item, ...data } : item
                        );
                        setIsComplete(updated.every(item => item.isComplete));
                        return updated;
                    } else {
                        // Array hoặc object map - merge
                        const normalized = normalizeToArray(data);
                        if (normalized.length > 0) {
                            // ✅ OPTIMIZATION: Dùng Map cho normalized data
                            const normalizedMap = new Map();
                            normalized.forEach(item => normalizedMap.set(item.tinh, item));
                            
                            const updated = base.map(item => {
                                const found = normalizedMap.get(item.tinh);
                                return found ? { ...item, ...found } : item;
                            });
                            setIsComplete(updated.every(item => item.isComplete));
                            return updated;
                        }
                        return base;
                    }
                });
                setIsLoading(false);
                setError(null);
            }
        };

        const handleError = (error) => {
            if (!mountedRef.current) return;
            console.error('XSMN socket error:', error);
            setError(error.message || 'Lỗi kết nối');
        };

        const handleConnected = () => {
            if (!mountedRef.current) return;
            setSocketStatus('connected');
            console.log('✅ XSMN socket connected');
            // Yêu cầu dữ liệu mới nhất ngay sau khi connect (tránh mất dữ liệu khi quay lại trang)
            try {
                xsmnSocketClient.requestLatest();
            } catch (err) {
                console.warn('⚠️ requestLatest khi connected lỗi:', err.message);
            }
        };

        const handleDisconnected = () => {
            if (!mountedRef.current) return;
            setSocketStatus('disconnected');
            console.log('❌ XSMN socket disconnected');
        };

        // Register listeners
        xsmnSocketClient.on('xsmn:latest', handleLatest);
        xsmnSocketClient.on('xsmn:latest-all', handleLatestAll);
        xsmnSocketClient.on('xsmn:prize-update', handlePrizeUpdate);
        xsmnSocketClient.on('xsmn:complete', handleComplete);
        xsmnSocketClient.on('xsmn:full-update', handleFullUpdate);
        xsmnSocketClient.on('xsmn:error', handleError);
        xsmnSocketClient.on('connected', handleConnected);
        xsmnSocketClient.on('disconnected', handleDisconnected);

        // Cleanup
        return () => {
            if (prizeUpdateTimeoutRef.current) {
                clearTimeout(prizeUpdateTimeoutRef.current);
                prizeUpdateTimeoutRef.current = null;
            }
            
            // Clear animation timeouts
            animationTimeoutsRef.current.forEach((timeoutId) => {
                clearTimeout(timeoutId);
            });
            animationTimeoutsRef.current.clear();
            
            xsmnSocketClient.off('xsmn:latest', handleLatest);
            xsmnSocketClient.off('xsmn:latest-all', handleLatestAll);
            xsmnSocketClient.off('xsmn:prize-update', handlePrizeUpdate);
            xsmnSocketClient.off('xsmn:complete', handleComplete);
            xsmnSocketClient.off('xsmn:full-update', handleFullUpdate);
            xsmnSocketClient.off('xsmn:error', handleError);
            xsmnSocketClient.off('connected', handleConnected);
            xsmnSocketClient.off('disconnected', handleDisconnected);
            
            xsmnSocketClient.decrementRef();
        };
    }, [inLiveWindow, isModal, emptyResult, setAnimationWithTimeout]);

    // Function to get head and tail numbers for statistics
    const getHeadAndTailNumbers = useCallback((item) => {
        const allNumbers = [
            ...(item.eightPrizes_0 ? [{ num: item.eightPrizes_0, isEighth: true }] : []),
            ...(item.specialPrize_0 ? [{ num: item.specialPrize_0, isSpecial: true }] : []),
            ...(item.firstPrize_0 ? [{ num: item.firstPrize_0 }] : []),
            ...(item.secondPrize_0 ? [{ num: item.secondPrize_0 }] : []),
            ...(item.threePrizes_0 ? [{ num: item.threePrizes_0 }] : []),
            ...(item.threePrizes_1 ? [{ num: item.threePrizes_1 }] : []),
            ...(item.fourPrizes_0 ? [{ num: item.fourPrizes_0 }] : []),
            ...(item.fourPrizes_1 ? [{ num: item.fourPrizes_1 }] : []),
            ...(item.fourPrizes_2 ? [{ num: item.fourPrizes_2 }] : []),
            ...(item.fourPrizes_3 ? [{ num: item.fourPrizes_3 }] : []),
            ...(item.fourPrizes_4 ? [{ num: item.fourPrizes_4 }] : []),
            ...(item.fourPrizes_5 ? [{ num: item.fourPrizes_5 }] : []),
            ...(item.fourPrizes_6 ? [{ num: item.fourPrizes_6 }] : []),
            ...(item.fivePrizes_0 ? [{ num: item.fivePrizes_0 }] : []),
            ...(item.sixPrizes_0 ? [{ num: item.sixPrizes_0 }] : []),
            ...(item.sixPrizes_1 ? [{ num: item.sixPrizes_1 }] : []),
            ...(item.sixPrizes_2 ? [{ num: item.sixPrizes_2 }] : []),
            ...(item.sevenPrizes_0 ? [{ num: item.sevenPrizes_0 }] : []),
        ]
            .filter(item => item.num != null && item.num !== '' && item.num !== '...' && item.num !== '***')
            .map((item) => {
                const numStr = String(item.num).padStart(2, '0');
                const last2 = numStr.slice(-2);
                return {
                    num: last2,
                    isEighth: item.isEighth || false,
                    isSpecial: item.isSpecial || false,
                };
            })
            .filter(item => item.num != null && item.num !== '' && !isNaN(item.num));

        const heads = Array(10).fill().map(() => []);
        const tails = Array(10).fill().map(() => []);

        allNumbers.forEach((item) => {
            if (item.num != null && item.num !== '') {
                const numStr = String(item.num).padStart(2, '0');
                const head = parseInt(numStr[0]);
                const tail = parseInt(numStr[numStr.length - 1]);

                if (!isNaN(head) && head >= 0 && head <= 9 && !isNaN(tail) && tail >= 0 && tail <= 9) {
                    heads[head].push({ num: numStr, isEighth: item.isEighth, isSpecial: item.isSpecial });
                    tails[tail].push({ num: numStr, isEighth: item.isEighth, isSpecial: item.isSpecial });
                }
            }
        });

        for (let i = 0; i < 10; i++) {
            heads[i].sort((a, b) => parseInt(a.num) - parseInt(b.num));
            tails[i].sort((a, b) => parseInt(a.num) - parseInt(b.num));
        }

        return { heads, tails };
    }, []);

    // Helper parse date để tránh đảo ngày-tháng khi input dạng DD-MM-YYYY / DD/MM/YYYY
    const parseDateInput = (dateInput) => {
        if (!dateInput) return null;
        if (dateInput instanceof Date) return dateInput;

        if (typeof dateInput === 'string') {
            // DD-MM-YYYY hoặc DD/MM/YYYY
            if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateInput)) {
                const [d, m, y] = dateInput.split(/[-/]/).map(Number);
                const parsed = new Date(y, m - 1, d);
                if (!isNaN(parsed.getTime())) return parsed;
            }
            // ISO hoặc format khác để Date tự xử lý
            const iso = new Date(dateInput);
            if (!isNaN(iso.getTime())) return iso;
            return null;
        }

        return null;
    };

    // Function to format date
    const formatDate = (dateInput) => {
        const date = parseDateInput(dateInput);
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Function to get day of week
    const getDayOfWeek = (dateInput) => {
        const date = parseDateInput(dateInput);
        if (!date) return '';
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    // ✅ FIX: Render prize value với animation mới giống XSMB - riêng cho từng tỉnh
    const renderPrizeValue = useCallback((tinh, prizeType, value, digits = 5) => {
        // Animation hiển thị khi đang animate (không phụ thuộc vào value)
        const isAnimating = animatingPrizes[tinh] === prizeType;
        const className = `${styles.running_number} ${styles[`running_${digits}`]}`;
        const isSpecialOrEighth = prizeType === 'specialPrize_0' || prizeType === 'eightPrizes_0';

        // Xác định số chữ số cần hiển thị dựa trên bộ lọc
        let displayDigits = digits;
        if (filterType === 'last2') {
            displayDigits = 2;
        } else if (filterType === 'last3') {
            displayDigits = Math.min(digits, 3);
        }

        // ✅ OPTIMIZED: Số ngẫu nhiên đứng yên (không scroll, random mỗi lần render)
        if (isAnimating && (value === '...' || value === '***' || !value)) {
            // Sử dụng randomSeed kết hợp hash tỉnh để đảm bảo random khác nhau giữa các tỉnh
            const hashTinh = (tinh || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
            const seed = randomSeed + hashTinh;
            return (
                <span className={`${className} ${isSpecialOrEighth ? styles.highlight : ''}`} data-status="animating">
                    <span className={styles.digit_container}>
                        {Array.from({ length: displayDigits }).map((_, i) => {
                            // Mỗi digit hiển thị 1 số ngẫu nhiên (đứng yên, random mỗi lần render)
                            // Sử dụng seed + index để đảm bảo mỗi digit có số khác nhau
                            const randomNum = Math.abs(seed + i) % 10;
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
                <span className={`${className} ${isSpecialOrEighth ? styles.highlight : ''}`} data-status="pending">
                    <span className={styles.ellipsis}></span>
                </span>
            );
        }

        // Hiển thị số thật
        const filtered = getFilteredNumber(value, filterType) || '';
        const displayValue = filtered.padStart(displayDigits, '0');

        return (
            <span className={`${className} ${isSpecialOrEighth ? styles.highlight : ''}`} data-status="static">
                {displayValue}
            </span>
        );
    }, [animatingPrizes, filterType, randomSeed]);

    // ✅ FIX: Giống XSMB - check error nhưng vẫn hiển thị bảng rỗng (vì liveData luôn có emptyResult)
    if (error && (!liveData || liveData.length === 0)) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <h3>Lỗi kết nối</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // ✅ FIX: Giờ liveData luôn có emptyResult từ đầu, không cần fallback nữa
    const displayData = liveData;
    const dayOfWeek = displayData[0]?.dayOfWeek || '';
    const formattedDate = formatDate(displayData[0]?.drawDate || today);
    const dayOfWeekFormatted = getDayOfWeek(displayData[0]?.drawDate || today);
    
    // Không hiển thị loading message khi đã có displayData để hiển thị
    // Vì displayData luôn có dữ liệu (từ liveData hoặc emptyResult), 
    // nên không cần hiển thị loading message nữa
    const shouldShowLoading = false;

    // Calculate head and tail statistics
    const allHeads = Array(10).fill().map(() => []);
    const allTails = Array(10).fill().map(() => []);
    const stationsData = displayData.map(item => {
        const { heads, tails } = getHeadAndTailNumbers(item);
        for (let i = 0; i < 10; i++) {
            allHeads[i].push(heads[i]);
            allTails[i].push(tails[i]);
        }
        return { tentinh: item.tentinh, tinh: item.tinh };
    });

    return (
        <div className={styles.containerKQ}>
            {socketStatus === 'disconnected' && inLiveWindow && (
                <div className={styles.warning}>
                    ⚠️ Kết nối không ổn định, đang thử kết nối lại...
                </div>
            )}

            {shouldShowLoading && (
                <div className={styles.loadingMessage}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu kết quả xổ số...</p>
                </div>
            )}

            <div className={styles.kqxs}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <h1 className={styles.kqxs__title}>
                            {inLiveWindow ? '🔴 Tường Thuật Trực Tiếp XSMN' : `XSMN - Kết quả Xổ số Miền Nam - SXMN ${formattedDate}`}
                        </h1>
                        {inLiveWindow && (
                            <span className={styles.liveBadge}>
                                <span className={styles.liveDot}></span>
                                Đang phát trực tiếp
                            </span>
                        )}
                    </div>
                    <div className={styles.kqxs__action}>
                        <a className={styles.kqxs__actionLink} href="#!">XSMN</a>
                        <a className={`${styles.kqxs__actionLink} ${styles.dayOfWeek}`} href="#!">{dayOfWeekFormatted}</a>
                        <a className={styles.kqxs__actionLink} href="#!">{formattedDate}</a>
                    </div>
                </div>

                {/* Horizontal Layout: Main Table + Statistics Tables */}
                <div className={styles.horizontalLayout}>
                    {/* Main Results Table Container */}
                    <div className={styles.mainTableContainer}>
                        {/* Main Table */}
                        <table className={styles.tableXS} style={{ '--num-columns': displayData.length }}>
                            <thead>
                                <tr>
                                    <th></th>
                                    {displayData.map(item => (
                                        <th key={item.tinh} className={styles.stationName}>
                                            {item.tentinh}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Giải 8 */}
                                <tr>
                                    <td className={`${styles.tdTitle} ${styles.highlight}`}>G8</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={`${styles.prizeNumber} ${styles.highlight}`}>
                                                {renderPrizeValue(item.tinh, 'eightPrizes_0', item.eightPrizes_0, 2)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 7 */}
                                <tr>
                                    <td className={styles.tdTitle}>G7</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={styles.prizeNumber}>
                                                {renderPrizeValue(item.tinh, 'sevenPrizes_0', item.sevenPrizes_0, 3)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 6 */}
                                <tr>
                                    <td className={styles.tdTitle}>G6</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            {[0, 1, 2].map(idx => (
                                                <span key={idx} className={styles.prizeNumber}>
                                                    {renderPrizeValue(item.tinh, `sixPrizes_${idx}`, item[`sixPrizes_${idx}`], 4)}
                                                    {idx < 2 && <br />}
                                                </span>
                                            ))}
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 5 */}
                                <tr>
                                    <td className={styles.tdTitle}>G5</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={styles.prizeNumber}>
                                                {renderPrizeValue(item.tinh, 'fivePrizes_0', item.fivePrizes_0, 4)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 4 */}
                                <tr>
                                    <td className={styles.tdTitle}>G4</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            {[0, 1, 2, 3, 4, 5, 6].map(idx => (
                                                <span key={idx} className={styles.prizeNumber}>
                                                    {renderPrizeValue(item.tinh, `fourPrizes_${idx}`, item[`fourPrizes_${idx}`], 5)}
                                                    {idx < 6 && <br />}
                                                </span>
                                            ))}
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 3 */}
                                <tr>
                                    <td className={styles.tdTitle}>G3</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            {[0, 1].map(idx => (
                                                <span key={idx} className={styles.prizeNumber}>
                                                    {renderPrizeValue(item.tinh, `threePrizes_${idx}`, item[`threePrizes_${idx}`], 5)}
                                                    {idx < 1 && <br />}
                                                </span>
                                            ))}
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 2 */}
                                <tr>
                                    <td className={styles.tdTitle}>G2</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={styles.prizeNumber}>
                                                {renderPrizeValue(item.tinh, 'secondPrize_0', item.secondPrize_0, 5)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải 1 */}
                                <tr>
                                    <td className={styles.tdTitle}>G1</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={styles.prizeNumber}>
                                                {renderPrizeValue(item.tinh, 'firstPrize_0', item.firstPrize_0, 5)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Giải Đặc Biệt */}
                                <tr>
                                    <td className={`${styles.tdTitle} ${styles.highlight}`}>ĐB</td>
                                    {displayData.map(item => (
                                        <td key={item.tinh} className={styles.rowXS}>
                                            <span className={`${styles.prizeNumber} ${styles.highlight}`}>
                                                {renderPrizeValue(item.tinh, 'specialPrize_0', item.specialPrize_0, 6)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics Tables Container (Đầu và Đuôi) */}
                    <div className={styles.sideTablesContainer}>
                        {/* Đầu Table */}
                        <table className={styles.dau}>
                            <tbody>
                                <tr>
                                    <th>Đầu</th>
                                    {stationsData.map(station => (
                                        <th key={station.tinh} className={styles.dauDataCol}>
                                            {station.tentinh}
                                        </th>
                                    ))}
                                </tr>
                                {Array.from({ length: 10 }, (_, idx) => (
                                    <tr key={idx}>
                                        <td className={styles.dauDigitCol}>{idx}</td>
                                        {allHeads[idx].map((headNumbers, stationIdx) => (
                                            <td key={stationIdx} className={`${styles[`dau_${idx}`]} ${styles.dauDataCol}`}>
                                                {headNumbers && headNumbers.length > 0 ? (
                                                    headNumbers.map((item, numIdx) => (
                                                        <span
                                                            key={numIdx}
                                                            className={
                                                                item.isEighth || item.isSpecial
                                                                    ? styles.highlightPrize
                                                                    : ''
                                                            }
                                                        >
                                                            {item.num}
                                                            {numIdx < headNumbers.length - 1 && ', '}
                                                        </span>
                                                    ))
                                                ) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Đuôi Table */}
                        <table className={styles.dit}>
                            <tbody>
                                <tr>
                                    <th>Đuôi</th>
                                    {stationsData.map(station => (
                                        <th key={station.tinh} className={styles.ditDataCol}>
                                            {station.tentinh}
                                        </th>
                                    ))}
                                </tr>
                                {Array.from({ length: 10 }, (_, idx) => (
                                    <tr key={idx}>
                                        <td className={styles.ditDigitCol}>{idx}</td>
                                        {allTails[idx].map((tailNumbers, stationIdx) => (
                                            <td key={stationIdx} className={`${styles[`dit_${idx}`]} ${styles.ditDataCol}`}>
                                                {tailNumbers && tailNumbers.length > 0 ? (
                                                    tailNumbers.map((item, numIdx) => (
                                                        <span
                                                            key={numIdx}
                                                            className={
                                                                item.isEighth || item.isSpecial
                                                                    ? styles.highlightPrize
                                                                    : ''
                                                            }
                                                        >
                                                            {item.num}
                                                            {numIdx < tailNumbers.length - 1 && ', '}
                                                        </span>
                                                    ))
                                                ) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LiveResultXSMN);

