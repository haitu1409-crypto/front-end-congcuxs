/**
 * MessageList Component - Hiển thị danh sách tin nhắn
 */

import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import styles from '../../styles/MessageList.module.css';

export default function MessageList({ messages, typingUsers, currentUserId, messagesEndRef, onMention, onReaction, selectionMode, selectedMessages, onMessageSelect, onMessageClick, isAdmin }) {
    const listRef = useRef(null);

    // Format time
    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    // Auto scroll when new messages arrive
    useEffect(() => {
        if (messages.length > 0 && messagesEndRef?.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                });
            }, 100);
        }
    }, [messages.length, messagesEndRef]);

    return (
        <div className={styles.messageList} ref={listRef}>
            {messages.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
            ) : (
                messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    
                    // Check if messages are from same sender
                    const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
                    
                    // Check time difference between current message and previous message (30 seconds = 30000ms)
                    const timeDiffWithPrev = prevMessage 
                        ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()
                        : null;
                    const hasTimeGapWithPrev = timeDiffWithPrev !== null && timeDiffWithPrev > 30000; // More than 30 seconds
                    
                    // Check time difference between next message and current message
                    const timeDiffWithNext = nextMessage 
                        ? new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime()
                        : null;
                    const hasTimeGapWithNext = timeDiffWithNext !== null && timeDiffWithNext > 30000;
                    
                    // A message is consecutive if same sender AND no time gap
                    const isConsecutive = isSameSender && !hasTimeGapWithPrev;
                    
                    // Last in group: no next message OR different sender OR time gap > 30s
                    const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId || hasTimeGapWithNext;
                    
                    // First in group: no previous message OR different sender OR time gap > 30s
                    const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId || hasTimeGapWithPrev;
                    
                    // Show avatar if:
                    // 1. First message in group (different sender or time gap > 30s from previous)
                    // 2. Last message in group (no next or different sender or time gap > 30s to next)
                    const showAvatar = isFirstInGroup || isLastInGroup;
                    
                    const messageId = message.id || message._id;
                    const isSelected = selectedMessages?.has(messageId);

                    return (
                        <Message
                            key={messageId || index}
                            message={message}
                            isOwn={message.senderId === currentUserId}
                            showAvatar={showAvatar}
                            isConsecutive={isConsecutive}
                            isLastInGroup={isLastInGroup}
                            showTime={true}
                            formatTime={formatTime}
                            onMention={onMention}
                            currentUserId={currentUserId}
                            onReaction={onReaction}
                            selectionMode={selectionMode}
                            isSelected={isSelected}
                            onSelect={onMessageSelect}
                            onMessageClick={onMessageClick}
                            isAdmin={isAdmin}
                        />
                    );
                })
            )}
            {typingUsers.length > 0 && (
                <TypingIndicator users={typingUsers} />
            )}
        </div>
    );
}

