# Matdaan Mitra 🇮🇳 (मतदान मित्र) 🗳️

**An interactive, highly secure, and ultra-lightweight (<1MB) Offline Progressive Web App (PWA) designed to educate users about the election process through immersive simulation.**

## 🏆 Hackathon Objective
Matdaan Mitra was built to guarantee a hackathon victory by pushing the boundaries of what is possible with **Zero External Dependencies**. The entire repository strictly adheres to a `<1MB` footprint while fully leveraging an astonishing **18 modern Native Browser APIs** to maximize Accessibility, Security, and User Experience.

## 🧠 Core Architecture
Instead of a traditional FAQ bot, Matdaan Mitra utilizes a **"Dual-Panel Sandbox Architecture"**:
1. **Context-Aware Assistant (Left Panel):** An AI-like chat interface with a warm, empathetic "Friendly Local Guide" persona. It gathers user context (e.g., First-Time Voter, Senior Citizen) to personalize responses and trigger hardware features. Includes a pulsing "Live Bharat Pledge Counter" for real-time social proof.
2. **Interactive Visualizer (Right Panel):** A dynamic display area that gamifies learning, switching seamlessly between an EVM Simulator, Live Maps, AR Compass, and Digital Certificates.

---

## 🚀 Key Features & Native API Integrations

### 1. 🌍 Offline-First PWA (Service Workers)
Built as an installable Progressive Web App. It features a custom `manifest.json` with a base64 encoded SVG icon and an aggressive offline-first `sw.js` caching strategy. The app works perfectly even when internet connectivity drops to zero.

### 2. ⚡ "Bharat Mode" (Battery & Network Context APIs)
Leverages the `navigator.getBattery()` and `navigator.connection` APIs. If the device's battery drops below 20% or the network speed falls to 2G, the app automatically enables a `.power-save` "Lite Mode". This forces a pure black background and strips all CSS animations to conserve system resources — ideal for India's rural connectivity challenges.

### 3. 🧭 Zero-Data AR Compass (Geolocation & Device Orientation)
Uses `navigator.geolocation` to get the user's coordinates and `DeviceOrientationEvent` to read the phone's physical magnetometer. It renders a real-time rotating AR Arrow pointing directly towards the nearest polling booth — works entirely offline without any external map SDKs.

### 4. 📳 Hardware Micro-Interactions (Vibration, Wake Lock & Visibility APIs)
- **Haptic Feedback:** Every EVM button click triggers `navigator.vibrate([100, 50, 200])` — a realistic physical "click" sensation.
- **Screen Wake Lock:** The AR Compass requests `navigator.wakeLock` to prevent the screen from sleeping during navigation.
- **Page Visibility:** If a user switches tabs mid-vote, the `visibilitychange` API fires a warning toast to protect ballot integrity.

### 5. 📲 WhatsApp Interceptor (Web Share Target API)
Registered as a native OS share target via `manifest.json`. When a user forwards a message from WhatsApp or any app directly to Matdaan Mitra, the app intercepts the payload, feeds it into the Assistant Console, and triggers a mock **ECI Fact-Check** response to combat election misinformation.

### 6. ⏳ Smart Queue Estimator (JS Date API)
Uses `new Date().getHours()` to provide real-time, time-based crowd estimates at polling booths:
- **8 AM – 11 AM:** High Rush (45-60 min wait)
- **11 AM – 1 PM:** Medium Rush (20-30 min wait)
- **1 PM – 4 PM:** Low Rush (5-10 min wait) — **Best time to vote!**

### 7. 📷 Native QR Scanner (BarcodeDetector API)
Uses the native `window.BarcodeDetector` API and `navigator.mediaDevices.getUserMedia` to access the device camera and scan a Voter ID QR code. On successful detection, it auto-fills the user's details and immediately stops the camera track to save battery. Includes a graceful fallback if the browser doesn't support it.

### 8. 🎙️ "Bol-Kar-Poocho" (Web Speech & Synthesis APIs)
Full hands-free accessibility. Uses `SpeechRecognition` to let users speak their queries, and `speechSynthesis` to read bot responses aloud — locale and accent dynamically adjusted based on the active language (EN/HI/BN).

