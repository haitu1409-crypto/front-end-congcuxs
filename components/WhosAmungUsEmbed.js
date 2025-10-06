/**
 * whos.amung.us Embed Component
 * Alternative way to display whos.amung.us widget using iframe or direct embed
 */

import React, { useState } from 'react';
import styles from '../styles/WhosAmungUsEmbed.module.css';

const WhosAmungUsEmbed = ({ widgetId = '7aijsjfwyp' }) => {
    const [embedType, setEmbedType] = useState('iframe');

    const embedOptions = [
        {
            type: 'iframe',
            name: 'Dashboard Iframe',
            description: 'Embed dashboard trực tiếp',
            content: (
                <iframe
                    src={`https://whos.amung.us/stats/${widgetId}`}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    title="whos.amung.us Dashboard"
                    className={styles.embedIframe}
                />
            )
        },
        {
            type: 'script',
            name: 'Script Embed',
            description: 'Embed script trực tiếp',
            content: (
                <div className={styles.scriptEmbed}>
                    <div id="_wauo34"></div>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                var _wau = _wau || [];
                                _wau.push(["dynamic", "${widgetId}", "o34", "c4302bffffff", "small"]);
                            `
                        }}
                    />
                    <script
                        type="text/javascript"
                        src="//waust.at/d.js"
                        async
                    />
                </div>
            )
        },
        {
            type: 'link',
            name: 'Direct Link',
            description: 'Link trực tiếp đến dashboard',
            content: (
                <div className={styles.linkEmbed}>
                    <p>Nhấn vào link dưới để mở dashboard:</p>
                    <a
                        href={`https://whos.amung.us/stats/${widgetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.dashboardLink}
                    >
                        📊 Mở Dashboard whos.amung.us
                    </a>
                </div>
            )
        }
    ];

    const currentEmbed = embedOptions.find(option => option.type === embedType);

    return (
        <div className={styles.embedContainer}>
            <div className={styles.embedHeader}>
                <h3>🔗 whos.amung.us Embed Options</h3>
                <p>Chọn cách hiển thị widget whos.amung.us</p>
            </div>

            <div className={styles.embedTabs}>
                {embedOptions.map(option => (
                    <button
                        key={option.type}
                        className={`${styles.tab} ${embedType === option.type ? styles.activeTab : ''}`}
                        onClick={() => setEmbedType(option.type)}
                    >
                        {option.name}
                    </button>
                ))}
            </div>

            <div className={styles.embedContent}>
                <div className={styles.embedDescription}>
                    <h4>{currentEmbed.name}</h4>
                    <p>{currentEmbed.description}</p>
                </div>

                <div className={styles.embedDisplay}>
                    {currentEmbed.content}
                </div>
            </div>

            <div className={styles.embedInfo}>
                <h4>📋 Widget Information:</h4>
                <ul>
                    <li><strong>Widget ID:</strong> {widgetId}</li>
                    <li><strong>Dashboard URL:</strong> <a href={`https://whos.amung.us/stats/${widgetId}`} target="_blank" rel="noopener noreferrer">https://whos.amung.us/stats/{widgetId}</a></li>
                    <li><strong>Script URL:</strong> <code>//waust.at/d.js</code></li>
                    <li><strong>Widget ID:</strong> <code>{widgetId}</code></li>
                </ul>
            </div>
        </div>
    );
};

export default WhosAmungUsEmbed;
