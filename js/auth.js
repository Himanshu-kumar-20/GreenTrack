// js/auth.js
import { auth, firebaseDB, setAuthUser, signInWithGoogleFirebase } from './firebase.js';
import { showToast } from './components.js';

/* ─── Helpers ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ─── CSS Injection ───────────────────────────────────────── */
const injectAuthStyles = () => {
    if (document.getElementById('auth-injected-styles')) return;
    const style = document.createElement('style');
    style.id = 'auth-injected-styles';
    style.textContent = `
    /* ══ AUTH LAYOUT ══════════════════════════════════════════ */
    .auth-root {
        position: relative;
        min-height: 100vh;
        width: 100vw;
        display: flex;
        align-items: stretch;
        overflow-y: auto;
        background: var(--bg-dark);
    }

    /* Left branding panel */
    .auth-brand-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        padding: 3.5rem 3.5rem;
        position: relative;
        overflow-y: auto;
        background: radial-gradient(ellipse at 20% 50%, rgba(0, 255, 135, 0.12) 0%, transparent 55%),
                    radial-gradient(ellipse at 80% 10%, rgba(79, 152, 255, 0.10) 0%, transparent 50%),
                    radial-gradient(ellipse at 60% 85%, rgba(46, 213, 115, 0.08) 0%, transparent 50%),
                    linear-gradient(160deg, #050d07 0%, #081308 40%, #060f07 100%);
    }

    /* Animated gradient orbs */
    .auth-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(96px);
        pointer-events: none;
        animation: orbFloat 8s ease-in-out infinite;
    }
    .auth-orb-1 {
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(0,255,135,0.22) 0%, transparent 70%);
        top: -15%; left: -20%;
        animation-delay: 0s;
    }
    .auth-orb-2 {
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(127,255,0,0.12) 0%, transparent 70%);
        bottom: 5%; right: -10%;
        animation-delay: -3s;
    }
    .auth-orb-3 {
        width: 320px; height: 320px;
        background: radial-gradient(circle, rgba(79,152,255,0.12) 0%, transparent 70%);
        top: 30%; left: 35%;
        animation-delay: -5s;
    }
    @keyframes orbFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        33%       { transform: translateY(-30px) scale(1.04); }
        66%       { transform: translateY(18px) scale(0.97); }
    }

    /* Grid pattern */
    .auth-grid-bg {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(0,255,135,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,135,0.04) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
    }

    .auth-brand-content {
        position: relative;
        z-index: 2;
        width: 100%;
    }
    .auth-brand-icon {
        font-size: 5rem !important;
        color: var(--primary);
        filter: drop-shadow(0 0 30px rgba(0,255,135,0.6));
        animation: brandPulse 3s ease-in-out infinite;
        display: block;
        margin-bottom: 1.5rem;
    }
    @keyframes brandPulse {
        0%, 100% { filter: drop-shadow(0 0 24px rgba(0,255,135,0.5)); transform: scale(1); }
        50%       { filter: drop-shadow(0 0 48px rgba(0,255,135,0.85)); transform: scale(1.06); }
    }

    .auth-brand-title {
        font-size: clamp(2.8rem, 4vw, 4.2rem) !important;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, #4F98FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.1 !important;
        margin-bottom: 1.2rem;
    }

    .auth-brand-desc {
        color: rgba(232, 238, 233, 0.85);
        font-size: 1rem;
        line-height: 1.7;
        max-width: 100%;
        margin-bottom: 2rem;
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    /* Floating feature pills */
    .auth-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem;
        margin-bottom: 0;
    }
    .auth-feature-pill {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 1rem;
        background: rgba(0,255,135,0.06);
        border: 1px solid rgba(0,255,135,0.18);
        border-radius: 12px;
        font-size: 0.85rem;
        color: var(--text-muted);
        animation: pillFadeIn 0.5s ease both;
        width: 100%;
        backdrop-filter: blur(8px);
    }
    .auth-feature-pill .material-symbols-outlined {
        font-size: 1.1rem;
        color: var(--primary);
    }
    .auth-feature-pill:nth-child(1) { animation-delay: 0.6s; }
    .auth-feature-pill:nth-child(2) { animation-delay: 0.75s; }
    .auth-feature-pill:nth-child(3) { animation-delay: 0.9s; }
    @keyframes pillFadeIn {
        from { opacity: 0; transform: translateX(-16px); }
        to   { opacity: 1; transform: translateX(0); }
    }

    /* Divider */
    .auth-divider {
        width: 1px;
        background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);
        flex-shrink: 0;
        align-self: stretch;
        margin: 4rem 0;
    }

    /* Right form panel */
    .auth-form-panel {
        flex: 0.9;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding: 3rem 3.5rem;
        position: relative;
        overflow-y: auto;
    }

    .auth-card {
        width: 100%;
        max-width: 420px;
        animation: authCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes authCardIn {
        from { opacity: 0; transform: translateY(24px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Tab switcher */
    .auth-tabs {
        display: flex;
        background: rgba(255,255,255,0.04);
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 2rem;
        border: var(--border-glass);
        gap: 4px;
    }
    .auth-tab {
        flex: 1;
        padding: 0.65rem 1rem;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-family: var(--font-body);
        font-size: 0.92rem;
        font-weight: 500;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
    }
    .auth-tab.active {
        background: rgba(0,255,135,0.12);
        color: var(--primary);
        box-shadow: 0 0 16px rgba(0,255,135,0.15);
        border: 1px solid rgba(0,255,135,0.25);
    }
    .auth-tab:hover:not(.active) {
        background: rgba(255,255,255,0.05);
        color: var(--text-main);
    }

    .auth-heading {
        font-size: 1.7rem !important;
        margin-bottom: 0.4rem;
        background: linear-gradient(135deg, var(--text-main) 0%, rgba(232,238,233,0.7) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .auth-subheading {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-bottom: 1.8rem;
    }

    /* Input groups */
    .auth-input-group {
        margin-bottom: 1.1rem;
        position: relative;
    }
    .auth-input-label {
        display: block;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 0.45rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }
    .auth-input-wrap {
        position: relative;
    }
    .auth-input-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 1.1rem !important;
        pointer-events: none;
        transition: color 0.2s ease;
    }
    .auth-input {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 0.8rem 1rem 0.8rem 2.8rem;
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    }
    .auth-input::placeholder { color: rgba(143,163,150,0.5); }
    .auth-input:focus {
        border-color: rgba(0,255,135,0.45);
        background: rgba(0,255,135,0.04);
        box-shadow: 0 0 0 3px rgba(0,255,135,0.08), 0 4px 16px rgba(0,0,0,0.2);
    }
    .auth-input:focus + .auth-input-label { color: var(--primary); }
    .auth-input-wrap:focus-within .auth-input-icon { color: var(--primary); }
    .auth-input-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        padding: 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        transition: color 0.2s;
    }
    .auth-input-toggle:hover { color: var(--text-main); }

    .auth-select {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 0.8rem 1rem 0.8rem 2.8rem;
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.95rem;
        outline: none;
        appearance: none;
        cursor: pointer;
        transition: border-color 0.25s ease, background 0.25s ease;
    }
    .auth-select:focus {
        border-color: rgba(0,255,135,0.45);
        background: rgba(0,255,135,0.04);
        box-shadow: 0 0 0 3px rgba(0,255,135,0.08);
    }
    .auth-select option { background: #0c1510; color: var(--text-main); }

    /* Submit button */
    .auth-btn-primary {
        width: 100%;
        padding: 0.9rem 1.5rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: #050d07;
        font-family: var(--font-display);
        font-size: 1rem;
        font-weight: 700;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        letter-spacing: 0.01em;
        position: relative;
        overflow: hidden;
        margin-top: 0.5rem;
    }
    .auth-btn-primary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.25s;
    }
    .auth-btn-primary:hover:not(:disabled)::before { opacity: 1; }
    .auth-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,255,135,0.4);
    }
    .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .auth-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    /* Demo button */
    .auth-btn-demo {
        width: 100%;
        padding: 0.8rem 1.5rem;
        background: transparent;
        color: var(--text-muted);
        font-family: var(--font-body);
        font-size: 0.92rem;
        font-weight: 500;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.25s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    .auth-btn-demo:hover {
        border-color: rgba(79,152,255,0.4);
        background: rgba(79,152,255,0.06);
        color: var(--info);
        transform: translateY(-1px);
    }
    .auth-btn-demo:active { transform: translateY(0); }

    /* Divider OR */
    .auth-or {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.25rem 0;
        color: var(--text-muted);
        font-size: 0.82rem;
    }
    .auth-or::before, .auth-or::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255,255,255,0.08);
    }

    /* Footer link */
    .auth-footer-link {
        text-align: center;
        font-size: 0.88rem;
        color: var(--text-muted);
        margin-top: 1.2rem;
    }
    .auth-footer-link a {
        color: var(--primary);
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .auth-footer-link a:hover { opacity: 0.8; }

    /* Error shake */
    @keyframes authShake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-8px); }
        40%       { transform: translateX(8px); }
        60%       { transform: translateX(-5px); }
        80%       { transform: translateX(5px); }
    }
    .auth-shake { animation: authShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }

    /* Form field slide in */
    @keyframes fieldSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .auth-field-anim {
        animation: fieldSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .auth-field-anim:nth-child(1) { animation-delay: 0.05s; }
    .auth-field-anim:nth-child(2) { animation-delay: 0.10s; }
    .auth-field-anim:nth-child(3) { animation-delay: 0.15s; }
    .auth-field-anim:nth-child(4) { animation-delay: 0.20s; }
    .auth-field-anim:nth-child(5) { animation-delay: 0.25s; }

    /* Spinning loader */
    @keyframes authSpin {
        to { transform: rotate(360deg); }
    }
    .auth-spinner {
        width: 18px; height: 18px;
        border: 2.5px solid rgba(5,13,7,0.3);
        border-top-color: rgba(5,13,7,0.9);
        border-radius: 50%;
        animation: authSpin 0.7s linear infinite;
        display: inline-block;
    }

    /* Success splash */
    .auth-success-splash {
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        animation: authCardIn 0.4s ease both;
    }
    .auth-success-icon {
        font-size: 5rem !important;
        color: var(--primary);
        animation: successBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        filter: drop-shadow(0 0 30px rgba(0,255,135,0.7));
    }
    @keyframes successBounce {
        from { opacity: 0; transform: scale(0.3); }
        to   { opacity: 1; transform: scale(1); }
    }
    .auth-success-dots {
        display: flex; gap: 8px;
    }
    .auth-success-dot {
        width: 8px; height: 8px;
        background: var(--primary);
        border-radius: 50%;
        animation: dotBounce 1.2s ease infinite;
        opacity: 0.7;
    }
    .auth-success-dot:nth-child(2) { animation-delay: 0.2s; }
    .auth-success-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotBounce {
        0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
        40%            { transform: scale(1.5); opacity: 1; }
    }

    /* Sign-out confirmation overlay */
    .signout-confirm {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(12px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease both;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .signout-dialog {
        background: var(--bg-mid);
        border: var(--border-glass);
        border-radius: var(--radius-xl);
        padding: 2.5rem 2rem;
        max-width: 380px;
        width: 90%;
        text-align: center;
        box-shadow: var(--shadow-deep);
        animation: authCardIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .signout-icon {
        font-size: 3.5rem !important;
        color: var(--error);
        filter: drop-shadow(0 0 16px rgba(255,74,106,0.5));
        margin-bottom: 1rem;
        animation: brandPulse 3s ease-in-out infinite;
    }

    /* AURA SUSTAIN watermark */
    .auth-aura-watermark {
        position: absolute;
        bottom: 8%;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(0,255,135,0.06);
        white-space: nowrap;
        pointer-events: none;
        z-index: 1;
        user-select: none;
    }

    /* Social sign-in buttons */
    .auth-social-group {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }
    .auth-btn-social {
        width: 100%;
        padding: 0.75rem 1.2rem;
        background: rgba(255,255,255,0.04);
        color: var(--text-main);
        font-family: var(--font-body);
        font-size: 0.92rem;
        font-weight: 500;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.25s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
    }
    .auth-btn-social:hover {
        transform: translateY(-1px);
        background: rgba(255,255,255,0.07);
    }
    .auth-btn-social:active { transform: translateY(0); }
    .auth-btn-social svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }
    .auth-btn-social.google:hover {
        border-color: rgba(66,133,244,0.5);
        box-shadow: 0 4px 16px rgba(66,133,244,0.15);
    }
    .auth-btn-social.github:hover {
        border-color: rgba(255,255,255,0.25);
        box-shadow: 0 4px 16px rgba(255,255,255,0.08);
    }

    /* Responsive */
    @media (max-width: 900px) {
        .auth-brand-panel { display: none; }
        .auth-divider { display: none; }
        .auth-form-panel {
            flex: 1;
            padding: 2rem 1.5rem;
        }
    }
    @media (max-width: 480px) {
        .auth-form-panel { padding: 1.5rem 1rem; }
    }
    `;
    document.head.appendChild(style);
};

