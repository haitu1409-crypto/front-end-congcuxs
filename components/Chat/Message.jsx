/**
 * Message Component - Hiển thị 1 tin nhắn
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import { memo, useState, useEffect, useRef } from 'react';
import styles from '../../styles/Message.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const resolveAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (/^https?:\/\//i.test(avatar)) {
        return avatar;
    }
    return `${API_URL}${avatar}`;
};

const Message = memo(function Message({ message, isOwn, showAvatar, formatTime, onMention, currentUserId, onReaction, selectionMode, isSelected, onSelect, onMessageClick, isAdmin, isConsecutive, isLastInGroup }) {
    const [avatarFailed, setAvatarFailed] = useState(false);
    const longPressTimerRef = useRef(null);
    const isLongPressRef = useRef(false);
    
    // Reset avatarFailed when senderAvatar changes
    useEffect(() => {
        setAvatarFailed(false);
    }, [message.senderAvatar]);

    // Cleanup long press timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
        };
    }, []);
    
    // Tạo màu từ chữ cái đầu tiên
    const getColorFromLetter = (letter) => {
        if (!letter) return '#667eea';
        const letterUpper = letter.toUpperCase();
        const colors = [
            '#667eea', // A - Xanh dương
            '#f59e0b', // B - Cam
            '#10b981', // C - Xanh lá
            '#ef4444', // D - Đỏ
            '#8b5cf6', // E - Tím
            '#ec4899', // F - Hồng
            '#06b6d4', // G - Xanh ngọc
            '#f97316', // H - Cam đậm
            '#6366f1', // I - Indigo
            '#14b8a6', // J - Teal
            '#84cc16', // K - Vàng xanh
            '#3b82f6', // L - Xanh dương
            '#a855f7', // M - Tím
            '#f43f5e', // N - Đỏ hồng
            '#fb923c', // O - Cam
            '#22c55e', // P - Xanh lá
            '#eab308', // Q - Vàng
            '#dc2626', // R - Đỏ
            '#0ea5e9', // S - Xanh dương nhạt
            '#d946ef', // T - Tím hồng
            '#64748b', // U - Xám
            '#7c3aed', // V - Tím đậm
            '#f59e0b', // W - Cam
            '#06b6d4', // X - Xanh ngọc
            '#eab308', // Y - Vàng
            '#8b5cf6'  // Z - Tím
        ];
        const index = letterUpper.charCodeAt(0) - 65; // A = 65
        return colors[index >= 0 && index < 26 ? index : 0];
    };

    // Lấy chữ cái đầu tiên của tên
    const getInitial = (name) => {
        if (!name) return '?';
        const firstChar = name.trim().charAt(0).toUpperCase();
        return firstChar.match(/[A-Z]/) ? firstChar : '?';
    };

    const displayName = message.senderDisplayName || message.senderUsername || '';
    const initial = getInitial(displayName);
    const avatarColor = getColorFromLetter(initial);
    // Parse content to highlight mentions and 2-digit numbers (00-99)
    // Preserve whitespace and line breaks
    const renderContent = () => {
        let content = message.content || '';

        // Escape HTML function to prevent XSS
        const escapeHtml = (text) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        };

        // First, highlight mentions (before escaping, so we can match properly)
        if (message.mentions && message.mentions.length > 0) {
            message.mentions.forEach(mention => {
                const displayName = mention.displayName || mention.username;
                // Replace @username or displayName with highlighted version
                const regex = new RegExp(`@?${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
                content = content.replace(regex, (match) => {
                    // Escape the matched text before wrapping in HTML
                    const escapedMatch = escapeHtml(match);
                    return `<span class="${styles.mention}" data-user-id="${mention.userId}" data-username="${mention.username}">${escapedMatch}</span>`;
                });
            });
        }

        // Now escape remaining HTML content
        // Split by HTML tags to preserve already-created mentions
        const parts = content.split(/(<[^>]+>)/);
        const processedParts = parts.map((part) => {
            // If it's an HTML tag (like mention span), keep it as is
            if (part.startsWith('<')) {
                return part;
            }
            // Otherwise, escape HTML and process numbers
            let escapedPart = escapeHtml(part);
            
            // Highlight 2-digit numbers (00-99) in text
            escapedPart = escapedPart.replace(/\b(\d{2})\b/g, (match) => {
                const num = parseInt(match, 10);
                if (num >= 0 && num <= 99) {
                    return `<span class="${styles.twoDigitNumber}">${match}</span>`;
                }
                return match;
            });
            
            return escapedPart;
        });
        content = processedParts.join('');

        // Preserve line breaks: convert \n to <br>
        // Do this after all processing to ensure <br> tags are preserved
        content = content.replace(/\n/g, '<br>');

        return { __html: content };
    };

    const handleSenderClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Ngăn không cho trigger modal
        e.nativeEvent.stopImmediatePropagation(); // Ngăn tất cả các event handlers khác
        if (onMention && message.senderId) {
            onMention({
                userId: message.senderId,
                username: message.senderUsername,
                displayName: message.senderDisplayName || message.senderUsername
            });
        }
    };

    const handleAvatarClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Ngăn không cho trigger modal
        e.nativeEvent.stopImmediatePropagation(); // Ngăn tất cả các event handlers khác
        if (onMention && message.senderId) {
            onMention({
                userId: message.senderId,
                username: message.senderUsername,
                displayName: message.senderDisplayName || message.senderUsername
            });
        }
    };

    const handleMentionClick = (e) => {
        e.preventDefault();
        const mentionEl = e.target.closest(`.${styles.mention}`);
        if (mentionEl && onMention) {
            const userId = mentionEl.getAttribute('data-user-id');
            const username = mentionEl.getAttribute('data-username');
            const displayName = mentionEl.textContent.replace('@', '');
            if (userId) {
                onMention({
                    userId,
                    username,
                    displayName
                });
            }
        }
    };

    // Count reactions for like (thumbs-up) and heart
    const countReactions = () => {
        if (!message.reactions || !Array.isArray(message.reactions)) {
            return { likeCount: 0, heartCount: 0, hasLiked: false, hasHearted: false };
        }

        let likeCount = 0;
        let heartCount = 0;
        let hasLiked = false;
        let hasHearted = false;

        message.reactions.forEach(reaction => {
            const emoji = reaction.emoji || '';
            const userId = reaction.userId?.toString() || reaction.userId?._id?.toString() || '';
            const isCurrentUser = currentUserId && userId === currentUserId.toString();
            
            // Support various emoji formats for thumbs-up
            if (emoji === '👍' || emoji === 'thumbs-up' || emoji === 'thumbsup' || emoji === 'like') {
                likeCount++;
                if (isCurrentUser) {
                    hasLiked = true;
                }
            }
            // Support various emoji formats for heart
            else if (emoji === '❤️' || emoji === '❤' || emoji === 'heart' || emoji === '♥️' || emoji === '♥') {
                heartCount++;
                if (isCurrentUser) {
                    hasHearted = true;
                }
            }
        });

        return { likeCount, heartCount, hasLiked, hasHearted };
    };

    const { likeCount, heartCount, hasLiked, hasHearted } = countReactions();

    // Handle reaction click
    const handleReactionClick = async (emoji) => {
        if (!onReaction || (!message.id && !message._id)) return;
        
        const messageId = message.id || message._id;
        await onReaction(messageId, emoji);
    };

    // Check if device is mobile/touch device
    const isMobileDevice = () => {
        if (typeof window === 'undefined') return false;
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    // Handle opening modal (called from both click and long press)
    const openModal = (e) => {
        // Don't trigger if clicking on reactions
        if (e && e.target && e.target.closest(`.${styles.messageIcons}`)) {
            return;
        }

        // Don't trigger if clicking on reply preview
        if (e && e.target && e.target.closest(`.${styles.replyPreview}`)) {
            return;
        }

        // 🔥 KHÔNG trigger modal nếu click vào sender name hoặc avatar
        if (e && e.target && (
            e.target.closest(`.${styles.messageSender}`) || 
            e.target.closest(`.${styles.messageAvatar}`) ||
            e.target.closest(`.${styles.mention}`)
        )) {
            return;
        }

        if (!selectionMode && onMessageClick) {
            if (e) {
            e.preventDefault();
            e.stopPropagation();
            }
            // Any message can be clicked to open action modal
            onMessageClick(message);
        }
    };

    // Handle message bubble click for modal (desktop)
    const handleBubbleClick = (e) => {
        // Trên mobile, chỉ click không mở modal (cần long press)
        if (isMobileDevice()) {
            return;
        }

        openModal(e);
    };

    // Handle long press on mobile (touchstart)
    const handleTouchStart = (e) => {
        // Don't trigger if clicking on reactions, sender name, avatar, or mention
        if (e.target.closest(`.${styles.messageIcons}`) ||
            e.target.closest(`.${styles.messageSender}`) ||
            e.target.closest(`.${styles.messageAvatar}`) ||
            e.target.closest(`.${styles.mention}`) ||
            e.target.closest(`.${styles.replyPreview}`)) {
            return;
        }

        if (selectionMode) return;

        isLongPressRef.current = false;
        
        // Set timer for long press (500ms)
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            // Haptic feedback on mobile (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            openModal(e);
        }, 500);
    };

    // Handle touch end/cancel (stop long press timer)
    const handleTouchEnd = (e) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        // If it was a long press, prevent default click behavior
        if (isLongPressRef.current) {
            e.preventDefault();
            e.stopPropagation();
            isLongPressRef.current = false;
        }
    };

    const handleTouchCancel = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        isLongPressRef.current = false;
    };

    // Handle container click for selection mode only
    const handleContainerClick = (e) => {
        // Don't trigger if clicking on checkbox
        if (e.target.closest(`.${styles.checkboxContainer}`)) {
            return;
        }

        if (selectionMode && onSelect) {
            e.preventDefault();
            e.stopPropagation();
            const messageId = message.id || message._id;
            onSelect(messageId);
        }
    };

    const messageId = message.id || message._id;

    return (
        <div 
            id={`message-${messageId}`}
            className={`${styles.message} ${isOwn ? styles.ownMessage : ''} ${selectionMode ? styles.selectableMessage : ''} ${isSelected ? styles.selectedMessage : ''} ${isConsecutive ? styles.consecutiveMessage : ''} ${isLastInGroup ? styles.lastInGroup : ''}`}
            onClick={handleContainerClick}
        >
            {selectionMode && (
                <div className={styles.checkboxContainer}>
                    <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => onSelect && onSelect(messageId)}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.checkbox}
                    />
                </div>
            )}
            {!isOwn && showAvatar && (
                <div 
                    className={`${styles.messageAvatar} ${onMention ? styles.clickableAvatar : ''}`}
                    style={{ backgroundColor: (message.senderAvatar && !avatarFailed) ? 'transparent' : avatarColor }}
                    onClick={handleAvatarClick}
                    title={onMention ? "Nhấn để tag người này" : ""}
                >
                    {message.senderAvatar && !avatarFailed ? (
                        <img 
                            src={resolveAvatarUrl(message.senderAvatar)}
                            alt={message.senderDisplayName || message.senderUsername}
                            className={styles.avatarImage}
                            crossOrigin="anonymous"
                            onError={() => {
                                setAvatarFailed(true);
                                console.warn(`Avatar failed to load: ${message.senderAvatar}`);
                            }}
                            onLoad={() => {
                                // Successfully loaded - ensure failed state is cleared
                                setAvatarFailed(false);
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <span className={styles.avatarInitial}>{initial}</span>
                    )}
                </div>
            )}
            {!isOwn && !showAvatar && (
                <div className={styles.messageAvatarPlaceholder}></div>
            )}
            <div className={styles.messageContent}>
                <div 
                    className={`${styles.messageBubble} ${!selectionMode ? styles.clickableBubble : ''}`}
                    onClick={handleBubbleClick}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                >
                    {/* Reply Preview */}
                    {message.replyTo && (
                        <div 
                            className={styles.replyPreview}
                            onClick={(e) => {
                                e.stopPropagation();
                                // Scroll to replied message if possible
                                const repliedMessageId = message.replyTo.id || message.replyTo._id;
                                const repliedElement = document.getElementById(`message-${repliedMessageId}`);
                                if (repliedElement) {
                                    repliedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Highlight briefly
                                    repliedElement.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                                    setTimeout(() => {
                                        repliedElement.style.backgroundColor = '';
                                    }, 2000);
                                }
                            }}
                        >
                            <div className={styles.replyPreviewContent}>
                                <div className={styles.replyPreviewSender}>
                                    {message.replyTo.senderDisplayName || message.replyTo.senderUsername}
                                </div>
                                <div className={styles.replyPreviewText}>
                                    {message.replyTo.content && message.replyTo.content.length > 50 
                                        ? message.replyTo.content.substring(0, 50) + '...'
                                        : message.replyTo.content}
                                </div>
                            </div>
                        </div>
                    )}
                    {!isOwn && showAvatar && (
                        <div className={styles.messageSenderContainer}>
                            <div 
                                className={`${styles.messageSender} ${onMention ? styles.clickableSender : ''}`}
                                style={{ color: avatarColor }}
                                onClick={handleSenderClick}
                                title={onMention ? "Nhấn để tag người này" : ""}
                            >
                                {message.senderDisplayName || message.senderUsername}
                            </div>
                            {message.senderRole === 'admin' && (
                                <span className={styles.adminLabel}>admin</span>
                            )}
                        </div>
                    )}
                    <div 
                        className={styles.messageText}
                        dangerouslySetInnerHTML={renderContent()}
                        onClick={handleMentionClick}
                    />
                    <div className={styles.messageFooter}>
                        <div className={styles.messageIcons}>
                            <div 
                                className={`${styles.reactionIcon} ${hasLiked ? styles.reactionActive : ''}`}
                                onClick={() => handleReactionClick('👍')}
                                title="Like"
                            >
                                <span className={`${styles.emojiIcon} ${hasLiked ? styles.iconActive : ''}`}>😂</span>
                                {likeCount > 0 && <span className={styles.reactionCount}>{likeCount}</span>}
                            </div>
                            <div 
                                className={`${styles.reactionIcon} ${hasHearted ? styles.reactionActive : ''}`}
                                onClick={() => handleReactionClick('❤️')}
                                title="Heart"
                            >
                                <span className={`${styles.emojiIcon} ${hasHearted ? styles.iconActive : ''}`}>❤️</span>
                                {heartCount > 0 && <span className={styles.reactionCount}>{heartCount}</span>}
                            </div>
                        </div>
                        <div className={styles.messageTime}>
                            {formatTime(message.createdAt)}
                            {message.isEdited && (
                                <span className={styles.editedLabel}> (Đã sửa)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Return true if props are equal (skip re-render), false if different (re-render)
    const messageId = prevProps.message?.id || prevProps.message?._id;
    const nextMessageId = nextProps.message?.id || nextProps.message?._id;
    
    // Message changed
    if (messageId !== nextMessageId) return false;
    
    // Content or edit status changed
    if (prevProps.message?.content !== nextProps.message?.content) return false;
    if (prevProps.message?.isEdited !== nextProps.message?.isEdited) return false;
    
    // Reactions changed
    const prevReactionsLength = prevProps.message?.reactions?.length || 0;
    const nextReactionsLength = nextProps.message?.reactions?.length || 0;
    if (prevReactionsLength !== nextReactionsLength) return false;
    
    // Selection state changed
    if (prevProps.isSelected !== nextProps.isSelected) return false;
    if (prevProps.selectionMode !== nextProps.selectionMode) return false;
    
    // Display props changed
    if (prevProps.isOwn !== nextProps.isOwn) return false;
    if (prevProps.showAvatar !== nextProps.showAvatar) return false;
    if (prevProps.isConsecutive !== nextProps.isConsecutive) return false;
    if (prevProps.isLastInGroup !== nextProps.isLastInGroup) return false;
    
    // All props are equal, skip re-render
    return true;
});

export default Message;

