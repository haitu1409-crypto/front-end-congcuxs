/**
 * Desktop Header Box Component
 * Chỉ hiển thị trên desktop, ẩn hoàn toàn trên mobile
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Star, Zap, Target, BarChart3, Calendar, Award, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './Auth/AuthButton';
import styles from '../styles/DesktopHeader.module.css';

export default function DesktopHeader() {
    const [currentTime, setCurrentTime] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Chỉ render sau khi component đã mount trên client
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Show header with animation after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const stats = [
        { icon: Users, label: 'Người dùng', value: '10K+', color: 'blue' },
        { icon: Target, label: 'Dàn tạo', value: '50K+', color: 'green' },
        { icon: Award, label: 'Tỷ lệ trúng', value: '85%', color: 'purple' },
        { icon: TrendingUp, label: 'Tăng trưởng', value: '+25%', color: 'orange' }
    ];

    return (
        <div className={`${styles.desktopHeader} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.headerContainer}>
                {/* Left Section - Time & Date */}
                <div className={styles.timeSection}>
                    <div className={styles.timeDisplay}>
                        <Calendar className={styles.timeIcon} />
                        <div className={styles.timeInfo}>
                            <div className={styles.currentTime}>
                                {mounted && currentTime ? formatTime(currentTime) : '--:--'}
                            </div>
                            <div className={styles.currentDate}>
                                {mounted && currentTime ? formatDate(currentTime) : 'Đang tải...'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Section - Logo */}
                <div className={styles.logoSection}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Image
                                src="/imgs/monkey.png"
                                alt="Dàn Đề Wukong"
                                width={32}
                                height={32}
                                className={styles.logoImage}
                                priority
                                fetchPriority="high"
                                sizes="32px"
                                loading="eager"
                            />
                        </div>
                        <span className={styles.logoText}>
                            <span className={styles.logoTextMain}>Dàn Đề Wukong</span>
                            <span className={styles.logoTextSub}>Công cụ chuyên nghiệp</span>
                        </span>
                    </Link>
                </div>

                {/* Right Section - Stats & Auth */}
                <div className={styles.statsSection}>
                    <div className={styles.statsGrid}>
                        {stats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={index} className={`${styles.statItem} ${styles[stat.color]}`}>
                                    <IconComponent className={styles.statIcon} />
                                    <div className={styles.statContent}>
                                        <div className={styles.statValue}>{stat.value}</div>
                                        <div className={styles.statLabel}>{stat.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className={styles.decorativeElements}>
                <div className={styles.floatingIcon}>
                    <Zap className={styles.floatingIconSvg} />
                </div>
                <div className={styles.floatingIcon}>
                    <BarChart3 className={styles.floatingIconSvg} />
                </div>
            </div>
        </div>
    );
}

