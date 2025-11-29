/**
 * Latest XSMB Results Component
 * Hiển thị kết quả xổ số miền Bắc mới nhất ở trang chủ
 */

import React from 'react';
import dynamic from 'next/dynamic';
import XSMBSimpleTable from './XSMBSimpleTable';
import styles from '../styles/LatestXSMBResults.module.css';

const ChatPreview = dynamic(() => import('./Chat/ChatPreview'), {
    ssr: false
});

const LatestXSMBResults = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    Kết Quả Xổ Số Miền Bắc Mới Nhất
                </h2>
            </div>

            <div className={styles.content}>
                <XSMBSimpleTable
                    date="latest"
                    autoFetch={true}
                    showLoto={true}
                    showLoading={true}
                    showError={true}
                    className={styles.tableWrapper}
                />

                <div className={styles.chatPreviewWrapper}>
                    <ChatPreview />
                </div>
            </div>

        </div>
    );
};

export default LatestXSMBResults;
