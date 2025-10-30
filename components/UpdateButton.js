import React, { useState, memo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import styles from '../styles/UpdateButton.module.css';

/**
 * Component nút cập nhật thống kê
 * Optimized with React.memo and useCallback
 * @param {Function} onUpdate - Hàm callback khi nhấn nút cập nhật
 * @param {string} label - Label cho nút (mặc định: "Cập nhật")
 * @param {boolean} disabled - Disable nút khi đang update
 */
const UpdateButton = memo(function UpdateButton({ onUpdate, label = 'Cập nhật', disabled = false }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    const handleUpdate = useCallback(async () => {
        setIsUpdating(true);
        try {
            await onUpdate();
            setLastUpdateTime(new Date());
        } catch (error) {
            console.error('Error updating stats:', error);
            alert('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
    }, [onUpdate]);

    return (
        <div className={styles.updateButtonContainer}>
            <button
                className={`${styles.updateButton} ${isUpdating ? styles.updating : ''}`}
                onClick={handleUpdate}
                disabled={disabled || isUpdating}
                title={lastUpdateTime ? `Cập nhật lần cuối: ${lastUpdateTime.toLocaleString('vi-VN')}` : 'Cập nhật dữ liệu'}
            >
                <RefreshCw 
                    size={16} 
                    className={`${styles.icon} ${isUpdating ? styles.spinning : ''}`} 
                />
                <span>{isUpdating ? 'Đang cập nhật...' : label}</span>
            </button>
            {lastUpdateTime && (
                <span className={styles.lastUpdate}>
                    Cập nhật: {lastUpdateTime.toLocaleTimeString('vi-VN')}
                </span>
            )}
        </div>
    );
});

UpdateButton.displayName = 'UpdateButton';

export default UpdateButton;

