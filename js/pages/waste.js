import { sleep } from '../utils.js';
import { showToast, flyPoints } from '../components.js';
import { firebaseDB, currentUser, addEcoPoints } from '../firebase.js';


// Waste category data with rich metadata
const WASTE_DATA = {
    "Recyclable": {
        badge: 'badge-green',
        catClass: 'cat-recyclable',
        icon: 'recycling',
        color: 'var(--primary)',
        instruction: 'Rinse the item if it has food residue, then place it in the Recycling (Blue) bin.',
        tips: [
            { icon: 'water_drop', text: 'Rinse before recycling to avoid contamination.' },
            { icon: 'local_shipping', text: 'Collected and sent to recycling facility.' },
            { icon: 'eco', text: 'Saves energy vs. making new materials.' },
        ],
        impact: ['🌊 Saves ocean waste', '⚡ Reduces energy use', '🌍 Cuts CO₂']
    },
    "Wet Waste": {
        badge: 'badge-blue',
        catClass: 'cat-wet',
        icon: 'compost',
        color: 'var(--info)',
        instruction: 'Place in the Green bin for organic/wet waste. This item can be composted into nutrient-rich soil.',
        tips: [
            { icon: 'spa', text: 'Compost creates rich fertilizer for crops.' },
            { icon: 'science', text: 'Anaerobic digestion produces biogas energy.' },
            { icon: 'grass', text: 'Reduces methane in landfills significantly.' },
        ],
        impact: ['🌱 Becomes compost', '⚡ Produces biogas', '🏭 Diverts from landfill']
    },
    "Dry Waste": {
        badge: 'badge-amber',
        catClass: 'cat-dry',
        icon: 'delete',
        color: 'var(--warning)',
        instruction: 'Dispose in the Yellow or Black general waste bin. This item is not recyclable or compostable.',
        tips: [
            { icon: 'reduce_capacity', text: 'Try to reduce usage of single-use dry waste.' },
            { icon: 'shopping_bag', text: 'Look for alternatives with recyclable packaging.' },
            { icon: 'info', text: 'Some facilities can convert to refuse-derived fuel.' },
        ],
        impact: ['📦 General disposal', '🔥 May be incinerated', '♻️ Replace with reusables']
    },
    "Hazardous": {
        badge: 'badge-red',
        catClass: 'cat-hazardous',
        icon: 'warning',
        color: 'var(--error)',
        instruction: '⚠️ Do NOT dispose in regular trash! Take to a certified e-waste or hazardous waste facility.',
        tips: [
            { icon: 'location_on', text: 'Use a certified e-waste drop-off near you.' },
            { icon: 'health_and_safety', text: 'Hazardous items contaminate soil and water.' },
            { icon: 'gpp_good', text: 'Proper disposal protects communities.' },
        ],
        impact: ['☣️ Toxic if landfilled', '🔋 Recoverable metals', '🏥 Protect community health']
    }
};

