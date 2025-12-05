/**
 * Thống Kê Dàn - Admin Page
 * Trang thống kê dàn đơn giản cho admin
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { ArrowLeft, Plus, Play, UserPlus, X, List, BarChart3 } from 'lucide-react';
import styles from '../../styles/ThongKeDan.module.css';

export default function ThongKeDan() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [caoThuList, setCaoThuList] = useState([]);
    const [newCaoThu, setNewCaoThu] = useState('');
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultData, setResultData] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [listData, setListData] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsData, setStatsData] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDateForList, setSelectedDateForList] = useState('');

    // Helper function để format ngày theo local time (YYYY-MM-DD)
    const getTodayString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    // Helper function để format Date object thành string YYYY-MM-DD theo local time
    const formatDateToString = (date) => {
        if (!date) return getTodayString();
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Check authentication
    useEffect(() => {
        const checkAuth = () => {
            const isAuth = localStorage.getItem('admin_authenticated') === 'true';
            const authTime = localStorage.getItem('admin_auth_time');
            const currentTime = Date.now();

            if (isAuth && authTime && (currentTime - parseInt(authTime)) < 24 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                router.push('/admin');
            }
            setCheckingAuth(false);
        };

        checkAuth();
    }, [router]);

    // Fetch data
    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            fetchCaoThuList();
        }
    }, [isAuthenticated]);

    const fetchCaoThuList = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan/cao-thu-list?password=141920`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                setCaoThuList(result.data.caoThuList || []);
            }
        } catch (error) {
            console.error('Error fetching cao thủ list:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            // Tính ngày hiện tại theo local time (không dùng UTC)
            const todayStr = getTodayString();
            const todayObj = new Date(todayStr);
            todayObj.setHours(0, 0, 0, 0);
            
            // Sử dụng password authentication thay vì token
            const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan?password=141920&limit=1000`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                // Chỉ lấy records của ngày hiện tại, group theo cao thủ để chỉ hiển thị 1 dòng cho mỗi cao thủ
                const recordsByCaoThu = {};
                result.data.rows.forEach(row => {
                    if (!row.tenCaoThu) return; // Bỏ qua records không có cao thủ
                    
                    // Format ngày từ database theo local time
                    const rowDate = row.ngay ? formatDateToString(row.ngay) : todayStr;
                    const rowDateObj = new Date(rowDate);
                    rowDateObj.setHours(0, 0, 0, 0);
                    
                    // Chỉ lấy records của ngày hiện tại
                    if (rowDateObj.getTime() !== todayObj.getTime()) {
                        return;
                    }
                    
                    const caoThu = row.tenCaoThu;
                    
                    // Chỉ giữ record mới nhất hoặc có nhapDan cho mỗi cao thủ
                    if (!recordsByCaoThu[caoThu]) {
                        recordsByCaoThu[caoThu] = row;
                    } else {
                        // Ưu tiên record có nhapDan, nếu không thì lấy record mới nhất
                        const existing = recordsByCaoThu[caoThu];
                        const existingDate = existing.updatedAt ? new Date(existing.updatedAt) : new Date(0);
                        const currentDate = row.updatedAt ? new Date(row.updatedAt) : new Date(0);
                        
                        if (row.nhapDan && row.nhapDan.trim() && (!existing.nhapDan || !existing.nhapDan.trim())) {
                            recordsByCaoThu[caoThu] = row;
                        } else if (currentDate > existingDate) {
                            recordsByCaoThu[caoThu] = row;
                        }
                    }
                });
                
                // Chuyển đổi recordsByCaoThu thành mảng và format
                const formattedRows = Object.values(recordsByCaoThu).map((row, index) => {
                    const rowDate = row.ngay ? new Date(row.ngay).toISOString().split('T')[0] : todayStr;
                    
                    // Load dàn từ record (chỉ cho ngày hiện tại)
                    let nhapDan = '';
                    if (row.nhapDan && row.nhapDan.trim()) {
                        nhapDan = row.nhapDan;
                    } else if (row.groups && row.groups.length > 0) {
                        // Tái tạo nhapDan từ groups
                        const nhapDanParts = row.groups.map(group => {
                            const label = group.label || group.rawLabel || '';
                            const numbers = Array.isArray(group.numbers) ? group.numbers : [];
                            return label + ' ' + numbers.join(' ');
                        }).filter(Boolean);
                        nhapDan = nhapDanParts.join('  ').trim();
                    } else if (row.dan && row.dan.length > 0) {
                        nhapDan = row.dan.join(' ');
                    }
                    
                    return {
                        id: row._id || `temp-${index}`,
                        nhapDan: nhapDan,
                        ngay: todayStr, // Luôn là ngày hiện tại
                        tenCaoThu: row.tenCaoThu || ''
                    };
                });
                
                if (formattedRows.length === 0) {
                    // Nếu không có dữ liệu, tạo một dòng trống với ngày hiện tại
                    formattedRows.push({
                        id: 'temp-1',
                        nhapDan: '',
                        ngay: todayStr,
                        tenCaoThu: ''
                    });
                }
                
                setRows(formattedRows);
            } else {
                // Nếu lỗi hoặc không có dữ liệu, tạo một dòng trống
                setRows([{
                    id: 'temp-1',
                    nhapDan: '',
                    ngay: getTodayString(),
                    tenCaoThu: ''
                }]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Nếu lỗi, tạo một dòng trống
            setRows([{
                id: 'temp-1',
                nhapDan: '',
                ngay: getTodayString(),
                tenCaoThu: ''
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        const newRow = {
            id: `temp-${Date.now()}-${Math.random()}`,
            nhapDan: '',
            ngay: getTodayString(),
            tenCaoThu: ''
        };
        setRows([...rows, newRow]);
    };

    const handleInputChange = async (id, field, value) => {
        const updatedRows = rows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updatedRows);
        
        // Nếu thay đổi cao thủ hoặc ngày, tự động load dàn từ database
        if (field === 'tenCaoThu' || field === 'ngay') {
            const row = updatedRows.find(r => r.id === id);
            if (row && row.tenCaoThu && row.ngay) {
                await loadDanForRow(id, row.tenCaoThu, row.ngay);
            }
        }
    };
    
    const loadDanForRow = async (rowId, tenCaoThu, ngay) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const dateObj = new Date(ngay);
            dateObj.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateObj);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Tìm dàn của cao thủ này trong ngày này
            const response = await fetch(
                `${apiUrl}/api/admin/thong-ke-dan?password=141920&tenCaoThu=${encodeURIComponent(tenCaoThu)}&limit=1000`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const result = await response.json();
            
            if (result.success && result.data && result.data.rows) {
                // Tìm record có ngày trùng với ngày đã chọn
                const matchingRecord = result.data.rows.find(record => {
                    const recordDate = new Date(record.ngay);
                    recordDate.setHours(0, 0, 0, 0);
                    return recordDate.getTime() === dateObj.getTime();
                });
                
                let nhapDanToLoad = '';
                
                if (matchingRecord) {
                    if (matchingRecord.nhapDan && matchingRecord.nhapDan.trim()) {
                        // Có dàn đã nhập, load vào input
                        nhapDanToLoad = matchingRecord.nhapDan;
                    } else if (matchingRecord.groups && matchingRecord.groups.length > 0) {
                        // Không có nhapDan nhưng có groups, tái tạo nhapDan từ groups
                        const nhapDanParts = matchingRecord.groups.map(group => {
                            const label = group.label || group.rawLabel || '';
                            const numbers = Array.isArray(group.numbers) ? group.numbers : [];
                            return label + ' ' + numbers.join(' ');
                        }).filter(Boolean);
                        nhapDanToLoad = nhapDanParts.join('  ').trim();
                    } else if (matchingRecord.dan && matchingRecord.dan.length > 0) {
                        // Chỉ có dan, hiển thị dan
                        nhapDanToLoad = matchingRecord.dan.join(' ');
                    }
                    
                    // Cập nhật state với functional update để đảm bảo state mới nhất
                    if (nhapDanToLoad) {
                        setRows(prevRows => prevRows.map(row => 
                            row.id === rowId ? { ...row, nhapDan: nhapDanToLoad } : row
                        ));
                    }
                }
                // Nếu không tìm thấy, giữ nguyên (để trống)
            }
        } catch (error) {
            console.error('Error loading dan for row:', error);
            // Không hiển thị lỗi, chỉ log
        }
    };

    const handleSave = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // Format rows để gửi lên server
            const rowsToSave = rows.map(row => ({
                id: row.id && !row.id.startsWith('temp-') ? row.id : undefined,
                nhapDan: row.nhapDan || '',
                ngay: row.ngay || getTodayString(),
                tenCaoThu: row.tenCaoThu || '',
                password: '141920' // Thêm password vào body
            }));

            const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan/multiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rows: rowsToSave, password: '141920' })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Đã lưu ${result.data.saved} bản ghi thành công`);
                
                // Reset các input "Nhập dàn" về trống sau khi lưu
                setRows(rows.map(row => ({
                    ...row,
                    nhapDan: '' // Reset input nhập dàn về trống
                })));
                
                // Reload data và danh sách cao thủ
                fetchData();
                fetchCaoThuList();
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lưu dữ liệu'));
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Lỗi khi lưu dữ liệu');
        }
    };

    const formatDataForModal = (rows) => {
        const formattedData = rows
            .map(row => ({
                ...row,
                dateObj: row.ngay ? new Date(row.ngay) : new Date(0)
            }))
            .sort((a, b) => {
                // Sắp xếp theo ngày mới nhất trước, sau đó theo STT
                const dateDiff = b.dateObj - a.dateObj;
                if (dateDiff !== 0) return dateDiff;
                return (a.stt || 0) - (b.stt || 0);
            })
            .map((row, index) => {
                let ngayFormatted = '';
                if (row.ngay) {
                    try {
                        const date = new Date(row.ngay);
                        if (!isNaN(date.getTime())) {
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            ngayFormatted = `${day}/${month}/${year}`;
                        }
                    } catch (e) {
                        ngayFormatted = '';
                    }
                }
                
                // Format dàn: hiển thị các tiêu đề (labels) từ groups thay vì danh sách số
                let danFormatted = '';
                if (row.groups && Array.isArray(row.groups) && row.groups.length > 0) {
                    // Lấy các labels từ groups và format
                    const labels = row.groups.map(group => {
                        if (group.label) {
                            // Nếu là chạm, hiển thị đầy đủ label
                            if (group.groupType === 'cham') {
                                return group.label;
                            }
                            // Nếu không phải chạm, chỉ hiển thị label
                            return group.label;
                        }
                        return null;
                    }).filter(Boolean);
                    
                    if (labels.length > 0) {
                        danFormatted = labels.join(', ');
                    } else {
                        // Fallback: nếu không có groups, hiển thị số lượng số
                        const count = row.dan ? row.dan.length : 0;
                        if (count > 0) {
                            // Xác định label dựa trên số lượng
                            let label = '0X';
                            if (count === 1) label = 'BTĐ';
                            else if (count === 2) label = 'STĐ';
                            else if (count === 4) label = 'TTĐ';
                            else if (count <= 9) label = '0X';
                            else if (count <= 19) label = '1X';
                            else if (count <= 29) label = '2X';
                            else if (count <= 39) label = '3X';
                            else if (count <= 49) label = '4X';
                            else if (count <= 59) label = '5X';
                            else if (count <= 69) label = '6X';
                            else if (count <= 79) label = '7X';
                            else if (count <= 89) label = '8X';
                            else label = '9X';
                            danFormatted = label;
                        }
                    }
                } else if (row.dan && row.dan.length > 0) {
                    // Fallback: nếu không có groups, xác định label dựa trên số lượng
                    const count = row.dan.length;
                    let label = '0X';
                    if (count === 1) label = 'BTĐ';
                    else if (count === 2) label = 'STĐ';
                    else if (count === 4) label = 'TTĐ';
                    else if (count <= 9) label = '0X';
                    else if (count <= 19) label = '1X';
                    else if (count <= 29) label = '2X';
                    else if (count <= 39) label = '3X';
                    else if (count <= 49) label = '4X';
                    else if (count <= 59) label = '5X';
                    else if (count <= 69) label = '6X';
                    else if (count <= 79) label = '7X';
                    else if (count <= 89) label = '8X';
                    else label = '9X';
                    danFormatted = label;
                }
                
                // Format kết quả: hiển thị tiêu đề dàn trúng (ví dụ: "3X", "1X") thay vì số kết quả
                let ketQuaFormatted = '';
                if (row.ghiChu) {
                    // Nếu có ghi chú, extract label từ ghiChu
                    if (row.ghiChu.startsWith('Trúng:')) {
                        // Trúng: 3X -> hiển thị "3X"
                        ketQuaFormatted = row.ghiChu.replace('Trúng:', '').trim();
                    } else if (row.ghiChu === 'Trượt') {
                        // Trượt -> hiển thị "Trượt"
                        ketQuaFormatted = 'Trượt';
                    } else {
                        ketQuaFormatted = row.ghiChu;
                    }
                } else if (row.ketQua && Array.isArray(row.ketQua) && row.ketQua.length > 0) {
                    // Có số trúng nhưng không có ghiChu - tìm label từ groups
                    // Tìm group nào chứa số trúng
                    if (row.groups && Array.isArray(row.groups) && row.groups.length > 0) {
                        const matchedNumber = row.ketQua[0];
                        const matchedGroup = row.groups.find(group => {
                            const numbers = Array.isArray(group.numbers) ? group.numbers : [];
                            return numbers.includes(matchedNumber);
                        });
                        if (matchedGroup && matchedGroup.label) {
                            ketQuaFormatted = matchedGroup.label;
                        } else {
                            // Fallback: hiển thị số trúng nếu không tìm thấy label
                            ketQuaFormatted = row.ketQua.join(', ');
                        }
                    } else {
                        // Fallback: hiển thị số trúng
                        ketQuaFormatted = row.ketQua.join(', ');
                    }
                } else {
                    // Không có ketQua và không có ghiChu - chưa có kết quả xổ số
                    ketQuaFormatted = '...';
                }
                
                return {
                    stt: index + 1,
                    ngay: ngayFormatted,
                    caoThu: row.tenCaoThu || '',
                    diemSo: row.diemSo || 0,
                    dan: danFormatted,
                    ketQua: ketQuaFormatted
                };
            });
        
        return formattedData;
    };

    const handleViewList = async () => {
        try {
            setLoadingList(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // Xây dựng query string với filter ngày nếu có
            let queryString = 'password=141920&limit=1000';
            if (selectedDateForList) {
                queryString += `&ngay=${encodeURIComponent(selectedDateForList)}`;
            }

            // Lấy dữ liệu thống kê dàn (có filter theo ngày nếu được chọn)
            let allRows = [];
            let page = 1;
            let hasMore = true;

            // Lấy tất cả dữ liệu bằng cách paginate
            while (hasMore) {
                const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan?${queryString}&page=${page}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success && result.data) {
                    allRows = [...allRows, ...result.data.rows];
                    
                    // Kiểm tra xem còn trang nào không
                    if (result.data.pagination && page >= result.data.pagination.pages) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            if (allRows.length > 0) {
                const formattedData = formatDataForModal(allRows);
                setListData(formattedData);
                setShowListModal(true);
            } else {
                alert(selectedDateForList ? `Chưa có dữ liệu nào cho ngày ${selectedDateForList}` : 'Chưa có dữ liệu nào');
            }
        } catch (error) {
            console.error('Error fetching list:', error);
            alert('Lỗi khi lấy danh sách');
        } finally {
            setLoadingList(false);
        }
    };

    const handleRunResult = async () => {
        try {
            setLoadingResults(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // Gọi API chạy đối chiếu kết quả
            // Nếu có chọn ngày, chỉ chạy đối chiếu cho ngày đó
            const requestBody = { password: '141920' };
            if (selectedDate) {
                requestBody.ngay = selectedDate;
            }
            
            const runResponse = await fetch(`${apiUrl}/api/admin/thong-ke-dan/run-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const runResult = await runResponse.json();

            if (runResult.success) {
                const processedCount = runResult.data?.processed || runResult.data?.totalRecords || 0;
                
                // Nếu có results từ runResult, sử dụng luôn thay vì query lại
                if (runResult.data?.results && runResult.data.results.length > 0) {
                    console.log('Using results from runResult:', runResult.data.results);
                    const formattedResults = formatDataForModal(runResult.data.results);
                    console.log('Formatted results:', formattedResults);
                    
                    setResultData(formattedResults);
                    setShowResultModal(true);
                    alert(`Đã chạy đối chiếu kết quả cho ${processedCount} bản ghi`);
                } else {
                    // Nếu không có results, query lại từ database
                    const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan?password=141920&limit=1000`, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await response.json();

                    if (result.success && result.data) {
                        // Format dữ liệu để hiển thị trong modal - lấy tất cả các bản ghi đã được xử lý
                        // (bao gồm cả những bản ghi chưa có kết quả xổ số)
                        console.log('Raw data from API:', result.data.rows);
                        const formattedResults = formatDataForModal(result.data.rows);
                        console.log('Formatted results:', formattedResults);

                        setResultData(formattedResults);
                        setShowResultModal(true);
                        
                        alert(`Đã chạy đối chiếu kết quả cho ${processedCount} bản ghi`);
                    } else {
                        alert('Lỗi: ' + (result.message || 'Không thể lấy dữ liệu kết quả'));
                    }
                }
            } else {
                alert('Lỗi: ' + (runResult.message || 'Không thể chạy đối chiếu kết quả'));
            }
        } catch (error) {
            console.error('Error running result:', error);
            alert('Lỗi khi chạy đối chiếu kết quả');
        } finally {
            setLoadingResults(false);
        }
    };

    const handleViewStats = async () => {
        setLoadingStats(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan?password=141920&limit=1000`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success && result.data) {
                // Group data by cao thủ
                const groupedData = {};
                result.data.rows.forEach(row => {
                    const caoThu = row.tenCaoThu || 'Chưa có tên';
                    if (!groupedData[caoThu]) {
                        groupedData[caoThu] = [];
                    }
                    groupedData[caoThu].push(row);
                });

                // Format data for grid display
                const statsArray = Object.keys(groupedData).map(caoThu => ({
                    caoThu,
                    records: groupedData[caoThu].map(row => {
                        let ngayFormatted = '';
                        if (row.ngay) {
                            try {
                                const date = new Date(row.ngay);
                                if (!isNaN(date.getTime())) {
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    ngayFormatted = `${day}/${month}/${year}`;
                                }
                            } catch (e) {
                                ngayFormatted = '';
                            }
                        }

                        let danFormatted = '';
                        if (row.groups && row.groups.length > 0) {
                            const labels = row.groups.map(group => {
                                if (group.groupType === 'cham' && group.chamDigits && group.chamDigits.length > 0) {
                                    return `chạm ${group.chamDigits.join(',')}`;
                                }
                                return group.label || group.rawLabel;
                            }).filter(Boolean);
                            danFormatted = labels.join(', ');
                        } else if (row.dan && row.dan.length > 0) {
                            const count = row.dan.length;
                            let label = '0X';
                            if (count === 1) label = 'BTĐ';
                            else if (count === 2) label = 'STĐ';
                            else if (count === 4) label = 'TTĐ';
                            else if (count <= 9) label = '0X';
                            else if (count <= 19) label = '1X';
                            else if (count <= 29) label = '2X';
                            else if (count <= 39) label = '3X';
                            else if (count <= 49) label = '4X';
                            else if (count <= 59) label = '5X';
                            else if (count <= 69) label = '6X';
                            else if (count <= 79) label = '7X';
                            else if (count <= 89) label = '8X';
                            else label = '9X';
                            danFormatted = label;
                        }

                        // Format kết quả: hiển thị tiêu đề dàn trúng (ví dụ: "3X", "1X") thay vì số kết quả
                        let ketQuaFormatted = '';
                        let ketQuaLabel = '';
                        
                        if (row.ghiChu) {
                            // Nếu có ghi chú, extract label từ ghiChu
                            if (row.ghiChu.startsWith('Trúng:')) {
                                // Trúng: 3X -> hiển thị "3X"
                                ketQuaLabel = row.ghiChu.replace('Trúng:', '').trim();
                                ketQuaFormatted = ketQuaLabel;
                            } else if (row.ghiChu === 'Trượt') {
                                // Trượt -> hiển thị "Trượt"
                                ketQuaFormatted = 'Trượt';
                                ketQuaLabel = '';
                            } else {
                                ketQuaFormatted = row.ghiChu;
                            }
                        } else if (row.ketQua && Array.isArray(row.ketQua) && row.ketQua.length > 0) {
                            // Có số trúng nhưng không có ghiChu - tìm label từ groups
                            // Tìm group nào chứa số trúng
                            if (row.groups && Array.isArray(row.groups) && row.groups.length > 0) {
                                const matchedNumber = row.ketQua[0];
                                const matchedGroup = row.groups.find(group => {
                                    const numbers = Array.isArray(group.numbers) ? group.numbers : [];
                                    return numbers.includes(matchedNumber);
                                });
                                if (matchedGroup && matchedGroup.label) {
                                    ketQuaLabel = matchedGroup.label;
                                    ketQuaFormatted = ketQuaLabel;
                                } else {
                                    // Fallback: hiển thị số trúng nếu không tìm thấy label
                                    ketQuaFormatted = row.ketQua.join(', ');
                                }
                            } else {
                                // Fallback: hiển thị số trúng
                                ketQuaFormatted = row.ketQua.join(', ');
                            }
                        } else {
                            // Không có ketQua và không có ghiChu - chưa có kết quả xổ số
                            ketQuaFormatted = '...';
                        }

                        return {
                            ngay: ngayFormatted,
                            dan: danFormatted,
                            diemSo: row.diemSo || 0,
                            ketQua: ketQuaFormatted,
                            ghiChu: row.ghiChu || '',
                            ketQuaLabel: ketQuaLabel // Label của dàn trúng (ví dụ: "3X")
                        };
                    })
                }));

                setStatsData(statsArray);
                setShowStatsModal(true);
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lấy dữ liệu'));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            alert('Lỗi khi lấy thống kê');
        } finally {
            setLoadingStats(false);
        }
    };

    const handleAddCaoThu = async () => {
        if (newCaoThu.trim() === '') {
            alert('Vui lòng nhập tên cao thủ');
            return;
        }
        
        const caoThuName = newCaoThu.trim();
        
        if (caoThuList.includes(caoThuName)) {
            alert('Tên cao thủ đã tồn tại');
            return;
        }
        
        try {
            // Tự động thêm một row với tên cao thủ này để lưu vào database
            const newRow = {
                id: `temp-${Date.now()}-${Math.random()}`,
                nhapDan: '',
                ngay: getTodayString(),
                tenCaoThu: caoThuName
            };
            
            // Thêm vào local state để hiển thị ngay
            setRows([...rows, newRow]);
            setCaoThuList([...caoThuList, caoThuName]);
            setNewCaoThu('');
            
            // Tự động lưu vào database để cao thủ được lưu vĩnh viễn
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/admin/thong-ke-dan/multiple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rows: [{
                        nhapDan: '',
                        ngay: getTodayString(),
                        tenCaoThu: caoThuName
                    }], 
                    password: '141920'
                })
            });

            const result = await response.json();
            if (result.success) {
                // Reload danh sách cao thủ từ database
                fetchCaoThuList();
                // Reload data để cập nhật IDs
                fetchData();
            }
        } catch (error) {
            console.error('Error adding cao thủ:', error);
            // Vẫn thêm vào local state dù có lỗi
            setCaoThuList([...caoThuList, caoThuName]);
            setNewCaoThu('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddCaoThu();
        }
    };

    if (checkingAuth) {
        return (
            <Layout>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Đang kiểm tra quyền truy cập...</p>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head>
                <title>Thống Kê Dàn - Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <Layout>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.container}>
                        <Link href="/admin" className={styles.backButton}>
                            <ArrowLeft size={20} />
                            <span>Quay lại Dashboard</span>
                        </Link>
                        <h1 className={styles.pageTitle}>Thống Kê Dàn</h1>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.container}>
                    <div className={styles.contentWrapper}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.addCaoThuSection}>
                                    <div className={styles.addCaoThuForm}>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên cao thủ"
                                            value={newCaoThu}
                                            onChange={(e) => setNewCaoThu(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className={styles.caoThuInput}
                                        />
                                        <button onClick={handleAddCaoThu} className={styles.addCaoThuButton}>
                                            <UserPlus size={18} />
                                            Thêm cao thủ
                                        </button>
                                    </div>
                                    {caoThuList.length > 0 && (
                                        <div className={styles.caoThuList}>
                                            <span className={styles.caoThuLabel}>Danh sách cao thủ:</span>
                                            <div className={styles.caoThuTags}>
                                                {caoThuList.map((name, index) => (
                                                    <span key={index} className={styles.caoThuTag}>
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.tableContainer}>
                                    <table className={styles.statsTable}>
                                        <thead>
                                            <tr>
                                                <th>Nhập dàn</th>
                                                <th>Ngày</th>
                                                <th>Tên cao thủ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row) => (
                                                <tr key={row.id}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.nhapDan}
                                                            onChange={(e) => handleInputChange(row.id, 'nhapDan', e.target.value)}
                                                            className={styles.tableInput}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            value={row.ngay || ''}
                                                            onChange={(e) => handleInputChange(row.id, 'ngay', e.target.value)}
                                                            className={styles.tableInput}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={row.tenCaoThu}
                                                            onChange={(e) => handleInputChange(row.id, 'tenCaoThu', e.target.value)}
                                                            className={styles.tableSelect}
                                                        >
                                                            <option value="">-- Chọn cao thủ --</option>
                                                            {caoThuList.map((name, index) => (
                                                                <option key={index} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={row.tenCaoThu}
                                                            onChange={(e) => handleInputChange(row.id, 'tenCaoThu', e.target.value)}
                                                            placeholder="Hoặc nhập tên"
                                                            className={styles.tableInput}
                                                            style={{ marginTop: '4px' }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={styles.buttonGroup}>
                                    <button onClick={handleAddRow} className={styles.addRowButton}>
                                        <Plus size={18} />
                                        Thêm dòng
                                    </button>
                                    <button onClick={handleSave} className={styles.saveButton}>
                                        Lưu
                                    </button>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="date"
                                            value={selectedDateForList}
                                            onChange={(e) => setSelectedDateForList(e.target.value)}
                                            className={styles.dateSelectInput}
                                            placeholder="Chọn ngày (tùy chọn)"
                                        />
                                        <button 
                                            onClick={handleViewList} 
                                            className={styles.viewListButton}
                                            disabled={loadingList}
                                        >
                                            <List size={18} />
                                            {loadingList ? 'Đang tải...' : 'Xem danh sách'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className={styles.dateSelectInput}
                                            placeholder="Chọn ngày (tùy chọn)"
                                        />
                                        <button 
                                            onClick={handleRunResult} 
                                            className={styles.runResultButton}
                                            disabled={loadingResults}
                                        >
                                            <Play size={18} />
                                            {loadingResults ? 'Đang tải...' : 'Chạy kết quả'}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleViewStats} 
                                        className={styles.statsButton}
                                        disabled={loadingStats}
                                    >
                                        <BarChart3 size={18} />
                                        {loadingStats ? 'Đang tải...' : 'Thống kê'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Modal */}
                {showStatsModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowStatsModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Thống Kê Theo Cao Thủ</h2>
                                <button 
                                    className={styles.modalCloseButton}
                                    onClick={() => setShowStatsModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {loadingStats ? (
                                    <div className={styles.loadingState}>
                                        <div className={styles.loadingSpinner}></div>
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                ) : statsData.length === 0 ? (
                                    <div className={styles.emptyResult}>
                                        <p>Chưa có dữ liệu nào</p>
                                    </div>
                                ) : (
                                    <div className={styles.statsGridContainer}>
                                        {statsData.map((item, index) => (
                                            <div key={index} className={styles.statsColumn}>
                                                <div className={styles.statsColumnHeader}>
                                                    {item.caoThu}
                                                </div>
                                                <div className={styles.statsColumnBody}>
                                                    {item.records.map((record, recordIndex) => (
                                                        <div key={recordIndex} className={styles.statsRecord}>
                                                            <div className={styles.statsRecordDate}>{record.ngay}</div>
                                                            <div className={styles.statsRecordResult}>
                                                                {record.ketQuaLabel || '-'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* List Modal */}
                {showListModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowListModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Danh Sách Thống Kê Dàn</h2>
                                <button 
                                    className={styles.modalCloseButton}
                                    onClick={() => setShowListModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {listData.length === 0 ? (
                                    <div className={styles.emptyResult}>
                                        <p>Chưa có dữ liệu nào</p>
                                    </div>
                                ) : (
                                    <div className={styles.resultTableContainer}>
                                        <table className={styles.resultTable}>
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Ngày</th>
                                                    <th>Cao thủ</th>
                                                    <th>Điểm số</th>
                                                    <th>Dàn</th>
                                                    <th>Kết quả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.stt}</td>
                                                        <td>{item.ngay}</td>
                                                        <td>{item.caoThu}</td>
                                                        <td>{item.diemSo}</td>
                                                        <td>{item.dan}</td>
                                                        <td>{item.ketQua}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Modal */}
                {showResultModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowResultModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Danh Sách Kết Quả</h2>
                                <button 
                                    className={styles.modalCloseButton}
                                    onClick={() => setShowResultModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {resultData.length === 0 ? (
                                    <div className={styles.emptyResult}>
                                        <p>Chưa có kết quả nào</p>
                                    </div>
                                ) : (
                                    <div className={styles.resultTableContainer}>
                                        <table className={styles.resultTable}>
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Ngày</th>
                                                    <th>Cao thủ</th>
                                                    <th>Điểm số</th>
                                                    <th>Dàn</th>
                                                    <th>Kết quả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.stt}</td>
                                                        <td>{item.ngay}</td>
                                                        <td>{item.caoThu}</td>
                                                        <td>{item.diemSo}</td>
                                                        <td>{item.dan}</td>
                                                        <td>{item.ketQua}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
}

