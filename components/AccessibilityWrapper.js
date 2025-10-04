/**
 * Accessibility Wrapper Component
 * Component cung cấp các tính năng accessibility
 */

import { useEffect, useRef } from 'react';

const AccessibilityWrapper = ({ children, announceChanges = false }) => {
    const announcerRef = useRef(null);

    useEffect(() => {
        // Tạo announcer cho screen readers
        if (announceChanges && typeof document !== 'undefined') {
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.position = 'absolute';
            announcer.style.left = '-10000px';
            announcer.style.width = '1px';
            announcer.style.height = '1px';
            announcer.style.overflow = 'hidden';

            document.body.appendChild(announcer);
            announcerRef.current = announcer;

            return () => {
                if (announcerRef.current) {
                    document.body.removeChild(announcerRef.current);
                }
            };
        }
    }, [announceChanges]);

    const announce = (message) => {
        if (announcerRef.current) {
            announcerRef.current.textContent = message;
        }
    };

    return children({ announce });
};

export default AccessibilityWrapper;
