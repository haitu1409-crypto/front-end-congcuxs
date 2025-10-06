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
        // Initialize whos.amung.us widget directly
        const initWidget = () => {
            console.log('Initializing whos.amung.us widget...');
            
            // Initialize _wau array if not exists
            if (!window._wau) {
                window._wau = [];
            }
            
            // Push widget configuration
            window._wau.push(["dynamic", "7aijsjfwyp", "o34", "c4302bffffff", "small"]);
            
            // Load script if not already loaded
            if (!document.querySelector('script[src*="waust.at"]')) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.src = '//waust.at/d.js';
                script.onload = () => {
                    console.log('whos.amung.us script loaded');
                    setIsLoaded(true);
                };
                script.onerror = (error) => {
                    console.error('Failed to load whos.amung.us script:', error);
                };
                document.head.appendChild(script);
            } else {
                console.log('whos.amung.us script already loaded');
                setIsLoaded(true);
            }
        };
        
        // Initialize widget
        initWidget();
        
        // Check for widget content periodically
        const checkWidget = () => {
            const widgetElement = document.getElementById('_wauo34');
            const wauElements = document.querySelectorAll('[id*="wau"], .wau-counter, [class*="wau"]');
            
            console.log('Widget check:', {
                widgetElement: !!widgetElement,
                widgetContent: widgetElement ? widgetElement.innerHTML : 'No content',
                wauElements: wauElements.length,
                allElements: document.querySelectorAll('*').length
            });
            
            if (widgetElement && widgetElement.innerHTML.trim()) {
                setIsLoaded(true);
            }
        };
        
        // Check every 2 seconds
        const interval = setInterval(checkWidget, 2000);
        
        return () => clearInterval(interval);
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
                    {/* whos.amung.us widget */}
                    <div id="_wauo34" style={{ 
                        display: 'inline-block', 
                        minWidth: '20px',
                        color: 'inherit',
                        fontWeight: 'inherit'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default OnlineCounter;
