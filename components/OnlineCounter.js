/**
 * Online Counter Component - whos.amung.us widget
 * Hiển thị số người đang online trên website
 */

import React, { useState, useEffect } from 'react';
import styles from '../styles/OnlineCounter.module.css';

const OnlineCounter = ({
    position = 'bottom-right',
    showLabel = true,
    theme = 'dark',
    size = 'medium'
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if whos.amung.us script is loaded
        const checkScript = () => {
            console.log('Checking whos.amung.us script...', {
                window_wau: !!window._wau,
                document_ready: document.readyState,
                widget_elements: document.querySelectorAll('[id*="wau"]')
            });

            // Check for whos.amung.us elements (they use dynamic IDs)
            const wauElements = document.querySelectorAll('[id*="wau"], .wau-counter, [class*="wau"]');
            if (window._wau || wauElements.length > 0) {
                console.log('whos.amung.us script loaded successfully');
                setIsLoaded(true);
            } else {
                setTimeout(checkScript, 500);
            }
        };

        // Start checking after a short delay
        setTimeout(checkScript, 1000);
    }, []);

    // Don't render if script not loaded yet
    if (!isLoaded) {
        return (
            <div className={`${styles.counter} ${styles[position]} ${styles[theme]} ${styles[size]}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.counter} ${styles[position]} ${styles[theme]} ${styles[size]}`}>
            <div className={styles.widget}>
                {showLabel && (
                    <span className={styles.label}>
                        👥 Online
                    </span>
                )}
                <div className={styles.counterNumber}>
                    {/* whos.amung.us will create its own elements */}
                    <div id="_wauo34"></div>
                </div>
            </div>
        </div>
    );
};

export default OnlineCounter;
