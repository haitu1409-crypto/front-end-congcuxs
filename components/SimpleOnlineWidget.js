/**
 * Widget Component - Chỉ dán mã gốc
 */

import React, { useEffect } from 'react';

const SimpleOnlineWidget = () => {
    useEffect(() => {
        // Chỉ load một lần
        if (document.querySelector('script[src*="waust.at"]')) {
            return;
        }

        // Dán mã widget gốc
        const script1 = document.createElement('script');
        script1.innerHTML = 'var _wau = _wau || []; _wau.push(["dynamic", "49tvp9jc5g", "38a", "c4302bffffff", "small"]);';
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.async = true;
        script2.src = '//waust.at/d.js';

        script2.onload = () => {
            // Force widget positioning sau khi load
            setTimeout(() => {
                const widget = document.getElementById('_wau38a');
                if (widget) {
                    // Reset widget styling để nó không có position
                    widget.style.setProperty('position', 'static', 'important');
                    widget.style.setProperty('top', 'auto', 'important');
                    widget.style.setProperty('left', 'auto', 'important');
                    widget.style.setProperty('bottom', 'auto', 'important');
                    widget.style.setProperty('right', 'auto', 'important');
                    widget.style.setProperty('transform', 'none', 'important');
                    widget.style.setProperty('margin', '0', 'important');

                    // Thêm CSS rule để override widget styling
                    const style = document.createElement('style');
                    style.textContent = `
                        #_wau38a {
                            position: static !important;
                            top: auto !important;
                            left: auto !important;
                            bottom: auto !important;
                            right: auto !important;
                            transform: none !important;
                            margin: 0 !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }, 1000);
        };

        document.head.appendChild(script2);
    }, []);

    // Force positioning liên tục
    useEffect(() => {
        const forcePositioning = () => {
            const widget = document.getElementById('_wau38a');
            if (widget) {
                // Reset widget về static position
                widget.style.setProperty('position', 'static', 'important');
                widget.style.setProperty('top', 'auto', 'important');
                widget.style.setProperty('left', 'auto', 'important');
                widget.style.setProperty('bottom', 'auto', 'important');
                widget.style.setProperty('right', 'auto', 'important');
                widget.style.setProperty('transform', 'none', 'important');
                widget.style.setProperty('margin', '0', 'important');
            }
        };

        // Force ngay lập tức
        forcePositioning();

        // Force mỗi giây
        const interval = setInterval(forcePositioning, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '0px',
                right: '0px',
                zIndex: 9999,
                pointerEvents: 'auto'
            }}
        >
            <div id="_wau38a"></div>
        </div>
    );
};

export default SimpleOnlineWidget;
