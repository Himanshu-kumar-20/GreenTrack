// js/router.js
import { currentUser, auth } from './firebase.js';
import { renderAuthView, performSignOut } from './auth.js';
import { initDashboard } from './pages/dashboard.js';
import { initCarbon } from './pages/carbon.js';
import { initWaste } from './pages/waste.js';
import { initMarket } from './pages/market.js';
import { initCommunity } from './pages/community.js';
import { initProfile } from './pages/profile.js';
import { initParticleCanvas, initRipples, showNotificationPanel } from './components.js';

const routes = {
    'dashboard':  initDashboard,
    'carbon':     initCarbon,
    'waste':      initWaste,
    'market':     initMarket,
    'community':  initCommunity,
    'profile':    initProfile
};

const routerView    = document.getElementById('router-view');
const appLayout     = document.getElementById('app');
const authContainer = document.getElementById('auth-container');

let isAuthInitialized = false;
let currentRoute = null;

// ─── Theme Toggle ───────────────────────────────────────
const applyTheme = (theme) => {
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.remove('theme-dark');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    localStorage.setItem('greentrack-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    const label = document.getElementById('theme-label');
    if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
};

const initTheme = () => {
    const saved = localStorage.getItem('greentrack-theme') || 'dark';
    applyTheme(saved);
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
};

// ─── Nav Active Update ──────────────────────────────────
const updateNav = (route) => {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.toggle('active', link.dataset.route === route);
    });
};

// ─── Page Loader Spinner ────────────────────────────────
const renderLoader = () => {
    routerView.innerHTML = `
        <div class="flex items-center justify-center flex-col gap-md" style="height:70vh;">
            <div class="ring-container" style="width:72px;height:72px;">
                <svg width="72" height="72" viewBox="0 0 100 100" style="animation:spin 1s linear infinite;">
                    <circle cx="50" cy="50" r="40" stroke-width="8" stroke="var(--primary)" fill="none"
                        stroke-dasharray="160" stroke-linecap="round"
                        style="filter:drop-shadow(0 0 8px var(--primary-glow));" />
                </svg>
            </div>
            <p class="text-muted" style="font-size:0.9rem; letter-spacing:0.05em;">Loading...</p>
        </div>
    `;
};

// ─── Page Transition ────────────────────────────────────
const navigateTo = async (initFn) => {
    // Premium Exit Phase
    if (routerView.firstChild) {
        routerView.classList.add('page-exit');
        await new Promise(r => setTimeout(r, 250));
    }

    routerView.innerHTML = '';
    routerView.classList.remove('page-exit');
    
    // Show premium loader
    renderLoader();

    // Init the new content
    await initFn(routerView);

    // Scroll to top
    routerView.scrollTop = 0;

    // Apply Page Entry to the newly rendered content container
    // This ensures every page starts with the premium fade-in
    routerView.firstElementChild?.classList.add('page-entry');

    // Re-init ripples
    initRipples();
};

// ─── Main Router Handler ────────────────────────────────
const handleRouting = async () => {
    let hash = window.location.hash.substring(1) || 'dashboard';

    if (!isAuthInitialized && !auth.currentUser) {
        authContainer.style.display = 'block';
        authContainer.innerHTML = `
            <div style="height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:var(--space-md);">
                <svg width="60" height="60" viewBox="0 0 100 100" style="animation:spin 1s linear infinite;">
                    <circle cx="50" cy="50" r="40" stroke-width="8" stroke="var(--primary)" fill="none"
                        stroke-dasharray="160" stroke-linecap="round" />
                </svg>
                <p class="text-muted" style="font-size:0.9rem;">Connecting...</p>
            </div>
        `;
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        appLayout.style.display = 'none';
        authContainer.style.display = 'block';
        if (!['login', 'register'].includes(hash)) {
            window.location.hash = 'login';
            return;
        }
        renderAuthView(hash);
        return;
    }

    // User logged in
    authContainer.style.display = 'none';
    authContainer.innerHTML = '';
    appLayout.style.display = 'flex';

    if (['login', 'register'].includes(hash)) {
        window.location.hash = 'dashboard';
        return;
    }

    if (!routes[hash]) {
        hash = 'dashboard';
        window.location.hash = 'dashboard';
        return;
    }

    // Skip if same route
    if (hash === currentRoute) return;
    currentRoute = hash;

    updateNav(hash);

    try {
        await navigateTo(routes[hash]);
    } catch (error) {
        console.error('Routing Error:', error);
        routerView.innerHTML = `
            <div class="glass-card" style="text-align:center; max-width:500px; margin:auto; margin-top:4rem;">
                <span class="material-symbols-outlined text-neon" style="font-size:4rem; display:block; margin-bottom:var(--space-md);">error_outline</span>
                <h2>Failed to load page</h2>
                <p class="text-muted" style="margin-top:var(--space-sm);">${error.message}</p>
                <button class="btn btn-outline" style="margin-top:var(--space-lg);" onclick="window.location.hash='dashboard'">Go Home</button>
            </div>
        `;
    }
};

// ─── Event Listeners ─────────────────────────────────────
window.addEventListener('hashchange', () => {
    currentRoute = null; // reset to allow re-navigation
    handleRouting();
});

window.addEventListener('auth-state-changed', () => {
    isAuthInitialized = true;
    handleRouting();
});

// ─── Boot ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Init particles
    initParticleCanvas();

    // Init theme
    initTheme();

    // Init global ripples
    initRipples();

    // Notification bell
    const bellBtn = document.getElementById('btn-notifications');
    if (bellBtn) {
        bellBtn.addEventListener('click', showNotificationPanel);
    }

    // Navbar sign-out button
    const signOutBtn = document.getElementById('btn-nav-signout');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => performSignOut());
    }

    // Fallback if auth doesn't respond in 2s
    setTimeout(() => {
        if (!isAuthInitialized) {
            isAuthInitialized = true;
            handleRouting();
        }
    }, 2000);
});
