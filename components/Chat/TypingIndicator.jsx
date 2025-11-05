/**
 * TypingIndicator Component - Hiển thị khi có user đang gõ
 */

import styles from '../../styles/TypingIndicator.module.css';

export default function TypingIndicator({ users }) {
    if (users.length === 0) return null;

    const names = users.map(u => u.displayName || u.username).join(', ');

    return (
        <div className={styles.typingIndicator}>
            <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span className={styles.typingText}>
                {names} {users.length === 1 ? 'đang gõ' : 'đang gõ'}...
            </span>
        </div>
    );
}

