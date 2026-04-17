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
        overflow: hidden;
        background: var(--bg-dark);
    }

    /* Left branding panel */
    .auth-brand-panel {
        flex: 1.1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 5rem 4rem;
        position: relative;
        overflow: hidden;
        background-image: linear-gradient(rgba(6, 10, 7, 0.4), rgba(6, 10, 7, 0.4)), url('assets/landing_bg.png');
        background-size: cover;
        background-position: center;
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
        font-size: 1.1rem;
        line-height: 1.7;
        max-width: 380px;
        margin-bottom: 2.8rem;
        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    /* Floating feature pills */
    .auth-features {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    .auth-feature-pill {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 1.1rem;
        background: rgba(0,255,135,0.06);
        border: 1px solid rgba(0,255,135,0.18);
        border-radius: 999px;
        font-size: 0.88rem;
        color: var(--text-muted);
        animation: pillFadeIn 0.5s ease both;
        width: fit-content;
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
        justify-content: center;
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
                <div class="auth-aura-watermark">AURA SUSTAIN</div>

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

    /* ── Event Handlers ─────────────────────────────────────── */

    // Tab switching
    $('tab-login').addEventListener('click', () => renderAuthView('login'));
    $('tab-register').addEventListener('click', () => renderAuthView('register'));
    $('auth-toggle').addEventListener('click', () => renderAuthView(isLogin ? 'register' : 'login'));

    // Social sign-in handlers
    $('btn-google')?.addEventListener('click', async () => {
        const btn = $('btn-google');
        btn.disabled = true;
        btn.innerHTML = `<span class="auth-spinner"></span> Connecting to Google...`;
        try {
            const user = await signInWithGoogleFirebase();
            handleSuccessfulLogin(user.displayName || 'Google User');
        } catch (error) {
            console.error("Google auth err", error);
            // Fallback mock logic for hackathon demo if firebase config is missing
            if (error.message.includes("not initialized") || error.code) {
                showToast("Firebase Config missing, using Mock Login", "warning");
                setTimeout(() => {
                    const mockUser = {
                        uid: 'google_' + Math.random().toString(36).substr(2, 9),
                        displayName: 'Google Demo User',
                        email: 'user@gmail.com',
                        isAnonymous: false,
                    };
                    setAuthUser(mockUser);
                    handleSuccessfulLogin(mockUser.displayName);
                }, 800);
            } else {
                showToast("Login Failed", "error");
                btn.disabled = false;
                btn.innerHTML = `Sign in with Google`;
            }
        }
    });

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
