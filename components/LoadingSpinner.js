/**
 * Loading Spinner Component
 * Component loading spinner tối ưu cho performance
 */

import { memo } from 'react';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = memo(function LoadingSpinner({
    size = 'medium',
    message = 'Đang tải...',
    showMessage = true,
    className = ''
}) {
    return (
        <div className={`${styles.loadingContainer} ${styles[size]} ${className}`}>
            <div className={styles.spinner}>
                <div className={styles.spinnerInner}></div>
            </div>
            {showMessage && (
                <p className={styles.loadingMessage}>{message}</p>
            )}
        </div>
    );
});

export default LoadingSpinner;
