/**
 * Exportable Table With Export Controls
 * Component bảng thống kê với các nút xuất ảnh chất lượng cao
 */

import { useRef, useState, memo } from 'react';
import ExportableTable from './ExportableTable';
import useImageExport from '../../hooks/useImageExport';
import { Download, Image, Zap, Star } from '../../utils/icons';

const ExportableTableWithControls = ({ data, title, userDisplayName }) => {
    const tableRef = useRef(null);
    const [exportMode, setExportMode] = useState('normal');
    const {
        exportToImage,
        exportHighQuality,
        exportUltraQuality,
        exportForFacebook,
        isExporting
    } = useImageExport();

    const handleExport = async (quality = 'normal') => {
        if (!tableRef.current) return;

        try {
            let result;

            // Đặt export mode trước khi xuất
            setExportMode(quality === 'ultra' ? 'ultra' : 'normal');

            // Đợi một chút để CSS được áp dụng
            await new Promise(resolve => setTimeout(resolve, 100));

            switch (quality) {
                case 'high':
                    result = await exportHighQuality(tableRef);
                    break;
                case 'ultra':
                    result = await exportUltraQuality(tableRef);
                    break;
                case 'facebook':
                    result = await exportForFacebook(tableRef, 'facebook-post');
                    break;
                default:
                    result = await exportToImage(tableRef);
            }

            if (result.success) {
                console.log(`Xuất ảnh thành công: ${result.filename}`);
                console.log(`Kích thước: ${result.dimensions.width}x${result.dimensions.height}px`);
            }
        } catch (error) {
            console.error('Lỗi khi xuất ảnh:', error);
            alert('Có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.');
        } finally {
            // Reset export mode
            setExportMode('normal');
        }
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Export Controls */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => handleExport('normal')}
                    disabled={isExporting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.6 : 1
                    }}
                >
                    <Download size={14} />
                    Xuất ảnh thường
                </button>

                <button
                    onClick={() => handleExport('high')}
                    disabled={isExporting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.6 : 1
                    }}
                >
                    <Image size={14} />
                    Chất lượng cao
                </button>

                <button
                    onClick={() => handleExport('ultra')}
                    disabled={isExporting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.6 : 1
                    }}
                >
                    <Star size={14} />
                    Siêu chất lượng
                </button>

                <button
                    onClick={() => handleExport('facebook')}
                    disabled={isExporting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '8px 12px',
                        backgroundColor: '#1877f2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: isExporting ? 'not-allowed' : 'pointer',
                        opacity: isExporting ? 0.6 : 1
                    }}
                >
                    <Zap size={14} />
                    Cho Facebook
                </button>
            </div>

            {/* Loading indicator */}
            {isExporting && (
                <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#6b7280'
                }}>
                    Đang xuất ảnh... Vui lòng đợi
                </div>
            )}

            {/* Quality info */}
            <div style={{
                fontSize: '11px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '16px',
                lineHeight: '1.4'
            }}>
                <strong>Chất lượng xuất ảnh:</strong><br />
                • Thường: Scale x4, phù hợp xem trên màn hình<br />
                • Cao: Scale x6, phù hợp in ấn nhỏ<br />
                • Siêu cao: Scale x8, phù hợp in ấn lớn<br />
                • Facebook: Tối ưu cho mạng xã hội
            </div>

            {/* Exportable Table */}
            <ExportableTable
                ref={tableRef}
                data={data}
                title={title}
                userDisplayName={userDisplayName}
                exportMode={exportMode}
            />
        </div>
    );
};

export default memo(ExportableTableWithControls);














