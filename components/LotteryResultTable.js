/**
 * Lottery Result Table Component
 * Component chuyên dụng để hiển thị bảng kết quả xổ số
 * Hỗ trợ render HTML raw từ bài viết tin tức
 */

import React from 'react';
import styles from '../styles/LotteryResultTable.module.css';
import xsmbStyles from '../styles/XoSoMienBac.module.css';

/**
 * LotteryResultTable Component
 * 
 * Cách sử dụng:
 * 1. Trong content editor, paste HTML table trực tiếp
 * 2. Hoặc sử dụng component này trong bài viết
 * 
 * @param {Object} props
 * @param {string} props.htmlContent - Raw HTML content của bảng kết quả
 * @param {string} props.title - Tiêu đề bảng
 * @param {string} props.region - Miền (MB, MN, MT)
 * @param {string} props.variant - 'xsmt' hoặc 'xsmb' (default: 'xsmt')
 */
const LotteryResultTable = ({ htmlContent, title, region, variant = 'xsmt' }) => {
    if (!htmlContent) return null;

    // Chọn styles dựa vào variant
    const containerClass = variant === 'xsmb'
        ? xsmbStyles.xsmbContainer
        : styles.lotteryTableWrapper;

    return (
        <div className={containerClass}>
            {title && variant === 'xsmt' && (
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>{title}</h2>
                    {region && (
                        <span className={styles.regionBadge}>{region}</span>
                    )}
                </div>
            )}

            {/* ✅ Render HTML trực tiếp với dangerouslySetInnerHTML */}
            <div
                className={variant === 'xsmb' ? '' : styles.lotteryTableContent}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </div>
    );
};

export default LotteryResultTable;

/**
 * HƯỚNG DẪN SỬ DỤNG:
 * 
 * CÁCH 1: Paste trực tiếp HTML vào content editor
 * =============================================
 * Khi tạo bài viết, paste HTML table trực tiếp vào content field.
 * Frontend đã sử dụng dangerouslySetInnerHTML nên sẽ render đúng.
 * 
 * CÁCH 2: Sử dụng component này trong bài viết
 * =============================================
 * Import component vào page tin-tức/[slug].js và render:
 * 
 * <LotteryResultTable 
 *     htmlContent={article.lotteryTableHTML}
 *     title="XSMT - Kết Quả Xổ Số Miền Trung"
 *     region="MT"
 * />
 * 
 * CÁCH 3: Tạo field riêng cho lottery table trong article model
 * =============================================
 * Thêm field lotteryTableHTML vào Article model
 * Lưu HTML table riêng, render riêng
 */

