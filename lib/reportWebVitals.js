/**
 * Report Web Vitals
 * Custom handler for Next.js reportWebVitals
 */

// Send to Google Analytics
function sendToGoogleAnalytics({ name, delta, value, id }) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
            event_category: 'Web Vitals',
            event_label: id,
            value: Math.round(name === 'CLS' ? delta * 1000 : delta),
            non_interaction: true,
        });
    }
}

// Send to Console (Development)
function sendToConsole({ name, delta, value, id, rating }) {
    const roundedValue = Math.round(name === 'CLS' ? value * 1000 : value);
    const roundedDelta = delta ? Math.round(name === 'CLS' ? delta * 1000 : delta) : 'N/A';

    if (process.env.NODE_ENV === 'development') {
        console.group(`[Web Vitals] ${name}`);
        console.log('Value:', roundedValue);
        console.log('Delta:', roundedDelta);
        console.log('Rating:', rating || 'N/A');
        console.log('ID:', id);
        console.groupEnd();
    }
}

// Main export
export default function reportWebVitals(metric) {
    if (process.env.NODE_ENV === 'production') {
        sendToGoogleAnalytics(metric);
    } else {
        sendToConsole(metric);
    }

    // You can also send to other analytics services here
    // Example: Vercel Analytics, Amplitude, Mixpanel, etc.
}

