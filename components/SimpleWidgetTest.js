/**
 * Simple Widget Test Component
 * Test widget whos.amung.us đơn giản
 */

import React, { useState, useEffect } from 'react';
import styles from '../styles/SimpleWidgetTest.module.css';

const SimpleWidgetTest = () => {
    const [widgetContent, setWidgetContent] = useState('Loading...');

    useEffect(() => {
        // Initialize widget
        const initWidget = () => {
            console.log('Simple widget test - Initializing...');
            
            // Clear any existing _wau
            window._wau = [];
            
            // Push widget configuration
            window._wau.push(["dynamic", "7aijsjfwyp", "o34", "c4302bffffff", "small"]);
            
            console.log('Widget config pushed:', window._wau);
        };

        // Load script
        const loadScript = () => {
            // Remove existing script
            const existingScript = document.querySelector('script[src*="waust.at"]');
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = '//waust.at/d.js';
            
            script.onload = () => {
                console.log('Simple widget test - Script loaded');
                setTimeout(checkWidget, 1000);
            };
            
            script.onerror = (error) => {
                console.error('Simple widget test - Script error:', error);
                setWidgetContent('Script Error');
            };
            
            document.head.appendChild(script);
        };

        // Check widget content
        const checkWidget = () => {
            const widgetElement = document.getElementById('_wauo34');
            console.log('Simple widget test - Checking widget:', widgetElement);
            
            if (widgetElement) {
                const content = widgetElement.innerHTML || widgetElement.textContent;
                console.log('Simple widget test - Widget content:', content);
                setWidgetContent(content || 'No content');
            } else {
                console.log('Simple widget test - Widget element not found');
                setWidgetContent('Widget not found');
            }
        };

        // Initialize and load
        initWidget();
        loadScript();
        
        // Check periodically
        const interval = setInterval(checkWidget, 3000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <h3>🧪 Simple Widget Test</h3>
            <div className={styles.widgetContainer}>
                <div className={styles.widgetDisplay}>
                    <strong>Widget Content:</strong>
                    <div className={styles.content}>
                        {widgetContent}
                    </div>
                </div>
                <div className={styles.widgetElement}>
                    <strong>Widget Element:</strong>
                    <div id="_wauo34" className={styles.widget}></div>
                </div>
            </div>
            <div className={styles.debug}>
                <p><strong>Debug Info:</strong></p>
                <ul>
                    <li>Check browser console for logs</li>
                    <li>Widget ID: 7aijsjfwyp</li>
                    <li>Element ID: _wauo34</li>
                    <li>Script: //waust.at/d.js</li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleWidgetTest;