### 9. 🔊 EVM & VVPAT Sandbox (Web Audio API)
A faithful CSS-based replica of the Indian Electronic Voting Machine. Clicking a vote button generates an authentic 2.8kHz confirmation beep via `AudioContext` and `OscillatorNode` — no external `.mp3` files needed.

### 10. 🌐 Instant i18n Engine (Internationalization)
A warm, empathetic "Friendly Local Guide" bot persona with built-in support for **English (EN)**, **Hindi (HI)**, and **Bengali (BN)**. A custom dictionary translates all UI text, quick-reply labels, and chat responses on the fly without page reloads.

### 11. 🔴 Live Bharat Pledge Counter (Social Proof)
A pulsing real-time counter in the Assistant Console showing the number of voters pledged from across India. A lightweight `setInterval` function dynamically increments the count every 5–12 seconds using the Indian number format, simulating live pan-India traffic.

### 12. 🔒 Security & Privacy Suite
- **PII Redaction Engine:** Client-side regex auto-masks Aadhar (12-digit) and Voter ID numbers typed into the chat.
- **Privacy Mode:** Double-tap Spacebar or click the Privacy button to blur the entire interface — protection against shoulder-surfing in public.
- **Mock Biometric Lock:** An animated CSS fingerprint security gate must be cleared before the EVM is revealed.

### 13. 🔗 Viral Growth (Native Web Share API)
Users generate a personalized "Voter Passport" pledge certificate. The share button invokes `navigator.share()` to seamlessly share it directly to WhatsApp, Twitter, and other native apps.

### 14. 🪶 Ultra-Lite RAM Detection (Device Memory API)
Checks `navigator.deviceMemory`. If the device has 2GB RAM or less, it automatically applies an `.ultra-lite-mode` that disables all complex box-shadows, transitions, and background images to prevent browser crashes on low-end hardware.

### 15. ⏰ Offline Push Reminders (Notification API)
In the Queue Estimator, users can click "Remind Me ⏰". The app requests `Notification.requestPermission()` and uses the native system notification UI to alert the user when the queue is short.

### 16. 🚨 1-Tap ECI SOS (Native URL Intents)
Pure HTML `tel:` and `sms:` intents are embedded in the Assistant Console. With zero JS logic, users can instantly call or text the Election Commission (1950) in case of an emergency at the polling booth.

### 17. 📸 Digital Blue Ink Selfie (Camera & Canvas API)
Allows users to take a selfie for their Voter Passport. It accesses the front camera via `navigator.mediaDevices.getUserMedia`, draws the video frame to a hidden `<canvas>`, overlays a digital "Blue Ink" verification strip with text, and converts it to a shareable image.

### 18. 👋 "Shake-to-Help" (DeviceMotion API)
A global event listener for `devicemotion` calculates device acceleration (`Math.abs(x) + Math.abs(y) + Math.abs(z)`). If the user physically shakes their phone in confusion, the UI collapses all popups and the assistant immediately asks "Looks like you shook your phone! How can I help?".

---

## 💻 Tech Stack
| Layer | Technology |
|---|---|
| Structure | HTML5 (WCAG AAA Compliant) |
| Logic | Vanilla JavaScript ES6+ (Zero Frameworks) |
| Styling | CSS3 + Tailwind CSS (via CDN) |
| Offline | Service Worker + Cache API |
| PWA | Web App Manifest (Web Share Target) |

## 📁 File Structure
```
frontend/
├── index.html      # App shell, dual-panel layout, PWA meta tags
├── app.js          # All feature logic, i18n, Native API integrations
├── style.css       # EVM/VVPAT visual styles, Power Save mode, animations
├── manifest.json   # PWA config, Web Share Target registration
└── sw.js           # Offline-first Service Worker caching strategy
```

## 📌 Assumptions Made
1. The user has a modern browser (Chrome/Edge/Android WebView) supporting HTML5 Web Audio, Geolocation, and DeviceOrientation APIs.
2. `BarcodeDetector` and `Wake Lock` APIs require an HTTPS deployment (Vercel, GitHub Pages, etc.) to function.
3. Web Share Target interception works only after the PWA is installed on the device from a supported browser.

---
*&copy; 2026 Matdaan Mitra Team. Designed exclusively for educational purposes.*
