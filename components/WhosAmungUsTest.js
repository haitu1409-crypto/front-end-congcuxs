/**
 * whos.amung.us Test Component
 * Component để test và debug widget whos.amung.us
 */

import React, { useState, useEffect } from 'react';
import styles from '../styles/WhosAmungUsTest.module.css';

const WhosAmungUsTest = () => {
    const [debugInfo, setDebugInfo] = useState({
        scriptLoaded: false,
        widgetExists: false,
        widgetContent: '',
        windowObject: false,
        errors: []
    });

    useEffect(() => {
        const checkWidget = () => {
            const widgetElement = document.getElementById('_wauo34');
            const scriptLoaded = !!window._wau;
            const wauElements = document.querySelectorAll('[id*="wau"], .wau-counter, [class*="wau"]');

            setDebugInfo({
                scriptLoaded,
                widgetExists: !!widgetElement,
                widgetContent: widgetElement ? widgetElement.innerHTML : 'No widget found',
                windowObject: !!window._wau,
                errors: []
            });

            console.log('Widget Debug Info:', {
                scriptLoaded,
                widgetExists: !!widgetElement,
                widgetContent: widgetElement ? widgetElement.innerHTML : 'No widget found',
                windowObject: !!window._wau,
                wauElements: wauElements.length,
                allScripts: Array.from(document.scripts).map(s => s.src).filter(s => s.includes('waust.at'))
            });
        };

        // Check immediately
        checkWidget();

        // Check every 2 seconds
        const interval = setInterval(checkWidget, 2000);

        return () => clearInterval(interval);
    }, []);

    const refreshWidget = () => {
        // Try to reload the script
        const existingScript = document.querySelector('script[src*="waust.at"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Reinitialize whos.amung.us
        window._wau = window._wau || [];
        window._wau.push(["dynamic", "7aijsjfwyp", "o34", "c4302bffffff", "small"]);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = '//waust.at/d.js';
        document.head.appendChild(script);
    };

    return (
        <div className={styles.testContainer}>
            <h3>🔍 whos.amung.us Debug Info</h3>

            <div className={styles.debugGrid}>
                <div className={styles.debugCard}>
                    <h4>Script Status</h4>
                    <div className={`${styles.status} ${debugInfo.scriptLoaded ? styles.success : styles.error}`}>
                        {debugInfo.scriptLoaded ? '✅ Loaded' : '❌ Not Loaded'}
                    </div>
                </div>

                <div className={styles.debugCard}>
                    <h4>Widget Element</h4>
                    <div className={`${styles.status} ${debugInfo.widgetExists ? styles.success : styles.error}`}>
                        {debugInfo.widgetExists ? '✅ Found' : '❌ Not Found'}
                    </div>
                </div>

                <div className={styles.debugCard}>
                    <h4>Window Object</h4>
                    <div className={`${styles.status} ${debugInfo.windowObject ? styles.success : styles.error}`}>
                        {debugInfo.windowObject ? '✅ Available' : '❌ Not Available'}
                    </div>
                </div>
            </div>

            <div className={styles.widgetContent}>
                <h4>Widget Content:</h4>
                <div className={styles.contentBox}>
                    {debugInfo.widgetContent || 'No content'}
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={refreshWidget} className={styles.refreshButton}>
                    🔄 Refresh Widget
                </button>

                <a
                    href="https://whos.amung.us/stats/7p3pwa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dashboardLink}
                >
                    📊 Open Dashboard
                </a>
            </div>

            <div className={styles.instructions}>
                <h4>📋 Instructions:</h4>
                <ol>
                    <li>Check browser console for debug logs</li>
                    <li>Verify widget ID "7p3pwa" is correct</li>
                    <li>Ensure whos.amung.us script loads without errors</li>
                    <li>Check if widget element appears in DOM</li>
                </ol>
            </div>
        </div>
    );
};

export default WhosAmungUsTest;
