/**
 * Trang Thống Kê 3 Miền
 * Hiển thị bảng thống kê kết quả xổ số 3 miền
 */

import { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy, memo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import MobileNavbar from '../components/MobileNavbar';
// Tối ưu import icons - chỉ import những icon cần thiết
import { BarChart3, RefreshCw, Filter, Download, ImageIcon, Settings, Save, FolderOpen, Plus, Check, X } from 'lucide-react';
import styles from '../styles/ThongKe.module.css';
import { API_CONFIG } from '../config/api';
import apiService from '../services/apiService';
import dynamic from 'next/dynamic';

// Lazy load heavy components for better PageSpeed
const SafeStatisticsTable = dynamic(() => import('../components/LazyComponents').then(mod => ({ default: mod.SafeStatisticsTable })), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải bảng thống kê...</div>,
    ssr: false
});

const SafeSummaryCards = dynamic(() => import('../components/LazyComponents').then(mod => ({ default: mod.SafeSummaryCards })), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải thẻ tóm tắt...</div>,
    ssr: false
});

const ExportableTable = lazy(() => import('../components/ThongKe/ExportableTable'));

function ThongKePage() {
    const router = useRouter();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        limit: 30
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [exportWidth, setExportWidth] = useState(1200);
    const [exportPreset, setExportPreset] = useState('facebook-post');
    const [userName, setUserName] = useState(''); // Tên người dùng cho xuất file và hiển thị
    const [activeMonth, setActiveMonth] = useState('current'); // 'current' or 'previous'
    const [currentMonthData, setCurrentMonthData] = useState(null);
    const [previousMonthData, setPreviousMonthData] = useState(null);

    // Modal states
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('save'); // 'save' or 'load'
    const [authData, setAuthData] = useState({
        username: '',
        password: ''
    });
    const [authLoading, setAuthLoading] = useState(false);

    // Stable authData object to prevent re-renders
    const stableAuthData = useMemo(() => authData, [authData.username, authData.password]);

    // Add date states
    const [addDateInput, setAddDateInput] = useState('');
    const [showAddDateInput, setShowAddDateInput] = useState(false);

    // Refs
    const exportTableRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Refs for modal inputs to prevent focus loss
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    // Facebook size presets - được memoize để tránh tạo lại object
    const facebookPresets = useMemo(() => ({
        'facebook-post': {
            width: 1200,
            name: 'Facebook Post',
            description: '1200x630px - Kích thước chuẩn Facebook (1.91:1)',
            ratio: '1.91:1'
        },
        'facebook-story': {
            width: 1080,
            name: 'Facebook Story',
            description: '1080x1920px - Kích thước chuẩn Story (9:16)',
            ratio: '9:16'
        },
        'facebook-cover': {
            width: 1200,
            name: 'Facebook Cover',
            description: '1200x630px - Kích thước chuẩn Cover (1.91:1)',
            ratio: '1.91:1'
        },
        'facebook-event': {
            width: 1200,
            name: 'Facebook Event',
            description: '1200x630px - Kích thước chuẩn Event (1.91:1)',
            ratio: '1.91:1'
        },
        'instagram-post': {
            width: 1080,
            name: 'Instagram Post',
            description: '1080x1080px - Kích thước chuẩn Instagram (1:1)',
            ratio: '1:1'
        },
        'custom': {
            width: exportWidth,
            name: 'Tùy chỉnh',
            description: 'Kích thước tùy chỉnh',
            ratio: 'Tự động'
        }
    }), [exportWidth]); // Chỉ tạo lại khi exportWidth thay đổi

    // Handle preset change - được memoize
    const handlePresetChange = useCallback((preset) => {
        setExportPreset(preset);
        if (preset !== 'custom') {
            setExportWidth(facebookPresets[preset].width);
        }
    }, [facebookPresets]); // Phụ thuộc vào facebookPresets

    // Helper functions được memoize để tránh tính toán lại không cần thiết
    const getCurrentMonthRange = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        return { startDate, endDate, title: `Tháng ${month + 1}/${year}` };
    }, []); // Chỉ tính một lần khi component mount

    const getPreviousMonthRange = useMemo(() => {
        const now = new Date();
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        return { startDate, endDate, title: `Tháng ${month + 1}/${year}` };
    }, []); // Chỉ tính một lần khi component mount

    // Fetch dữ liệu thống kê cho một tháng - sử dụng apiService với caching
    const fetchMonthData = useCallback(async (monthRange) => {
        const params = {
            startDate: monthRange.startDate,
            endDate: monthRange.endDate,
            limit: 31 // Tối đa 31 ngày trong tháng
        };

        try {
            const result = await apiService.getThongKe3Mien(params);

            if (result.success) {
                return { ...result.data, title: monthRange.title };
            } else {
                throw new Error(result.message || 'Lỗi không xác định');
            }
        } catch (error) {
            console.error('API Error:', error);
            // Return fallback data if API fails
            return {
                statistics: [],
                summary: {
                    mienNam: { hitRate: 0 },
                    mienTrung: { hitRate: 0 },
                    mienBac: { hitRate: 0 }
                },
                metadata: { totalRecords: 0 },
                title: monthRange.title
            };
        }
    }, []); // Không phụ thuộc vào gì, chỉ tạo một lần

    // Fetch dữ liệu thống kê cho cả 2 tháng - được memoize
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch dữ liệu song song cho cả 2 tháng
            const [currentData, previousData] = await Promise.all([
                fetchMonthData(getCurrentMonthRange),
                fetchMonthData(getPreviousMonthRange)
            ]);

            setCurrentMonthData(currentData);
            setPreviousMonthData(previousData);

            // Set data mặc định là tháng hiện tại
            setData(currentData);

        } catch (err) {
            console.error('Lỗi khi tải thống kê:', err);
            setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    }, [fetchMonthData, getCurrentMonthRange, getPreviousMonthRange]); // Phụ thuộc vào các function và objects đã memoize

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Chuyển đổi tháng - được memoize
    const switchMonth = useCallback((month) => {
        setActiveMonth(month);
        if (month === 'current' && currentMonthData) {
            setData(currentMonthData);
        } else if (month === 'previous' && previousMonthData) {
            setData(previousMonthData);
        }
    }, [currentMonthData, previousMonthData]); // Phụ thuộc vào dữ liệu tháng

    // Xử lý thay đổi filter
    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Áp dụng filter
    const applyFilters = useCallback(() => {
        fetchData();
        setShowFilters(false);
    }, [fetchData]);

    // Reset filter
    const resetFilters = useCallback(() => {
        setFilters({
            startDate: '',
            endDate: '',
            limit: 30
        });
    }, []);

    // Lưu dữ liệu thống kê - sử dụng apiService
    const saveStatistics = useCallback(async (date, updateData) => {
        try {
            const result = await apiService.updateThongKe(date, updateData);

            if (result.success) {
                // Cập nhật lại dữ liệu local
                setData(prevData => ({
                    ...prevData,
                    statistics: prevData.statistics.map(row =>
                        row.date === date ? { ...row, ...updateData } : row
                    )
                }));

                // Cập nhật cả currentMonthData và previousMonthData nếu cần
                setCurrentMonthData(prevData =>
                    prevData ? {
                        ...prevData,
                        statistics: prevData.statistics.map(row =>
                            row.date === date ? { ...row, ...updateData } : row
                        )
                    } : prevData
                );

                setPreviousMonthData(prevData =>
                    prevData ? {
                        ...prevData,
                        statistics: prevData.statistics.map(row =>
                            row.date === date ? { ...row, ...updateData } : row
                        )
                    } : prevData
                );
            } else {
                throw new Error(result.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            throw err;
        }
    }, []); // Không phụ thuộc vào gì

    // Xuất ảnh - Fixed version
    const exportToImage = async () => {
        if (!data || !exportTableRef.current) {
            alert('Không có dữ liệu để xuất ảnh');
            return;
        }

        try {
            setIsExporting(true);

            // Dynamic import html2canvas with error handling
            let html2canvas;
            try {
                const html2canvasModule = await import('html2canvas');
                html2canvas = html2canvasModule.default;
            } catch (importError) {
                console.error('Failed to import html2canvas:', importError);
                throw new Error('Không thể tải thư viện xuất ảnh. Vui lòng thử lại sau.');
            }

            if (!html2canvas) {
                throw new Error('Thư viện xuất ảnh không khả dụng');
            }

            // Show loading message
            const loadingMessage = document.createElement('div');
            loadingMessage.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8); color: white; padding: 20px;
                border-radius: 8px; z-index: 10000; font-size: 16px;
            `;
            loadingMessage.textContent = 'Đang tạo ảnh...';
            document.body.appendChild(loadingMessage);

            // Get element and calculate dimensions
            const element = exportTableRef.current;

            // First, get natural dimensions of the element
            const originalStyle = {
                position: element.style.position,
                left: element.style.left,
                top: element.style.top,
                visibility: element.style.visibility,
                opacity: element.style.opacity,
                width: element.style.width,
                height: element.style.height,
                transform: element.style.transform,
                zIndex: element.style.zIndex,
                margin: element.style.margin,
                padding: element.style.padding,
                boxSizing: element.style.boxSizing
            };

            // Temporarily make element visible for measurement
            element.style.position = 'static';
            element.style.left = 'auto';
            element.style.top = 'auto';
            element.style.transform = 'none';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.width = 'auto';
            element.style.height = 'auto';
            element.style.zIndex = '1000';
            element.style.backgroundColor = '#ffffff';
            element.style.margin = '0';
            element.style.padding = '20px';
            element.style.boxSizing = 'border-box';

            // Force reflow
            element.offsetHeight;

            const rect = element.getBoundingClientRect();
            const elementWidth = Math.max(rect.width, exportWidth * 0.8);
            const elementHeight = Math.max(rect.height, 400);

            // Calculate final dimensions based on preset - Auto height based on data
            let finalWidth = exportWidth;
            let finalHeight;

            // Calculate auto height based on number of days in data with multi-column support
            const numberOfDays = data?.statistics?.length || 0;
            const maxDaysPerColumn = 15;
            const numberOfColumns = Math.ceil(numberOfDays / maxDaysPerColumn);
            const actualDaysPerColumn = Math.min(numberOfDays, maxDaysPerColumn);

            const baseRowHeight = 28; // Height per row (from CSS)
            const headerHeight = 60; // Header height
            const summaryHeight = 80; // Summary section height
            const padding = 40; // Container padding
            const tableHeaderHeight = 60; // Table header height

            const autoHeight = Math.max(
                headerHeight + tableHeaderHeight + (actualDaysPerColumn * baseRowHeight) + summaryHeight + padding,
                400 // Minimum height
            );

            // Set exact dimensions for each preset with auto height
            if (exportPreset === 'facebook-post') {
                finalWidth = 1200;
                finalHeight = Math.max(autoHeight, 630); // Use auto height or Facebook minimum
            } else if (exportPreset === 'facebook-story') {
                finalWidth = 1080;
                finalHeight = 1920; // Facebook story size - keep fixed
            } else if (exportPreset === 'facebook-cover') {
                finalWidth = 1200;
                finalHeight = Math.max(autoHeight, 630); // Use auto height or Facebook minimum
            } else if (exportPreset === 'facebook-event') {
                finalWidth = 1200;
                finalHeight = Math.max(autoHeight, 630); // Use auto height or Facebook minimum
            } else if (exportPreset === 'instagram-post') {
                finalWidth = 1080;
                finalHeight = 1080; // Instagram square - keep fixed
            } else {
                // Custom size - use auto height
                finalHeight = autoHeight;
            }

            // Now position element in center with final dimensions
            element.style.position = 'fixed';
            element.style.left = '50%';
            element.style.top = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.width = finalWidth + 'px';
            element.style.height = finalHeight + 'px';
            element.style.zIndex = '9999';

            // Calculate scale for better quality - Fixed scale for consistent results
            const scale = 2; // Fixed scale for consistent quality

            console.log('Export dimensions:', {
                elementWidth: elementWidth,
                elementHeight: elementHeight,
                finalWidth: finalWidth,
                finalHeight: finalHeight,
                scale: scale,
                preset: exportPreset,
                numberOfDays: numberOfDays,
                numberOfColumns: numberOfColumns,
                actualDaysPerColumn: actualDaysPerColumn,
                autoHeight: autoHeight
            });

            const canvas = await html2canvas(element, {
                width: finalWidth,
                height: finalHeight,
                scale: scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                removeContainer: true,
                foreignObjectRendering: false, // Disable to avoid SVG issues
                imageTimeout: 15000,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                x: 0,
                y: 0,
                // Optimize for high quality export
                letterRendering: true,
                onclone: (clonedDoc) => {
                    // Fix any SVG elements that might have NaN attributes
                    const svgElements = clonedDoc.querySelectorAll('svg');
                    svgElements.forEach(svg => {
                        if (!svg.getAttribute('width') || svg.getAttribute('width') === 'NaN') {
                            svg.setAttribute('width', '16');
                        }
                        if (!svg.getAttribute('height') || svg.getAttribute('height') === 'NaN') {
                            svg.setAttribute('height', '16');
                        }
                        if (!svg.getAttribute('viewBox')) {
                            svg.setAttribute('viewBox', '0 0 16 16');
                        }
                    });

                    // Ensure fonts are loaded in cloned document
                    const clonedElement = clonedDoc.querySelector('[data-export-mode]');
                    if (clonedElement) {
                        clonedElement.style.fontFamily = 'Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif';
                        clonedElement.style.color = '#1e293b';
                        clonedElement.style.backgroundColor = '#ffffff';
                        clonedElement.style.position = 'fixed';
                        clonedElement.style.left = '50%';
                        clonedElement.style.top = '50%';
                        clonedElement.style.transform = 'translate(-50%, -50%)';
                        clonedElement.style.width = finalWidth + 'px';
                        clonedElement.style.height = finalHeight + 'px';
                        clonedElement.style.zIndex = '9999';
                        // Optimize for export quality
                        clonedElement.style.imageRendering = 'crisp-edges';
                        clonedElement.style.textRendering = 'optimizeLegibility';
                    }
                }
            });

            // Restore original styles
            Object.keys(originalStyle).forEach(key => {
                element.style[key] = originalStyle[key];
            });

            // Remove loading message
            if (document.body.contains(loadingMessage)) {
                document.body.removeChild(loadingMessage);
            }

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Không thể tạo ảnh từ bảng dữ liệu - Canvas rỗng');
            }

            // Download image
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            const userPrefix = userName.trim() ? `${userName.trim()}-` : '';
            const filename = `${userPrefix}thong-ke-3-mien-${dateStr}.png`;

            link.download = filename;
            link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality for Facebook
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);

            // Success message
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                background: #10b981; color: white; padding: 12px 20px;
                border-radius: 8px; z-index: 10000; font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            successMessage.textContent = `✅ Xuất ảnh thành công! (${canvas.width}x${canvas.height}px)`;
            document.body.appendChild(successMessage);

            // Auto remove success message
            setTimeout(() => {
                if (document.body.contains(successMessage)) {
                    document.body.removeChild(successMessage);
                }
            }, 3000);

        } catch (error) {
            console.error('Export error:', error);

            // Remove loading message if exists
            const loadingMessages = document.querySelectorAll('div[style*="position: fixed"]');
            loadingMessages.forEach(msg => {
                if (document.body.contains(msg)) {
                    document.body.removeChild(msg);
                }
            });

            // Error message
            const errorMessage = document.createElement('div');
            errorMessage.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                background: #ef4444; color: white; padding: 12px 20px;
                border-radius: 8px; z-index: 10000; font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            errorMessage.textContent = `❌ Lỗi xuất ảnh: ${error.message}`;
            document.body.appendChild(errorMessage);

            // Auto remove error message
            setTimeout(() => {
                if (document.body.contains(errorMessage)) {
                    document.body.removeChild(errorMessage);
                }
            }, 5000);
        } finally {
            setIsExporting(false);
        }
    };

    // Xuất dữ liệu CSV
    const exportToCSV = () => {
        if (!data || !data.statistics) return;

        const headers = ['Ngày', 'Miền Nam ĐB', 'Miền Nam Nhận', 'Miền Trung ĐB', 'Miền Trung Nhận', 'Miền Bắc ĐB', 'Miền Bắc Nhận'];
        const csvContent = [
            headers.join(','),
            ...data.statistics.map(row => [
                row.displayDate,
                row.mienNam.db,
                row.mienNam.nhan,
                row.mienTrung.db,
                row.mienTrung.nhan,
                row.mienBac.db,
                row.mienBac.nhan
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Tạo tên file với tên người dùng
        const dateStr = new Date().toISOString().split('T')[0];
        const userPrefix = userName.trim() ? `${userName.trim()}-` : '';
        const filename = `${userPrefix}thong-ke-3-mien-${dateStr}.csv`;

        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Mở modal lưu dữ liệu
    const openSaveModal = useCallback(() => {
        setAuthMode('save');
        setAuthData({ username: '', password: '' });
        setShowAuthModal(true);
    }, []);

    // Mở modal tải dữ liệu
    const openLoadModal = useCallback(() => {
        setAuthMode('load');
        setAuthData({ username: '', password: '' });
        setShowAuthModal(true);
    }, []);

    // Đóng modal - được memoize và tối ưu
    const closeAuthModal = useCallback(() => {
        setShowAuthModal(false);
        setAuthData({ username: '', password: '' });
        setAuthLoading(false);
        // Clear refs
        if (usernameRef.current) usernameRef.current.value = '';
        if (passwordRef.current) passwordRef.current.value = '';
    }, []);

    // Xử lý thay đổi input trong modal - tối ưu để tránh re-render
    const handleAuthInputChange = useCallback((field, value) => {
        setAuthData(prev => {
            // Chỉ update nếu value thực sự thay đổi
            if (prev[field] === value) return prev;
            return {
                ...prev,
                [field]: value
            };
        });
    }, []); // Empty dependency array để tránh re-create function

    // Xử lý input password với validation - Sử dụng ref để tránh re-render
    const handlePasswordChange = useCallback((e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        e.target.value = value; // Update input value directly
        setAuthData(prev => ({ ...prev, password: value }));
    }, []);

    // Xử lý input username - Sử dụng ref để tránh re-render
    const handleUsernameChange = useCallback((e) => {
        const value = e.target.value;
        setAuthData(prev => ({ ...prev, username: value }));
    }, []);

    // Lưu dữ liệu thống kê - sử dụng apiService với refs
    const saveStatisticsData = useCallback(async () => {
        const username = usernameRef.current?.value?.trim() || '';
        const password = passwordRef.current?.value?.trim() || '';

        if (!data || !username || !password) {
            alert('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
            return;
        }

        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
            alert('Mật khẩu phải là 6 chữ số');
            return;
        }

        try {
            setAuthLoading(true);

            const saveData = {
                username: username,
                password: password,
                data: data,
                userDisplayName: userName,
                savedAt: new Date().toISOString()
            };

            const result = await apiService.saveStatistics(saveData);

            if (result.success) {
                alert('Lưu dữ liệu thành công!');
                setShowAuthModal(false);
                setAuthData({ username: '', password: '' });
                // Clear refs
                if (usernameRef.current) usernameRef.current.value = '';
                if (passwordRef.current) passwordRef.current.value = '';
                setAuthLoading(false);
            } else {
                throw new Error(result.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            alert('Lỗi khi lưu dữ liệu: ' + err.message);
        } finally {
            setAuthLoading(false);
        }
    }, [data, userName]); // Removed authData dependency

    // Tải dữ liệu thống kê - sử dụng apiService với refs
    const loadStatisticsData = useCallback(async () => {
        const username = usernameRef.current?.value?.trim() || '';
        const password = passwordRef.current?.value?.trim() || '';

        if (!username || !password) {
            alert('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
            return;
        }

        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
            alert('Mật khẩu phải là 6 chữ số');
            return;
        }

        try {
            setAuthLoading(true);

            const credentials = {
                username: username,
                password: password
            };

            const result = await apiService.loadStatistics(credentials);

            if (result.success) {
                setData(result.data.data);
                setUserName(result.data.userDisplayName || '');
                alert('Tải dữ liệu thành công!');
                setShowAuthModal(false);
                setAuthData({ username: '', password: '' });
                // Clear refs
                if (usernameRef.current) usernameRef.current.value = '';
                if (passwordRef.current) passwordRef.current.value = '';
                setAuthLoading(false);
            } else {
                throw new Error(result.message || 'Tài khoản hoặc mật khẩu không đúng');
            }
        } catch (err) {
            console.error('Lỗi khi tải:', err);
            alert('Lỗi khi tải dữ liệu: ' + err.message);
        } finally {
            setAuthLoading(false);
        }
    }, []); // No dependencies

    // Xử lý submit modal
    const handleAuthSubmit = useCallback(() => {
        if (authMode === 'save') {
            saveStatisticsData();
        } else {
            loadStatisticsData();
        }
    }, [authMode, saveStatisticsData, loadStatisticsData]);

    // Parse date input (supports DD/MM or DD-MM format)
    const parseDateInput = (input) => {
        const trimmed = input.trim();
        const currentYear = new Date().getFullYear();

        // Support DD/MM or DD-MM format
        const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
        if (!match) return null;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);

        // Validate day and month
        if (day < 1 || day > 31 || month < 1 || month > 12) return null;

        // Create date string in YYYY-MM-DD format
        const dateStr = `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Validate the date exists
        const date = new Date(dateStr);
        if (date.getFullYear() !== currentYear ||
            date.getMonth() + 1 !== month ||
            date.getDate() !== day) {
            return null;
        }

        return {
            date: dateStr,
            displayDate: `${day}/${month}`,
            day,
            month
        };
    };

    // Add new date row
    const addNewDateRow = () => {
        if (!addDateInput.trim()) {
            alert('Vui lòng nhập ngày (VD: 30/09 hoặc 30-09)');
            return;
        }

        const parsedDate = parseDateInput(addDateInput);
        if (!parsedDate) {
            alert('Định dạng ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM hoặc DD-MM (VD: 30/09)');
            return;
        }

        if (!data || !data.statistics) {
            alert('Không có dữ liệu thống kê để thêm');
            return;
        }

        // Check if date already exists
        const existingDate = data.statistics.find(row => row.date === parsedDate.date);
        if (existingDate) {
            alert(`Ngày ${parsedDate.displayDate} đã tồn tại trong bảng thống kê`);
            return;
        }

        // Create new empty row
        const newRow = {
            date: parsedDate.date,
            displayDate: parsedDate.displayDate,
            mienNam: { db: '', nhan: '' },
            mienTrung: { db: '', nhan: '' },
            mienBac: { db: '', nhan: '' }
        };

        // Add to data and sort by date (newest first)
        const updatedStatistics = [...data.statistics, newRow].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        setData(prev => ({
            ...prev,
            statistics: updatedStatistics,
            metadata: {
                ...prev.metadata,
                totalRecords: updatedStatistics.length
            }
        }));

        // Clear input and hide
        setAddDateInput('');
        setShowAddDateInput(false);

        alert(`Đã thêm ngày ${parsedDate.displayDate} vào bảng thống kê`);
    };

    // Handle add date input key press
    const handleAddDateKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            addNewDateRow();
        } else if (e.key === 'Escape') {
            setAddDateInput('');
            setShowAddDateInput(false);
        }
    }, [addNewDateRow]);

    // Delete date row
    const deleteDateRow = useCallback((dateToDelete, displayDate) => {
        if (!data || !data.statistics) {
            alert('Không có dữ liệu thống kê để xóa');
            return;
        }

        // Confirm deletion
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa dữ liệu ngày ${displayDate}?`);
        if (!confirmDelete) return;

        // Filter out the date to delete
        const updatedStatistics = data.statistics.filter(row => row.date !== dateToDelete);

        if (updatedStatistics.length === data.statistics.length) {
            alert(`Không tìm thấy dữ liệu ngày ${displayDate} để xóa`);
            return;
        }

        // Update data
        setData(prev => ({
            ...prev,
            statistics: updatedStatistics,
            metadata: {
                ...prev.metadata,
                totalRecords: updatedStatistics.length
            }
        }));

        alert(`Đã xóa dữ liệu ngày ${displayDate}`);
    }, [data]);

    // Memoized export options component
    const ExportOptions = memo(({
        showExportOptions,
        userName,
        setUserName,
        exportPreset,
        exportWidth,
        facebookPresets,
        handlePresetChange,
        setExportWidth,
        exportToImage,
        exportToCSV,
        isExporting,
        data
    }) => {
        if (!showExportOptions) return null;

        return (
            <div className={styles.exportOptions}>
                {/* Compact Header with User Input */}
                <div className={styles.exportHeader}>
                    <div className={styles.exportGroup}>
                        <label>Tên người dùng:</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="VD: Nguyễn Văn A"
                            className={styles.exportInput}
                            maxLength={100}
                        />
                    </div>
                    <div className={styles.exportGroup}>
                        <label>Kích thước:</label>
                        <select
                            value={exportPreset}
                            onChange={(e) => handlePresetChange(e.target.value)}
                            className={styles.exportSelect}
                        >
                            {Object.entries(facebookPresets).map(([key, preset]) => (
                                <option key={key} value={key}>
                                    {preset.name} - {preset.description}
                                </option>
                            ))}
                        </select>
                    </div>
                    {exportPreset === 'custom' && (
                        <div className={styles.exportGroup}>
                            <label>Độ rộng (px):</label>
                            <input
                                type="number"
                                value={exportWidth}
                                onChange={(e) => setExportWidth(parseInt(e.target.value) || 800)}
                                min="400"
                                max="2000"
                                step="50"
                                className={styles.exportInput}
                                style={{ width: '120px' }}
                            />
                        </div>
                    )}
                </div>

                {/* Compact Actions */}
                <div className={styles.exportActions}>
                    <button
                        onClick={exportToImage}
                        disabled={isExporting || !data}
                        className={styles.imageButton}
                    >
                        <ImageIcon size={16} />
                        {isExporting ? 'Đang xuất...' : 'Xuất ảnh'}
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={!data}
                        className={styles.csvButton}
                    >
                        <Download size={16} />
                        CSV
                    </button>
                    <div className={styles.exportInfo}>
                        {(() => {
                            const numberOfDays = data?.statistics?.length || 0;
                            const numberOfColumns = Math.ceil(numberOfDays / 15);
                            const columnInfo = numberOfColumns > 1 ? `, ${numberOfColumns} cột` : '';

                            if (exportPreset === 'facebook-post') return `1200px × Auto (Min: 630px, ${numberOfDays} ngày${columnInfo})`;
                            if (exportPreset === 'facebook-story') return '1080px × 1920px (9:16)';
                            if (exportPreset === 'facebook-cover') return `1200px × Auto (Min: 630px, ${numberOfDays} ngày${columnInfo})`;
                            if (exportPreset === 'facebook-event') return `1200px × Auto (Min: 630px, ${numberOfDays} ngày${columnInfo})`;
                            if (exportPreset === 'instagram-post') return '1080px × 1080px (1:1)';
                            return `${exportWidth}px × Auto (${numberOfDays} ngày${columnInfo})`;
                        })()}
                    </div>
                </div>
            </div>
        );
    });

    ExportOptions.displayName = 'ExportOptions';

    // Separate AuthModal component to prevent re-render issues
    const AuthModal = useMemo(() => {
        if (!showAuthModal) return null;

        return (
            <div className={styles.modalOverlay} onClick={closeAuthModal}>
                <div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className={styles.modalHeader}>
                        <h3 className={styles.modalTitle}>
                            {authMode === 'save' ? 'Lưu dữ liệu thống kê' : 'Mở file đã lưu'}
                        </h3>
                        <button
                            className={styles.modalCloseButton}
                            onClick={closeAuthModal}
                            disabled={authLoading}
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.modalBody}>
                        <div className={styles.modalDescription}>
                            {authMode === 'save'
                                ? 'Nhập tên tài khoản và mật khẩu 6 số để lưu dữ liệu thống kê hiện tại'
                                : 'Nhập tên tài khoản và mật khẩu để tải dữ liệu thống kê đã lưu'
                            }
                        </div>

                        <div className={styles.modalInputGroup}>
                            <label>Tên tài khoản:</label>
                            <input
                                ref={usernameRef}
                                type="text"
                                defaultValue={authData.username}
                                onChange={handleUsernameChange}
                                placeholder="VD: nguyenvana"
                                className={styles.modalInput}
                                disabled={authLoading}
                                maxLength={50}
                                autoComplete="username"
                                autoFocus={authMode === 'save'}
                            />
                        </div>

                        <div className={styles.modalInputGroup}>
                            <label>Mật khẩu (6 chữ số):</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                defaultValue={authData.password}
                                onChange={handlePasswordChange}
                                placeholder="123456"
                                className={styles.modalInput}
                                disabled={authLoading}
                                maxLength={6}
                                autoComplete="current-password"
                                autoFocus={authMode === 'load'}
                            />
                            <small className={styles.modalHint}>
                                Chỉ nhập 6 chữ số (0-9)
                            </small>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            className={styles.modalCancelButton}
                            onClick={closeAuthModal}
                            disabled={authLoading}
                        >
                            Hủy
                        </button>
                        <button
                            className={styles.modalSubmitButton}
                            onClick={handleAuthSubmit}
                            disabled={authLoading}
                        >
                            {authLoading ? 'Đang xử lý...' : (authMode === 'save' ? 'Lưu' : 'Tải')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [showAuthModal, authMode, authLoading, closeAuthModal, handleUsernameChange, handlePasswordChange, handleAuthSubmit]);

    return (
        <>
            <SEOOptimized
                pageType="thong-ke"
                breadcrumbs={[
                    { name: 'Trang chủ', url: siteUrl },
                    { name: 'Lập Bảng Thống Kê Chốt Dàn 3 Miền', url: `${siteUrl}/thong-ke` }
                ]}
                faq={[
                    {
                        question: 'Bảng thống kê chốt dàn 3 miền được cập nhật như thế nào?',
                        answer: 'Dữ liệu bảng thống kê chốt dàn 3 miền được cập nhật realtime từ nguồn chính thức của xổ số miền Bắc, miền Nam, miền Trung. Hệ thống tự động đồng bộ dữ liệu mỗi khi có kết quả xổ số mới.'
                    },
                    {
                        question: 'Có thể xuất dữ liệu bảng thống kê chốt dàn không?',
                        answer: 'Có, bạn có thể xuất dữ liệu bảng thống kê chốt dàn ra file Excel, CSV, PDF hoặc xuất ảnh chất lượng cao để chia sẻ trên mạng xã hội. Hỗ trợ nhiều định dạng khác nhau.'
                    },
                    {
                        question: 'Dữ liệu thống kê chốt dàn có chính xác không?',
                        answer: 'Tất cả dữ liệu bảng thống kê chốt dàn được kiểm tra và xác thực từ nguồn chính thức của xổ số 3 miền, đảm bảo tính chính xác 100%. Dữ liệu được cập nhật liên tục và kiểm tra tự động.'
                    },
                    {
                        question: 'Làm thế nào để lập bảng thống kê chốt dàn hiệu quả?',
                        answer: 'Sử dụng công cụ lập bảng thống kê chốt dàn 3 miền để theo dõi xu hướng, phân tích tần suất xuất hiện, xác định số nóng/lạnh, từ đó tối ưu chiến lược chơi dàn đề và tăng tỷ lệ trúng.'
                    },
                    {
                        question: 'Thống kê chốt dàn 3 miền có khác nhau không?',
                        answer: 'Có, mỗi miền có đặc điểm riêng: Miền Bắc xổ hàng ngày, Miền Nam 3 lần/tuần, Miền Trung 2 lần/tuần. Bảng thống kê phân tích riêng từng miền và so sánh tổng thể.'
                    },
                    {
                        question: 'Có thể lưu trữ bảng thống kê chốt dàn không?',
                        answer: 'Có, bạn có thể lưu trữ bảng thống kê chốt dàn vào tài khoản cá nhân, xuất file để lưu trữ offline, hoặc chia sẻ với bạn bè. Dữ liệu được bảo mật và đồng bộ trên mọi thiết bị.'
                    }
                ]}
            />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.container}>
                    {/* Mobile Navbar */}
                    <MobileNavbar currentPage="thong-ke" showCurrentPageItems={false} />

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <div className={styles.headerLeft}>
                                <BarChart3 className={styles.headerIcon} />
                                <div>
                                    <h1 className={styles.title}>Lập Bảng Thống Kê Chốt Dàn 3 Miền - Tôn Ngộ Không</h1>
                                    <p className={styles.subtitle}>
                                        Công cụ lập bảng thống kê chốt dàn 3 miền chuyên nghiệp - Theo dõi kết quả và xu hướng xổ số - Thương hiệu Tôn Ngộ Không
                                    </p>
                                </div>
                            </div>
                            <div className={styles.headerActions}>
                                {/* Chỉ giữ lại thông tin cơ bản */}
                            </div>
                        </div>

                    </div>

                    {/* Month Tabs */}
                    <div className={styles.monthTabs}>
                        <div className={styles.tabsContainer}>
                            <button
                                className={`${styles.monthTab} ${activeMonth === 'current' ? styles.activeTab : ''}`}
                                onClick={() => switchMonth('current')}
                                disabled={loading}
                            >
                                <span className={styles.tabLabel}>Tháng hiện tại</span>
                                <span className={styles.tabSubLabel}>
                                    {getCurrentMonthRange.title}
                                </span>
                            </button>
                            <button
                                className={`${styles.monthTab} ${activeMonth === 'previous' ? styles.activeTab : ''}`}
                                onClick={() => switchMonth('previous')}
                                disabled={loading}
                            >
                                <span className={styles.tabLabel}>Tháng trước</span>
                                <span className={styles.tabSubLabel}>
                                    {getPreviousMonthRange.title}
                                </span>
                            </button>
                        </div>
                        <div className={styles.tabIndicator}>
                            <span className={styles.currentTitle}>
                                {data?.title || 'Đang tải...'}
                            </span>
                        </div>
                    </div>

                    {/* Summary Cards - Safe lazy loaded */}
                    <SafeSummaryCards summary={data?.summary} />

                    {/* Action Bar - Ngay trên bảng thống kê */}
                    <div className={styles.actionBar}>
                        <div className={styles.actionBarLeft}>
                            <button
                                className={styles.filterButton}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={16} />
                                Bộ lọc
                            </button>
                            <button
                                className={styles.refreshButton}
                                onClick={fetchData}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                                Cập nhập
                            </button>
                        </div>
                        <div className={styles.actionBarRight}>
                            <div className={styles.addDateSection}>
                                {showAddDateInput ? (
                                    <div className={styles.addDateInputGroup}>
                                        <input
                                            type="text"
                                            value={addDateInput}
                                            onChange={(e) => setAddDateInput(e.target.value)}
                                            onKeyDown={handleAddDateKeyPress}
                                            placeholder="VD: 30/09 hoặc 30-09"
                                            className={styles.addDateInput}
                                            autoFocus
                                            maxLength={5}
                                        />
                                        <button
                                            className={styles.addDateConfirm}
                                            onClick={addNewDateRow}
                                            title="Thêm ngày"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            className={styles.addDateCancel}
                                            onClick={() => {
                                                setAddDateInput('');
                                                setShowAddDateInput(false);
                                            }}
                                            title="Hủy"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.addDateButton}
                                        onClick={() => setShowAddDateInput(true)}
                                        disabled={!data}
                                        title="Thêm ngày mới"
                                    >
                                        <Plus size={16} />
                                        Thêm ngày
                                    </button>
                                )}
                            </div>
                            <button
                                className={styles.saveButton}
                                onClick={openSaveModal}
                                disabled={!data}
                            >
                                <Save size={16} />
                                Lưu dữ liệu thống kê
                            </button>
                            <button
                                className={styles.loadButton}
                                onClick={openLoadModal}
                            >
                                <FolderOpen size={16} />
                                Mở file đã lưu
                            </button>
                            <button
                                className={styles.exportButton}
                                onClick={() => setShowExportOptions(!showExportOptions)}
                                disabled={!data}
                            >
                                <Settings size={16} />
                                Xuất hình ảnh
                            </button>
                        </div>
                    </div>

                    {/* Filters - Di chuyển xuống */}
                    {showFilters && (
                        <div className={styles.filters}>
                            <div className={styles.filterRow}>
                                <div className={styles.filterGroup}>
                                    <label>Từ ngày:</label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className={styles.filterInput}
                                    />
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Đến ngày:</label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className={styles.filterInput}
                                    />
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Số bản ghi:</label>
                                    <select
                                        value={filters.limit}
                                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                                        className={styles.filterSelect}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={30}>30</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                                <div className={styles.filterActions}>
                                    <button onClick={applyFilters} className={styles.applyButton}>
                                        Áp dụng
                                    </button>
                                    <button onClick={resetFilters} className={styles.resetButton}>
                                        Đặt lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Export Options - Memoized Component */}
                    <ExportOptions
                        showExportOptions={showExportOptions}
                        userName={userName}
                        setUserName={setUserName}
                        exportPreset={exportPreset}
                        exportWidth={exportWidth}
                        facebookPresets={facebookPresets}
                        handlePresetChange={handlePresetChange}
                        setExportWidth={setExportWidth}
                        exportToImage={exportToImage}
                        exportToCSV={exportToCSV}
                        isExporting={isExporting}
                        data={data}
                    />

                    {/* Main Content - Safe lazy loaded */}
                    <div className={styles.content}>
                        <SafeStatisticsTable
                            data={data}
                            loading={loading}
                            error={error}
                            onRetry={fetchData}
                            onSave={saveStatistics}
                            onDelete={deleteDateRow}
                        />
                    </div>

                    {/* Hidden Export Table - Lazy loaded */}
                    <div style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '0',
                        width: '1200px', // Fixed width for consistent export
                        height: 'auto',
                        visibility: 'hidden',
                        opacity: '0',
                        pointerEvents: 'none',
                        zIndex: '-1',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Suspense fallback={<div>Loading export table...</div>}>
                            {data && (
                                <ExportableTable
                                    ref={exportTableRef}
                                    data={data}
                                    title={`THỐNG KÊ 3 MIỀN - ${data?.title || ''}`}
                                    userDisplayName={userName}
                                    exportMode="image"
                                />
                            )}
                        </Suspense>
                    </div>

                    {/* Auth Modal - Memoized Component */}
                    {AuthModal}
                </div>
            </Layout>
        </>
    );
}

// Wrap with memo for performance optimization
export default memo(ThongKePage);
