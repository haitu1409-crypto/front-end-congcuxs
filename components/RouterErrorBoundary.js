/**
 * Router Error Boundary
 * Handles router abort errors and navigation conflicts
 */

import { Component } from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Error Boundary Class Component
class RouterErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Check if it's a router abort error
        if (error.message && error.message.includes('Abort fetching component')) {
            return { hasError: true, error };
        }
        return null;
    }

    componentDidCatch(error, errorInfo) {
        // Log router errors for debugging
        if (error.message && error.message.includes('Abort fetching component')) {
            console.warn('Router abort error caught and handled:', error.message);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Đang tải trang...
                </div>
            );
        }

        return this.props.children;
    }
}

// Router Error Handler Hook
export function useRouterErrorHandler() {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChangeError = (err, url) => {
            if (err.cancelled) {
                console.warn('Route change cancelled:', url);
                return;
            }

            if (err.message && err.message.includes('Abort fetching component')) {
                console.warn('Component fetch aborted for:', url);
                // Retry navigation after a short delay
                setTimeout(() => {
                    router.push(url);
                }, 100);
            }
        };

        const handleRouteChangeStart = (url) => {
            // Clear any pending timeouts
            if (window.routerTimeout) {
                clearTimeout(window.routerTimeout);
            }
        };

        router.events.on('routeChangeError', handleRouteChangeError);
        router.events.on('routeChangeStart', handleRouteChangeStart);

        return () => {
            router.events.off('routeChangeError', handleRouteChangeError);
            router.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [router]);
}

export default RouterErrorBoundary;

