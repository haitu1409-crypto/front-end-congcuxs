/**
 * Latest XSMB Results Component
 * Hiển thị kết quả xổ số miền Bắc mới nhất ở trang chủ
 * Tự động chuyển sang LiveResult khi đến giờ live
 */

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import XSMBSimpleTable from './XSMBSimpleTable';
import styles from '../styles/LatestXSMBResults.module.css';
import { isWithinLiveWindow } from '../utils/lotteryUtils';

const LiveResult = dynamic(() => import('./LiveResult'), {
    loading: () => (
        <div style={{ 
            minHeight: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#fff',
            borderRadius: '8px',
            margin: '20px 0',
            contain: 'layout style' 
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #f3f3f3', 
                    borderTop: '4px solid #667eea', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 10px'
                }}></div>
                <p>Đang tải kết quả trực tiếp...</p>
            </div>
        </div>
    ),
    ssr: false
});

const LatestXSMBResults = () => {
    const [isLiveWindow, setIsLiveWindow] = useState(false);
    const intervalRef = useRef(null);

    // ✅ Check live window periodically
    useEffect(() => {
        const checkLiveWindow = () => {
            setIsLiveWindow(isWithinLiveWindow());
        };

        // Check immediately
        checkLiveWindow();

        // Clear existing interval if any
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set interval based on current state
        const interval = isLiveWindow ? 5000 : 30000;
        intervalRef.current = setInterval(checkLiveWindow, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isLiveWindow]);

    return (
        <div className={styles.container}>
            {!isLiveWindow && (
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Kết Quả Xổ Số Miền Bắc Mới Nhất
                    </h2>
                </div>
            )}

            <div className={styles.content}>
                {isLiveWindow ? (
                    <LiveResult />
                ) : (
                    <XSMBSimpleTable
                        date="latest"
                        autoFetch={true}
                        showLoto={true}
                        showLoading={true}
                        showError={true}
                        className={styles.tableWrapper}
                    />
                )}
            </div>

        </div>
    );
};

export default LatestXSMBResults;