/* ─── Main Render ─────────────────────────────────────────── */
export const renderAuthView = (type = 'login') => {
    injectAuthStyles();
    const container = document.getElementById('auth-container');
    const isLogin = type !== 'register';

    container.innerHTML = `
        <div class="auth-root">
            <!-- Left Branding Panel -->
            <div class="auth-brand-panel">
                <div class="auth-grid-bg"></div>
                <div class="auth-orb auth-orb-1"></div>
                <div class="auth-orb auth-orb-2"></div>
                <div class="auth-orb auth-orb-3"></div>
                <!-- Watermark Removed for collision fix -->

                <div class="auth-brand-content">
                    <span class="material-symbols-outlined auth-brand-icon">eco</span>
                    <h1 class="auth-brand-title">GreenTrack</h1>
                    <p class="auth-brand-desc">
                        Your intelligent platform for sustainable living. Track, scan, connect, and make a real difference for our planet.
                    </p>

                    <div class="auth-features">
                        <div class="auth-feature-pill">
                            <span class="material-symbols-outlined">co2</span>
                            Carbon Footprint Tracker
                        </div>
                        <div class="auth-feature-pill">
                            <span class="material-symbols-outlined">document_scanner</span>
                            AI Waste Classification
                        </div>
                        <div class="auth-feature-pill">
                            <span class="material-symbols-outlined">groups</span>
                            Global Eco Community
                        </div>
                        <div class="auth-feature-pill">
                            <span class="material-symbols-outlined">shopping_bag</span>
                            Organic Marketplace
                        </div>
                    </div>


                    <!-- ── Eco Impact Visual Panel ────────────────────── -->
                    <div style="margin-top: 2rem; animation: fadeUp 0.8s ease 0.7s both;">
                        
                        <!-- Mini header -->
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
                            <span style="color:#8FA396; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">Platform Impact — Last 7 Days</span>
                            <span style="color:#2ed573; font-size:0.75rem; font-weight:500; display:flex; align-items:center; gap:0.3rem;">
                                <span style="width:6px;height:6px;border-radius:50%;background:#2ed573;display:inline-block;box-shadow:0 0 6px #2ed573;"></span>
                                Live
                            </span>
                        </div>

                        <!-- Animated SVG trend chart -->
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1rem 1rem 0.5rem; position:relative; overflow:hidden;">
                            <svg viewBox="0 0 280 80" style="width:100%;height:70px;display:block;" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#2ed573" stop-opacity="0.4"/>
                                        <stop offset="100%" stop-color="#2ed573" stop-opacity="0"/>
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                </defs>
                                <!-- Grid lines -->
                                <line x1="0" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                                <line x1="0" y1="40" x2="280" y2="40" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                                <line x1="0" y1="60" x2="280" y2="60" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
                                <!-- Fill area -->
                                <path d="M0,65 L40,55 L80,45 L120,38 L160,28 L200,20 L240,12 L280,8 L280,80 L0,80 Z" fill="url(#chartGrad)"/>
                                <!-- Line -->
                                <path d="M0,65 L40,55 L80,45 L120,38 L160,28 L200,20 L240,12 L280,8" fill="none" stroke="#2ed573" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
                                <!-- Dots -->
                                <circle cx="280" cy="8" r="4" fill="#2ed573" filter="url(#glow)"/>
                                <circle cx="200" cy="20" r="3" fill="rgba(46,213,115,0.6)"/>
                                <circle cx="120" cy="38" r="3" fill="rgba(46,213,115,0.6)"/>
                            </svg>
                            <!-- X-axis labels -->
                            <div style="display:flex;justify-content:space-between;padding:0 0.25rem;margin-top:0.25rem;">
                                <span style="color:#8FA396;font-size:0.65rem;">Mon</span>
                                <span style="color:#8FA396;font-size:0.65rem;">Tue</span>
                                <span style="color:#8FA396;font-size:0.65rem;">Wed</span>
                                <span style="color:#8FA396;font-size:0.65rem;">Thu</span>
                                <span style="color:#8FA396;font-size:0.65rem;">Fri</span>
                                <span style="color:#8FA396;font-size:0.65rem;">Sat</span>
                                <span style="color:#2ed573;font-size:0.65rem;font-weight:600;">Today</span>
                            </div>
                        </div>

                        <!-- Today's quick metrics row -->
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.6rem; margin-top:0.6rem;">
                            <div style="background:rgba(46,213,115,0.07);border:1px solid rgba(46,213,115,0.15);border-radius:10px;padding:0.6rem 0.75rem;text-align:center;">
                                <div style="font-size:1.1rem;font-weight:700;color:#2ed573;line-height:1.2;">↓ 23%</div>
                                <div style="font-size:0.65rem;color:#8FA396;margin-top:0.2rem;">Avg CO₂</div>
                            </div>
                            <div style="background:rgba(79,152,255,0.07);border:1px solid rgba(79,152,255,0.15);border-radius:10px;padding:0.6rem 0.75rem;text-align:center;">
                                <div style="font-size:1.1rem;font-weight:700;color:#4F98FF;line-height:1.2;">4,128</div>
                                <div style="font-size:0.65rem;color:#8FA396;margin-top:0.2rem;">Scans Today</div>
                            </div>
                            <div style="background:rgba(255,176,32,0.07);border:1px solid rgba(255,176,32,0.15);border-radius:10px;padding:0.6rem 0.75rem;text-align:center;">
                                <div style="font-size:1.1rem;font-weight:700;color:#FFB020;line-height:1.2;">318</div>
                                <div style="font-size:0.65rem;color:#8FA396;margin-top:0.2rem;">Trees Saved</div>
                            </div>
                        </div>

                        <!-- World activity dots -->
                        <div style="margin-top:0.6rem;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:0.65rem 0.85rem; display:flex; align-items:center; gap:0.75rem;">
                            <span class="material-symbols-outlined" style="color:#2ed573;font-size:1.1rem;">public</span>
                            <span style="color:#8FA396;font-size:0.8rem;">Active right now in</span>
                            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-left:auto;">
                                <span style="background:rgba(46,213,115,0.15);color:#2ed573;font-size:0.68rem;padding:0.15rem 0.5rem;border-radius:20px;font-weight:500;">🇮🇳 India</span>
                                <span style="background:rgba(46,213,115,0.15);color:#2ed573;font-size:0.68rem;padding:0.15rem 0.5rem;border-radius:20px;font-weight:500;">🇺🇸 USA</span>
                                <span style="background:rgba(46,213,115,0.15);color:#2ed573;font-size:0.68rem;padding:0.15rem 0.5rem;border-radius:20px;font-weight:500;">🇩🇪 DE</span>
                                <span style="background:rgba(46,213,115,0.15);color:#2ed573;font-size:0.68rem;padding:0.15rem 0.5rem;border-radius:20px;font-weight:500;">+41</span>
                            </div>
                        </div>
                    </div>

                    <!-- Testimonial / Social Proof -->

                    <div style="margin-top: 2.5rem; padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; animation: fadeUp 0.8s ease 0.85s both;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.8rem;">
                            <div style="display: flex;">
                                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#2ed573,#26a85a);border:2px solid #050d07;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:#050d07;">R</div>
                                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#4F98FF,#2563eb);border:2px solid #050d07;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;margin-left:-8px;">S</div>
                                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#FF6B6B,#c0392b);border:2px solid #050d07;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white;margin-left:-8px;">A</div>
                            </div>
                            <div style="display:flex;gap:2px;">
                                <span style="color:#FFD700;font-size:0.8rem;">★★★★★</span>
                            </div>
                            <span style="color:#8FA396;font-size:0.78rem;margin-left:auto;">4.9 / 5.0</span>
                        </div>
                        <p style="color:rgba(232,238,233,0.8);font-size:0.88rem;line-height:1.6;margin:0;font-style:italic;">&ldquo;GreenTrack helped me reduce my carbon footprint by 30% in just one month. This platform is a game-changer!&rdquo;</p>
                        <p style="color:#2ed573;font-size:0.78rem;margin-top:0.5rem;font-weight:600;">— Rahul S., Eco Advocate</p>
                    </div>

                    <!-- Live activity ticker -->
                    <div style="margin-top: 1rem; display:flex; align-items:center; gap:0.6rem; padding: 0.65rem 1rem; background: rgba(46, 213, 115, 0.05); border-radius: 10px; border: 1px solid rgba(46, 213, 115, 0.12); animation: fadeUp 0.8s ease 1s both;">
                        <span style="width:7px;height:7px;border-radius:50%;background:#2ed573;flex-shrink:0;box-shadow:0 0 8px #2ed573;animation:blink 1.5s ease-in-out infinite;"></span>
                        <span style="color:#8FA396;font-size:0.8rem;">Live:</span>
                        <span id="auth-live-ticker" style="color:rgba(232,238,233,0.85);font-size:0.8rem;transition:opacity 0.5s;">Priya just reduced 2.4kg CO₂ by cycling 🚲</span>
                    </div>

                    <style>
                        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
                    </style>

                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; animation: fadeUp 1s ease 1.1s both;">
                        <div style="background: rgba(46, 213, 115, 0.1); padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid rgba(46, 213, 115, 0.2); backdrop-filter: blur(10px); flex: 1;">
                            <div style="font-size: 0.78rem; color: #8FA396; margin-bottom: 0.25rem;">Active Users</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #2ed573;">12,400+</div>
                        </div>
                        <div style="background: rgba(46, 213, 115, 0.1); padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid rgba(46, 213, 115, 0.2); backdrop-filter: blur(10px); flex: 1;">
                            <div style="font-size: 0.78rem; color: #8FA396; margin-bottom: 0.25rem;">CO₂ Saved Today</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #2ed573;">3,240 kg</div>
                        </div>
                        <div style="background: rgba(46, 213, 115, 0.1); padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid rgba(46, 213, 115, 0.2); backdrop-filter: blur(10px); flex: 1;">
                            <div style="font-size: 0.78rem; color: #8FA396; margin-bottom: 0.25rem;">Items Scanned</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #2ed573;">89K+</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="auth-divider"></div>

            <!-- Right Form Panel -->
            <div class="auth-form-panel">
                <div class="auth-card">
                    <!-- Tab switcher -->
                    <div class="auth-tabs">
                        <button class="auth-tab ${isLogin ? 'active' : ''}" id="tab-login">Sign In</button>
                        <button class="auth-tab ${!isLogin ? 'active' : ''}" id="tab-register">Create Account</button>
                    </div>

                    <h2 class="auth-heading">${isLogin ? 'Welcome back 👋' : 'Join the movement 🌱'}</h2>
                    <p class="auth-subheading">${isLogin ? 'Sign in to your GreenTrack account.' : 'Create your free account and start your eco journey.'}</p>

                    <form id="auth-form" autocomplete="off" novalidate>
                        ${!isLogin ? `
                        <div class="auth-input-group">
                            <label class="auth-input-label" for="auth-name">Full Name</label>
                            <div class="auth-input-wrap">
                                <span class="material-symbols-outlined auth-input-icon">person</span>
                                <input type="text" id="auth-name" class="auth-input" placeholder="e.g. Jane Doe" required autocomplete="name">
                            </div>
                        </div>
                        <div class="auth-input-group">
                            <label class="auth-input-label" for="auth-role">Your Role</label>
                            <div class="auth-input-wrap">
                                <span class="material-symbols-outlined auth-input-icon">badge</span>
                                <select id="auth-role" class="auth-select">
                                    <option value="Eco-Member">🌿 Eco Member</option>
                                    <option value="Farmer">🌾 Farmer / Producer</option>
                                    <option value="Buyer">🛒 Conscious Buyer</option>
                                </select>
                            </div>
                        </div>
                        ` : ''}

                        <div class="auth-input-group">
                            <label class="auth-input-label" for="auth-email">Email Address</label>
                            <div class="auth-input-wrap">
                                <span class="material-symbols-outlined auth-input-icon">mail</span>
                                <input type="email" id="auth-input-email" class="auth-input" placeholder="jane@earth.com" required autocomplete="email">
                            </div>
                        </div>

                        <div class="auth-input-group">
                            <label class="auth-input-label" for="auth-password">Password</label>
                            <div class="auth-input-wrap">
                                <span class="material-symbols-outlined auth-input-icon">lock</span>
                                <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" style="padding-right:2.8rem;">
                                <button type="button" class="auth-input-toggle" id="toggle-pw" title="Toggle password">
                                    <span class="material-symbols-outlined" style="font-size:1.1rem;">visibility</span>
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="auth-btn-primary" id="btn-submit">
                            <span id="btn-submit-label">${isLogin ? 'Sign In' : 'Create Account'}</span>
                        </button>
                    </form>

                    <div class="auth-or">or continue with</div>

                    <div class="auth-social-group">
                        <button type="button" id="btn-google" class="auth-btn-social google">
                            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Sign in with Google
                        </button>
                        <button type="button" id="btn-github" class="auth-btn-social github">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            Sign in with GitHub
                        </button>
                    </div>

                    <div class="auth-or" style="margin: 0.75rem 0;">or</div>

                    <button type="button" id="btn-demo" class="auth-btn-demo">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">rocket_launch</span>
                        Continue as Guest (Quick Demo)
                    </button>

                    <p class="auth-footer-link">
                        ${isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <a id="auth-toggle">${isLogin ? 'Create one →' : '← Sign in'}</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Start live activity ticker
    const tickerMsgs = [
        "Priya just reduced 2.4kg CO₂ by cycling 🚲",
        "Rahul scanned a recyclable bottle ♻️",
        "Aisha joined the 30-day green challenge 🌱",
        "Sanjay saved 1.8kg CO₂ using public transit 🚌",
        "Meera logged her first zero-waste meal 🥗",
        "Dev purchased eco-friendly packaging ✅",
        "Aarav planted 2 trees this week 🌳",
    ];
    let tickerIndex = 0;
    const tickerEl = document.getElementById('auth-live-ticker');
    if (tickerEl) {
        setInterval(() => {
            tickerEl.style.opacity = '0';
            setTimeout(() => {
                tickerIndex = (tickerIndex + 1) % tickerMsgs.length;
                tickerEl.textContent = tickerMsgs[tickerIndex];
                tickerEl.style.opacity = '1';
            }, 500);
        }, 3500);
    }

    // ── Helper: show mock account chooser ──────────────────────
    const showMockGoogleChooser = (btn) => {
        btn.innerHTML = `<span class="auth-spinner"></span> Opening accounts...`;
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center; z-index: 10000;
        `;
        overlay.innerHTML = `
            <div style="background: linear-gradient(160deg, #111b15 0%, #0d1810 100%); border: 1px solid rgba(46, 213, 115, 0.2); border-radius: 20px; padding: 2rem; width: 380px; max-width: 90vw; text-align: center; box-shadow: 0 32px 64px rgba(0,0,0,0.6); animation: fadeUp 0.3s ease;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1.2rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <h3 style="color: white; margin: 0; font-family: 'DM Sans', sans-serif; font-size: 1.1rem;">Sign in with Google</h3>
                </div>
                <p style="color: #8FA396; font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.5;">Choose an account to continue to <strong style="color: #2ed573;">GreenTrack</strong></p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: left;">
                    <button class="mock-google-acc" data-name="Himanshu Kumar" data-email="himanshu@gmail.com" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 1rem; width: 100%; transition: background 0.2s;">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2ed573,#26a85a);color:#050d07;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0;">H</div>
                        <div><div style="color:white;font-weight:500;font-family:'DM Sans',sans-serif;">Himanshu Kumar</div><div style="color:#8FA396;font-size:0.78rem;">himanshu@gmail.com</div></div>
                    </button>
                    <button class="mock-google-acc" data-name="Guest Account" data-email="guest@gmail.com" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 1rem; width: 100%; transition: background 0.2s;">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4F98FF,#2563eb);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0;">G</div>
                        <div><div style="color:white;font-weight:500;font-family:'DM Sans',sans-serif;">Guest Account</div><div style="color:#8FA396;font-size:0.78rem;">guest@gmail.com</div></div>
                    </button>
                    <button class="mock-google-acc" data-name="Eco Explorer" data-email="eco.explorer@gmail.com" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 1rem; width: 100%; transition: background 0.2s;">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF6B6B,#c0392b);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0;">E</div>
                        <div><div style="color:white;font-weight:500;font-family:'DM Sans',sans-serif;">Eco Explorer</div><div style="color:#8FA396;font-size:0.78rem;">eco.explorer@gmail.com</div></div>
                    </button>
                </div>
                <div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between;">
                    <span style="color:#8FA396;font-size:0.75rem;">Demo mode — add GOOGLE_CLIENT_ID to config.js for real login</span>
                    <button id="mock-google-cancel" style="background:none;border:none;color:#4F98FF;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelectorAll('.mock-google-acc').forEach(accBtn => {
            accBtn.addEventListener('mouseenter', () => accBtn.style.background = 'rgba(255,255,255,0.1)');
            accBtn.addEventListener('mouseleave', () => accBtn.style.background = 'rgba(255,255,255,0.04)');
            accBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                const mockUser = {
                    uid: 'google_' + Math.random().toString(36).substr(2, 9),
                    displayName: accBtn.getAttribute('data-name'),
                    email: accBtn.getAttribute('data-email'),
                    isAnonymous: false,
                };
                setAuthUser(mockUser);
                handleSuccessfulLogin(mockUser.displayName);
            });
        });
        document.getElementById('mock-google-cancel').addEventListener('click', () => {
            document.body.removeChild(overlay);
            btn.disabled = false;
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Sign in with Google`;
        });
    };

    // Social sign-in handlers
    $('btn-google')?.addEventListener('click', async () => {
        const btn = $('btn-google');
        btn.disabled = true;
        btn.innerHTML = `<span class="auth-spinner"></span> Connecting...`;

        // ── Try real Google Identity Services (GIS) first ──
        // Works with Vercel — no Firebase needed. Just add GOOGLE_CLIENT_ID to config.js
        if (window.google?.accounts && CONFIG.GOOGLE_CLIENT_ID && CONFIG.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
            try {
                window.google.accounts.id.initialize({
                    client_id: CONFIG.GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        // Decode the JWT token to get user info
                        const payload = JSON.parse(atob(response.credential.split('.')[1]));
                        const gisUser = {
                            uid: 'gis_' + payload.sub,
                            displayName: payload.name,
                            email: payload.email,
                            photoURL: payload.picture,
                            isAnonymous: false,
                        };
                        setAuthUser(gisUser);
                        handleSuccessfulLogin(gisUser.displayName);
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Popup was blocked — fall back to mock
                        showMockGoogleChooser(btn);
                    }
                });
                btn.disabled = false;
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Sign in with Google`;
                return;
            } catch (gisError) {
                console.warn('GIS error, falling back to mock:', gisError);
            }
        }

        // ── Fallback: try Firebase Google auth ──
        try {
            const user = await signInWithGoogleFirebase();
            handleSuccessfulLogin(user.displayName || 'Google User');
        } catch (error) {
            // ── Final fallback: mock chooser ──
            showMockGoogleChooser(btn);
        }
    });

    /* ── Event Handlers ─────────────────────────────────────── */
    // Tab switching
    $('tab-login').addEventListener('click', () => renderAuthView('login'));
    $('tab-register').addEventListener('click', () => renderAuthView('register'));
    $('auth-toggle').addEventListener('click', () => renderAuthView(isLogin ? 'register' : 'login'));

    $('btn-github')?.addEventListener('click', async () => {
        const btn = $('btn-github');
        btn.disabled = true;
        btn.innerHTML = `<span class="auth-spinner"></span> Connecting to GitHub...`;
        await new Promise(r => setTimeout(r, 1200));
        const user = {
            uid: 'github_' + Math.random().toString(36).substr(2, 9),
            displayName: 'GitHub Dev',
            email: 'dev@github.com',
            isAnonymous: false,
        };
        setAuthUser(user);
        handleSuccessfulLogin(user.displayName);
    });

    // Password toggle
    const pwInput = $('auth-password');
    $('toggle-pw').addEventListener('click', () => {
        const icon = $('toggle-pw').querySelector('.material-symbols-outlined');
        if (pwInput.type === 'password') {
            pwInput.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            pwInput.type = 'password';
            icon.textContent = 'visibility';
        }
    });

    // Demo / guest login
    $('btn-demo').addEventListener('click', async () => {
        const btn = $('btn-demo');
        btn.disabled = true;
        btn.innerHTML = `<span class="auth-spinner"></span> Entering Demo...`;

        await new Promise(r => setTimeout(r, 900));

        const demoUser = {
            uid: 'demo_user',
            displayName: 'Guest Explorer',
            email: 'guest@greentrack.com',
            isAnonymous: true,
        };

        setAuthUser(demoUser);
        handleSuccessfulLogin('Guest Explorer');
    });

    // Form submit
    $('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('auth-input-email').value.trim();
        const password = $('auth-password').value;
        const btn = $('btn-submit');
        const label = $('btn-submit-label');
        const form = $('auth-form');

        // Simple validation
        if (!email || !password) {
            form.classList.add('auth-shake');
            setTimeout(() => form.classList.remove('auth-shake'), 400);
            return;
        }
        if (!isLogin && password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            form.classList.add('auth-shake');
            setTimeout(() => form.classList.remove('auth-shake'), 400);
            return;
        }

        btn.disabled = true;
        label.innerHTML = `<span class="auth-spinner"></span>`;

        await new Promise(r => setTimeout(r, 1000)); // simulate network

        try {
            if (isLogin) {
                // Check mock DB for existing user
                const allUsers = await firebaseDB.getCollection('users');
                const found = allUsers.find(u => u.email === email);

                if (!found) {
                    throw new Error('No account found. Please check your email or create an account.');
                }
                if (found.password && found.password !== password) {
                    throw new Error('Invalid password. Please try again.');
                }

                setAuthUser({
                    uid: found.id || found.uid || email,
                    displayName: found.name,
                    email: found.email,
                    isAnonymous: false,
                });
                handleSuccessfulLogin(found.name);

            } else {
                const name = $('auth-name')?.value.trim() || 'Eco Member';
                const role = $('auth-role')?.value || 'Eco-Member';

                const uid = 'user_' + Math.random().toString(36).substr(2, 9);

                await firebaseDB.setDocument('users', uid, {
                    uid, name, email, password, role,
                    points: 50,
                    co2Total: 0,
                    streak: 1,
                    joinedAt: new Date().toISOString()
                });

                setAuthUser({ uid, displayName: name, email, isAnonymous: false });
                handleSuccessfulLogin(name);
            }
        } catch (error) {
            showToast(error.message, 'error');
            btn.disabled = false;
            label.textContent = isLogin ? 'Sign In' : 'Create Account';
            $('auth-form').classList.add('auth-shake');
            setTimeout(() => $('auth-form').classList.remove('auth-shake'), 400);
        }
    });
};

/* ─── Success Splash ──────────────────────────────────────── */
const handleSuccessfulLogin = (name = 'Explorer') => {
    const container = document.getElementById('auth-container');
    container.innerHTML = `
        <div class="auth-success-splash">
            <span class="material-symbols-outlined auth-success-icon">eco</span>
            <h2 style="font-size: 1.6rem; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Welcome, ${name}!
            </h2>
            <p class="text-muted" style="font-size:0.95rem;">Preparing your eco-dashboard...</p>
            <div class="auth-success-dots">
                <div class="auth-success-dot"></div>
                <div class="auth-success-dot"></div>
                <div class="auth-success-dot"></div>
            </div>
        </div>
    `;

    setTimeout(() => {
        window.location.hash = 'dashboard';
        window.dispatchEvent(new Event('hashchange'));
    }, 1400);
};

/* ─── Sign Out (global, called from profile / navbar) ─────── */
export const performSignOut = () => {
    // Create confirmation dialog
    if (document.getElementById('signout-overlay')) return;

    injectAuthStyles();

    const overlay = document.createElement('div');
    overlay.className = 'signout-confirm glass-fade';
    overlay.id = 'signout-overlay';
    overlay.innerHTML = `
        <div class="signout-dialog page-entry">
            <span class="material-symbols-outlined signout-icon earth-pulse">logout</span>
            <h3 style="margin-bottom: 0.5rem;">Sign Out?</h3>
            <p class="text-muted" style="font-size:0.9rem; margin-bottom:1.8rem; line-height:1.6;">
                You'll need to sign in again to access your eco dashboard and track your progress.
            </p>
            <div style="display:flex; gap:0.75rem; justify-content:center;">
                <button id="signout-cancel" class="hover-lift tap-scale" style="
                    flex:1; max-width:140px; padding:0.75rem 1rem;
                    background:rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.1);
                    border-radius:10px; color:var(--text-muted);
                    font-family:var(--font-body); font-size:0.92rem;
                    cursor:pointer; transition:all 0.2s ease;
                ">Cancel</button>
                <button id="signout-confirm-btn" class="hover-lift tap-scale" style="
                    flex:1; max-width:140px; padding:0.75rem 1rem;
                    background:linear-gradient(135deg, #FF4A6A, #cc2244);
                    border:none; border-radius:10px;
                    color:#fff; font-family:var(--font-body);
                    font-size:0.92rem; font-weight:600;
                    cursor:pointer; transition:all 0.2s ease;
                ">Sign Out</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Hover effects
    const cancelBtn = document.getElementById('signout-cancel');
    const confirmBtn = document.getElementById('signout-confirm-btn');

    cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'rgba(255,255,255,0.08)'; cancelBtn.style.color = 'var(--text-main)'; });
    cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'rgba(255,255,255,0.05)'; cancelBtn.style.color = 'var(--text-muted)'; });
    confirmBtn.addEventListener('mouseenter', () => { confirmBtn.style.transform = 'translateY(-1px)'; confirmBtn.style.boxShadow = '0 6px 20px rgba(255,74,106,0.4)'; });
    confirmBtn.addEventListener('mouseleave', () => { confirmBtn.style.transform = ''; confirmBtn.style.boxShadow = ''; });

    cancelBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => overlay.remove(), 200);
    });

    confirmBtn.addEventListener('click', async () => {
        confirmBtn.innerHTML = `<span class="auth-spinner" style="border-color:rgba(255,255,255,0.3); border-top-color:#fff;"></span>`;
        confirmBtn.disabled = true;

        await new Promise(r => setTimeout(r, 700));

        setAuthUser(null);

        overlay.remove();
        const appEl = document.getElementById('app');
        const authEl = document.getElementById('auth-container');
        if (appEl) appEl.style.display = 'none';
        if (authEl) { authEl.style.display = 'block'; }

        window.location.hash = 'login';
        renderAuthView('login');
    });

    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeOut 0.2s ease forwards';
            setTimeout(() => overlay.remove(), 200);
        }
    });

    // inject fadeOut keyframe if not present
    if (!document.getElementById('signout-fadeout-kf')) {
        const kf = document.createElement('style');
        kf.id = 'signout-fadeout-kf';
        kf.textContent = `@keyframes fadeOut { to { opacity: 0; } }`;
        document.head.appendChild(kf);
    }
};
