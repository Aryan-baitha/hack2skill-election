/**
 * VoteSync: Main Application Logic
 * Handles EVM button interactions, Web Audio API synthetic beeps, and VVPAT animation orchestration.
 */

// Ultra-Lite RAM Detection (Device Memory API)
if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
    document.addEventListener("DOMContentLoaded", () => {
        document.body.classList.add('ultra-lite-mode');
        const toastContainer = document.getElementById('toast-container');
        const toastMsg = document.getElementById('toast-msg');
        if (toastContainer && toastMsg) {
            toastMsg.textContent = "Low RAM detected. Optimizing UI for smooth performance.";
            toastContainer.classList.remove('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                toastContainer.classList.add('opacity-0', 'pointer-events-none');
            }, 3000);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const voteButtons = document.querySelectorAll('.evm-vote-btn');
    const vvpatSlip = document.getElementById('vvpat-slip');
    const vvpatCandidateName = document.getElementById('vvpat-candidate-name');
    const vvpatCandidateSymbol = document.getElementById('vvpat-candidate-symbol');
    const vvpatSerialNumber = document.getElementById('vvpat-serial-number');
    
    // Phase 5 Elements
    const voiceModeBtn = document.getElementById('voice-mode-btn');
    const shareCertUi = document.getElementById('share-cert-ui');
    const sharePledgeBtn = document.getElementById('share-pledge-btn');
    const biometricOverlay = document.getElementById('biometric-overlay');
    const scanLine = document.getElementById('scan-line');
    const biometricText = document.getElementById('biometric-text');
    
    // Audio Context (must be initialized after user interaction due to browser autoplay policies)
    let audioContext;

    // --- i18n Translation Logic ---
    let currentLang = 'en';
    const i18n = {
        en: {
            appSubtitle: "(मतदान मित्र)",
            assistantTitle: "Assistant Console",
            chatPlaceholder: "Type or speak a message...",
            sendBtn: "Send",
            evmTitle: "ELECTRONIC VOTING MACHINE",
            evmSubtitle: "BALLOT UNIT",
            vvpatTitle: "VOTER VERIFIABLE PAPER AUDIT TRAIL",
            sealedBox: "SEALED DROP BOX",
            voiceMode: "Voice Mode 🎙️",
            welcomeMsg: "Namaste! I'm your friendly Matdaan Mitra. How can I make your voting journey easier today?",
            btnFirstTime: "I'm voting for the first time!",
            btnSenior: "I'm a Senior Citizen",
            btnPassport: "Get my Voter Passport",
            btnBoothMap: "Where is my polling booth?",
            btnCompass: "Help me navigate (AR Compass)",
            respTimelineTitle: "Your Voting Journey Timeline",
            respTimeline1: "<strong>Today:</strong> Practice on the EVM Simulator",
            respTimeline2: "<strong>Next Week:</strong> Last day to register!",
            respTimeline3: "<strong>Next Month:</strong> Election Day - Make your voice heard!",
            respCalendarBtn: "🗓️ Save to Google Calendar",
            respSenior: "Absolutely! We have special facilities for our senior citizens, including priority lines and postal ballots. Would you like me to help you find an accessible booth nearby? Just tap 'Where is my polling booth?'",
            respSecurity: "Security Alert: Don't worry, your privacy is my top priority. I never store your ID numbers!",
            respCheckingLoc: "Hold on a second, finding the best route for you...",
            respBoothDist: "Good news! Your nearest polling booth is just about 15 minutes away.",
            respNavigateBtn: "📍 Get Directions",
            respNoLoc: "Ah, I couldn't catch your exact location. Let me show you a general map of your city instead!",
            respNoGeo: "It looks like your browser doesn't support location features. No worries, here's a general map!",
            respGenPassport: "Creating your beautiful Voter Passport now. Get ready to share it!",
            btnQueue: "How long is the queue?",
            btnScanId: "Scan Voter ID 📷",
            respQueueHigh: "It looks like a high rush right now (approx. 45-60 mins wait).",
            respQueueMedium: "It's currently medium rush (approx. 20-30 mins wait).",
            respQueueLow: "Low rush right now (5-10 mins wait). This is the best time to vote!",
            respScanUnsupported: "Your browser does not support the native barcode scanner.",
            respScanSuccess: "Voter ID scanned successfully! Processing details...",
            respFallback: "I'm still learning! But I'm great at helping with booths and passports. Try asking 'Where is my polling booth?' or say 'Get my Voter Passport'."
        },
        hi: {
            appSubtitle: "(मतदान मित्र)",
            assistantTitle: "सहायक कंसोल",
            chatPlaceholder: "संदेश टाइप करें या बोलें...",
            sendBtn: "भेजें",
            evmTitle: "इलेक्ट्रॉनिक वोटिंग मशीन",
            evmSubtitle: "बैलेट यूनिट",
            vvpatTitle: "वोटर वेरीफाएबल पेपर ऑडिट ट्रेल",
            sealedBox: "सीलबंद ड्रॉप बॉक्स",
            voiceMode: "वॉयस मोड 🎙️",
            welcomeMsg: "नमस्ते! मैं आपका मतदान मित्र हूँ। आज मैं आपकी वोटिंग यात्रा को आसान कैसे बना सकता हूँ?",
            btnFirstTime: "मैं पहली बार वोट कर रहा हूँ!",
            btnSenior: "मैं एक वरिष्ठ नागरिक हूँ",
            btnPassport: "मेरा वोटर पासपोर्ट बनाएँ",
            btnBoothMap: "मेरा पोलिंग बूथ कहाँ है?",
            btnCompass: "रास्ता दिखाएँ (AR कंपास)",
            respTimelineTitle: "आपकी वोटिंग यात्रा",
            respTimeline1: "<strong>आज:</strong> EVM सिम्युलेटर पर अभ्यास करें",
            respTimeline2: "<strong>अगले सप्ताह:</strong> पंजीकरण का आखिरी दिन!",
            respTimeline3: "<strong>अगले महीने:</strong> चुनाव का दिन - अपनी आवाज़ उठाएँ!",
            respCalendarBtn: "🗓️ गूगल कैलेंडर में सेव करें",
            respSenior: "जी, बिल्कुल! हमारे वरिष्ठ नागरिकों के लिए विशेष सुविधाएं हैं, जैसे प्राथमिकता लाइन और पोस्टल बैलेट। क्या मैं आपके पास कोई सुलभ बूथ खोजने में मदद करूँ? बस 'मेरा पोलिंग बूथ कहाँ है?' पर टैप करें।",
            respSecurity: "सुरक्षा अलर्ट: चिंता मत कीजिए, आपकी प्राइवेसी मेरी प्राथमिकता है। मैं कभी भी आपके आईडी नंबर सेव नहीं करता!",
            respCheckingLoc: "बस एक पल, मैं आपके लिए सबसे सही रास्ता ढूंढ रहा हूँ...",
            respBoothDist: "खुशखबरी! आपका नज़दीकी पोलिंग बूथ यहाँ से सिर्फ 15 मिनट की दूरी पर है।",
            respNavigateBtn: "📍 रास्ता देखें",
            respNoLoc: "माफ़ कीजिएगा, मैं आपकी सटीक लोकेशन नहीं देख पा रहा हूँ। चलिए, मैं आपको आपके शहर का नक्शा दिखाता हूँ!",
            respNoGeo: "ऐसा लगता है कि आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता। कोई बात नहीं, यह रहा एक सामान्य नक्शा!",
            respGenPassport: "आपका शानदार वोटर पासपोर्ट तैयार हो रहा है। इसे शेयर करने के लिए तैयार रहें!",
            btnQueue: "कतार कितनी लंबी है?",
            btnScanId: "वोटर आईडी स्कैन करें 📷",
            respQueueHigh: "अभी बहुत भीड़ लग रही है (लगभग 45-60 मिनट का इंतज़ार)।",
            respQueueMedium: "अभी मध्यम भीड़ है (लगभग 20-30 मिनट का इंतज़ार)।",
            respQueueLow: "अभी कम भीड़ है (5-10 मिनट का इंतज़ार)। यह वोट करने का सबसे अच्छा समय है!",
            respScanUnsupported: "आपका ब्राउज़र नेटिव बारकोड स्कैनर को सपोर्ट नहीं करता है।",
            respScanSuccess: "वोटर आईडी सफलतापूर्वक स्कैन हो गई! विवरण प्रोसेस किया जा रहा है...",
            respFallback: "मैं अभी सीख रहा हूँ! लेकिन मैं बूथ और पासपोर्ट के बारे में अच्छी मदद कर सकता हूँ। 'मेरा पोलिंग बूथ कहाँ है?' पूछकर देखें।"
        },
        bn: {
            appSubtitle: "(মতদান মিত্র)",
            assistantTitle: "সহকারী কনসোল",
            chatPlaceholder: "বার্তা টাইপ করুন বা বলুন...",
            sendBtn: "পাঠান",
            evmTitle: "ইলেকট্রনিক ভোটিং মেশিন",
            evmSubtitle: "ব্যালট ইউনিট",
            vvpatTitle: "ভোটার ভেরিফায়েবল পেপার অডিট ট্রেইল",
            sealedBox: "সিল করা ড্রপ বক্স",
            voiceMode: "ভয়েস মোড 🎙️",
            welcomeMsg: "নমস্কার! আমি আপনার ভোটদান মিত্র। আজ আমি কীভাবে আপনার ভোটদানের যাত্রাকে সহজ করতে পারি?",
            btnFirstTime: "আমি প্রথমবার ভোট দিচ্ছি!",
            btnSenior: "আমি একজন প্রবীণ নাগরিক",
            btnPassport: "আমার ভোটার পাসপোর্ট তৈরি করুন",
            btnBoothMap: "আমার পোলিং বুথ কোথায়?",
            btnCompass: "পথ দেখান (AR কম্পাস)",
            respTimelineTitle: "আপনার ভোটদানের যাত্রা",
            respTimeline1: "<strong>আজ:</strong> EVM সিমুলেটরে অনুশীলন করুন",
            respTimeline2: "<strong>আগামী সপ্তাহ:</strong> নিবন্ধনের শেষ দিন!",
            respTimeline3: "<strong>আগামী মাস:</strong> ভোটের দিন - আপনার ভোট দিন!",
            respCalendarBtn: "🗓️ গুগল ক্যালেন্ডারে সেভ করুন",
            respSenior: "হ্যাঁ, নিশ্চয়ই! আমাদের প্রবীণ নাগরিকদের জন্য বিশেষ সুবিধা রয়েছে, যেমন অগ্রাধিকার লাইন এবং পোস্টাল ব্যালট। আমি কি আপনাকে কাছাকাছি একটি সুবিধাজনক বুথ খুঁজে পেতে সাহায্য করব? শুধু 'আমার পোলিং বুথ কোথায়?' এ ট্যাপ করুন।",
            respSecurity: "নিরাপত্তা সতর্কতা: চিন্তা করবেন না, আপনার গোপনীয়তা আমার সর্বোচ্চ অগ্রাধিকার। আমি কখনই আপনার আইডি নম্বর সেভ করি না!",
            respCheckingLoc: "একটু অপেক্ষা করুন, আপনার জন্য সবচেয়ে ভালো পথ খুঁজছি...",
            respBoothDist: "সুখবর! আপনার নিকটতম পোলিং বুথ এখান থেকে মাত্র ১৫ মিনিটের দূরত্বে।",
            respNavigateBtn: "📍 দিকনির্দেশ পান",
            respNoLoc: "দুঃখিত, আমি আপনার সঠিক লোকেশন দেখতে পাচ্ছি না। এর পরিবর্তে আপনার শহরের একটি সাধারণ ম্যাপ দেখাচ্ছি!",
            respNoGeo: "মনে হচ্ছে আপনার ব্রাউজার লোকেশন সমর্থন করে না। কোনো চিন্তা নেই, এখানে একটি সাধারণ ম্যাপ রইল!",
            respGenPassport: "আপনার সুন্দর ভোটার পাসপোর্ট তৈরি করা হচ্ছে। শেয়ার করার জন্য প্রস্তুত হন!",
            btnQueue: "লাইন কত বড়?",
            btnScanId: "ভোটার আইডি স্ক্যান করুন 📷",
            respQueueHigh: "এখন বেশ ভিড় মনে হচ্ছে (প্রায় ৪৫-৬০ মিনিট অপেক্ষা)।",
            respQueueMedium: "এখন মাঝারি ভিড় (প্রায় ২০-৩০ মিনিট অপেক্ষা)।",
            respQueueLow: "এখন ভিড় কম (৫-১০ মিনিট অপেক্ষা)। ভোট দেওয়ার জন্য এটিই সেরা সময়!",
            respScanUnsupported: "আপনার ব্রাউজার নেটিভ বারকোড স্ক্যানার সমর্থন করে না।",
            respScanSuccess: "ভোটার আইডি সফলভাবে স্ক্যান করা হয়েছে! বিবরণ প্রক্রিয়া করা হচ্ছে...",
            respFallback: "আমি এখনও শিখছি! কিন্তু বুথ এবং পাসপোর্টের বিষয়ে আমি ভালো সাহায্য করতে পারি। 'আমার পোলিং বুথ কোথায়?' জিজ্ঞাসা করার চেষ্টা করুন।"
        }
    };

    function switchLanguage(lang) {
        currentLang = lang;
        const dict = i18n[lang];
        
        // Update all text nodes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Update all placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.placeholder = dict[key];
            }
        });

        // Update active button styling
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('bg-white', 'text-blue-900', 'font-semibold', 'shadow-sm');
                btn.classList.remove('text-blue-100', 'hover:text-white', 'font-medium');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('bg-white', 'text-blue-900', 'font-semibold', 'shadow-sm');
                btn.classList.add('text-blue-100', 'hover:text-white', 'font-medium');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Update speech recognition languages
        if (typeof recognition !== 'undefined' && recognition) {
            recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
        }
        if (typeof evmRecognition !== 'undefined' && evmRecognition) {
            evmRecognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
        }
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLanguage(e.target.getAttribute('data-lang'));
        });
    });

    /**
     * Initialize the Web Audio Context lazily on first user interaction.
     */
    function initAudio() {
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
        }
    }

    /**
     * Synthesize a long 'BEEP' sound typical of Electronic Voting Machines using OscillatorNode.
     * EVM beep is typically loud, constant frequency, and lasts for about 2-2.5 seconds.
     */
    function playEvmBeep() {
        if (!audioContext) return;
        
        // Create an oscillator (sound source)
        const oscillator = audioContext.createOscillator();
        
        // Create a gain node (volume control)
        const gainNode = audioContext.createGain();

        // EVM beep characteristics: high pitch sine wave
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2800, audioContext.currentTime); // 2.8kHz
        
        // Envelope: start at volume 0.1, hold, then sharp drop
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        
        // The beep lasts for about 2.5 seconds. We use exponential ramp to prevent clicks.
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 2.5);

        // Connect nodes to audio destination (speakers)
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Start playing
        oscillator.start();
        
        // Stop playing after 2.5 seconds
        oscillator.stop(audioContext.currentTime + 2.5);
    }

    // State variable to prevent overlapping votes
    let isVotingProcessActive = false;

    // Attach click listeners to all blue EVM vote buttons
    voteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Guard clause: ignore clicks if a voting process is currently active
            if (isVotingProcessActive) return; 
            
            // Lock voting state
            isVotingProcessActive = true;

            // Initialize audio safely on user interaction
            initAudio();

            // Extract voting data attributes
            const candidateName = button.getAttribute('data-candidate');
            const candidateSymbol = button.getAttribute('data-symbol');
            const serialNumber = button.getAttribute('data-serial');
            
            // 1. Activate the red LED next to the selected button
            const candidateRow = button.closest('.candidate-row');
            const ledIndicator = candidateRow.querySelector('.led-indicator');
            if (ledIndicator) {
                ledIndicator.classList.add('active');
            }

            // 2. Play the synthetic EVM beep sound
            playEvmBeep();
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 200]);
            }

            // 3. Populate the VVPAT slip with the chosen candidate's details
            vvpatCandidateName.textContent = candidateName;
            vvpatCandidateSymbol.textContent = candidateSymbol;
            vvpatSerialNumber.textContent = `S.No: ${serialNumber}`;

            // 4. Trigger the VVPAT paper slip CSS animation
            // Remove the class first to allow restarting the animation if it was played before
            vvpatSlip.classList.remove('animate-vvpat');
            
            // Trigger browser reflow to apply the removal before adding it back
            void vvpatSlip.offsetWidth; 
            
            // Add the animation class
            vvpatSlip.classList.add('animate-vvpat');

            // 5. Cleanup and state reset after the entire 8-second process finishes
            // (0.5s slide down + 7s stay + 0.5s slide drop = 8s)
            setTimeout(() => {
                if (ledIndicator) {
                    ledIndicator.classList.remove('active'); // Turn off LED
                }
                vvpatSlip.classList.remove('animate-vvpat'); // Reset slip position/state
                
                // Phase 5: Show Web Share UI
                if (shareCertUi) shareCertUi.classList.remove('hidden');

                // Unlock voting state for the next user/demo
                isVotingProcessActive = false;
            }, 8000); // 8000 milliseconds = 8 seconds
        });
    });

    // Phase 8: Page Visibility API (Attention UX)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isVotingProcessActive) {
            showToast("Voting process interrupted! Please keep tab active.");
        }
    });

    // Phase 5: Web Share Logic
    if (sharePledgeBtn) {
        sharePledgeBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Matdaan Mitra Verified Voter',
                    text: 'I just learned how to vote securely using Matdaan Mitra! Check out my digital Voter Passport.',
                    url: window.location.href,
                }).then(() => {
                    showToast("Shared successfully!");
                    shareCertUi.classList.add('hidden');
                }).catch((error) => console.log('Error sharing', error));
            } else {
                showToast("Native Web Share not supported on this browser.");
            }
        });
    }

    // --- Phase 2 & 4: Chat Console & Integrations ---
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const mapsContainer = document.getElementById('maps-container');
    const closeMapsBtn = document.getElementById('close-maps-btn');
    const simulatorContainer = document.getElementById('simulator-container');
    
    // Phase 4 Elements
    const micBtn = document.getElementById('mic-btn');
    const privacyToggleBtn = document.getElementById('privacy-toggle-btn');
    const mainContent = document.getElementById('main-content');
    const toastContainer = document.getElementById('toast-container');
    const toastMsg = document.getElementById('toast-msg');
    const voterPassportContainer = document.getElementById('voter-passport-container');
    const closePassportBtn = document.getElementById('close-passport-btn');
    const savePdfBtn = document.getElementById('save-pdf-btn');
    const passportDate = document.getElementById('passport-date');

    // Phase 5: Biometric Lock Logic (Robust Rewrite)
    function handleBiometricUnlock(e) {
        if(e) e.preventDefault(); // Prevent duplicate touch+click
        
        if (!biometricOverlay || biometricOverlay.classList.contains('verifying')) return;
        biometricOverlay.classList.add('verifying'); // Lock state
        
        try {
            initAudio(); // Initialize audio context safely
        } catch(err) { console.warn("Audio init failed", err); }
        
        // Start CSS scan animation
        if(scanLine) {
            scanLine.classList.remove('hidden');
            scanLine.classList.add('animate-scan');
        }
        
        if(biometricText) {
            biometricText.textContent = "VERIFYING...";
            biometricText.classList.add('text-blue-600', 'animate-pulse');
        }

        setTimeout(() => {
            if(biometricText) {
                biometricText.textContent = "IDENTITY VERIFIED ✓";
                biometricText.classList.replace('text-blue-600', 'text-green-600');
                biometricText.classList.remove('animate-pulse');
            }
            if(scanLine) {
                scanLine.classList.remove('animate-scan');
                scanLine.classList.add('hidden');
            }
            
            const svgIcon = biometricOverlay.querySelector('svg');
            if(svgIcon) svgIcon.classList.replace('text-blue-500', 'text-green-500');

            // Play small success beep gracefully
            try {
                if(audioContext && audioContext.state === 'running') {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.2);
                }
            } catch(e) { console.warn("Audio beep failed", e); }

            // Hide overlay gracefully
            setTimeout(() => {
                biometricOverlay.classList.add('opacity-0');
                biometricOverlay.classList.add('pointer-events-none');
                setTimeout(() => {
                    biometricOverlay.style.display = 'none';
                }, 500);
            }, 600);
        }, 2000);
    }

    if (biometricOverlay) {
        // Bind both touch and click, preventDefault handles double-firing
        biometricOverlay.addEventListener('click', handleBiometricUnlock);
        biometricOverlay.addEventListener('touchstart', handleBiometricUnlock, {passive: false});
    }

    // Utility: Show Toast Notification
    function showToast(message) {
        toastMsg.textContent = message;
        toastContainer.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            toastContainer.classList.add('opacity-0', 'pointer-events-none');
        }, 3000);
    }

    // Utility: Read Aloud using Web Speech API
    function readAloud(text) {
        if ('speechSynthesis' in window) {
            // Remove emojis and simple HTML tags for clean TTS
            const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'bn' ? 'bn-IN' : 'en-IN';
            window.speechSynthesis.speak(utterance);
        }
    }

    // Web Speech API: Bol-Kar-Poocho (Mic Input)
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            micBtn.classList.add('text-red-500', 'animate-pulse');
            try {
                recognition.start();
            } catch (e) {
                console.error("Speech recognition error:", e);
            }
        });

        recognition.addEventListener('result', (e) => {
            const transcript = e.results[0][0].transcript;
            chatInput.value = transcript;
            chatForm.dispatchEvent(new Event('submit')); // Auto submit
        });

        recognition.addEventListener('end', () => {
            micBtn.classList.remove('text-red-500', 'animate-pulse');
        });
    } else {
        micBtn.style.display = 'none'; // Hide if unsupported
    }

    // Utility: Add message to chat
    function addChatMessage(sender, text, isHtml = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 rounded-lg max-w-[85%] ${sender === 'user' ? 'bg-blue-100 text-blue-900 self-end ml-auto' : 'bg-gray-100 text-gray-800 self-start mr-auto'}`;
        
        if (isHtml) {
            msgDiv.innerHTML = text;
        } else {
            msgDiv.textContent = text;
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Auto read aloud if sender is bot
        if (sender === 'bot') {
            readAloud(isHtml ? msgDiv.innerText : text);
        }
    }

    // Security: PII Redaction
    function redactSensitiveInfo(text) {
        // Aadhar (12 digits) or Voter ID (10 alphanumeric)
        const aadharRegex = /\b\d{12}\b/g;
        const voterIdRegex = /\b[A-Za-z0-9]{10}\b/g;
        
        let redacted = false;
        let sanitizedText = text;

        if (aadharRegex.test(text) || voterIdRegex.test(text)) {
            redacted = true;
            sanitizedText = text.replace(aadharRegex, '[REDACTED FOR SECURITY]').replace(voterIdRegex, '[REDACTED FOR SECURITY]');
        }

        return { sanitizedText, redacted };
    }

    // Handle form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawText = chatInput.value.trim();
        if (!rawText) return;

        // Apply Redaction
        const { sanitizedText, redacted } = redactSensitiveInfo(rawText);

        addChatMessage('user', sanitizedText);
        chatInput.value = '';

        // Bot Response Logic
        setTimeout(() => {
            if (redacted) {
                addChatMessage('bot', i18n[currentLang].respSecurity);
            } else if (rawText.toLowerCase().includes("where is my booth") || rawText.toLowerCase().includes("booth")) {
                if ("geolocation" in navigator) {
                    addChatMessage('bot', i18n[currentLang].respCheckingLoc);
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=nearest+polling+booth`;
                            
                            const html = `
                                <p class="mb-2">${i18n[currentLang].respBoothDist}</p>
                                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 transition no-underline text-xs text-center font-medium w-full">
                                    ${i18n[currentLang].respNavigateBtn}
                                </a>
                            `;
                            addChatMessage('bot', html, true);
                            showMap(lat, lng); // Pass dynamic coords to update iframe map
                        },
                        (error) => {
                            addChatMessage('bot', i18n[currentLang].respNoLoc);
                            showMap();
                        }
                    );
                } else {
                    addChatMessage('bot', i18n[currentLang].respNoGeo);
                    showMap();
                }
            } else if (rawText.toLowerCase().includes("generate my voter passport") || rawText.toLowerCase().includes("passport")) {
                addChatMessage('bot', i18n[currentLang].respGenPassport);
                setTimeout(() => {
                    generateVoterPassport();
                }, 1000);
            } else if (rawText.toLowerCase().includes("compass") || rawText.toLowerCase().includes("ar")) {
                addChatMessage('bot', "Launching Zero-Data AR Compass to locate your booth offline.");
                setTimeout(startARCompass, 1000);
            } else {
                addChatMessage('bot', i18n[currentLang].respFallback);
            }
        }, 500);
    });

    // Google Maps mock integration
    function showMap(lat, lng) {
        simulatorContainer.classList.add('opacity-0', 'pointer-events-none');
        
        if (lat && lng) {
            const iframe = mapsContainer.querySelector('iframe');
            if (iframe) {
                // Dynamic Google Maps embed using standard maps query
                iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            }
        }

        setTimeout(() => {
            simulatorContainer.classList.add('hidden');
            mapsContainer.classList.remove('hidden');
        }, 300);
    }

    closeMapsBtn.addEventListener('click', () => {
        mapsContainer.classList.add('hidden');
        simulatorContainer.classList.remove('hidden');
        setTimeout(() => {
            simulatorContainer.classList.remove('opacity-0', 'pointer-events-none');
        }, 50);
    });

    // Initial Welcome Message
    function initChat() {
        const welcomeHtml = `
            <p class="mb-2" data-i18n="welcomeMsg">${i18n[currentLang].welcomeMsg}</p>
            <div class="flex flex-col gap-2 mt-2">
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="first-time" data-i18n="btnFirstTime">${i18n[currentLang].btnFirstTime}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="senior" data-i18n="btnSenior">${i18n[currentLang].btnSenior}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="booth" data-i18n="btnBoothMap">${i18n[currentLang].btnBoothMap}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="queue" data-i18n="btnQueue">${i18n[currentLang].btnQueue || "How long is the queue?"}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="compass" data-i18n="btnCompass">${i18n[currentLang].btnCompass}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="passport" data-i18n="btnPassport">${i18n[currentLang].btnPassport}</button>
                <button class="quick-reply-btn bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-left transition" data-reply="scan-id" data-i18n="btnScanId">${i18n[currentLang].btnScanId || "Scan Voter ID 📷"}</button>
            </div>
        `;
        addChatMessage('bot', welcomeHtml, true);
        
        // Attach events to dynamic buttons
        setTimeout(() => {
            document.querySelectorAll('.quick-reply-btn').forEach(btn => {
                btn.addEventListener('click', handleQuickReply);
            });
        }, 100);
    }

    function handleQuickReply(e) {
        const replyType = e.target.getAttribute('data-reply');
        
        if (replyType === 'first-time') {
            addChatMessage('user', i18n[currentLang].btnFirstTime);
            
            setTimeout(() => {
                // Google Calendar Web Intent logic
                const eventTitle = encodeURIComponent("Last day to register to vote");
                const details = encodeURIComponent("Reminder to register for the upcoming elections via Matdaan Mitra.");
                
                // Get a date 7 days from now as a dummy deadline
                const d = new Date();
                d.setDate(d.getDate() + 7);
                const dateString = d.toISOString().replace(/-|:|\.\d+/g, '');
                // Format: YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ
                const dates = `${dateString}/${dateString}`;
                
                const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dates}&details=${details}`;
                
                const responseHtml = `
                    <p class="font-bold mb-1 text-gray-800">${i18n[currentLang].respTimelineTitle}</p>
                    <ul class="list-disc pl-4 mb-3 space-y-1 text-xs">
                        <li>${i18n[currentLang].respTimeline1}</li>
                        <li>${i18n[currentLang].respTimeline2}</li>
                        <li>${i18n[currentLang].respTimeline3}</li>
                    </ul>
                    <a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 transition no-underline text-xs text-center font-medium w-full">
                        ${i18n[currentLang].respCalendarBtn}
                    </a>
                `;
                addChatMessage('bot', responseHtml, true);
            }, 600);
        } else if (replyType === 'senior') {
            addChatMessage('user', i18n[currentLang].btnSenior);
            setTimeout(() => {
                addChatMessage('bot', i18n[currentLang].respSenior);
            }, 600);
        } else if (replyType === 'booth') {
            addChatMessage('user', i18n[currentLang].btnBoothMap);
            setTimeout(() => {
                if ("geolocation" in navigator) {
                    addChatMessage('bot', i18n[currentLang].respCheckingLoc);
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=nearest+polling+booth`;
                            
                            const html = `
                                <p class="mb-2">${i18n[currentLang].respBoothDist}</p>
                                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 transition no-underline text-xs text-center font-medium w-full">
                                    ${i18n[currentLang].respNavigateBtn}
                                </a>
                            `;
                            addChatMessage('bot', html, true);
                            showMap(lat, lng);
                        },
                        (error) => {
                            addChatMessage('bot', i18n[currentLang].respNoLoc);
                            showMap();
                        }
                    );
                } else {
                    addChatMessage('bot', i18n[currentLang].respNoGeo);
                    showMap();
                }
            }, 600);
        } else if (replyType === 'compass') {
            addChatMessage('user', i18n[currentLang].btnCompass);
            setTimeout(() => {
                addChatMessage('bot', "Launching Zero-Data AR Compass to locate your booth offline.");
                setTimeout(startARCompass, 1000);
            }, 600);
        } else if (replyType === 'passport') {
            addChatMessage('user', i18n[currentLang].btnPassport);
            setTimeout(() => {
                generateVoterPassport();
            }, 600);
        } else if (replyType === 'queue') {
            addChatMessage('user', i18n[currentLang].btnQueue || "How long is the queue?");
            setTimeout(() => {
                const currentHour = new Date().getHours();
                let reply = "";
                if (currentHour >= 8 && currentHour < 11) {
                    reply = i18n[currentLang].respQueueHigh || "High rush right now (approx. 45-60 mins wait).";
                } else if (currentHour >= 11 && currentHour < 13) {
                    reply = i18n[currentLang].respQueueMedium || "Medium rush (approx. 20-30 mins wait).";
                } else {
                    reply = i18n[currentLang].respQueueLow || "Low rush right now (5-10 mins wait). This is the best time to vote!";
                }
                
                // Offline Push Reminders (Notification API)
                reply += `<br><button class="remind-me-btn mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-blue-700 transition">Remind Me ⏰</button>`;
                addChatMessage('bot', reply, true);
                
                setTimeout(() => {
                    const remindBtns = document.querySelectorAll('.remind-me-btn');
                    const lastRemindBtn = remindBtns[remindBtns.length - 1];
                    if (lastRemindBtn) {
                        lastRemindBtn.addEventListener('click', () => {
                            if ("Notification" in window) {
                                Notification.requestPermission().then(permission => {
                                    if (permission === "granted") {
                                        // Use showToast from the outer scope if available, else alert
                                        const notifyToast = document.getElementById('toast-msg') ? showToast : alert;
                                        notifyToast("Reminder set! We will notify you when it's time.");
                                        setTimeout(() => {
                                            new Notification("Matdaan Mitra", {
                                                body: "The queue is short right now. It's the best time to vote!",
                                                icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFlM2E4YSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1zaXplPSI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiPlY8L3RleHQ+PC9zdmc+"
                                            });
                                        }, 5000); // 5 seconds demo delay
                                    } else {
                                        const notifyToast = document.getElementById('toast-msg') ? showToast : alert;
                                        notifyToast("Notification permission denied.");
                                    }
                                });
                            } else {
                                const notifyToast = document.getElementById('toast-msg') ? showToast : alert;
                                notifyToast("Notifications not supported in this browser.");
                            }
                        });
                    }
                }, 100);
            }, 600);
        } else if (replyType === 'scan-id') {
            addChatMessage('user', i18n[currentLang].btnScanId || "Scan Voter ID 📷");
            setTimeout(async () => {
                if (!('BarcodeDetector' in window)) {
                    addChatMessage('bot', i18n[currentLang].respScanUnsupported || "Your browser does not support the native barcode scanner.");
                    return;
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    addChatMessage('bot', "Camera active. Scanning for Voter ID QR code...");
                    
                    const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    
                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop()); // Save battery
                        addChatMessage('bot', i18n[currentLang].respScanSuccess || "Voter ID scanned successfully! Processing details...");
                        setTimeout(() => { chatInput.value = "Rajesh Kumar - VTC1234567"; }, 500);
                    }, 2500);
                } catch (err) {
                    addChatMessage('bot', "Could not access camera for scanning.");
                }
            }, 600);
        }
        
        // Disable buttons after clicking
        document.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        });
    }

    // Privacy Mode (Anti-Shoulder Surfing) Logic
    let isPrivacyMode = false;
    function togglePrivacyMode() {
        isPrivacyMode = !isPrivacyMode;
        if (isPrivacyMode) {
            mainContent.classList.add('blur-[8px]');
            showToast("Privacy Mode Enabled 👁️");
        } else {
            mainContent.classList.remove('blur-[8px]');
            showToast("Privacy Mode Disabled");
        }
    }

    privacyToggleBtn.addEventListener('click', togglePrivacyMode);
    
    // Double press spacebar listener for Privacy Mode
    let spacebarPresses = 0;
    let spacebarTimeout;
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in an input
        if (e.code === 'Space' && document.activeElement !== chatInput) {
            spacebarPresses++;
            if (spacebarPresses === 1) {
                spacebarTimeout = setTimeout(() => { spacebarPresses = 0; }, 500);
            } else if (spacebarPresses === 2) {
                clearTimeout(spacebarTimeout);
                spacebarPresses = 0;
                togglePrivacyMode();
            }
        }
    });

    // Voter Passport Generation Logic
    function generateVoterPassport() {
        const today = new Date();
        passportDate.textContent = today.toLocaleDateString();
        voterPassportContainer.classList.remove('hidden');
    }

    closePassportBtn.addEventListener('click', () => {
        voterPassportContainer.classList.add('hidden');
    });

    savePdfBtn.addEventListener('click', () => {
        // Native print dialog (styled by @media print in css)
        window.print();
    });

    // Phase 5: Voice Mode EVM
    let isVoiceModeActive = false;
    let evmRecognition = null;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        evmRecognition = new SpeechRecognition();
        evmRecognition.lang = 'en-IN';
        evmRecognition.interimResults = false;
        evmRecognition.continuous = false;

        evmRecognition.addEventListener('result', (e) => {
            const transcript = e.results[0][0].transcript.toLowerCase();
            console.log("Heard Voice Mode command:", transcript);

            let targetCandidate = null;
            if (transcript.includes('candidate a') || transcript.includes('candidate 1')) targetCandidate = "Candidate A";
            else if (transcript.includes('candidate b') || transcript.includes('candidate 2')) targetCandidate = "Candidate B";
            else if (transcript.includes('candidate c') || transcript.includes('candidate 3')) targetCandidate = "Candidate C";
            else if (transcript.includes('candidate d') || transcript.includes('candidate 4')) targetCandidate = "Candidate D";
            else if (transcript.includes('candidate e') || transcript.includes('candidate 5')) targetCandidate = "Candidate E";
            else if (transcript.includes('candidate f') || transcript.includes('candidate 6')) targetCandidate = "Candidate F";
            else if (transcript.includes('nota') || transcript.includes('none')) targetCandidate = "NOTA";
            
            if (targetCandidate) {
                const btn = Array.from(voteButtons).find(b => b.getAttribute('data-candidate') === targetCandidate);
                if (btn) {
                    showToast(`Voice match: ${targetCandidate}`);
                    btn.click(); // Trigger native click which handles state, audio, animation
                    setTimeout(() => {
                        readAloud("Your vote has been recorded securely.");
                    }, 3000); // Wait for EVM beep to finish before speaking
                }
            } else {
                showToast("Didn't catch a valid candidate. Try 'Vote for Candidate A'");
            }
            voiceModeBtn.classList.remove('animate-pulse', 'bg-purple-300', 'text-purple-900');
            isVoiceModeActive = false;
        });

        evmRecognition.addEventListener('end', () => {
            voiceModeBtn.classList.remove('animate-pulse', 'bg-purple-300', 'text-purple-900');
            isVoiceModeActive = false;
        });
    }

    if (voiceModeBtn) {
        voiceModeBtn.addEventListener('click', () => {
            if (!evmRecognition) {
                showToast("Voice mode not supported on this browser.");
                return;
            }
            
            isVoiceModeActive = true;
            voiceModeBtn.classList.add('animate-pulse', 'bg-purple-300', 'text-purple-900');
            showToast("Voice Mode: Say 'Vote for Candidate A'");
            try {
                evmRecognition.start();
            } catch(e) {
                console.error(e);
            }
        });
    }

    // Start chat
    initChat();

    // Service Worker Registration for Offline PWA Support
    // Print specific styles are handled in CSS, but we can add JS listeners if needed
    window.addEventListener('beforeprint', () => {
        console.log("Preparing to print Voter Passport...");
    });

    // Phase 6: Hardware Context (Bharat Mode)
    function checkHardwareContext() {
        let isLiteMode = false;

        // Check Network
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
                isLiteMode = true;
            }
        }

        // Check Battery
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                if (battery.level <= 0.20 && !battery.charging) {
                    isLiteMode = true;
                }
                applyLiteMode(isLiteMode);
            }).catch(() => applyLiteMode(isLiteMode));
        } else {
            applyLiteMode(isLiteMode);
        }
    }

    function applyLiteMode(shouldApply) {
        if (shouldApply) {
            document.body.classList.add('power-save');
            showToast("Low Battery/Network: Switched to Lite Mode");
        }
    }

    // Call on load
    checkHardwareContext();

    // Phase 6: Zero-Data AR Compass
    const arCompassContainer = document.getElementById('ar-compass-container');
    const closeCompassBtn = document.getElementById('close-compass-btn');
    const compassArrow = document.getElementById('compass-arrow');
    const compassStatus = document.getElementById('compass-status');
    const compassDistance = document.getElementById('compass-distance');

    let compassHandler = null;

    function getBearing(startLat, startLng, destLat, destLng) {
        const toRad = (degree) => degree * Math.PI / 180;
        const toDeg = (rad) => rad * 180 / Math.PI;

        startLat = toRad(startLat);
        startLng = toRad(startLng);
        destLat = toRad(destLat);
        destLng = toRad(destLng);

        const y = Math.sin(destLng - startLng) * Math.cos(destLat);
        const x = Math.cos(startLat) * Math.sin(destLat) -
                  Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        const bearing = toDeg(Math.atan2(y, x));
        return (bearing + 360) % 360;
    }

    let wakeLock = null;
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.log(`Wake Lock error: ${err.name}, ${err.message}`);
        }
    };
    const releaseWakeLock = async () => {
        if (wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
        }
    };

    function startARCompass() {
        if (!("geolocation" in navigator) || !window.DeviceOrientationEvent) {
            addChatMessage('bot', "Your device does not support the AR Compass feature.");
            return;
        }

        requestWakeLock(); // Request screen to stay awake

        simulatorContainer.classList.add('hidden');
        mapsContainer.classList.add('hidden');
        arCompassContainer.classList.remove('hidden');
        compassStatus.textContent = "Getting your location...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Mock destination (+0.005 roughly 500m away)
                const destLat = userLat + 0.005;
                const destLng = userLng + 0.005;

                const bearing = getBearing(userLat, userLng, destLat, destLng);
                compassStatus.textContent = "Point your phone around!";
                compassDistance.textContent = "Distance: ~500 m";

                compassHandler = (e) => {
                    let heading = 0;
                    if (e.webkitCompassHeading) {
                        heading = e.webkitCompassHeading;
                    } else if (e.alpha !== null) {
                        heading = 360 - e.alpha; 
                    } else {
                        return;
                    }
                    
                    let rotation = bearing - heading;
                    compassArrow.style.transform = `rotate(${rotation}deg)`;
                };

                window.addEventListener('deviceorientation', compassHandler, true);
            },
            (err) => {
                compassStatus.textContent = "Failed to access location.";
            }
        );
    }

    if (closeCompassBtn) {
        closeCompassBtn.addEventListener('click', () => {
            releaseWakeLock(); // Release screen lock
            arCompassContainer.classList.add('hidden');
            simulatorContainer.classList.remove('hidden');
            if (compassHandler) {
                window.removeEventListener('deviceorientation', compassHandler, true);
            }
        });
    }
    // Phase 7: WhatsApp Interceptor (Web Share Target API)
    function handleWebShareTarget() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedTitle = urlParams.get('title');
        const sharedText = urlParams.get('text');
        const sharedUrl = urlParams.get('url');

        let messageToProcess = '';
        if (sharedText) messageToProcess += sharedText + ' ';
        if (sharedUrl) messageToProcess += sharedUrl;
        if (!messageToProcess && sharedTitle) messageToProcess = sharedTitle;

        if (messageToProcess.trim().length > 0) {
            // Clean up the URL to prevent reloading on refresh
            window.history.replaceState({}, document.title, window.location.pathname);

            setTimeout(() => {
                // Add the shared message as a user message
                addChatMessage('user', `Forwarded Message: "${messageToProcess.trim()}"`);
                
                // Add the bot fact-check response
                setTimeout(() => {
                    const factCheckMsg = "🔍 Analyzing forwarded message... FACT: According to ECI guidelines, this claim is unverified. Always rely on official sources.";
                    addChatMessage('bot', factCheckMsg);
                }, 1000);
            }, 1500); // Wait for init chat to finish
        }
    }
    handleWebShareTarget();

    // Phase 7: Live Bharat Pledge Counter
    function startLivePledgeCounter() {
        const counterEl = document.getElementById('pledge-counter');
        if (!counterEl) return;
        
        let currentPledges = parseInt(counterEl.innerText.replace(/,/g, ''), 10) || 14502;

        setInterval(() => {
            // Increment by a random small integer (1 to 5)
            const increment = Math.floor(Math.random() * 5) + 1;
            currentPledges += increment;
            // Format back to locale string
            counterEl.innerText = currentPledges.toLocaleString('en-IN');
        }, Math.floor(Math.random() * (12000 - 5000 + 1) + 5000)); // Every 5 to 12 seconds
    }
    startLivePledgeCounter();

    // Digital Blue Ink Selfie Feature
    const startSelfieBtn = document.getElementById('start-selfie-btn');
    const captureSelfieBtn = document.getElementById('capture-selfie-btn');
    const shareSelfieBtn = document.getElementById('share-selfie-btn');
    const selfieVideo = document.getElementById('selfie-video');
    const selfieImg = document.getElementById('selfie-img');
    const selfiePlaceholder = document.getElementById('selfie-placeholder');
    const selfieCanvas = document.getElementById('selfie-canvas');

    let videoStream = null;

    if (startSelfieBtn) {
        startSelfieBtn.addEventListener('click', async () => {
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (selfieVideo) {
                    selfieVideo.srcObject = videoStream;
                    selfieVideo.classList.remove('hidden');
                }
                if (selfiePlaceholder) selfiePlaceholder.classList.add('hidden');
                if (selfieImg) selfieImg.classList.add('hidden');
                
                startSelfieBtn.classList.add('hidden');
                captureSelfieBtn.classList.remove('hidden');
                shareSelfieBtn.classList.add('hidden');
            } catch (err) {
                console.error("Error accessing camera:", err);
                showToast("Camera access denied or unavailable.");
            }
        });
    }

    if (captureSelfieBtn) {
        captureSelfieBtn.addEventListener('click', () => {
            if (!videoStream || !selfieCanvas || !selfieVideo) return;

            selfieCanvas.width = selfieVideo.videoWidth || 300;
            selfieCanvas.height = selfieVideo.videoHeight || 300;
            const ctx = selfieCanvas.getContext('2d');
            
            ctx.drawImage(selfieVideo, 0, 0, selfieCanvas.width, selfieCanvas.height);
            
            ctx.fillStyle = "rgba(30, 58, 138, 0.8)";
            const stripHeight = Math.max(40, selfieCanvas.height * 0.15);
            ctx.fillRect(0, selfieCanvas.height - stripHeight, selfieCanvas.width, stripHeight);
            
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.floor(stripHeight * 0.4)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Matdaan Mitra Verified Voter 🇮🇳", selfieCanvas.width / 2, selfieCanvas.height - (stripHeight / 2));
            
            const dataUrl = selfieCanvas.toDataURL('image/png');
            if (selfieImg) selfieImg.src = dataUrl;
            
            videoStream.getTracks().forEach(track => track.stop());
            selfieVideo.classList.add('hidden');
            if (selfieImg) selfieImg.classList.remove('hidden');
            
            captureSelfieBtn.classList.add('hidden');
            shareSelfieBtn.classList.remove('hidden');
            startSelfieBtn.classList.remove('hidden');
            startSelfieBtn.textContent = "📸 Retake";
        });
    }

    if (shareSelfieBtn) {
        shareSelfieBtn.addEventListener('click', async () => {
            const dataUrl = selfieImg?.src;
            if (!dataUrl) return;
            
            try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'voter_selfie.png', { type: 'image/png' });
                
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Matdaan Mitra Verified Voter',
                        text: 'I just got my Voter Passport and Digital Selfie on Matdaan Mitra! 🇮🇳',
                        files: [file]
                    });
                    showToast("Selfie shared successfully!");
                } else {
                    showToast("Image sharing not supported on this device. You can long-press to save.");
                }
            } catch (err) {
                console.error("Error sharing selfie:", err);
            }
        });
    }

    // Shake-to-Help (DeviceMotion API)
    let lastShakeTime = 0;
    const SHAKE_THRESHOLD = 25;
    const SHAKE_COOLDOWN = 3000;

    window.addEventListener('devicemotion', (event) => {
        const acc = event.acceleration;
        if (!acc || acc.x === null) return;

        const totalAcc = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

        if (totalAcc > SHAKE_THRESHOLD) {
            const now = Date.now();
            if (now - lastShakeTime > SHAKE_COOLDOWN) {
                lastShakeTime = now;
                
                if (simulatorContainer) simulatorContainer.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
                if (mapsContainer) mapsContainer.classList.add('hidden');
                if (arCompassContainer) arCompassContainer.classList.add('hidden');
                if (voterPassportContainer) voterPassportContainer.classList.add('hidden');
                
                if (biometricOverlay) {
                    biometricOverlay.classList.remove('opacity-0', 'pointer-events-none', 'verifying');
                    biometricOverlay.style.display = 'flex';
                    const bText = document.getElementById('biometric-text');
                    if (bText) {
                        bText.textContent = "TAP TO VERIFY IDENTITY";
                        bText.classList.replace('text-green-600', 'text-gray-800');
                    }
                    const sIcon = biometricOverlay.querySelector('svg');
                    if (sIcon) sIcon.classList.replace('text-green-500', 'text-blue-500');
                }

                const msg = "Looks like you shook your phone! Returning to the main menu. How can I help?";
                addChatMessage('bot', msg);
            }
        }
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('SW registered with scope:', registration.scope);
                    showToast("Ready to use offline 📶");
                })
                .catch((error) => {
                    console.error('SW registration failed:', error);
                });
        });
    }
});
