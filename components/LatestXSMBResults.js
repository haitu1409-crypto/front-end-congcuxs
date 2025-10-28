/**
 * Latest XSMB Results Component
 * Hiển thị kết quả xổ số miền Bắc mới nhất ở trang chủ
 */

import React, { useState } from 'react';
import XSMBSimpleTable from './XSMBSimpleTable';
import { clearLatestCache } from '../services/xsmbApi';
import styles from '../styles/LatestXSMBResults.module.css';

const LatestXSMBResults = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        clearLatestCache();
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    🎯 Kết Quả Xổ Số Miền Bắc Mới Nhất
                </h2>
                <button 
                    onClick={handleRefresh}
                    className={styles.refreshButton}
                    title="Làm mới dữ liệu"
                >
                    🔄
                </button>
            </div>

            <div className={styles.content}>
                <XSMBSimpleTable
                    key={refreshKey}
                    date="latest"
                    autoFetch={true}
                    showLoto={true}
                    showLoading={true}
                    showError={true}
                    className={styles.tableWrapper}
                />
            </div>

        </div>
    );
};

export default LatestXSMBResults;
