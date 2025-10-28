/**
 * Error Message Component
 * Component hiển thị lỗi với khả năng retry
 */

import { memo } from 'react';
import styles from '../styles/ErrorMessage.module.css';

const ErrorMessage = memo(function ErrorMessage({
    message = 'Đã xảy ra lỗi',
    onRetry = null,
    showRetry = true,
    className = ''
}) {
    return (
        <div className={`${styles.errorContainer} ${className}`}>
            <div className={styles.errorIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                </svg>
            </div>
            <div className={styles.errorContent}>
                <h3 className={styles.errorTitle}>Lỗi</h3>
                <p className={styles.errorMessage}>{message}</p>
                {showRetry && onRetry && (
                    <button
                        className={styles.retryButton}
                        onClick={onRetry}
                    >
                        Thử lại
                    </button>
                )}
            </div>
        </div>
    );
});

export default ErrorMessage;
