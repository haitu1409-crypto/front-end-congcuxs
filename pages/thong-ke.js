/**
 * Trang Thống Kê 3 Miền
 * Hiển thị bảng thống kê kết quả xổ số 3 miền
 */

import { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEOOptimized from '../components/SEOOptimized';
// Tối ưu import icons - chỉ import những icon cần thiết
import { BarChart3, RefreshCw, Filter, Download, ImageIcon, Settings, Save, FolderOpen, Plus, Check, X } from 'lucide-react';
import styles from '../styles/ThongKe.module.css';
import { API_CONFIG } from '../config/api';
import apiService from '../services/apiService';
// Import safe lazy components với Error Boundary
import {
    SafeStatisticsTable,
    SafeSummaryCards,
    ComponentLoader,
    DefaultLoadingSpinner
} from '../components/LazyComponents';
// Lazy load components để tối ưu bundle size - chỉ load khi cần
const ExportableTable = lazy(() => import('../components/ThongKe/ExportableTable'));

export default function ThongKePage() {
    const router = useRouter();
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

    // Add date states
    const [addDateInput, setAddDateInput] = useState('');
    const [showAddDateInput, setShowAddDateInput] = useState(false);

    // Refs
    const exportTableRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // Facebook size presets - được memoize để tránh tạo lại object
    const facebookPresets = useMemo(() => ({
        'facebook-post': {
            width: 1200,
            name: 'Facebook Post',
            description: '1200px - Tối ưu cho bài đăng Facebook',
            ratio: 'Tự động'
        },
        'facebook-story': {
            width: 1080,
            name: 'Facebook Story',
            description: '1080px - Phù hợp cho Story Facebook',
            ratio: '9:16'
        },
        'facebook-cover': {
            width: 1640,
            name: 'Facebook Cover',
            description: '1640px - Ảnh bìa Facebook',
            ratio: '16:9'
        },
        'facebook-event': {
            width: 1920,
            name: 'Facebook Event',
            description: '1920px - Ảnh sự kiện Facebook',
            ratio: '16:9'
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

        const result = await apiService.getThongKe3Mien(params);

        if (result.success) {
            return { ...result.data, title: monthRange.title };
        } else {
            throw new Error(result.message || 'Lỗi không xác định');
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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchMonthData, getCurrentMonthRange, getPreviousMonthRange]); // Phụ thuộc vào các function và objects đã memoize

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchData();
    }, []);

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
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Áp dụng filter
    const applyFilters = () => {
        fetchData();
        setShowFilters(false);
    };

    // Reset filter
    const resetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            limit: 30
        });
    };

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

    // Xuất ảnh - Simplified version
    const exportToImage = async () => {
        if (!data || !exportTableRef.current) return;

        try {
            setIsExporting(true);

            // Simple export using html2canvas
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(exportTableRef.current, {
                width: exportWidth,
                height: 'auto',
                scale: 1,
                useCORS: true,
                allowTaint: true
            });

            // Download image
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            const userPrefix = userName.trim() ? `${userName.trim()}-` : '';
            const filename = `${userPrefix}thong-ke-3-mien-${dateStr}.png`;

            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();

            alert(`Xuất ảnh thành công! Kích thước: ${canvas.width}x${canvas.height}px`);
        } catch (error) {
            alert('Lỗi khi xuất ảnh: ' + error.message);
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
    const openSaveModal = () => {
        setAuthMode('save');
        setAuthData({ username: '', password: '' });
        setShowAuthModal(true);
    };

    // Mở modal tải dữ liệu
    const openLoadModal = () => {
        setAuthMode('load');
        setAuthData({ username: '', password: '' });
        setShowAuthModal(true);
    };

    // Đóng modal - được memoize
    const closeAuthModal = useCallback(() => {
        setShowAuthModal(false);
        setAuthData({ username: '', password: '' });
        setAuthLoading(false);
    }, []);

    // Xử lý thay đổi input trong modal
    const handleAuthInputChange = (field, value) => {
        setAuthData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Lưu dữ liệu thống kê - sử dụng apiService
    const saveStatisticsData = useCallback(async () => {
        if (!data || !authData.username.trim() || !authData.password.trim()) {
            alert('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
            return;
        }

        if (authData.password.length !== 6 || !/^\d{6}$/.test(authData.password)) {
            alert('Mật khẩu phải là 6 chữ số');
            return;
        }

        try {
            setAuthLoading(true);

            const saveData = {
                username: authData.username.trim(),
                password: authData.password,
                data: data,
                userDisplayName: userName,
                savedAt: new Date().toISOString()
            };

            const result = await apiService.saveStatistics(saveData);

            if (result.success) {
                alert('Lưu dữ liệu thành công!');
                closeAuthModal();
            } else {
                throw new Error(result.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            alert('Lỗi khi lưu dữ liệu: ' + err.message);
        } finally {
            setAuthLoading(false);
        }
    }, [data, authData, userName, closeAuthModal]); // Phụ thuộc vào các giá trị cần thiết

    // Tải dữ liệu thống kê - sử dụng apiService
    const loadStatisticsData = useCallback(async () => {
        if (!authData.username.trim() || !authData.password.trim()) {
            alert('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
            return;
        }

        if (authData.password.length !== 6 || !/^\d{6}$/.test(authData.password)) {
            alert('Mật khẩu phải là 6 chữ số');
            return;
        }

        try {
            setAuthLoading(true);

            const credentials = {
                username: authData.username.trim(),
                password: authData.password
            };

            const result = await apiService.loadStatistics(credentials);

            if (result.success) {
                setData(result.data.data);
                setUserName(result.data.userDisplayName || '');
                alert('Tải dữ liệu thành công!');
                closeAuthModal();
            } else {
                throw new Error(result.message || 'Tài khoản hoặc mật khẩu không đúng');
            }
        } catch (err) {
            console.error('Lỗi khi tải:', err);
            alert('Lỗi khi tải dữ liệu: ' + err.message);
        } finally {
            setAuthLoading(false);
        }
    }, [authData, closeAuthModal]); // Phụ thuộc vào authData và closeAuthModal

    // Xử lý submit modal
    const handleAuthSubmit = () => {
        if (authMode === 'save') {
            saveStatisticsData();
        } else {
            loadStatisticsData();
        }
    };

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
    const handleAddDateKeyPress = (e) => {
        if (e.key === 'Enter') {
            addNewDateRow();
        } else if (e.key === 'Escape') {
            setAddDateInput('');
            setShowAddDateInput(false);
        }
    };

    // Delete date row
    const deleteDateRow = (dateToDelete, displayDate) => {
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
    };

    return (
        <Layout>
            <SEOOptimized 
                pageType="thong-ke"
                breadcrumbs={[
                    { name: 'Trang chủ', url: siteUrl },
                    { name: 'Thống Kê', url: `${siteUrl}/thong-ke` }
                ]}
                faq={[
                    {
                        question: 'Thống kê được cập nhật như thế nào?',
                        answer: 'Dữ liệu thống kê được cập nhật realtime từ nguồn chính thức của xổ số 3 miền.'
                    },
                    {
                        question: 'Có thể xuất dữ liệu thống kê không?',
                        answer: 'Có, bạn có thể xuất dữ liệu ra file Excel hoặc lưu vào bộ nhớ tạm.'
                    },
                    {
                        question: 'Dữ liệu có chính xác không?',
                        answer: 'Tất cả dữ liệu được kiểm tra và xác thực từ nguồn chính thức, đảm bảo tính chính xác 100%.'
                    }
                ]}
            />

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <BarChart3 className={styles.headerIcon} />
                            <div>
                                <h1 className={styles.title}>Bảng Thống Kê 3 Miền - Tôn Ngộ Không</h1>
                                <p className={styles.subtitle}>
                                    Theo dõi kết quả và xu hướng xổ số 3 miền - Thương hiệu Tôn Ngộ Không
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

                {/* Export Options - Compact Design */}
                {showExportOptions && (
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
                                            {preset.name} ({preset.width}px)
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
                                {exportWidth}px × Auto
                            </div>
                        </div>
                    </div>
                )}

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
                    position: 'fixed',
                    left: '-100vw',
                    top: '0',
                    width: 'max-content',
                    height: 'max-content',
                    visibility: 'hidden',
                    opacity: '0',
                    pointerEvents: 'none',
                    zIndex: '-1'
                }}>
                    <Suspense fallback={<div>Loading export table...</div>}>
                        <ExportableTable
                            ref={exportTableRef}
                            data={data}
                            title={`THỐNG KÊ 3 MIỀN - ${data?.title || ''}`}
                            userDisplayName={userName}
                        />
                    </Suspense>
                </div>

                {/* Auth Modal */}
                {showAuthModal && (
                    <div className={styles.modalOverlay} onClick={closeAuthModal}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                                        type="text"
                                        value={authData.username}
                                        onChange={(e) => handleAuthInputChange('username', e.target.value)}
                                        placeholder="VD: nguyenvana"
                                        className={styles.modalInput}
                                        disabled={authLoading}
                                        maxLength={50}
                                    />
                                </div>

                                <div className={styles.modalInputGroup}>
                                    <label>Mật khẩu (6 chữ số):</label>
                                    <input
                                        type="password"
                                        value={authData.password}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            handleAuthInputChange('password', value);
                                        }}
                                        placeholder="123456"
                                        className={styles.modalInput}
                                        disabled={authLoading}
                                        maxLength={6}
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
                                    disabled={authLoading || !authData.username.trim() || authData.password.length !== 6}
                                >
                                    {authLoading ? 'Đang xử lý...' : (authMode === 'save' ? 'Lưu' : 'Tải')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
