/**
 * Simple Online Counter Component
 * Widget đơn giản hiển thị trạng thái online
 */

import React, { useState, useEffect } from 'react';

const SimpleOnlineWidget = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize whos.amung.us for tracking only
        const initWhosAmungUs = () => {
            console.log('Initializing whos.amung.us tracking...');
            
            // Remove existing script
            const existingScript = document.querySelector('script[src*="waust.at"]');
            if (existingScript) {
                existingScript.remove();
            }

            // Initialize _wau
            window._wau = window._wau || [];
            window._wau.push(["dynamic", "7aijsjfwyp", "o34", "c4302bffffff", "small"]);
            
            // Load script
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = '//waust.at/d.js';
            
            script.onload = () => {
                console.log('whos.amung.us script loaded');
                setIsLoading(false);
            };
            
            script.onerror = () => {
                console.log('whos.amung.us failed');
                setIsLoading(false);
            };
            
            document.head.appendChild(script);
        };

        // Initialize
        initWhosAmungUs();
        
        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(initWhosAmungUs, 30000);

        return () => clearInterval(refreshInterval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: 'rgba(102, 126, 234, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        }}>
            {isLoading ? (
                <span style={{ opacity: 0.7 }}>⏳ Loading...</span>
            ) : (
                <>
                    <span>👥</span>
                    <span>Online</span>
                    <span style={{ 
                        fontSize: '10px', 
                        opacity: 0.7,
                        marginLeft: '4px'
                    }}>
                        📊
                    </span>
                </>
            )}
            
            {/* Hidden widget element for whos.amung.us */}
            <div id="_wauo34" style={{ display: 'none' }}></div>
        </div>
    );
};

export default SimpleOnlineWidget;
