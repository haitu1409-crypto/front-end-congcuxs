/**
 * ChatPreview Component
 * Hiển thị đoạn hội thoại gần nhất từ group chat với thiết kế đơn giản
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getChatGifById, getChatGifUrl } from '../../lib/chatGifs';
import { useChat } from '../../hooks/useChat';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';
import styles from '../../styles/ChatPreview.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getSenderName = (message) => {
    if (!message) return 'Người dùng';
    return (
        message.senderDisplayName ||
        message.senderName ||
        message.senderUsername ||
        message.senderId ||
        'Người dùng'
    );
};

const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
};

const autoLinkUrls = (text, linkClass) => {
    if (!text) return text;
    const urlRegex = /\b((?:https?:\/\/|www\.)[\w-]+(?:\.[\w.-]+)+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?)/gi;
    return text.replace(urlRegex, (match) => {
        const trimmed = match.trim();
        if (/^(https?:\/\/)/i.test(trimmed)) {
            return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${trimmed}</a>`;
        }
        return `<a href="https://${trimmed}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${trimmed}</a>`;
    });
};

const renderMessageContent = (message) => {
    let content = message.content || '';

    const mentions = Array.isArray(message.mentions) ? message.mentions : [];
    mentions.forEach((mention) => {
        const displayName = mention.displayName || mention.username;
        if (!displayName) return;
        const regex = new RegExp(`@?${displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        content = content.replace(regex, (match) => {
            const escapedMatch = escapeHtml(match);
            return `<span class="${styles.mention}" data-user-id="${mention.userId}" data-username="${mention.username}">${escapedMatch}</span>`;
        });
    });

    const gifTokenRegex = /\{\{gif:([a-z0-9-]+)\}\}/gi;
    content = content.replace(gifTokenRegex, (match, rawId) => {
        const gifId = (rawId || '').toLowerCase();
        const gif = getChatGifById(gifId);
        if (!gif) {
            return match;
        }
        const gifUrl = getChatGifUrl(gif);
        if (!gifUrl) {
            return match;
        }
        const safeLabel = escapeHtml(gif.label || gif.id || 'GIF');
        return `<span class="${styles.gifWrapper}" data-gif-id="${gif.id}"><img src="${gifUrl}" alt="${safeLabel}" loading="lazy" decoding="async" class="${styles.gifImage}" /></span>`;
    });

    const parts = content.split(/(<[^>]+>)/);
    const processedParts = parts.map((part) => {
        if (part.startsWith('<')) {
            return part;
        }
        let escapedPart = escapeHtml(part);
        escapedPart = autoLinkUrls(escapedPart, styles.messageLink);
        escapedPart = escapedPart.replace(/\b(\d{2,})\b/g, (match) => {
            return `<span class="${styles.highlightNumber}">${match}</span>`;
        });
        return escapedPart;
    });

    return processedParts.join('');
};

const getFirstLetter = (name) => {
    if (!name) return '?';
    const firstChar = name.trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : '?';
};

const getColorFromLetter = (letter) => {
    if (!letter) return '#667eea';
    const letterUpper = letter.toUpperCase();
    const colors = [
        '#667eea', // A
        '#f59e0b', // B
        '#10b981', // C
        '#ef4444', // D
        '#8b5cf6', // E
        '#ec4899', // F
        '#06b6d4', // G
        '#f97316', // H
        '#6366f1', // I
        '#14b8a6', // J
        '#84cc16', // K
        '#3b82f6', // L
        '#a855f7', // M
        '#f43f5e', // N
        '#fb923c', // O
        '#22c55e', // P
        '#eab308', // Q
        '#dc2626', // R
        '#0ea5e9', // S
        '#d946ef', // T
        '#64748b', // U
        '#7c3aed', // V
        '#f59e0b', // W
        '#06b6d4', // X
        '#eab308', // Y
        '#8b5cf6'  // Z
    ];
    const index = letterUpper.charCodeAt(0) - 65;
    return colors[index >= 0 && index < 26 ? index : 0];
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function ChatPreview({ className }) {
    const { isAuthenticated, token, loading: authLoading } = useAuth();
    const [roomId, setRoomId] = useState(null);
    const [error, setError] = useState(null);
    const {
        messages: chatMessages,
        loading: chatLoading,
        sendMessage,
        sending,
        startTyping,
        stopTyping
    } = useChat(roomId);
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [visibleCount, setVisibleCount] = useState(15);
    const [stickToBottom, setStickToBottom] = useState(true);
    const typingTimeoutRef = useRef(null);
    const messageListRef = useRef(null);
    const prevMessageCountRef = useRef(0);
    const loadMoreHeightRef = useRef(null);

    const handleEmojiInsert = (emojiChar) => {
        if (!emojiChar) return;
        setInputValue((prev) => `${prev}${emojiChar}`);
    };

    const fetchRoomId = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API_URL}/api/chat/groupchat`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const fetchedRoomId = response.data?.data?.room?.roomId;
            if (response.data.success && fetchedRoomId) {
                setRoomId(fetchedRoomId);
                setError(null);
            } else {
                setError('Không tìm thấy phòng chat');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Bạn chưa được cấp quyền truy cập chat.');
            } else {
                setError('Không thể kết nối đến chat.');
            }
        }
    }, [token]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setRoomId(null);
            setError(null);
            return;
        }
        fetchRoomId();
    }, [fetchRoomId, isAuthenticated, token]);

    useEffect(() => {
        if (!chatMessages) return;
        setVisibleCount((prev) => {
            const initial = 15;
            const target = prev ? prev : initial;
            return Math.min(Math.max(target, initial), chatMessages.length || initial);
        });
    }, [chatMessages]);

    const renderedMessages = useMemo(() => {
        if (!chatMessages || chatMessages.length === 0) return [];
        const startIndex = Math.max(chatMessages.length - visibleCount, 0);
        return chatMessages.slice(startIndex);
    }, [chatMessages, visibleCount]);

    const hasMoreMessages = !!chatMessages && chatMessages.length > renderedMessages.length;

    useEffect(() => {
        if (!chatMessages) return;

        if (chatMessages.length > prevMessageCountRef.current) {
            setStickToBottom(true);
        }
        prevMessageCountRef.current = chatMessages.length;
    }, [chatMessages]);

    useEffect(() => {
        const list = messageListRef.current;
        if (!list) return;

        if (loadMoreHeightRef.current !== null) {
            const previousHeight = loadMoreHeightRef.current;
            const newHeight = list.scrollHeight;
            const heightDiff = newHeight - previousHeight;
            list.scrollTop = heightDiff;
            loadMoreHeightRef.current = null;
            return;
        }

        if (stickToBottom) {
            list.scrollTop = list.scrollHeight;
        }
    }, [renderedMessages, stickToBottom]);

    const isInitialLoading = isAuthenticated && !error && !roomId;

    const handleStopTyping = useCallback(() => {
        if (stopTyping) {
            stopTyping();
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [stopTyping]);

    const handleInputChange = (event) => {
        const { value } = event.target;
        setInputValue(value);

        if (!roomId) return;

        if (value.trim()) {
            startTyping?.();
        } else {
            handleStopTyping();
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 2000);
    };

    const handleSend = async (event) => {
        event?.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed || sending || !roomId) {
            return;
        }
        try {
            await sendMessage(trimmed);
            setStickToBottom(true);
        } finally {
            setInputValue('');
            handleStopTyping();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className={`${styles.previewCard} ${className ? className : ''}`}
        >
            <div className={styles.welcomeBanner}>
                Chào mừng bạn đến với phòng chat, hãy mở toàn màn hình để chat riêng với admin,
                đổi ảnh đại diện của mình, gửi hình ảnh trong chat, trả lời tin nhắn người khác,
                xóa tin nhắn, chỉnh sửa, copy,..
            </div>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <MessageCircle size={16} />
                    <span>Group Chat Wukong</span>
                </div>
                <Link href="/chat" className={styles.openFullLink}>
                    Mở toàn màn hình →
                </Link>
            </div>

            <div className={styles.body}>
                {authLoading ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={20} />
                        <span>Đang kiểm tra phiên đăng nhập...</span>
                    </div>
                ) : !isAuthenticated ? (
                    <div className={styles.centerState}>
                        <p className={styles.notice}>
                            Đăng nhập để xem và tham gia trò chuyện cùng cộng đồng.
                        </p>
                        <Link href="/chat" className={styles.loginButton}>
                            Đăng nhập &amp; tham gia
                        </Link>
                    </div>
                ) : (chatLoading || isInitialLoading) && renderedMessages.length === 0 ? (
                    <div className={styles.centerState}>
                        <Loader2 className={styles.spinner} size={20} />
                        <span>Đang tải tin nhắn...</span>
                    </div>
                ) : error ? (
                    <div className={styles.centerState}>
                        <p className={styles.errorText}>{error}</p>
                        <button
                            type="button"
                            className={styles.retryButton}
                            onClick={fetchRoomId}
                        >
                            Thử lại
                        </button>
                    </div>
                ) : renderedMessages.length === 0 ? (
                    <div className={styles.centerState}>
                        <p className={styles.notice}>Chưa có tin nhắn nào.</p>
                    </div>
                ) : (
                    <div className={styles.messageList} ref={messageListRef}>
                        {hasMoreMessages && (
                            <div className={styles.loadMoreWrapper}>
                                <button
                                    type="button"
                                    className={styles.loadMoreButton}
                                    onClick={() => {
                                        const list = messageListRef.current;
                                        if (list) {
                                            loadMoreHeightRef.current = list.scrollHeight;
                                        }
                                        setStickToBottom(false);
                                        setVisibleCount((prev) =>
                                            Math.min(prev + 15, chatMessages ? chatMessages.length : prev + 15)
                                        );
                                    }}
                                >
                                    &raquo; Xem nội dung trước
                                </button>
                            </div>
                        )}
                        {renderedMessages.map((message) => {
                            const messageId = message.id || message._id;
                            const senderName = getSenderName(message);
                            const senderColor = getColorFromLetter(
                                getFirstLetter(senderName)
                            );
                            return (
                                <div key={messageId} className={styles.messageLine}>
                                    <div className={styles.senderLine}>
                                        <span
                                            className={styles.sender}
                                            style={{ color: senderColor }}
                                        >
                                            {senderName}
                                        </span>
                                        <span className={styles.time}>
                                            {formatTime(message.createdAt)}
                                        </span>
                                    </div>
                                    <div className={styles.contentLine}>
                                        {message.attachments?.length > 0 ? (
                                            <span className={styles.attachmentNotice}>
                                                📎 {message.attachments.length} tệp đính kèm
                                            </span>
                                        ) : message.content ? (
                                            <span
                                                className={styles.messageContent}
                                                dangerouslySetInnerHTML={{
                                                    __html: renderMessageContent(message)
                                                }}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {isAuthenticated && roomId && !error && (
                <form className={styles.inputWrapper} onSubmit={handleSend}>
                    <textarea
                        className={styles.inputField}
                        placeholder="Nhập tin nhắn..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleStopTyping}
                        rows={1}
                        disabled={sending}
                    />
                    <div className={styles.inputActions}>
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => {
                                setShowGifPicker(false);
                                setShowEmojiPicker((prev) => !prev);
                            }}
                            aria-label="Chèn emoji"
                        >
                            <span className={styles.actionEmoji}>😊</span>
                        </button>
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => {
                                setShowEmojiPicker(false);
                                setShowGifPicker((prev) => !prev);
                            }}
                            aria-label="Chèn GIF"
                        >
                            GIF
                        </button>
                    </div>
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={sending || !inputValue.trim()}
                    >
                        {sending ? 'Đang gửi...' : 'Gửi'}
                    </button>
                    {showEmojiPicker && (
                        <div className={styles.pickerPopover}>
                            <EmojiPicker
                                isOpen={showEmojiPicker}
                                onEmojiSelect={(emoji) => handleEmojiInsert(emoji?.native || emoji?.emoji || '')}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        </div>
                    )}
                    {showGifPicker && (
                        <div className={styles.pickerPopover}>
                            <GifPicker
                                isOpen={showGifPicker}
                                onClose={() => setShowGifPicker(false)}
                                onGifSelect={(gif) => {
                                    if (!gif) return;
                                    setShowGifPicker(false);
                                    sendMessage(`{{gif:${gif.id}}}`);
                                }}
                            />
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}


