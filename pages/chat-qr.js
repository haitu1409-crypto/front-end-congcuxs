/**
 * Chat QR Code Share Page
 * Page này hiển thị QR code với Open Graph tags để Facebook có thể crawl và hiển thị preview
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { QRCodeSVG } from 'qrcode.react';

export default function ChatQRPage() {
    const router = useRouter();
    const [chatUrl, setChatUrl] = useState('');
    const [qrImageUrl, setQrImageUrl] = useState('');

    useEffect(() => {
        // Get chat URL
        const productionUrl = 'https://taodandewukong.pro';
        const url = typeof window !== 'undefined' 
            ? (process.env.NODE_ENV === 'production' 
                ? `${productionUrl}/chat` 
                : `${window.location.origin}/chat`)
            : '/chat';
        
        setChatUrl(url);
        
        // Generate QR code image URL using qr-server.com API
        // This will be used as og:image
        const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&format=png`;
        setQrImageUrl(qrImage);
    }, []);

    // Open Graph meta data
    const ogTitle = 'Group Chat Chốt Dàn 3 Miền Wukong';
    const ogDescription = 'Tham gia Group Chat để chia sẻ và thảo luận về dàn đề chốt số 3 miền cùng cộng đồng Wukong';
    const shareUrl = chatUrl || 'https://taodandewukong.pro/chat';

    return (
        <>
            <Head>
                <title>{ogTitle} | Dàn Đề Wukong</title>
                <meta name="description" content={ogDescription} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:title" content={ogTitle} />
                <meta property="og:description" content={ogDescription} />
                <meta property="og:image" content={qrImageUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=https://taodandewukong.pro/chat'} />
                <meta property="og:image:width" content="512" />
                <meta property="og:image:height" content="512" />
                <meta property="og:image:alt" content="QR Code - Group Chat Chốt Dàn 3 Miền Wukong" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={shareUrl} />
                <meta name="twitter:title" content={ogTitle} />
                <meta name="twitter:description" content={ogDescription} />
                <meta name="twitter:image" content={qrImageUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=https://taodandewukong.pro/chat'} />
                
                {/* Redirect to chat page after 1 second */}
                <meta httpEquiv="refresh" content="1;url=/chat" />
            </Head>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    maxWidth: '400px',
                    width: '100%'
                }}>
                    <h1 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
                        {ogTitle}
                    </h1>
                    
                    {chatUrl && (
                        <div style={{ marginBottom: '20px' }}>
                            <QRCodeSVG
                                value={chatUrl}
                                size={256}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: '/imgs/monkey.png',
                                    height: 60,
                                    width: 60,
                                    excavate: true,
                                }}
                            />
                        </div>
                    )}
                    
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
                        {ogDescription}
                    </p>
                    
                    <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '20px' }}>
                        Đang chuyển hướng đến trang chat...
                    </p>
                </div>
            </div>
        </>
    );
}

