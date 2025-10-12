/**
 * Exportable Table Component
 * Component bảng thống kê có thể xuất ảnh
 */

import { forwardRef, memo, useMemo } from 'react';
import styles from '../../styles/ExportableTable.module.css';

// Helper functions - định nghĩa trước tất cả để tránh lỗi hoisting
const getCellValue = (value, rowDate, today) => {
    if (value && value.trim() !== '') {
        return value;
    }

    // Nếu là ngày hiện tại và ô trống
    if (rowDate === today) {
        return '...';
    }

    // Các ngày khác và ô trống
    return 'X';
};

const getCellClassName = (value, rowDate, today, baseClassName) => {
    if (value && value.trim() !== '') {
        return '';
    }

    // Nếu là ngày hiện tại và ô trống
    if (rowDate === today) {
        return 'waitingResult';
    }

    // Các ngày khác và ô trống
    return 'emptyCellX';
};

// Get performance class based on hit rate
const getPerformanceClass = (hitRate) => {
    const rate = parseFloat(hitRate) || 0;
    if (rate >= 70) return 'highPerformance';
    if (rate >= 40) return 'mediumPerformance';
    return 'lowPerformance';
};

const ExportableTable = forwardRef(({ data, title = "THỐNG KÊ 3 MIỀN - TÔN NGỘ KHÔNG", userDisplayName = "", exportMode = "normal" }, ref) => {
    // Tất cả hooks phải được gọi trước bất kỳ return nào
    // Memoize expensive computations
    const { currentDate, today, processedData } = useMemo(() => {
        if (!data || !data.statistics) {
            return { currentDate: null, today: null, processedData: null };
        }

        const currentDate = new Date().toLocaleDateString('vi-VN');
        const today = new Date().toISOString().split('T')[0];

        // Pre-process data để tránh tính toán lại trong render
        const processedData = data.statistics.map((row, index) => ({
            ...row,
            isEven: index % 2 === 0,
            cells: {
                mienNam: {
                    db: {
                        value: getCellValue(row.mienNam?.db, row.date, today),
                        className: getCellClassName(row.mienNam?.db, row.date, today, 'dbCell')
                    },
                    nhan: {
                        value: getCellValue(row.mienNam?.nhan, row.date, today),
                        className: getCellClassName(row.mienNam?.nhan, row.date, today, 'nhanCell')
                    }
                },
                mienTrung: {
                    db: {
                        value: getCellValue(row.mienTrung?.db, row.date, today),
                        className: getCellClassName(row.mienTrung?.db, row.date, today, 'dbCell')
                    },
                    nhan: {
                        value: getCellValue(row.mienTrung?.nhan, row.date, today),
                        className: getCellClassName(row.mienTrung?.nhan, row.date, today, 'nhanCell')
                    }
                },
                mienBac: {
                    db: {
                        value: getCellValue(row.mienBac?.db, row.date, today),
                        className: getCellClassName(row.mienBac?.db, row.date, today, 'dbCell')
                    },
                    nhan: {
                        value: getCellValue(row.mienBac?.nhan, row.date, today),
                        className: getCellClassName(row.mienBac?.nhan, row.date, today, 'nhanCell')
                    }
                }
            }
        }));

        return { currentDate, today, processedData };
    }, [data]);

    // Performance summary data - phải được gọi trước return
    const summaryData = useMemo(() => {
        if (!data?.summary) return null;

        return [
            {
                region: 'Miền Nam',
                hitRate: data.summary.mienNam?.hitRate || 0,
                performanceClass: getPerformanceClass(data.summary.mienNam?.hitRate)
            },
            {
                region: 'Miền Trung',
                hitRate: data.summary.mienTrung?.hitRate || 0,
                performanceClass: getPerformanceClass(data.summary.mienTrung?.hitRate)
            },
            {
                region: 'Miền Bắc',
                hitRate: data.summary.mienBac?.hitRate || 0,
                performanceClass: getPerformanceClass(data.summary.mienBac?.hitRate)
            }
        ];
    }, [data?.summary]);

    // Multi-column layout logic
    const { tableColumns, maxDaysPerColumn } = useMemo(() => {
        const numberOfDays = processedData?.length || 0;
        const maxDaysPerColumn = 15;

        if (numberOfDays <= maxDaysPerColumn) {
            // Single column
            return {
                tableColumns: [processedData],
                maxDaysPerColumn
            };
        } else {
            // Multiple columns
            const columns = [];
            for (let i = 0; i < processedData.length; i += maxDaysPerColumn) {
                columns.push(processedData.slice(i, i + maxDaysPerColumn));
            }
            return {
                tableColumns: columns,
                maxDaysPerColumn
            };
        }
    }, [processedData]);

    // Early return sau khi tất cả hooks đã được gọi
    if (!processedData) {
        return null;
    }

    const renderTable = (columnData, columnIndex) => (
        <table key={columnIndex} className={styles.exportTable}>
            <thead>
                <tr>
                    <th rowSpan={2} className={styles.dateHeader}>Ngày</th>
                    <th colSpan={2} className={styles.regionHeader}>Miền Nam</th>
                    <th colSpan={2} className={styles.regionHeader}>Miền Trung</th>
                    <th colSpan={2} className={styles.regionHeader}>Miền Bắc</th>
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
                {columnData.map((row, index) => (
                    <tr key={row.date} className={row.isEven ? styles.evenRow : styles.oddRow}>
                        <td className={styles.dateCell}>{row.displayDate}</td>
                        <td className={`${styles.dbCell} ${row.cells.mienNam.db.className ? styles[row.cells.mienNam.db.className] : ''}`}>{row.cells.mienNam.db.value}</td>
                        <td className={`${styles.nhanCell} ${row.cells.mienNam.nhan.className ? styles[row.cells.mienNam.nhan.className] : ''}`}>{row.cells.mienNam.nhan.value}</td>
                        <td className={`${styles.dbCell} ${row.cells.mienTrung.db.className ? styles[row.cells.mienTrung.db.className] : ''}`}>{row.cells.mienTrung.db.value}</td>
                        <td className={`${styles.nhanCell} ${row.cells.mienTrung.nhan.className ? styles[row.cells.mienTrung.nhan.className] : ''}`}>{row.cells.mienTrung.nhan.value}</td>
                        <td className={`${styles.dbCell} ${row.cells.mienBac.db.className ? styles[row.cells.mienBac.db.className] : ''}`}>{row.cells.mienBac.db.value}</td>
                        <td className={`${styles.nhanCell} ${row.cells.mienBac.nhan.className ? styles[row.cells.mienBac.nhan.className] : ''}`}>{row.cells.mienBac.nhan.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div
            ref={ref}
            className={styles.exportContainer}
            data-export-mode={exportMode}
        >
            {/* Header */}
            <div className={styles.exportHeader}>
                <h1 className={styles.exportTitle}>{title}</h1>
                <div className={styles.exportInfo}>
                    {userDisplayName && (
                        <span className={styles.exportUser}>
                            Thuộc về: <strong>{userDisplayName}</strong>
                        </span>
                    )}
                    <span className={styles.exportDate}>
                        Ngày xuất: {currentDate}
                    </span>
                </div>
            </div>

            {/* Table Container - Multi-column if needed */}
            <div className={styles.tableWrapper}>
                {tableColumns.length === 1 ? (
                    // Single column
                    renderTable(tableColumns[0], 0)
                ) : (
                    // Multi-column layout
                    <div className={styles.multiColumnTable}>
                        {tableColumns.map((columnData, index) => (
                            <div key={index} className={styles.tableColumn}>
                                {renderTable(columnData, index)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            {summaryData && (
                <div className={styles.exportSummary}>
                    <h3>Thống Kê Tỉ Lệ Trúng</h3>
                    <div className={styles.summaryGrid}>
                        {summaryData.map((item) => (
                            <div key={item.region} className={`${styles.summaryItem} ${styles[item.performanceClass]}`}>
                                <span className={styles.regionName}>{item.region}:</span>
                                <span className={styles.hitRateNumber}>Tỉ lệ trúng: {item.hitRate}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className={styles.exportFooter}>
                <div className={styles.footerItem}>
                    <span>📅 Tổng số ngày thống kê: {data.metadata?.totalRecords || 0}</span>
                </div>
                <div className={styles.footerItem}>
                    <span>📊 Dàn Đề Wukong - Công cụ chuyên nghiệp</span>
                </div>
            </div>
        </div>
    );
});

// Wrap with memo for performance
const MemoizedExportableTable = memo(ExportableTable);

ExportableTable.displayName = 'ExportableTable';
MemoizedExportableTable.displayName = 'MemoizedExportableTable';

export default MemoizedExportableTable;