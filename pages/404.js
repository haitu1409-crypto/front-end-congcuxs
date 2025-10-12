/**
 * Custom 404 Page - Tối ưu SEO
 */

import Link from 'next/link';
import Head from 'next/head';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import styles from '../styles/Error.module.css';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 - Không Tìm Thấy Trang | Tạo Dàn Đề</title>
                <meta name="description" content="Trang bạn tìm kiếm không tồn tại. Quay lại trang chủ để sử dụng công cụ tạo dàn số." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <PageSpeedOptimizer />

            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.errorCode}>404</div>
                    <h1 className={styles.errorTitle}>Không Tìm Thấy Trang</h1>
                    <p className={styles.errorDescription}>
                        Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
                    </p>

                    <div className={styles.suggestions}>
                        <h2>Bạn có thể thử:</h2>
                        <ul>
                            <li>Kiểm tra lại địa chỉ URL</li>
                            <li>Quay lại trang chủ</li>
                            <li>Sử dụng các công cụ dưới đây</li>
                        </ul>
                    </div>

                    <div className={styles.quickLinks}>
                        <Link href="/" className={styles.primaryButton}>
                            🏠 Trang Chủ
                        </Link>
                        <Link href="/dan-2d" className={styles.secondaryButton}>
                            🎯 Dàn 2D
                        </Link>
                        <Link href="/dan-3d4d" className={styles.secondaryButton}>
                            📊 Dàn 3D/4D
                        </Link>
                        <Link href="/dan-dac-biet" className={styles.secondaryButton}>
                            ⭐ Dàn Đặc Biệt
                        </Link>
                        <Link href="/content" className={styles.secondaryButton}>
                            📚 Hướng dẫn & Mẹo chơi
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

