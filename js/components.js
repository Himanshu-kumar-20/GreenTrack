// js/components.js
import { sleep } from './utils.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIPPLE TAP EFFECT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const addRipple = (element) => {
    element.addEventListener('click', (e) => {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.4;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-wave';
        ripple.style.cssText = `width:${size}px; height:${size}px; left:${x}px; top:${y}px;`;
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
};

// Apply ripple to all existing buttons and add observer for future ones
export const initRipples = () => {
    const applyRipples = (root = document) => {
        root.querySelectorAll('.btn, .nav-item, .tracker-tab, .c-tab, .cam-mode-btn').forEach(el => {
            if (!el.dataset.rippled) {
                el.dataset.rippled = '1';
                addRipple(el);
            }
        });
    };

    applyRipples();

    // MutationObserver to auto-attach ripple to dynamically created buttons
    const observer = new MutationObserver(() => applyRipples());
    observer.observe(document.body, { childList: true, subtree: true });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED NUMBER COUNTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const animateCount = (el, from, to, duration = 1200, decimals = 0) => {
    if (!el) return;
    const start = performance.now();
    const range = to - from;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = from + range * easeOut(progress);
        el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOAST NOTIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };

    const toast = document.createElement('div');
    toast.className = `toast ${type} glass-fade breeze-float`;
    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon glow-pulse">${icons[type] || 'info'}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 400);
    }, 4500);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODALS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const showModal = (title, contentHTML, actionsHTML = '') => {
    const overlay = document.getElementById('modal-container');
    const contentBox = document.getElementById('modal-content');
    if (!overlay || !contentBox) return;

    overlay.innerHTML = `
        <div id="modal-content" class="modal-content glass-fade page-entry" style="padding:0; overflow:hidden;">
            <div class="modal-header">
                <h3 style="margin:0; font-family:var(--font-display);">${title}</h3>
                <button class="modal-close btn-ghost btn tap-scale" id="btn-close-modal">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="modal-body staggered-fade" style="margin-bottom: var(--space-xl); padding: var(--space-xl);">${contentHTML}</div>
            <div class="modal-actions staggered-fade" style="display:flex; gap:var(--space-md); justify-content:flex-end; padding: var(--space-lg); border-top: var(--border-glass);">${actionsHTML}</div>
        </div>
    `;

    overlay.classList.remove('hidden');
    document.getElementById('btn-close-modal').addEventListener('click', hideModal);
    // Close on backdrop click
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hideModal(); }, { once: true });
};

