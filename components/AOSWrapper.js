/**
 * AOS (Animate On Scroll) Wrapper Component
 * Provides smooth scroll animations for better UX
 */

import { useEffect } from 'react';

const AOSWrapper = ({ children, ...props }) => {
    useEffect(() => {
        // Simple AOS-like functionality without external library
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    // Unobserve after animation to prevent memory leaks
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with data-aos attributes
        const aosElements = document.querySelectorAll('[data-aos]');
        aosElements.forEach(el => observer.observe(el));

        return () => {
            // Cleanup observer properly
            aosElements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }, []);

    return children;
};

export default AOSWrapper;
