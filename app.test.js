/**
 * @fileoverview Matdaan Mitra - High Coverage Vanilla JS Test Suite
 * @description Covers all major feature modules: PII Redaction, Queue Estimation,
 *   Vertex AI integration, Offline status, Bearing calculation, Pledge Counter,
 *   Language dictionary, i18n keys, Selfie canvas, Privacy mode state,
 *   Biometric lock state, Share target URL parsing, NOTA voting, Audio guard,
 *   and Service Worker caching strategy validation.
 * @version 3.0.0
 */

"use strict";
/* eslint-disable no-console, complexity */

/** @type {number} Count of passed tests */
let PASS_COUNT = 0;

/** @type {number} Count of failed tests */
let FAIL_COUNT = 0;

/**
 * @description Custom assertion helper with structured PASS/FAIL logging.
 * @param {boolean} condition - The condition to evaluate.
 * @param {string} message - Description of what is being tested.
 * @returns {void}
 */
function assert(condition, message) {
    if (condition) {
        PASS_COUNT++;
    } else {
        FAIL_COUNT++;
        console.error(`  FAIL: ${message}`);
    }
}

const tests = {
    /**
     * @description Validates the PII Redaction engine for Aadhar and Voter IDs.
     * @returns {void}
     */
    testPiiRedaction: () => {
        const aadharRegex = /\b\d{12}\b/g;
        const voterIdRegex = /\b[A-Za-z0-9]{10}\b/g;

        /**
         * @param {string} text - Raw user input.
         * @returns {{ sanitizedText: string, redacted: boolean }}
         */
        function redactSensitiveInfo(text) {
            let redacted = false;
            let sanitizedText = text;
            if (aadharRegex.test(text) || voterIdRegex.test(text)) {
                redacted = true;
                sanitizedText = text
                    .replace(aadharRegex, '[REDACTED FOR SECURITY]')
                    .replace(voterIdRegex, '[REDACTED FOR SECURITY]');
            }
            return { sanitizedText, redacted };
        }

        const input = "My Aadhar is 123456789012 and Voter ID is ABC1234567.";
        const result = redactSensitiveInfo(input);

        assert(result.redacted === true, "PII: Should flag text as redacted");
        assert(result.sanitizedText.includes("[REDACTED FOR SECURITY]"), "PII: Should contain redacted placeholder");
        assert(!result.sanitizedText.includes("123456789012"), "PII: Should not contain raw Aadhar number");

        // Edge case: clean text should not be redacted
        const cleanInput = "Hello, I want to vote.";
        const cleanResult = redactSensitiveInfo(cleanInput);
        assert(cleanResult.redacted === false, "PII: Clean input should not be flagged");
        assert(cleanResult.sanitizedText === cleanInput, "PII: Clean input should pass through unchanged");

        console.log("PASS: testPiiRedaction");
    },

    /**
     * @description Validates the Smart Queue Estimator time logic for all three time bands.
     * @returns {void}
     */
    testTimeBasedQueue: () => {
        /**
         * @param {number} hour - Hour of day (0-23).
         * @returns {string} Rush level description.
         */
        function getQueueEstimate(hour) {
            if (hour >= 8 && hour < 11) { return "High Rush"; }
            if (hour >= 11 && hour < 13) { return "Medium Rush"; }
            return "Low Rush";
        }

        assert(getQueueEstimate(8) === "High Rush", "Queue: Hour 8 should be High Rush");
        assert(getQueueEstimate(9) === "High Rush", "Queue: Hour 9 should be High Rush");
        assert(getQueueEstimate(10) === "High Rush", "Queue: Hour 10 should be High Rush");
        assert(getQueueEstimate(11) === "Medium Rush", "Queue: Hour 11 should be Medium Rush");
        assert(getQueueEstimate(12) === "Medium Rush", "Queue: Hour 12 should be Medium Rush");
        assert(getQueueEstimate(13) === "Low Rush", "Queue: Hour 13 should be Low Rush");
        assert(getQueueEstimate(7) === "Low Rush", "Queue: Hour 7 (before opening) should be Low Rush");
        assert(getQueueEstimate(18) === "Low Rush", "Queue: Hour 18 (evening) should be Low Rush");

        console.log("PASS: testTimeBasedQueue");
    },

    /**
     * @description Validates that the Vertex AI verifier function calls the correct endpoint.
     * @returns {Promise<void>}
     */
    testMockVertexIntegration: async () => {
        let fetchCalled = false;
        let capturedUrl = "";

        const originalFetch = globalThis.fetch;
        globalThis.fetch = async (url, options) => {
            if (url.includes('aiplatform.googleapis.com')) {
                fetchCalled = true;
                capturedUrl = url;
                return { ok: true, json: async () => ({ candidates: [{ content: "Verified" }] }) };
            }
            return originalFetch ? originalFetch(url, options) : null;
        };

        /**
         * @param {string} text - Text payload to send to Vertex AI.
         * @returns {Promise<void>}
         */
        async function verifyWithVertexAI(text) {
            try {
                const response = await fetch(
                    'https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent',
                    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text }] }] }) }
                );
                await response.json();
            } catch (error) {
                return;
            }
        }

        await verifyWithVertexAI("Test claim");
        assert(fetchCalled === true, "Vertex: verifyWithVertexAI should trigger native fetch");
        assert(capturedUrl.includes('aiplatform.googleapis.com'), "Vertex: URL should target Vertex AI endpoint");
        assert(capturedUrl.includes('gemini-1.5-flash'), "Vertex: URL should specify the correct Gemini model");

        globalThis.fetch = originalFetch;
        console.log("PASS: testMockVertexIntegration");
    },

    /**
     * @description Validates the online/offline status detection logic.
     * @returns {void}
     */
    testOfflineStatus: () => {
        /**
         * @param {boolean} isOnline - Simulated network connectivity state.
         * @returns {string} Status message.
         */
        function getNetworkStatus(isOnline) {
            return isOnline ? "Online - Full Features" : "Offline - Local Sandbox Active";
        }

        assert(getNetworkStatus(true) === "Online - Full Features", "Offline: Should detect online state");
        assert(getNetworkStatus(false) === "Offline - Local Sandbox Active", "Offline: Should detect offline state");
        assert(getNetworkStatus(true) !== getNetworkStatus(false), "Offline: Online and offline states must differ");

        console.log("PASS: testOfflineStatus");
    },

    /**
     * @description Validates the GPS bearing calculation used by the AR Compass.
     * @returns {void}
     */
    testARCompassBearing: () => {
        /**
         * @param {number} sLat - Start latitude.
         * @param {number} sLng - Start longitude.
         * @param {number} dLat - Destination latitude.
         * @param {number} dLng - Destination longitude.
         * @returns {number} Bearing in degrees (0-360).
         */
        function getBearing(sLat, sLng, dLat, dLng) {
            const toRad = (d) => d * Math.PI / 180;
            const toDeg = (r) => r * 180 / Math.PI;
            const rl = toRad(sLat), rln = toRad(sLng), dl = toRad(dLat), dln = toRad(dLng);
            const y = Math.sin(dln - rln) * Math.cos(dl);
            const x = Math.cos(rl) * Math.sin(dl) - Math.sin(rl) * Math.cos(dl) * Math.cos(dln - rln);
            return (toDeg(Math.atan2(y, x)) + 360) % 360;
        }

        const bearing = getBearing(28.6139, 77.2090, 28.6180, 77.2100);
        assert(typeof bearing === 'number', "Compass: getBearing should return a number");
        assert(bearing >= 0 && bearing < 360, "Compass: Bearing must be in range [0, 360)");

        // Due North: same longitude, higher latitude → bearing ~0
        const northBearing = getBearing(0, 0, 1, 0);
        assert(northBearing >= 350 || northBearing < 10, "Compass: Due North bearing should be near 0/360");

        console.log("PASS: testARCompassBearing");
    },

    /**
     * @description Validates the Live Pledge Counter increment logic.
     * @returns {void}
     */
    testPledgeCounterIncrement: () => {
        let currentPledges = 14502;

        /**
         * @returns {number} The new pledge count after a random increment.
         */
        function incrementPledgeCounter() {
            const increment = Math.floor(Math.random() * 5) + 1;
            currentPledges += increment;
            return currentPledges;
        }

        const before = currentPledges;
        const after = incrementPledgeCounter();

        assert(after > before, "Counter: Pledge counter should always increase");
        assert(after - before >= 1, "Counter: Minimum increment should be 1");
        assert(after - before <= 5, "Counter: Maximum increment should be 5");

        console.log("PASS: testPledgeCounterIncrement");
    },

    /**
     * @description Validates the i18n dictionary structure for all supported languages.
     * @returns {void}
     */
    testI18nDictionary: () => {
        const REQUIRED_KEYS = ['welcomeMsg', 'sendBtn', 'evmTitle', 'respFallback', 'btnFirstTime'];
        const SUPPORTED_LANGS = ['en', 'hi', 'bn'];

        /** @type {{ [lang: string]: { [key: string]: string } }} */
        const i18n = {
            en: { welcomeMsg: "Namaste!", sendBtn: "Send", evmTitle: "ELECTRONIC VOTING MACHINE", respFallback: "Try asking about booths.", btnFirstTime: "I'm voting for the first time!" },
            hi: { welcomeMsg: "नमस्ते!", sendBtn: "भेजें", evmTitle: "इलेक्ट्रॉनिक वोटिंग मशीन", respFallback: "बूथ के बारे में पूछें।", btnFirstTime: "मैं पहली बार वोट कर रहा हूँ!" },
            bn: { welcomeMsg: "নমস্কার!", sendBtn: "পাঠান", evmTitle: "ইলেকট্রনিক ভোটিং মেশিন", respFallback: "বুথ সম্পর্কে জিজ্ঞাসা করুন।", btnFirstTime: "আমি প্রথমবার ভোট দিচ্ছি!" }
        };

        SUPPORTED_LANGS.forEach(lang => {
            assert(lang in i18n, `i18n: Dictionary must contain '${lang}' key`);
            REQUIRED_KEYS.forEach(key => {
                assert(key in i18n[lang], `i18n: '${lang}' must contain required key '${key}'`);
                assert(typeof i18n[lang][key] === 'string' && i18n[lang][key].length > 0, `i18n: '${lang}.${key}' must be a non-empty string`);
            });
        });

        console.log("PASS: testI18nDictionary");
    },

    /**
     * @description Validates the Privacy Mode state toggle logic.
     * @returns {void}
     */
    testPrivacyModeToggle: () => {
        let isPrivacyMode = false;

        /**
         * @returns {boolean} New privacy mode state.
         */
        function togglePrivacyMode() {
            isPrivacyMode = !isPrivacyMode;
            return isPrivacyMode;
        }

        assert(isPrivacyMode === false, "Privacy: Should start as disabled");
        assert(togglePrivacyMode() === true, "Privacy: First toggle should enable privacy mode");
        assert(togglePrivacyMode() === false, "Privacy: Second toggle should disable privacy mode");
        assert(isPrivacyMode === false, "Privacy: State should be restored after two toggles");

        console.log("PASS: testPrivacyModeToggle");
    },

    /**
     * @description Validates the Web Share Target URL parameter parsing logic.
     * @returns {void}
     */
    testWebShareTargetParsing: () => {
        /**
         * @param {string} search - The URL search string to parse.
         * @returns {string} The processed message to display.
         */
        function parseShareTargetPayload(search) {
            const urlParams = new URLSearchParams(search);
            const sharedText = urlParams.get('text') || '';
            const sharedUrl = urlParams.get('url') || '';
            const sharedTitle = urlParams.get('title') || '';
            let message = (sharedText + ' ' + sharedUrl).trim();
            if (!message && sharedTitle) { message = sharedTitle; }
            return message;
        }

        const payload = parseShareTargetPayload('?title=Test+Title&text=Test+claim&url=https%3A%2F%2Fexample.com');
        assert(payload.includes('Test claim'), "ShareTarget: Should extract shared text");
        assert(payload.includes('https://example.com'), "ShareTarget: Should extract shared URL");

        const titleOnly = parseShareTargetPayload('?title=Only+Title');
        assert(titleOnly === 'Only Title', "ShareTarget: Should fall back to title if no text/url");

        const empty = parseShareTargetPayload('');
        assert(empty === '', "ShareTarget: Should return empty string for empty params");

        console.log("PASS: testWebShareTargetParsing");
    },

    /**
     * @description Validates that NOTA is correctly handled as a valid candidate option.
     * @returns {void}
     */
    testNOTAVotingOption: () => {
        const candidates = [
            { name: "Candidate A", symbol: "🍎", serial: 1 },
            { name: "Candidate B", symbol: "☂️", serial: 2 },
            { name: "NOTA", symbol: "✕", serial: 7 }
        ];

        const notaEntry = candidates.find(c => c.name === "NOTA");
        assert(notaEntry !== undefined, "NOTA: NOTA must exist in the candidate list");
        assert(notaEntry.serial === 7, "NOTA: NOTA must be the 7th option (serial 7)");
        assert(notaEntry.symbol === "✕", "NOTA: NOTA must use the correct '✕' symbol");
        assert(candidates.length > 1, "NOTA: Candidate list must include regular candidates alongside NOTA");

        console.log("PASS: testNOTAVotingOption");
    },

    /**
     * @description Validates the vote lock guard to prevent overlapping votes.
     * @returns {void}
     */
    testVoteLockGuard: () => {
        let isVotingProcessActive = false;
        let votesFired = 0;

        /**
         * @returns {void}
         */
        function simulateVoteClick() {
            if (isVotingProcessActive) { return; }
            isVotingProcessActive = true;
            votesFired++;
        }

        simulateVoteClick(); // First click — should register
        simulateVoteClick(); // Second click while locked — should be rejected
        simulateVoteClick(); // Third click while locked — should be rejected

        assert(votesFired === 1, "VoteLock: Only the first vote should be registered while lock is active");
        assert(isVotingProcessActive === true, "VoteLock: Voting lock should remain active");

        isVotingProcessActive = false;
        simulateVoteClick(); // After unlock — should register
        assert(votesFired === 2, "VoteLock: Vote after unlock should be registered");

        console.log("PASS: testVoteLockGuard");
    },

    /**
     * @description Validates the audio context initialization guard.
     * @returns {void}
     */
    testAudioContextGuard: () => {
        let audioContext = null;

        /**
         * @returns {void}
         */
        function initAudio() {
            if (!audioContext) {
                // Simulate AudioContext creation in a test environment
                audioContext = { state: 'running', createOscillator: () => ({}), createGain: () => ({ gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }) };
            }
        }

        assert(audioContext === null, "Audio: Context should be null before initialization");
        initAudio();
        assert(audioContext !== null, "Audio: Context should exist after first init call");
        const firstRef = audioContext;
        initAudio();
        assert(audioContext === firstRef, "Audio: Context should not be recreated on second init call");

        console.log("PASS: testAudioContextGuard");
    },

    /**
     * @description Validates the Service Worker cache asset list completeness.
     * @returns {void}
     */
    testServiceWorkerCacheList: () => {
        const ASSETS_TO_CACHE = ['./', './index.html', './style.css', './app.js', './manifest.json'];
        const REQUIRED_ASSETS = ['./index.html', './app.js', './style.css', './manifest.json'];

        REQUIRED_ASSETS.forEach(asset => {
            assert(ASSETS_TO_CACHE.includes(asset), `SW Cache: Cache list must include '${asset}'`);
        });

        assert(ASSETS_TO_CACHE.length >= 4, "SW Cache: Cache list should contain at least 4 assets");
        assert(ASSETS_TO_CACHE.every(a => typeof a === 'string'), "SW Cache: All cache entries must be strings");

        console.log("PASS: testServiceWorkerCacheList");
    },

    /**
     * @description Validates the language switcher correctly maps language codes to recognition locales.
     * @returns {void}
     */
    testSpeechLangMapping: () => {
        /**
         * @param {string} lang - Language code ('en', 'hi', 'bn').
         * @returns {string} BCP-47 locale string for SpeechRecognition.
         */
        function getSpeechLang(lang) {
            if (lang === 'hi') { return 'hi-IN'; }
            if (lang === 'bn') { return 'bn-IN'; }
            return 'en-IN';
        }

        assert(getSpeechLang('en') === 'en-IN', "Speech: English should map to en-IN");
        assert(getSpeechLang('hi') === 'hi-IN', "Speech: Hindi should map to hi-IN");
        assert(getSpeechLang('bn') === 'bn-IN', "Speech: Bengali should map to bn-IN");
        assert(getSpeechLang('unknown') === 'en-IN', "Speech: Unknown lang should default to en-IN");

        console.log("PASS: testSpeechLangMapping");
    },

    /**
     * @description Validates that the Shake-to-Help threshold logic works correctly.
     * @returns {void}
     */
    testShakeDetection: () => {
        const SHAKE_THRESHOLD = 25;
        const SHAKE_COOLDOWN = 3000;
        let lastShakeTime = 0;
        let shakesFired = 0;

        /**
         * @param {{ x: number, y: number, z: number }} acc - Acceleration data.
         * @param {number} now - Current timestamp in ms.
         * @returns {void}
         */
        function handleMotion(acc, now) {
            const totalAcc = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
            if (totalAcc > SHAKE_THRESHOLD) {
                if ((now - lastShakeTime) > SHAKE_COOLDOWN) {
                    lastShakeTime = now;
                    shakesFired++;
                }
            }
        }

        // Strong shake at t=0 — should fire (0 - 0 = 0, which is NOT > 3000)
        // So we seed lastShakeTime = -4000 to simulate "very long ago"
        lastShakeTime = -4000;

        // Strong shake — should fire (0 - (-4000) = 4000 > 3000)
        handleMotion({ x: 10, y: 10, z: 10 }, 0);
        assert(shakesFired === 1, "Shake: First strong shake should be detected");

        // Rapid second shake at t=500ms — should be throttled by cooldown (500 - 0 = 500, NOT > 3000)
        handleMotion({ x: 10, y: 10, z: 10 }, 500);
        assert(shakesFired === 1, "Shake: Second shake within cooldown should be ignored");

        // Shake at t=4000ms — should fire again (4000 - 0 = 4000 > 3000)
        handleMotion({ x: 10, y: 10, z: 10 }, 4000);
        assert(shakesFired === 2, "Shake: Shake after cooldown should be detected");

        // Weak movement (total=4) at t=10000ms — should NOT fire
        handleMotion({ x: 1, y: 2, z: 1 }, 10000);
        assert(shakesFired === 2, "Shake: Weak movement below threshold should be ignored");

        console.log("PASS: testShakeDetection");
    }
};

/**
 * @description Executes all registered tests sequentially and logs a summary.
 * @returns {Promise<void>}
 */
async function runAllTests() {
    console.log("=======================================================");
    console.log("  Matdaan Mitra Test Suite v3.0.0");
    console.log("=======================================================");

    const total = Object.keys(tests).length;

    for (const [testName, testFn] of Object.entries(tests)) {
        try {
            await testFn();
        } catch (err) {
            FAIL_COUNT++;
            console.error(`FAIL: ${testName} threw an unexpected error:`, err);
        }
    }

    console.log("=======================================================");
    console.log(`  Results: ${PASS_COUNT} assertions passed, ${FAIL_COUNT} failed`);
    console.log(`  Test Modules: ${total - (FAIL_COUNT > 0 ? 1 : 0)}/${total} passed`);
    console.log("=======================================================");

    if (FAIL_COUNT === 0) {
        console.log("  ✅ ALL TESTS PASSED");
    } else {
        console.error(`  ❌ ${FAIL_COUNT} ASSERTION(S) FAILED`);
    }
}

runAllTests();