export const hideModal = () => {
    const overlay = document.getElementById('modal-container');
    if (overlay) overlay.classList.add('hidden');
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG RING PROGRESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const createRingProgress = (value, max, label, color = 'var(--primary)') => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 251.2;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <div class="ring-container" style="width:130px; height:130px;">
            <svg class="ring-svg" width="130" height="130" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40" stroke-width="7"/>
                <circle class="ring-progress" cx="50" cy="50" r="40" stroke-width="7"
                    stroke="${color}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                    style="filter: drop-shadow(0 0 8px ${color});" />
            </svg>
            <div class="ring-content">
                <span class="mono-data count-up" style="font-size:1.6rem; color:${color};" data-target="${value}">${value}</span>
                <span style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${label}</span>
            </div>
        </div>
    `;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FLOATING POINTS (XP REWARD)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const flyPoints = (amount, x, y) => {
    const el = document.createElement('div');
    el.className = 'points-fly-premium';
    el.innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem; margin-right:4px;">add_circle</span>${amount} XP`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACHIEVEMENT MODAL (CINEMATIC)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const showAchievementModal = (title, icon = 'stars', color = 'var(--primary)') => {
    const overlay = document.createElement('div');
    overlay.className = 'achievement-overlay glass-fade';
    overlay.innerHTML = `
        <div class="achievement-card page-entry">
            <div class="achievement-icon-wrapper water-ripple" style="--primary:${color};">
                <span class="material-symbols-outlined achievement-icon glow-pulse" style="color:${color}; font-size:4rem;">${icon}</span>
            </div>
            <h2 class="achievement-title staggered-fade" style="margin-top:var(--space-xl); color:${color};">Achievement!</h2>
            <p class="achievement-desc staggered-fade">${title}</p>
            <div class="achievement-glow" style="background:${color}; opacity:0.1;"></div>
            <button class="btn btn-primary btn-lg hover-lift tap-scale staggered-fade" id="btn-collect-achievement" style="margin-top:var(--space-xl);">
                Collect Rewards
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-collect-achievement').addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARTICLE CANVAS BACKGROUND
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const initParticleCanvas = () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 55;
    const particles = [];

    const mkParticle = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: -(Math.random() * 0.5 + 0.15),
        opacity: 0,
        maxOpacity: Math.random() * 0.35 + 0.05,
        life: 0,
        maxLife: Math.random() * 250 + 150,
        hue: Math.random() > 0.7 ? 90 : 150  // green or chartreuse
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = mkParticle();
        p.life = Math.random() * p.maxLife; // stagger initial lifetimes
        particles.push(p);
    }

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.life++;
            p.x += p.dx;
            p.y += p.dy;

            const lifeRatio = p.life / p.maxLife;
            if (lifeRatio < 0.15) p.opacity = (lifeRatio / 0.15) * p.maxOpacity;
            else if (lifeRatio > 0.75) p.opacity = ((1 - lifeRatio) / 0.25) * p.maxOpacity;
            else p.opacity = p.maxOpacity;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.life >= p.maxLife) particles[i] = mkParticle();
        });

        requestAnimationFrame(draw);
    };

    draw();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION PANEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const notifications = [
    { icon: '🌱', title: 'Daily Streak!', body: 'Keep it up — day 3 streak active.', time: '2m ago', color: 'var(--primary)' },
    { icon: '♻️', title: 'Scan Logged', body: 'Recyclable item saved to your eco-log.', time: '1h ago', color: 'var(--info)' },
    { icon: '🏆', title: 'Leaderboard', body: 'You\'re now in the top 10% this week!', time: '3h ago', color: 'var(--warning)' },
    { icon: '🛒', title: 'New in Market', body: 'Fresh organic produce added nearby.', time: '5h ago', color: 'var(--secondary)' },
];

export const showNotificationPanel = () => {
    let panel = document.getElementById('notif-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'notif-panel';
        panel.className = 'notif-panel glass-fade';
        panel.innerHTML = `
            <div class="notif-header">
                <div>
                    <h3 style="margin:0; font-family:var(--font-display);">Notifications</h3>
                    <p class="text-muted" style="font-size:0.82rem; margin-top:2px;">${notifications.length} new updates</p>
                </div>
                <button class="btn btn-ghost btn-sm tap-scale" id="close-notif">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="notif-list staggered-fade">
                ${notifications.map((n, i) => `
                    <div class="notif-item hover-lift">
                        <div class="notif-icon breeze-float" style="background: rgba(255,255,255,0.05); font-size:1.4rem; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${n.icon}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600; font-size:0.9rem;">${n.title}</div>
                            <div class="text-muted" style="font-size:0.8rem; margin-top:2px;">${n.body}</div>
                            <div class="text-muted" style="font-size:0.72rem; margin-top:4px;">${n.time}</div>
                        </div>
                        <div class="notif-dot glow-pulse"></div>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);
        document.getElementById('close-notif').addEventListener('click', () => panel.classList.remove('open'));
    }
    setTimeout(() => panel.classList.add('open'), 10);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ECO TIPS TICKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ecoTips = [
    "🌿 Using a reusable bag saves ~170 plastic bags per year.",
    "💧 Turning off tap while brushing saves 6L of water per minute.",
    "⚡ LED bulbs use 75% less energy than incandescent bulbs.",
    "🚴 Cycling instead of driving 5km saves ~1.1kg of CO₂.",
    "🌳 One tree absorbs ~21kg of CO₂ per year.",
];

export const createTicker = () => {
    const tip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
    return `
        <div class="eco-ticker">
            <span class="material-symbols-outlined" style="color:var(--primary); font-size:1.1rem; flex-shrink:0;">tips_and_updates</span>
            <span class="eco-ticker-label">Eco Tip</span>
            <span class="eco-ticker-text">${tip}</span>
        </div>
    `;
};
