# RentCan Project Status & Mobile Optimization Strategy

This file documents the features implemented so far, the configuration details used, and the roadmap for optimizing the application for its 99% mobile (iOS & Android) user base.

---

## 1. Work Accomplished & Save Info

### A. Authentication & Sign-Up Flow (Multi-Provider Setup)
- **Figma-Inspired Split-Screen Layout**: Implemented a modern desktop split-screen interface. Left side has a dark grid pattern overlay and radial light spots with clear RentCan branding points. Right side contains the forms. Mobile displays collapse the branding panel to fit cards into the viewport.
- **Email Logins**: Managed entirely via **Supabase Auth** (`sb.auth.signInWithOtp` for passwordless OTP and `sb.auth.signInWithPassword` for password credentials).
- **Phone (SMS) Logins**: Managed directly via **MSG91 APIs** for delivery and verification:
  - MSG91 Authkey: `535432AfGyahgfkas6a37b39eP1`
  - Sending Endpoint: `https://control.msg91.com/api/v5/otp`
  - Verification Endpoint: `https://control.msg91.com/api/v5/otp/verify`
  - Session Persistence: Handled using local database synchronization + browser `localStorage` user payloads for phone authentication.
- **WhatsApp Logins (MSG91 OTP Verification)**:
  - Managed via **MSG91 APIs** using the WhatsApp channel endpoint parameter (`&channel=whatsapp`).
  - Sends a secure OTP message code directly to the user's WhatsApp account and verifies it using the MSG91 verify API, aligning with standard SMS behaviors.
- **Social Logins (Google, Apple, Facebook)**:
  - Configured to trigger real **Supabase OAuth** (`sb.auth.signInWithOAuth`).
  - Google Client ID: `511948304725-7h68kqjbd9osvp0ev2kgk849864sjium.apps.googleusercontent.com`
  - Google Client Secret: `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`
  - Fallback logic: If Supabase fails or is unconfigured, it defaults to the high-fidelity mock interface to allow sandbox and demo testing without server blockers.

### B. Landlord & Tenant Dashboard (SPA View Routing)
- **Responsive Layout**: Bottom-navigation layout for mobile screens (95%+ traffic) and a persistent sidebar on desktop displays.
- **View Router Overhaul**: Replaced the long vertically stacked design with single-viewport tabbed sections matching the bottom/sidebar menu options:
  - **Landlord Views**: Properties (stats + list), Tenants (requests & active profiles), Payments (ledger list), Documents (contracts cabinet), and Maintenance (requests).
  - **Tenant Views**: Home (property info), Payments (rent dues + history), Documents (signed agreements), and Maintenance (issues log).
- **Add Property Modal Drawer**: Replaced the static dashboard form with a popup modal that acts as a native slide-up sheet on mobile and a centered dialog on desktop.
- **Direct Guest Tenant Linking Request**:
  - Tenant join cards support tabbed select between Invite Code and Landlord Phone search.
  - Searching by phone queries the landlord's active properties in real-time, sending a pending link request.
  - Landlords approve/decline requests straight from the dashboard.
- **Haptic Vibration Feedback**: Integrated `navigator.vibrate([12])` on all tab switching clicks and button presses on supported mobile browsers.

---

## 2. Recommendations for 99% iOS & Android Native Feel

Since 99% of your users are on mobile, these are the high-priority upgrades to make RentCan feel exactly like a native App Store or Play Store app:

### 1. Camera Access for Reporting Issues (High Value)
Tenants reporting issues should be able to snap a picture of the broken item directly.
- **Implementation**: Add an image upload field using `<input type="file" accept="image/*" capture="environment">`. 
- **Effect**: On both iOS and Android, this bypasses the standard file picker and launches the native camera app directly.

### 2. Native Haptics & Vibration Feedback
Use the Web Vibration API to add tactile feedback.
- **Implementation**: Call `navigator.vibrate([10])` on tab switches, `navigator.vibrate([40])` on button presses, and `navigator.vibrate([20, 50, 20])` on successful swipe-to-approve gestures.
- **Effect**: Users get subtle, premium native haptic feedback (vibrations) on Android devices.

### 3. Face ID / Touch ID (Biometric Login)
Skip typing passwords or waiting for OTPs on returning visits.
- **Implementation**: Integrate the **WebAuthn API** (via Supabase or a helper library).
- **Effect**: Users register their device fingerprint/face scan once, and can login instantly on iOS/Android just by looking at their phone or touching the sensor.

### 5. Web Push Notifications
Let landlords get notifications even when the browser is closed.
- **Implementation**: Configure Firebase Cloud Messaging (FCM) or OneSignal with Service Workers.
- **Effect**: Sends system-level push notifications to the user's phone lockscreen when a new request is raised or approved.

### 6. iOS Specific Meta Tags & Theme Styling
Safari requires extra tags to fully behave like a standalone app.
- **Implementation**:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="apple-touch-icon" href="assets/icon-192.png">
  ```
- **Effect**: Removes the Safari search bar/footer and lets you customize the top system status bar color (clock, battery icon) to blend into the app design.

### 7. Capacitor/Cordova wrapper (Optional Final Step)
If you want to publish directly to the **Google Play Store** and **Apple App Store**:
- **Implementation**: Wrap the current code in a **Capacitor** project (`npx cap init`). It compiles the HTML/CSS/JS into native iOS and Android packages without needing to rewrite any code.
- **Effect**: Gives you a real `.apk` and `.ipa` file to submit to the App Stores.
