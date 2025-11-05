/**
 * MessageInput Component - Input để gửi tin nhắn
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import styles from '../../styles/MessageInput.module.css';

export default function MessageInput({ onSend, onTyping, onStopTyping, sending, disabled, mentions = [], onCancelMentions, replyTo = null, onCancelReply }) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiButtonRef = useRef(null);

    // Handle input change
    const handleChange = (e) => {
        setMessage(e.target.value);
        
        // Trigger typing
        if (e.target.value.trim() && onTyping) {
            onTyping();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            if (onStopTyping) {
                onStopTyping();
            }
        }, 3000);
    };

    // Handle send
    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || sending || disabled) return;

        onSend(message, null, mentions, replyTo);
        setMessage('');
        
        // Reset textarea height to initial height
        if (inputRef.current) {
            inputRef.current.style.height = '40px';
        }
        
        if (onCancelMentions) {
            onCancelMentions();
        }
        if (onCancelReply) {
            onCancelReply();
        }
        if (onStopTyping) {
            onStopTyping();
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    // Reset textarea height when message is cleared
    useEffect(() => {
        if (!message && inputRef.current) {
            inputRef.current.style.height = '40px';
        }
    }, [message]);

    // Focus input when mentions change
    useEffect(() => {
        if (mentions.length > 0) {
            inputRef.current?.focus();
        }
    }, [mentions]);

    // Handle input focus on mobile - ensure input stays above keyboard
    useEffect(() => {
        const input = inputRef.current;
        const container = input?.closest(`.${styles.messageInput}`);
        if (!input || !container) return;

        const handleFocus = () => {
            // On mobile, use visual viewport to position input correctly
            if (typeof window !== 'undefined' && window.visualViewport) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const visualViewport = window.visualViewport;
                        if (visualViewport) {
                            // Get the input container position
                            const containerRect = container.getBoundingClientRect();
                            const viewportHeight = visualViewport.height;
                            const viewportBottom = visualViewport.offsetTop + viewportHeight;
                            
                            // If input container is below visible viewport, scroll it up
                            if (containerRect.bottom > viewportBottom - 10) {
                                // Scroll the input container into view
                                container.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'end',
                                    inline: 'nearest'
                                });
                            }
                        }
                    }, 250); // Wait for keyboard animation
                });
            }
        };

        input.addEventListener('focus', handleFocus);
        return () => {
            input.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Auto-add @username to content when mentions are added
    useEffect(() => {
        if (mentions.length > 0 && inputRef.current) {
            const lastMention = mentions[mentions.length - 1];
            const displayName = lastMention.displayName || lastMention.username;
            const mentionText = `@${displayName} `;
            
            // Only add if not already in content
            if (!message.includes(mentionText.trim())) {
                const currentValue = inputRef.current.value;
                const cursorPos = inputRef.current.selectionStart;
                const newValue = currentValue.slice(0, cursorPos) + mentionText + currentValue.slice(cursorPos);
                setMessage(newValue);
                
                // Set cursor position after mention
                setTimeout(() => {
                    const newCursorPos = cursorPos + mentionText.length;
                    inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                }, 0);
            }
        }
    }, [mentions.length]); // Only trigger when mentions count changes

    // Handle emoji select
    const handleEmojiSelect = (emoji) => {
        if (inputRef.current) {
            const currentValue = inputRef.current.value;
            const cursorPos = inputRef.current.selectionStart;
            const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
            setMessage(newValue);
            
            // Set cursor position after emoji
            setTimeout(() => {
                const newCursorPos = cursorPos + emoji.length;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                inputRef.current.focus();
            }, 0);
            
            // Trigger typing indicator
            if (onTyping) {
                onTyping();
            }
        }
        // Note: Don't close emoji picker automatically - let user select multiple emojis
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker) {
                const emojiPickerEl = document.querySelector('[class*="emojiPicker"]');
                if (
                    emojiButtonRef.current &&
                    !emojiButtonRef.current.contains(event.target) &&
                    emojiPickerEl &&
                    !emojiPickerEl.contains(event.target)
                ) {
                    setShowEmojiPicker(false);
                }
            }
        };

        if (showEmojiPicker) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Detect if mobile (touch device or small screen)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                || window.innerWidth <= 768;
            
            if (isMobile) {
                // On mobile: Enter creates new line, use Send button to submit
                // Plain Enter will create new line (default textarea behavior)
                return;
            } else {
                // On desktop: Enter to send, Shift+Enter for new line
                if (e.shiftKey) {
                    // Shift+Enter creates new line (default textarea behavior)
                    return;
                } else {
                    // Plain Enter sends message
                    e.preventDefault();
                    handleSend(e);
                }
            }
        }
    };

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <form className={styles.messageInput} onSubmit={handleSend}>
            {/* Reply Preview */}
            {replyTo && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyPreviewContent}>
                        <div className={styles.replyPreviewLabel}>Đang trả lời</div>
                        <div className={styles.replyPreviewSender}>
                            {replyTo.senderDisplayName || replyTo.senderUsername}
                        </div>
                        <div className={styles.replyPreviewText}>
                            {replyTo.content && replyTo.content.length > 50 
                                ? replyTo.content.substring(0, 50) + '...'
                                : replyTo.content}
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.cancelReplyButton}
                        onClick={onCancelReply}
                        title="Hủy trả lời"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Mentions preview */}
            {mentions.length > 0 && (
                <div className={styles.mentionsPreview}>
                    <div className={styles.mentionsInfo}>
                        <div className={styles.mentionsLabel}>Đang tag</div>
                        <div className={styles.mentionsList}>
                            {mentions.map((mention, index) => (
                                <span key={index} className={styles.mentionTag}>
                                    @{mention.displayName || mention.username}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.cancelMentionsButton}
                        onClick={onCancelMentions}
                        title="Hủy tag"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            <div className={styles.inputContainer}>
                <div className={styles.inputWrapper}>
                    <button
                        type="button"
                        ref={emojiButtonRef}
                        className={styles.emojiButton}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Emoji"
                        disabled={disabled || sending}
                    >
                        <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                        <div className={styles.emojiPickerWrapper}>
                            <EmojiPicker
                                onEmojiSelect={handleEmojiSelect}
                                isOpen={showEmojiPicker}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        </div>
                    )}
                </div>
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    placeholder={disabled ? "Đang kết nối..." : "Nhập tin nhắn..."}
                    className={styles.input}
                    disabled={disabled || sending}
                    maxLength={5000}
                    rows={1}
                    style={{
                        resize: 'none',
                        overflow: 'hidden',
                        minHeight: '40px',
                        maxHeight: '120px'
                    }}
                    onInput={(e) => {
                        // Auto-resize textarea
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!message.trim() || sending || disabled}
                    title="Gửi (Enter trên desktop, hoặc nhấn nút này)"
                >
                    {sending ? (
                        <Loader2 size={18} className={styles.spinner} />
                    ) : (
                        <Send size={18} />
                    )}
                </button>
            </div>
        </form>
    );
}

