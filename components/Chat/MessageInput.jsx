/**
 * MessageInput Component - Input để gửi tin nhắn
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Smile, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import styles from '../../styles/MessageInput.module.css';

export default function MessageInput({
    onSend,
    onTyping,
    onStopTyping,
    sending,
    disabled,
    mentions = [],
    onCancelMentions,
    replyTo = null,
    onCancelReply,
    onUploadImage,
    uploadingAttachment = false,
    maxAttachments = 4,
    maxImageBytes = 6 * 1024 * 1024
}) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const fileInputRef = useRef(null);
    const uploadButtonRef = useRef(null);
    const [attachments, setAttachments] = useState([]);
    const [localUploading, setLocalUploading] = useState(false);

    const isUploading = uploadingAttachment || localUploading;

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
        const trimmedMessage = message.trim();
        const hasAttachments = attachments.length > 0;

        if ((trimmedMessage.length === 0 && !hasAttachments) || sending || disabled || isUploading) {
            return;
        }

        onSend({
            content: trimmedMessage,
            attachments,
            type: hasAttachments ? 'image' : 'text',
            mentions,
            replyTo
        });
        setMessage('');
        setAttachments([]);
        
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

    const handleUploadButtonClick = () => {
        if (disabled || sending || isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        if (!onUploadImage) {
            return;
        }

        const files = Array.from(event.target.files || []);
        if (!files.length) {
            return;
        }

        let remainingSlots = maxAttachments - attachments.length;
        if (remainingSlots <= 0) {
            alert(`Bạn chỉ có thể gửi tối đa ${maxAttachments} ảnh mỗi tin nhắn.`);
            event.target.value = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        const uploadLimitMB = Math.round((maxImageBytes * 2) / (1024 * 1024));

        setLocalUploading(true);
        try {
            for (const file of files) {
                if (remainingSlots <= 0) {
                    break;
                }

                if (!allowedTypes.includes(file.type)) {
                    alert('Chỉ hỗ trợ các định dạng ảnh: JPG, PNG, GIF, WebP, HEIC/HEIF.');
                    continue;
                }

                if (file.size > maxImageBytes * 2) {
                    alert(`Ảnh vượt quá giới hạn xử lý (${uploadLimitMB}MB). Vui lòng chọn ảnh nhỏ hơn.`);
                    continue;
                }

                try {
                    const uploaded = await onUploadImage(file);
                    if (uploaded) {
                        setAttachments(prev => [...prev, uploaded]);
                        remainingSlots -= 1;
                    }
                } catch (error) {
                    console.error('Upload image error:', error);
                    alert(error?.message || 'Không thể upload ảnh. Vui lòng thử lại.');
                }
            }
        } finally {
            setLocalUploading(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
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
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
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
            {attachments.length > 0 && (
                <div className={styles.attachmentsPreview}>
                    {attachments.map((attachment, index) => {
                        const imageUrl = attachment.thumbnailUrl || attachment.secureUrl || attachment.url;
                        return (
                            <div className={styles.attachmentPreviewItem} key={`${attachment.publicId || index}-${index}`}>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={attachment.originalFilename || 'Ảnh đính kèm'}
                                        className={styles.attachmentPreviewImage}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.attachmentPreviewPlaceholder}>Ảnh</div>
                                )}
                                <button
                                    type="button"
                                    className={styles.removeAttachmentButton}
                                    onClick={() => handleRemoveAttachment(index)}
                                    title="Xóa ảnh"
                                    disabled={sending || isUploading}
                                >
                                    <X size={14} />
                                </button>
                                {attachment.bytes && (
                                    <span className={styles.attachmentPreviewMeta}>
                                        {(attachment.bytes / (1024 * 1024)).toFixed(1)} MB
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {isUploading && (
                <div className={styles.attachmentUploading}>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Đang upload ảnh...</span>
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
                    <button
                        type="button"
                        ref={uploadButtonRef}
                        className={styles.uploadButton}
                        onClick={handleUploadButtonClick}
                        title={`Đính kèm ảnh (${attachments.length}/${maxAttachments})`}
                        disabled={disabled || sending || isUploading || attachments.length >= maxAttachments || !onUploadImage}
                    >
                        {isUploading ? <Loader2 size={18} className={styles.spinner} /> : <ImageIcon size={20} />}
                    </button>
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
                    disabled={(message.trim().length === 0 && attachments.length === 0) || sending || disabled || isUploading}
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