export const initWaste = async (container) => {
    container.innerHTML = `
        <div class="page-entry">
            <div class="page-header staggered-fade">
                <h1>AI Waste Classifier <span class="material-symbols-outlined glow-pulse" style="color:var(--primary); vertical-align:middle;">document_scanner</span></h1>
                <p class="text-muted">Upload or photograph an item to discover the optimal disposal method.</p>
            </div>

            <div class="scanner-container">
                <!-- LEFT: Camera Panel (70%) -->
                <div class="camera-panel staggered-fade">
                    <!-- Mode Toggle -->
                    <div class="camera-mode-toggle">
                        <button class="cam-mode-btn active hover-lift tap-scale" id="btn-mode-upload">
                            <span class="material-symbols-outlined" style="font-size:1.1rem;">upload_file</span>
                            Upload Photo
                        </button>
                        <button class="cam-mode-btn hover-lift tap-scale" id="btn-mode-camera">
                            <span class="material-symbols-outlined" style="font-size:1.1rem;">camera_alt</span>
                            Live Camera
                        </button>
                    </div>

                    <!-- Camera / Upload Frame -->
                    <div class="camera-container glass-fade" id="camera-frame">
                        <!-- Corner brackets -->
                        <div class="scan-bracket tl glow-pulse"></div>
                        <div class="scan-bracket tr glow-pulse"></div>
                        <div class="scan-bracket bl glow-pulse"></div>
                        <div class="scan-bracket br glow-pulse"></div>

                        <!-- Default state -->
                        <div class="camera-overlay breeze-float" id="camera-instruction">
                            <span class="material-symbols-outlined earth-pulse" style="font-size:4rem; color:var(--primary);">add_a_photo</span>
                            <h3>Tap to Upload</h3>
                            <p class="text-muted" style="font-size:0.85rem;">Supports JPG, PNG, WEBP</p>
                        </div>

                        <!-- Hidden inputs -->
                        <input type="file" id="file-upload" accept="image/*" class="hidden" capture="environment">
                        <video id="live-video" class="hidden" autoplay playsinline muted></video>
                        <img id="preview-image" class="hidden" alt="Scanned item">

                        <!-- Scan Effect Overlay -->
                        <div id="scan-fx" class="scan-container hidden" style="position:absolute;inset:0;z-index:15;">
                            <div class="scan-line"></div>
                            <div class="scan-status-text glow-pulse" id="scan-status-text">Analyzing...</div>
                        </div>
                    </div>

                    <!-- Camera controls (live mode) -->
                    <div id="camera-controls" class="hidden" style="display:none; justify-content:center; gap:var(--space-md); margin-top:var(--space-md);">
                        <button class="btn btn-primary hover-lift tap-scale" id="btn-capture">
                            <span class="material-symbols-outlined">camera</span>
                            Capture & Classify
                        </button>
                        <button class="btn btn-outline hover-lift tap-scale" id="btn-stop-camera">
                            <span class="material-symbols-outlined">stop_circle</span>
                            Stop Camera
                        </button>
                    </div>
                </div>

                <!-- RIGHT: Analysis Panel (30%) -->
                <div class="analysis-panel staggered-fade">
                    <!-- Placeholder (before scan) -->
                    <div class="glass-card" id="result-placeholder">
                        <div class="result-card-empty">
                            <span class="material-symbols-outlined breeze-float" style="font-size:3.5rem; color:rgba(255,255,255,0.1); display:block;">document_scanner</span>
                            <h4 class="text-muted" style="font-weight:500;">No Item Scanned</h4>
                            <p class="text-muted" style="font-size:0.85rem; line-height:1.5;">Upload or photograph an item to get instant AI-powered disposal guidance.</p>
                        </div>
                    </div>

                    <!-- Result card (after scan) -->
                    <div class="glass-card hidden" id="scan-result">
                        <!-- Dynamic result content injected here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // ── Element Refs ─────────────────────────────────────
    const cameraFrame    = document.getElementById('camera-frame');
    const fileInput      = document.getElementById('file-upload');
    const preview        = document.getElementById('preview-image');
    const instruction    = document.getElementById('camera-instruction');
    const scanFx         = document.getElementById('scan-fx');
    const scanStatusText = document.getElementById('scan-status-text');
    const resultCard     = document.getElementById('scan-result');
    const placeholder    = document.getElementById('result-placeholder');
    const video          = document.getElementById('live-video');
    const cameraCtrl     = document.getElementById('camera-controls');

    let currentScan = null;
    let stream = null;

    // ── Mode Toggle ──────────────────────────────────────
    document.getElementById('btn-mode-upload').addEventListener('click', () => {
        setMode('upload');
    });
    document.getElementById('btn-mode-camera').addEventListener('click', () => {
        setMode('camera');
    });

    const setMode = (mode) => {
        document.getElementById('btn-mode-upload').classList.toggle('active', mode === 'upload');
        document.getElementById('btn-mode-camera').classList.toggle('active', mode === 'camera');

        if (mode === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
    };

    // ── Camera: Click to Upload (upload mode) ────────────
    cameraFrame.addEventListener('click', () => {
        const isUploadMode = document.getElementById('btn-mode-upload').classList.contains('active');
        if (isUploadMode && resultCard.classList.contains('hidden')) {
            fileInput.click();
        }
    });

    // ── Live Camera ──────────────────────────────────────
    const startCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            instruction.classList.add('hidden');
            cameraCtrl.style.display = 'flex';
            cameraCtrl.classList.remove('hidden');
            cameraFrame.classList.add('scan-active');
        } catch (err) {
            showToast('Camera access denied. Using upload mode.', 'warning');
            setMode('upload');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        video.classList.add('hidden');
        cameraCtrl.style.display = 'none';
        instruction.classList.remove('hidden');
        cameraFrame.classList.remove('scan-active');
    };

    document.getElementById('btn-stop-camera').addEventListener('click', () => setMode('upload'));

    // ── Capture from live video ──────────────────────────
    document.getElementById('btn-capture').addEventListener('click', async () => {
        const cvs = document.createElement('canvas');
        cvs.width = video.videoWidth;
        cvs.height = video.videoHeight;
        cvs.getContext('2d').drawImage(video, 0, 0);
        preview.src = cvs.toDataURL('image/jpeg');
        preview.classList.remove('hidden');
        video.classList.add('hidden');
        cameraCtrl.style.display = 'none';
        await runClassification();
    });

    // ── File Upload ──────────────────────────────────────
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        instruction.classList.add('hidden');
        preview.classList.remove('hidden');
        preview.src = URL.createObjectURL(file);
        await runClassification();
    });

    // ── Classification Logic ─────────────────────────────
    const runClassification = async () => {
        cameraFrame.classList.add('scan-active');
        scanFx.classList.remove('hidden');

        const messages = ['Scanning...', 'Detecting material...', 'Analyzing composition...', 'Classifying waste type...', 'Generating insights...'];
        let msgIdx = 0;
        const msgInterval = setInterval(() => {
            scanStatusText.textContent = messages[Math.min(msgIdx++, messages.length - 1)];
        }, 500);

        await sleep(2600);
        clearInterval(msgInterval);

        // Grant XP for successful scan
        const xpAmount = 25;
        addEcoPoints(xpAmount);
        
        // Trigger fly points at the center of the scanner
        const rect = cameraFrame.getBoundingClientRect();
        flyPoints(xpAmount, rect.left + rect.width / 2, rect.top + rect.height / 2);


        try {
            // AI mock classification with realistic weighted random
            const categories = Object.keys(WASTE_DATA);
            const weights = [0.40, 0.25, 0.25, 0.10]; // recyclable most common
            const rand = Math.random();
            let cumulative = 0;
            let bestMatch = categories[0];
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (rand <= cumulative) { bestMatch = categories[i]; break; }
            }
            const confidence = (Math.random() * 25 + 72).toFixed(0); // 72–97%

            const data = WASTE_DATA[bestMatch];
            currentScan = { label: bestMatch, confidence, timestamp: new Date().toISOString() };

            // Render result
            scanFx.classList.add('hidden');
            cameraFrame.classList.remove('scan-active');
            placeholder.classList.add('hidden');
            resultCard.classList.remove('hidden');

            resultCard.innerHTML = `
                <div class="result-header ${data.catClass} page-entry">
                    <span class="material-symbols-outlined result-icon leaf-sway" style="color:${data.color};">${data.icon}</span>
                    <span class="result-category-name glow-pulse">${bestMatch}</span>
                    <span class="text-muted" style="font-size:0.82rem;">Confidence: ${confidence}%</span>
                    <div class="confidence-bar" style="width:100%;">
                        <div class="confidence-fill progress-grow" style="--final-width: ${confidence}%;"></div>
                    </div>
                </div>

                <div class="analysis-block staggered-fade">
                    <h4 class="hover-lift"><span class="material-symbols-outlined">info</span>Disposal Guide</h4>
                    <p>${data.instruction}</p>
                </div>

                <div class="analysis-block staggered-fade">
                    <h4 class="hover-lift"><span class="material-symbols-outlined">eco</span>Environmental Impact</h4>
                    <div class="impact-chips">
                        ${data.impact.map(i => `<span class="impact-chip glow-pulse">${i}</span>`).join('')}
                    </div>
                </div>

                <div class="analysis-block staggered-fade">
                    <h4 class="hover-lift"><span class="material-symbols-outlined">tips_and_updates</span>Pro Tips</h4>
                    ${data.tips.map((t, i) => `
                        <div class="ai-tip-item staggered-fade" style="animation-delay: ${0.2 + (i * 0.1)}s">
                            <div class="ai-tip-icon breeze-float"><span class="material-symbols-outlined">${t.icon}</span></div>
                            <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">${t.text}</p>
                        </div>
                    `).join('')}
                </div>

                <div style="display:flex; gap:var(--space-sm); margin-top:var(--space-md);">
                    <button class="btn btn-outline hover-lift tap-scale" id="btn-reset" style="flex:1;">
                        <span class="material-symbols-outlined">refresh</span> Rescan
                    </button>
                    <button class="btn btn-primary hover-lift tap-scale" id="btn-log" style="flex:1;">
                        <span class="material-symbols-outlined glow-pulse">check_circle</span> Log (+15)
                    </button>
                </div>
            `;

            // Wire up result buttons
            document.getElementById('btn-reset').addEventListener('click', resetScanner);
            document.getElementById('btn-log').addEventListener('click', logWaste);

        } catch (err) {
            showToast('Classification failed. Please try again.', 'error');
            scanFx.classList.add('hidden');
            cameraFrame.classList.remove('scan-active');
            instruction.classList.remove('hidden');
            preview.classList.add('hidden');
        }
    };

    // ── Reset ─────────────────────────────────────────────
    const resetScanner = () => {
        resultCard.classList.add('hidden');
        resultCard.innerHTML = '';
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        instruction.classList.remove('hidden');
        fileInput.value = '';
        currentScan = null;
        cameraFrame.classList.remove('scan-active');
        // Re-show video if in camera mode
        const isCameraMode = document.getElementById('btn-mode-camera').classList.contains('active');
        if (isCameraMode && stream) {
            video.classList.remove('hidden');
            cameraCtrl.style.display = 'flex';
        }
    };

    // ── Log Waste ─────────────────────────────────────────
    const logWaste = async (e) => {
        if (!currentScan) return;
        const btn = document.getElementById('btn-log');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined spin">sync</span> Logging...'; }

        try {
            if (currentUser) {
                await firebaseDB.addDocument('waste_logs', {
                    userId: currentUser.uid,
                    ...currentScan
                });
            }
            showToast(`${currentScan.label} logged! +15 Eco-Points 🌿`, 'success');
            flyPoints(15, e);
            setTimeout(resetScanner, 1200);
        } catch (error) {
            showToast('Error logging waste: ' + error.message, 'error');
            if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Log (+15)'; }
        }
    };
};
