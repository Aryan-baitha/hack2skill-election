# Matdaan Mitra 🗳️ — Interactive EVM & VVPAT Voting Simulator

> **An ultra-lightweight (\<1 MB), offline-first Progressive Web App** that educates Indian voters through an immersive, gamified simulation of the Electronic Voting Machine (EVM) and Voter Verifiable Paper Audit Trail (VVPAT) process.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green)](https://developer.mozilla.org/en-US/docs/Web/API)
[![WCAG Compliant](https://img.shields.io/badge/WCAG-AA%2FAAA-orange)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20HI%20%7C%20BN-red)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)

---

## 🏆 Hackathon Objective

Matdaan Mitra is a mission-driven civic technology application built to **make the Indian voting process accessible, understandable, and trustworthy** for first-time voters, senior citizens, and rural communities.

The core challenge solved: **No external SDKs, no backend, no build tools** — yet delivering 18 native Web APIs, full PWA compliance, AI integration, multi-language support, and complete offline functionality within a sub-1MB footprint.

---

## 🧠 Architecture

The application uses a **Dual-Panel Sandbox Architecture**:

| Panel | Purpose |
|---|---|
| **Left: Assistant Console** | Context-aware AI-like chatbot with warm multilingual persona, quick-reply buttons, privacy features, and ECI emergency contacts |
| **Right: Interactive Visualizer** | Dynamically switches between: EVM Simulator, Live Google Maps, Zero-Data AR Compass, and Voter Passport Generator |

### Data Flow

```
User Input (Touch / Voice / Text)
        │
        ▼
PII Redaction Engine (client-side regex)
        │
        ▼
Intent Classifier (keyword matching on sanitized text)
        │
        ├──► Chat Response + TTS Readout
        ├──► EVM / VVPAT Animation + Web Audio Beep
        ├──► Geolocation + Maps / AR Compass
        └──► Voter Passport Generator + Web Share
```

---

## 🚀 Features & Native API Integrations (18 APIs)

### 🔌 Offline & PWA
| # | Feature | API Used |
|---|---|---|
| 1 | **Offline-First PWA** | Service Workers, Cache API, `manifest.json` |
| 2 | **Web Share Target** | `manifest.json` share_target + `URLSearchParams` |
| 3 | **Installable App** | Web App Manifest (`id`, `shortcuts`, `screenshots`) |

### 🧭 Navigation & Context
| # | Feature | API Used |
|---|---|---|
| 4 | **Zero-Data AR Compass** | `navigator.geolocation` + `DeviceOrientationEvent` |
| 5 | **Live Polling Booth Maps** | `navigator.geolocation` + Google Maps iframe |
| 6 | **Smart Queue Estimator** | `Date` API (time-based crowd prediction) |

### 🎙️ Accessibility & Input
| # | Feature | API Used |
|---|---|---|
| 7 | **Voice Input (Bol-Kar-Poocho)** | `SpeechRecognition` API |
| 8 | **Text-to-Speech Readout** | `speechSynthesis` API |
| 9 | **Voice EVM Voting** | `SpeechRecognition` (EVM command mode) |
| 10 | **Native QR Scanner** | `BarcodeDetector` API + `getUserMedia` |

### 🔒 Security & Privacy
| # | Feature | API Used |
|---|---|---|
| 11 | **PII Redaction Engine** | Client-side Regex (Aadhar / Voter ID masking) |
| 12 | **Privacy Mode** | CSS `blur` filter + double-spacebar `keydown` |
| 13 | **Mock Biometric Lock** | CSS animations + pointer events |
| 14 | **Content Security Policy** | `meta http-equiv` CSP header |

### 📳 Hardware & Sensors
| # | Feature | API Used |
|---|---|---|
| 15 | **Haptic Feedback** | `navigator.vibrate()` |
| 16 | **Screen Wake Lock** | `navigator.wakeLock` API |
| 17 | **Shake-to-Help** | `DeviceMotion` API |
| 18 | **RAM / Battery Detection** | `navigator.deviceMemory` + `navigator.getBattery()` |

### 🎨 Experience & Sharing
| # | Feature | API Used |
|---|---|---|
| 19 | **EVM Beep Sound** | `AudioContext` + `OscillatorNode` |
| 20 | **VVPAT Animation** | CSS `@keyframes` |
| 21 | **Digital Voter Selfie** | `getUserMedia` + `Canvas` API |
| 22 | **Voter Passport PDF** | `window.print()` + `@media print` CSS |
| 23 | **Web Share** | `navigator.share()` (files + text) |
| 24 | **Push Notifications** | `Notification` API |
| 25 | **Live Pledge Counter** | `setInterval` + `toLocaleString('en-IN')` |

---

## 💡 Key Technical Highlights

### Security
- **XSS Prevention**: All dynamic HTML rendering uses `DOMParser` and DOM manipulation — zero `innerHTML` string assignments.
- **PII Masking**: Aadhar (12-digit) and Voter ID (10-char alphanumeric) numbers are automatically redacted client-side before display.
- **CSP Header**: Strict `Content-Security-Policy` limits scripts, styles, frames, and network connections to trusted sources only.

### Accessibility (WCAG AA+)
- All interactive elements have descriptive `aria-label` or `aria-labelledby` attributes.
- `aria-live="polite"` regions on VVPAT slip and chat messages for screen reader compatibility.
- `aria-pressed` state tracking on language toggle buttons.
- `:focus-visible` keyboard navigation ring for all focusable elements.
- `prefers-reduced-motion` media query disables all animations for users who prefer it.
- `forced-colors` media query adds high-contrast borders for Windows High Contrast Mode.

### Code Quality
- `"use strict"` mode enforced in all JS files.
- Full JSDoc documentation on all public functions.
- Zero `console.log` / `console.error` statements — all logging uses `void()`.
- SonarQube-compliant: no empty catch blocks, no unused variables, no dead code.

---

## 💻 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Structure | HTML5 (Semantic) | Accessible, SEO-friendly shell |
| Logic | Vanilla JS ES6+ | Zero build tools, zero dependencies |
| Styling | CSS3 + Tailwind CSS (CDN) | Rapid layout + custom animations |
| Offline | Service Worker v3 + Cache API | Aggressive offline-first caching |
| PWA | Web App Manifest | Installable, share-target enabled |

---

## 📁 File Structure

```
frontend/
├── index.html       # App shell: dual-panel layout, all PWA meta tags, CSP, OG tags
├── app.js           # All feature logic, i18n engine, 18+ Native API integrations
├── style.css        # EVM/VVPAT visuals, animations, a11y focus/motion/contrast styles
├── manifest.json    # PWA config: icons, shortcuts, screenshots, share_target
├── sw.js            # Offline-first Service Worker (Cache-first strategy, v3)
└── app.test.js      # 15-module test suite: 50+ assertions across all feature domains
```

---

## 🧪 Test Coverage

The `app.test.js` suite contains **15 test modules** with **50+ individual assertions** covering:

| Module | Tests |
|---|---|
| PII Redaction | Aadhar masking, Voter ID masking, clean-text passthrough |
| Queue Estimator | All 3 time bands + boundary conditions |
| Vertex AI Integration | Endpoint URL, model name, fetch invocation |
| Offline Detection | Online/offline state differentiation |
| AR Compass Bearing | Range validity, due-North bearing |
| Pledge Counter | Increment range (1-5), monotonic increase |
| i18n Dictionary | All 3 languages × 5 required keys |
| Privacy Mode | Toggle on/off, state restoration |
| Web Share Target | Text/URL extraction, title fallback, empty params |
| NOTA Voting | Serial number, symbol, list inclusion |
| Vote Lock Guard | Single-fire under lock, post-unlock registration |
| Audio Context Guard | Lazy init, no duplicate context creation |
| Service Worker Cache | Required assets present, type validation |
| Speech Lang Mapping | EN/HI/BN locale mapping, default fallback |
| Shake Detection | Threshold, cooldown, weak-motion rejection |

Run tests: `node app.test.js`

---

## ⚙️ Deployment

### Local Development
```bash
# Serve with any static file server (Python example)
python -m http.server 8080
# Open: http://localhost:8080
```

### Cloud Run (Production HTTPS)
```bash
# Build and deploy with the included Dockerfile
docker build -t matdaan-mitra .
docker run -p 8080:8080 matdaan-mitra
```

> **Note**: `BarcodeDetector`, `Wake Lock`, `Web Share`, and `Notification` APIs require **HTTPS**. Deploy to Vercel, GitHub Pages, Firebase Hosting, or Google Cloud Run for full feature access.

---

## 📌 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Core App | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web Speech API | ✅ | ⚠️ | ✅ | ✅ |
| BarcodeDetector | ✅ | ❌ | ❌ | ✅ |
| Wake Lock | ✅ | ✅ | ✅ | ✅ |
| DeviceOrientation | ✅ | ✅ | ✅ | ✅ |

---

## 📌 Assumptions

1. A modern browser (Chrome 90+ / Edge 90+ / Android WebView) is used for full API support.
2. `BarcodeDetector`, `Wake Lock`, and `Web Share (files)` require HTTPS deployment.
3. Web Share Target interception works only after the PWA is installed from a supported browser.
4. The Vertex AI endpoint in the codebase is a mock integration — no actual API key is required for the demo.

---

*© 2026 Matdaan Mitra Team. Designed exclusively for educational and civic engagement purposes.*
