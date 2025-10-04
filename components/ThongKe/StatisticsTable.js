/**
 * Statistics Table Component
 * Component hiển thị bảng thống kê 3 miền
 */

import { useState, memo, useCallback } from 'react';
import { Calendar, BarChart3, Edit, Save, X, Trash2 } from 'lucide-react';
import styles from '../../styles/ThongKe.module.css';
import EditableCell from './EditableCell';

const StatisticsTable = memo(function StatisticsTable({ data, loading, error, onRetry, onSave, onDelete }) {
    const [editingRow, setEditingRow] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({}); // Trạng thái lưu cho từng row
    const [validationErrors, setValidationErrors] = useState({}); // Lỗi validation cho từng miền

    // Bắt đầu chỉnh sửa hàng - được memoize
    const startEdit = useCallback((row) => {
        setEditingRow(row.date);
        setEditData({
            mienNam: { ...row.mienNam },
            mienTrung: { ...row.mienTrung },
            mienBac: { ...row.mienBac }
        });
    }, []);

    // Hủy chỉnh sửa - được memoize
    const cancelEdit = useCallback(() => {
        setEditingRow(null);
        setEditData({});
        setValidationErrors({});
    }, []);

    // Kiểm tra có thể lưu không (không có lỗi validation)
    const canSave = Object.keys(validationErrors).length === 0;

    // Lưu thay đổi
    const saveEdit = async () => {
        if (!editingRow || !onSave || !canSave) return;

        try {
            setSaving(true);
            setSaveStatus(prev => ({ ...prev, [editingRow]: 'saving' }));

            await onSave(editingRow, editData);

            setSaveStatus(prev => ({ ...prev, [editingRow]: 'success' }));
            setEditingRow(null);
            setEditData({});

            // Xóa trạng thái success sau 2 giây
            setTimeout(() => {
                setSaveStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[editingRow];
                    return newStatus;
                });
            }, 2000);

        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            setSaveStatus(prev => ({ ...prev, [editingRow]: 'error' }));

            // Xóa trạng thái error sau 3 giây
            setTimeout(() => {
                setSaveStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[editingRow];
                    return newStatus;
                });
            }, 3000);
        } finally {
            setSaving(false);
        }
    };

    // Validation logic cho từng miền
    const validateRegion = useCallback((regionData) => {
        const hasDb = regionData.db && regionData.db.trim() !== '';
        const hasNhan = regionData.nhan && regionData.nhan.trim() !== '' && regionData.nhan.toLowerCase() !== 'đợi kết quả';

        // Nếu có một trong hai thì phải có cả hai
        if (hasDb && !hasNhan) {
            return 'Phải nhập cả Đặc Biệt và Nhận cùng lúc';
        }
        if (hasNhan && !hasDb) {
            return 'Phải nhập cả Đặc Biệt và Nhận cùng lúc';
        }

        return null; // Không có lỗi
    }, []);

    // Kiểm tra validation cho tất cả các miền
    const validateAllRegions = useCallback((data) => {
        const errors = {};

        ['mienNam', 'mienTrung', 'mienBac'].forEach(region => {
            const error = validateRegion(data[region] || {});
            if (error) {
                errors[region] = error;
            }
        });

        return errors;
    }, [validateRegion]);

    // Cập nhật giá trị ô - được memoize
    const updateCellValue = useCallback((region, field, value) => {
        setEditData(prev => {
            const newData = {
                ...prev,
                [region]: {
                    ...prev[region],
                    [field]: value
                }
            };

            // Validate ngay khi có thay đổi
            const errors = validateAllRegions(newData);
            setValidationErrors(errors);

            return newData;
        });
    }, [validateAllRegions]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingIcon}>
                    <BarChart3 size={48} />
                </div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>❌ {error}</p>
                <button onClick={onRetry} className={styles.retryButton}>
                    Thử lại
                </button>
            </div>
        );
    }

    if (!data || !data.statistics) {
        return (
            <div className={styles.error}>
                <p>Không có dữ liệu để hiển thị</p>
            </div>
        );
    }

    return (
        <>
            <div className={styles.tableContainer}>
                <table className={styles.statisticsTable}>
                    <thead>
                        <tr>
                            <th rowSpan={2} className={styles.dateHeader}>Ngày</th>
                            <th colSpan={2} className={styles.regionHeader}>Miền Nam</th>
                            <th colSpan={2} className={styles.regionHeader}>Miền Trung</th>
                            <th colSpan={2} className={styles.regionHeader}>Miền Bắc</th>
                            <th rowSpan={2} className={styles.actionHeader}>Thao tác</th>
                        </tr>
                        <tr>
                            <th className={styles.dbHeader}>Đặc Biệt</th>
                            <th className={styles.nhanHeader}>Nhận</th>
                            <th className={styles.dbHeader}>Đặc Biệt</th>
                            <th className={styles.nhanHeader}>Nhận</th>
                            <th className={styles.dbHeader}>Đặc Biệt</th>
                            <th className={styles.nhanHeader}>Nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.statistics.map((row, index) => {
                            const isEditing = editingRow === row.date;
                            const currentData = isEditing ? editData : row;
                            // Tính toán className trực tiếp (không cần useMemo trong loop)
                            const rowClassName = index % 2 === 0 ? styles.evenRow : styles.oddRow;

                            return (
                                <tr key={row.date} className={rowClassName}>
                                    <td className={styles.dateCell}>{row.displayDate}</td>

                                    {/* Miền Nam */}
                                    <td className={styles.dbCell}>
                                        <EditableCell
                                            value={currentData.mienNam?.db || ''}
                                            onSave={(value) => updateCellValue('mienNam', 'db', value)}
                                            isEditing={isEditing}
                                            maxLength={2}
                                            pattern="^\d{0,2}$"
                                            placeholder="00"
                                        />
                                    </td>
                                    <td className={styles.nhanCell}>
                                        <EditableCell
                                            value={currentData.mienNam?.nhan || ''}
                                            onSave={(value) => updateCellValue('mienNam', 'nhan', value)}
                                            isEditing={isEditing}
                                            maxLength={3}
                                            pattern="^(\d{1,2}X?|X)$"
                                            placeholder="1X"
                                            isNhanCell={true}
                                        />
                                    </td>

                                    {/* Miền Trung */}
                                    <td className={styles.dbCell}>
                                        <EditableCell
                                            value={currentData.mienTrung?.db || ''}
                                            onSave={(value) => updateCellValue('mienTrung', 'db', value)}
                                            isEditing={isEditing}
                                            maxLength={2}
                                            pattern="^\d{0,2}$"
                                            placeholder="00"
                                        />
                                    </td>
                                    <td className={styles.nhanCell}>
                                        <EditableCell
                                            value={currentData.mienTrung?.nhan || ''}
                                            onSave={(value) => updateCellValue('mienTrung', 'nhan', value)}
                                            isEditing={isEditing}
                                            maxLength={3}
                                            pattern="^(\d{1,2}X?|X)$"
                                            placeholder="1X"
                                            isNhanCell={true}
                                        />
                                    </td>

                                    {/* Miền Bắc */}
                                    <td className={styles.dbCell}>
                                        <EditableCell
                                            value={currentData.mienBac?.db || ''}
                                            onSave={(value) => updateCellValue('mienBac', 'db', value)}
                                            isEditing={isEditing}
                                            maxLength={2}
                                            pattern="^\d{0,2}$"
                                            placeholder="00"
                                        />
                                    </td>
                                    <td className={styles.nhanCell}>
                                        <EditableCell
                                            value={currentData.mienBac?.nhan || ''}
                                            onSave={(value) => updateCellValue('mienBac', 'nhan', value)}
                                            isEditing={isEditing}
                                            maxLength={3}
                                            pattern="^(\d{1,2}X?|X)$"
                                            placeholder="1X"
                                            isNhanCell={true}
                                        />
                                    </td>

                                    {/* Action buttons */}
                                    <td className={styles.actionCell}>
                                        {isEditing ? (
                                            <>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        onClick={saveEdit}
                                                        disabled={saving || !canSave}
                                                        className={`${styles.saveButton} ${!canSave ? styles.disabled :
                                                            saveStatus[row.date] === 'saving' ? styles.saving :
                                                                saveStatus[row.date] === 'success' ? styles.success :
                                                                    saveStatus[row.date] === 'error' ? styles.error : ''
                                                            }`}
                                                        title={!canSave ? 'Vui lòng nhập đầy đủ thông tin cho từng miền' : ''}
                                                    >
                                                        <Save size={16} />
                                                        <span className={styles.buttonText}>
                                                            {!canSave ? 'Chưa đủ dữ liệu' :
                                                                saveStatus[row.date] === 'saving' ? 'Đang lưu...' :
                                                                    saveStatus[row.date] === 'success' ? 'Đã lưu!' :
                                                                        saveStatus[row.date] === 'error' ? 'Lỗi!' : 'Lưu'}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        disabled={saving}
                                                        className={styles.cancelButton}
                                                    >
                                                        <X size={16} />
                                                        <span className={styles.buttonText}>Hủy</span>
                                                    </button>
                                                </div>

                                                {/* Hiển thị lỗi validation */}
                                                {Object.keys(validationErrors).length > 0 && (
                                                    <div className={styles.validationErrors}>
                                                        {Object.entries(validationErrors).map(([region, error]) => (
                                                            <div key={region} className={styles.validationError}>
                                                                <span className={styles.regionName}>
                                                                    {region === 'mienNam' ? 'Miền Nam' :
                                                                        region === 'mienTrung' ? 'Miền Trung' : 'Miền Bắc'}:
                                                                </span>
                                                                <span className={styles.errorMessage}>{error}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className={styles.actionButtons}>
                                                <button
                                                    onClick={() => startEdit(row)}
                                                    className={styles.editButton}
                                                >
                                                    <Edit size={16} />
                                                    <span className={styles.buttonText}>Sửa</span>
                                                </button>
                                                <button
                                                    onClick={() => onDelete && onDelete(row.date, row.displayDate)}
                                                    className={styles.deleteButton}
                                                    disabled={!onDelete}
                                                >
                                                    <Trash2 size={16} />
                                                    <span className={styles.buttonText}>Xóa</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {data.metadata && (
                <div className={styles.metadata}>
                    <div className={styles.metadataItem}>
                        <Calendar size={16} />
                        <span>Cập nhật lần cuối: {new Date(data.metadata.lastUpdated).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className={styles.metadataItem}>
                        <BarChart3 size={16} />
                        <span>Tổng số bản ghi: {data.metadata.totalRecords}</span>
                    </div>
                </div>
            )}
        </>
    );
});

// Thêm displayName cho component để dễ debug
StatisticsTable.displayName = 'StatisticsTable';

export default StatisticsTable;
