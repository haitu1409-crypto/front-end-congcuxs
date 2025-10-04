/**
 * Lazy Components
 * Tất cả các components được lazy load để tối ưu bundle size
 * Tích hợp Error Boundary để xử lý lỗi loading
 */

import { lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

// Lazy load các components chính
export const StatisticsTable = lazy(() =>
    import('./ThongKe/StatisticsTable').then(module => ({
        default: module.default
    }))
);

export const SummaryCards = lazy(() =>
    import('./ThongKe/SummaryCards').then(module => ({
        default: module.default
    }))
);

export const ExportableTable = lazy(() =>
    import('./ThongKe/ExportableTable').then(module => ({
        default: module.default
    }))
);

export const EditableCell = lazy(() =>
    import('./ThongKe/EditableCell').then(module => ({
        default: module.default
    }))
);

// Lazy load các components DanDe
export const DanDeGenerator = lazy(() =>
    import('./DanDeGenerator').then(module => ({
        default: module.default
    }))
);

export const Analytics = lazy(() =>
    import('./Analytics').then(module => ({
        default: module.default
    }))
);

// Loading component tái sử dụng với Error Boundary
export const ComponentLoader = ({ children, fallback = null, errorMessage = null }) => {
    return (
        <ErrorBoundary fallbackMessage={errorMessage}>
            <Suspense fallback={fallback || <DefaultLoadingSpinner />}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
};

// Default loading spinner
export const DefaultLoadingSpinner = () => (
    <LoadingSpinner message="Đang tải..." />
);

// HOC để wrap lazy components với error boundary
export const withLazyLoading = (LazyComponent, fallback = null, errorMessage = null) => {
    return (props) => (
        <ComponentLoader fallback={fallback} errorMessage={errorMessage}>
            <LazyComponent {...props} />
        </ComponentLoader>
    );
};

// Pre-configured lazy components với Error Boundary
export const SafeStatisticsTable = withLazyLoading(
    StatisticsTable,
    <DefaultLoadingSpinner />,
    'Lỗi khi tải bảng thống kê. Vui lòng thử lại.'
);

export const SafeSummaryCards = withLazyLoading(
    SummaryCards,
    <DefaultLoadingSpinner />,
    'Lỗi khi tải thống kê tổng quan. Vui lòng thử lại.'
);

export const SafeDanDeGenerator = withLazyLoading(
    DanDeGenerator,
    <DefaultLoadingSpinner />,
    'Lỗi khi tải công cụ tạo dàn đề. Vui lòng thử lại.'
);
