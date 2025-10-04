/**
 * Error Boundary Component
 * Bắt lỗi và hiển thị fallback UI cho lazy components
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import styles from '../styles/ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Cập nhật state để hiển thị fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error để debug
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log to external service nếu cần
        if (process.env.NODE_ENV === 'production') {
            // Có thể gửi error đến service như Sentry
            // logErrorToService(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });

        // Trigger re-render của component
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.errorContent}>
                        <div className={styles.errorIcon}>
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className={styles.errorTitle}>
                            Đã xảy ra lỗi
                        </h3>
                        <p className={styles.errorMessage}>
                            {this.props.fallbackMessage ||
                                'Có lỗi xảy ra khi tải component. Vui lòng thử lại.'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary>Chi tiết lỗi (Development)</summary>
                                <pre className={styles.errorStack}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            className={styles.retryButton}
                            onClick={this.handleRetry}
                        >
                            <RefreshCw size={16} />
                            Thử lại
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
