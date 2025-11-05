/**
 * Cell Detail Tooltip Component
 * Hiển thị chi tiết định vị khi hover vào ô
 */

import React from 'react';
import styles from '../styles/cellDetailTooltip.module.css';

const CellDetailTooltip = ({ cellData, cellPosition, isVisible, position, onClose }) => {
    if (!isVisible || !cellData || !cellData.stats || cellData.stats.length === 0) {
        return null;
    }

    // Parse vị trí từ position string - Format: (prize-element-digit)
    const parsePosition = (positionStr) => {
        if (!positionStr) return null;
        const match = positionStr.match(/\((\d+)-(\d+)-(\d+)\)/);
        if (match) {
            return {
                prize: parseInt(match[1]),
                element: parseInt(match[2]),
                digit: parseInt(match[3])
            };
        }
        return null;
    };

    // Lấy tên giải
    const getPrizeName = (prizeIndex) => {
        const prizeNames = {
            0: 'Giải Đặc Biệt',
            1: 'Giải Nhất',
            2: 'Giải Nhì',
            3: 'Giải Ba',
            4: 'Giải Tư',
            5: 'Giải Năm',
            6: 'Giải Sáu',
            7: 'Giải Bảy'
        };
        return prizeNames[prizeIndex] || `Giải ${prizeIndex}`;
    };

    // Lấy tên thứ
    const getDayName = (dayIndex) => {
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        return dayNames[dayIndex] || `Thứ ${dayIndex + 1}`;
    };

    return (
        <div
            className={styles.tooltip}
            style={{
                position: 'fixed',
                left: `${position?.x || 0}px`,
                top: `${position?.y || 0}px`,
                zIndex: 10000,
                pointerEvents: 'auto' // Cho phép hover vào tooltip
            }}
        >
            <div className={styles.tooltipHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className={styles.tooltipTitle}>Chi tiết định vị ô và dòng</h4>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={styles.closeButton}
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className={styles.tooltipSubtitle}>
                    {cellData.date && (
                        <div className={styles.subtitleItem}>
                            <span className={styles.subtitleLabel}>📅 Ngày:</span>
                            <span className={styles.subtitleValue}>{cellData.date}</span>
                        </div>
                    )}
                    {cellPosition && (
                        <div className={styles.subtitleItem}>
                            <span className={styles.subtitleLabel}>📍 Vị trí ô:</span>
                            <span className={styles.subtitleValue}>
                                Dòng {cellPosition.weekIndex + 1} - Cột {getDayName(cellPosition.dayIndex)} (Tuần {cellPosition.weekIndex + 1}, {getDayName(cellPosition.dayIndex)})
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.tooltipContent}>
                {cellData.stats.map((stat, statIndex) => {
                    const prizes = stat.prizes || {};
                    const specialPrize = prizes.specialPrize?.[0];
                    
                    // Chỉ hiển thị giải đặc biệt (như trong bảng chính)
                    if (!specialPrize || !specialPrize.number) {
                        return (
                            <div key={statIndex} className={styles.statBlock}>
                                <p className={styles.noSpecialPrize}>Không có dữ liệu giải đặc biệt cho ngày này.</p>
                            </div>
                        );
                    }

                    return (
                        <div key={statIndex} className={styles.statBlock}>
                            <div className={styles.prizeBlock}>
                                <h5 className={styles.prizeName}>Giải Đặc Biệt</h5>
                                <div className={styles.numberBlock}>
                                    <div className={styles.numberInfo}>
                                        <span className={styles.numberValue}>{specialPrize.number}</span>
                                    </div>
                                    
                                    {specialPrize.positions && specialPrize.positions.length > 0 && (
                                        <div className={styles.positionsList}>
                                            <div className={styles.positionsHeader}>
                                                Định vị từng chữ số ({specialPrize.positions.length} chữ số):
                                            </div>
                                            {specialPrize.positions.map((pos, posIdx) => {
                                                return (
                                                    <div key={posIdx} className={styles.positionItem}>
                                                        <span className={styles.positionDigit}>
                                                            Chữ số "{pos.digit}" ở vị trí {pos.position}
                                                        </span>
                                                        <div className={styles.positionDetails}>
                                                            <div className={styles.detailRow}>
                                                                <span className={styles.detailLabel}>🌐 Global Index:</span>
                                                                <span className={styles.detailValue}>{pos.globalIndex}</span>
                                                            </div>
                                                            {pos.cellPosition && (
                                                                <>
                                                                    <div className={styles.detailRow}>
                                                                        <span className={styles.detailLabel}>📊 Dòng:</span>
                                                                        <span className={styles.detailValue}>
                                                                            Dòng {pos.cellPosition.weekIndex + 1}
                                                                        </span>
                                                                    </div>
                                                                    <div className={styles.detailRow}>
                                                                        <span className={styles.detailLabel}>📍 Cột:</span>
                                                                        <span className={styles.detailValue}>
                                                                            {getDayName(pos.cellPosition.dayIndex)}
                                                                        </span>
                                                                    </div>
                                                                    <div className={styles.detailRow}>
                                                                        <span className={styles.detailLabel}>🎯 Vị trí trong số:</span>
                                                                        <span className={styles.detailValue}>
                                                                            Vị trí {pos.cellPosition.digitIndex + 1}
                                                                        </span>
                                                                    </div>
                                                                    {pos.cellPosition.rowIndexInCell !== undefined && pos.cellPosition.colIndexInCell !== undefined && (
                                                                        <>
                                                                            <div className={styles.detailRow}>
                                                                                <span className={styles.detailLabel}>📐 Hàng trong ô:</span>
                                                                                <span className={styles.detailValue}>
                                                                                    Hàng {pos.cellPosition.rowIndexInCell + 1} (index {pos.cellPosition.rowIndexInCell})
                                                                                </span>
                                                                            </div>
                                                                            <div className={styles.detailRow}>
                                                                                <span className={styles.detailLabel}>📐 Cột trong ô:</span>
                                                                                <span className={styles.detailValue}>
                                                                                    Cột {pos.cellPosition.colIndexInCell + 1} (index {pos.cellPosition.colIndexInCell})
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                    {pos.cellPosition.numberIndex !== undefined && (
                                                                        <div className={styles.detailRow}>
                                                                            <span className={styles.detailLabel}>🔢 Thứ tự số trong ô:</span>
                                                                            <span className={styles.detailValue}>
                                                                                Số thứ {pos.cellPosition.numberIndex + 1} (index {pos.cellPosition.numberIndex})
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CellDetailTooltip;

