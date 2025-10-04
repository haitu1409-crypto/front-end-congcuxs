/**
 * Summary Cards Component
 * Component hiển thị thẻ tóm tắt thống kê cho từng miền
 */

import { TrendingUp } from 'lucide-react';
import styles from '../../styles/ThongKe.module.css';

const REGION_NAMES = {
    mienNam: 'Miền Nam',
    mienTrung: 'Miền Trung',
    mienBac: 'Miền Bắc'
};

const REGION_COLORS = {
    mienNam: '#10b981',
    mienTrung: '#f59e0b',
    mienBac: '#3b82f6'
};

export default function SummaryCards({ summary }) {
    if (!summary) return null;

    return (
        <div className={styles.summaryCards}>
            {Object.entries(summary).map(([region, stats]) => (
                <div key={region} className={styles.summaryCard}>
                    <div className={styles.summaryHeader}>
                        <h3>{REGION_NAMES[region]}</h3>
                        <TrendingUp
                            className={styles.summaryIcon}
                            style={{ color: REGION_COLORS[region] }}
                        />
                    </div>
                    <div className={styles.summaryStats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Tỷ lệ trúng:</span>
                            <span
                                className={styles.statValue}
                                style={{
                                    color: stats.hitRate >= 50 ? '#10b981' : '#dc2626'
                                }}
                            >
                                {stats.hitRate}%
                            </span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Trúng:</span>
                            <span className={styles.statValue} style={{ color: '#10b981' }}>
                                {stats.totalHits}
                            </span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Trượt:</span>
                            <span className={styles.statValue} style={{ color: '#dc2626' }}>
                                {stats.totalMisses}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
