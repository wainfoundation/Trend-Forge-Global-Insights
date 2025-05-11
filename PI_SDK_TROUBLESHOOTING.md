# Pi SDK Troubleshooting Guide

This document provides solutions for common issues with the Pi SDK integration in the Trend Forge application.

## Common Error: "Pi SDK not available after waiting"

This error occurs when the application cannot load or initialize the Pi SDK properly. Here are steps to resolve this issue:

### 1. Check Browser Environment

The Pi SDK works best in the Pi Browser. If you're testing outside the Pi Browser:

- Try opening the app in the Pi Browser
- For development, you can use Chrome or Firefox, but some features may be limited

### 2. Verify Pi SDK Script Loading

The Pi SDK script should be loaded in your HTML file. Check that:

- The script tag is present in index.html
- The script URL is correct: `https://sdk.minepi.com/pi-sdk.js`
- The script has proper attributes (async, defer, crossorigin)

### 3. Check Pi API Key

Ensure your Pi API key is correctly configured:

- Check your .env file for the EXPO_PUBLIC_PI_API_KEY variable
- Verify the key is valid in the Pi Developer Portal
- Make sure the key is being properly loaded in app.config.js

### 4. Use the Retry Mechanisms

The app includes several retry mechanisms:

- Use the "Retry" button when prompted
- Try the "Direct Load" option
- Refresh the page and try again

### 5. Check Network Connectivity

Pi SDK requires network connectivity to function:

- Ensure you have a stable internet connection
- Check if sdk.minepi.com is accessible from your network
- Disable any content blockers or firewalls that might be blocking the SDK

### 6. Inspect Browser Console

Check your browser's developer console for specific error messages:

- Look for network errors related to the Pi SDK script
- Check for JavaScript errors during SDK initialization
- Look for CORS or Content Security Policy issues

### 7. Content Security Policy

If you're seeing CSP errors, ensure your app's Content Security Policy allows:

- Script source from sdk.minepi.com
- Connect source to api.minepi.com
- Frame source if needed

### 8. Sandbox Mode

During development, the Pi SDK should be in sandbox mode:

- Verify that `sandbox: true` is set in the Pi.init() call
- For production, this should be set to false

### 9. Pi Browser Compatibility

If using the Pi Browser:

- Ensure you're using the latest version
- Clear cache and cookies if needed
- Try opening in a new Pi Browser session

### 10. Implementation Check

Review the Pi SDK implementation in these key files:

- utils/pi-sdk.ts - Main SDK utility functions
- app/_layout.tsx - SDK initialization
- index.html - SDK script loading
- components using the SDK (AuthModal, RewardedAdButton, etc.)

## Advanced Troubleshooting

### Manual SDK Loading

If automatic loading fails, you can try manually loading the SDK:

1. Open your browser's developer console
2. Execute:
   ```javascript
   const script = document.createElement('script');
   script.src = 'https://sdk.minepi.com/pi-sdk.js';
   script.async = true;
   document.head.appendChild(script);
   script.onload = () => {
     window.Pi.init({ version: "2.0", sandbox: true });
     console.log('Pi SDK manually loaded');
   };
   ```

### Check for SDK Object

Verify if the Pi object exists in the window:

```javascript
console.log('Pi SDK available:', !!window.Pi);
```

### Test Basic SDK Functions

Test if basic SDK functions work:

```javascript
if (window.Pi) {
  window.Pi.authenticate(
    ['username'], 
    (auth) => { console.log('Auth success:', auth); },
    (error) => { console.log('Auth error:', error); }
  );
}
```

## Contact Support

If you've tried all these steps and still encounter issues:

- Contact Pi Network developer support
- Check the Pi Developer Portal for updated documentation
- Join the Pi Network developer community for assistance
