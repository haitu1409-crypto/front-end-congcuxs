/**
 * UserList Component - Danh sách users online
 * Optimized: Avatar data comes from backend, no need to fetch
 */

import { useState, useEffect } from 'react';
import { Circle, MessageCircle } from 'lucide-react';
import styles from '../../styles/UserList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Format time ago (Vietnamese)
const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = Date.now();
    const lastSeen = new Date(date).getTime();
    const diff = now - lastSeen;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    if (months < 12) return `${months} tháng trước`;
    return `${years} năm trước`;
};

// Helper function to get color from first letter
const getColorFromLetter = (letter) => {
    const upperLetter = letter?.toUpperCase() || '?';
    const colors = {
        'A': '#667eea', 'B': '#f59e0b', 'C': '#10b981', 'D': '#3b82f6',
        'E': '#8b5cf6', 'F': '#ec4899', 'G': '#14b8a6', 'H': '#f97316',
        'I': '#6366f1', 'J': '#84cc16', 'K': '#eab308', 'L': '#06b6d4',
        'M': '#a855f7', 'N': '#22c55e', 'O': '#ef4444', 'P': '#06b6d4',
        'Q': '#f43f5e', 'R': '#0ea5e9', 'S': '#8b5cf6', 'T': '#14b8a6',
        'U': '#3b82f6', 'V': '#ec4899', 'W': '#10b981', 'X': '#f59e0b',
        'Y': '#667eea', 'Z': '#6366f1'
    };
    return colors[upperLetter] || '#9ca3af';
};

// Helper function to get first letter
const getFirstLetter = (name) => {
    if (!name) return '?';
    const firstChar = name.trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : '?';
};

export default function UserList({ users, currentUserId, currentUserRole, onPrivateChatClick, unreadCounts = {} }) {
    // State to force re-render every minute for time updates
    const [, setUpdateTick] = useState(0);
    
    // Update time display every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateTick(prev => prev + 1);
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, []);
    
    // Check if current user can chat with target user
    const canChatWith = (targetUser) => {
        // Can't chat with yourself
        if (targetUser.userId === currentUserId) return false;
        
        const isCurrentUserAdmin = currentUserRole === 'admin';
        const isTargetAdmin = targetUser.role === 'admin';
        
        // Admin can chat with anyone (admin or user)
        if (isCurrentUserAdmin) return true;
        
        // User can only chat with admin
        if (!isCurrentUserAdmin && isTargetAdmin) return true;
        
        // User cannot chat with other users
        return false;
    };
    
    if (!users || users.length === 0) {
        return (
            <div className={styles.userList}>
                <div className={styles.emptyState}>
                    <p>Chưa có ai trong phòng</p>
                </div>
            </div>
        );
    }

    // Count online and offline users
    const onlineCount = users.filter(u => u.status === 'online').length;
    const offlineCount = users.filter(u => u.status === 'offline').length;

    return (
        <div className={styles.userList}>
            <div className={styles.userListHeader}>
                <h4>Thành viên ({users.length})</h4>
                <p className={styles.userStats}>
                    <span className={styles.onlineCount}>{onlineCount} online</span>
                    {offlineCount > 0 && (
                        <span className={styles.offlineCount}> • {offlineCount} offline</span>
                    )}
                </p>
            </div>
            <div className={styles.userListContent}>
                {users.map(user => {
                    const displayName = user.displayName || user.username || 'User';
                    const initial = getFirstLetter(displayName);
                    const avatarColor = getColorFromLetter(initial);
                    const isOnline = user.status === 'online';
                    const timeAgo = !isOnline && user.lastSeen ? formatTimeAgo(user.lastSeen) : '';
                    const showChatIcon = canChatWith(user);
                    const unreadCount = unreadCounts[user.userId] || 0;

                    return (
                        <div key={user.userId} className={`${styles.userItem} ${!isOnline ? styles.userOffline : ''}`}>
                            <div 
                                className={styles.userAvatar}
                                style={{ 
                                    backgroundColor: user.avatar ? 'transparent' : avatarColor
                                }}
                            >
                                {user.avatar ? (
                                    <img 
                                        src={`${API_URL}${user.avatar}`}
                                        alt={displayName}
                                        className={styles.avatarImage}
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <span className={styles.avatarInitial}>{initial}</span>
                                )}
                            </div>
                            <div className={styles.userInfo}>
                                <div className={styles.userNameRow}>
                                    <span className={styles.userName}>{displayName}</span>
                                    {user.role === 'admin' && (
                                        <span className={styles.adminBadge}>admin</span>
                                    )}
                                    {showChatIcon && (
                                        <div 
                                            className={styles.chatIconContainer}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onPrivateChatClick && onPrivateChatClick(user);
                                            }}
                                            title="Nhắn tin riêng"
                                        >
                                            <MessageCircle size={14} className={styles.chatIcon} />
                                            {unreadCount > 0 && (
                                                <span className={styles.unreadBadge}>
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {!isOnline && timeAgo && (
                                    <span className={styles.lastSeen}>{timeAgo}</span>
                                )}
                            </div>
                            <Circle 
                                className={`${styles.statusIndicator} ${isOnline ? styles.statusOnline : styles.statusOffline}`} 
                                size={8} 
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

