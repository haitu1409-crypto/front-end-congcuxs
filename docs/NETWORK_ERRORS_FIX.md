# Network Errors Fix Guide

## Problem Analysis

### 1. DNS Resolution Errors (`net::ERR_NAME_NOT_RESOLVED`)

**Symptoms:**
```
match?publisher_dsp_id=368&dsp_callback=1&external_user_id=ac458517cfc7d0a29774b5dc85676922&gdpr=0&…:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
7?gdpr=0&redir=https%3A%2F%2Fsync.crwdcntrl.net%2Fqmap%3Fc%3D16299%26tp%3DSPXC%26tpid%3D%24SPOTX_AU…:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**Root Cause:**
- These errors come from **third-party advertising/tracking networks**
- Domains like `crwdcntrl.net`, `sync.crwdcntrl.net` are ad-tech services
- They're loaded by Google Analytics or other tracking scripts
- The domains may be blocked by ad blockers, network restrictions, or simply unavailable

### 2. API Error: Z

**Symptoms:**
```
VM5:125 API Error: Z
console.error @ VM5:125
```

**Root Cause:**
- This comes from your `apiService.js` error handling
- The "Z" is likely an actual error message from your backend API
- Could be a database connection issue, validation error, or server-side problem

## Solutions Implemented

### ✅ 1. Enhanced Tracking Error Handler

**Files Updated:**
- `utils/trackingErrorHandler.js`
- `pages/_document.js`

**Changes:**
- Added new problematic domains to blocklist:
  - `crwdcntrl.net`
  - `sync.crwdcntrl.net`
  - `match?publisher_dsp_id`
  - `dsp_callback`
- Enhanced error suppression for `ERR_NAME_NOT_RESOLVED` errors
- Improved console error filtering

### ✅ 2. Improved API Error Logging

**File Updated:**
- `services/apiService.js`

**Changes:**
- Enhanced error logging with more context:
  - Error message
  - Request URL
  - Timestamp
- This will help identify the actual cause of "API Error: Z"

## Additional Recommendations

### 1. Backend API Investigation

To fix the "API Error: Z", check your backend:

```bash
# Check backend logs
cd C:\webSite_xs\back_end_dande
npm run dev
# or check production logs
```

**Common causes:**
- Database connection issues
- Missing environment variables
- Validation errors
- Server overload

### 2. Network-Level Solutions

**Option A: DNS Configuration**
```bash
# Add to hosts file (C:\Windows\System32\drivers\etc\hosts)
127.0.0.1 crwdcntrl.net
127.0.0.1 sync.crwdcntrl.net
```

**Option B: Browser Extensions**
- Install ad blocker (uBlock Origin)
- Configure to block tracking domains

### 3. Google Analytics Configuration

**Option A: Disable Enhanced Tracking**
```javascript
// In your Google Analytics config
gtag('config', 'G-RLCH8J3MHR', {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
});
```

**Option B: Use Google Analytics 4 with Consent Mode**
```javascript
// Implement consent mode
gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied'
});
```

## Testing the Fix

### 1. Clear Browser Cache
```bash
# Clear all browser data
Ctrl + Shift + Delete
```

### 2. Test in Incognito Mode
- Open incognito/private browsing
- Test your website
- Check console for errors

### 3. Monitor Network Tab
- Open Developer Tools (F12)
- Go to Network tab
- Look for failed requests
- Verify they're being blocked properly

## Expected Results

After implementing these fixes:

✅ **DNS errors should be suppressed** - No more `ERR_NAME_NOT_RESOLVED` in console
✅ **Better API error visibility** - More detailed error messages instead of just "Z"
✅ **Cleaner console** - Only relevant errors will be shown
✅ **Better user experience** - No impact on website functionality

## Monitoring

### Console Commands for Debugging

```javascript
// Check tracking status
console.log(getTrackingStatus());

// Check API service cache
console.log(apiService.getCacheInfo());

// Manual API test
apiService.getThongKe3Mien().then(console.log).catch(console.error);
```

## Notes

- These errors are **normal** for websites with analytics/tracking
- The fixes **don't break functionality** - they just hide noise
- Your website will continue to work normally
- Google Analytics will still function (just with better error handling)

## Support

If you continue to see issues:

1. Check browser console for any remaining errors
2. Verify backend API is responding correctly
3. Test in different browsers/environments
4. Check network connectivity and firewall settings
