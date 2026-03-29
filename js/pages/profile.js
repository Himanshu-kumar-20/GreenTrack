import { auth, firebaseDB } from '../firebase.js';
import { animateCount } from '../components.js';
import { performSignOut } from '../auth.js';
import { getLevel } from '../utils.js';


const BADGES = [
    { icon: 'eco',                color: 'var(--primary)',  label: 'First Scan',        desc: 'Scanned your first item',      unlocked: true  },
    { icon: 'local_fire_department', color: 'var(--warning)', label: '7-Day Streak',   desc: 'Logged 7 consecutive days',    unlocked: true  },
    { icon: 'recycling',          color: 'var(--info)',     label: 'Recycler',          desc: 'Recycled 10+ items',           unlocked: true  },
    { icon: 'shopping_bag',       color: 'var(--secondary)', label: 'Market Pioneer',  desc: 'Made first market purchase',   unlocked: false },
    { icon: 'groups',             color: '#a78bfa',         label: 'Community Star',    desc: 'Posted 5+ community updates',  unlocked: false },
    { icon: 'public',             color: 'var(--error)',    label: 'Planet Keeper',     desc: 'Reach 2000 Eco Points',        unlocked: false },
];

export const initProfile = async (container) => {
    const user = auth.currentUser;
    if (!user) { window.location.hash = 'login'; return; }

    container.innerHTML = `<div style="height:60vh;display:flex;align-items:center;justify-content:center;"><div class="skeleton-avatar" style="width:70px;height:70px;"></div></div>`;

    let userData = {
        name: user.displayName || 'Eco Warrior',
        email: user.email,
        role: 'Eco-Member',
        points: 0,
        co2Total: 0,
        streak: 1
    };

    try {
        const doc = await firebaseDB.getDocument('users', user.uid);
        if (doc) userData = { ...userData, ...doc };
    } catch (e) { /* use defaults */ }

    const { current: lvl, next } = getLevel(userData.points);
    const xpInLevel = next ? userData.points - lvl.minPts : 0;
    const xpNeeded  = next ? next.minPts - lvl.minPts : 1;
    const xpPct     = next ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

    // Impact equivalents
    const treesPlanted  = Math.floor((userData.co2Total || 0) / 21);
    const kmAvoided     = Math.floor((userData.co2Total || 0) / 0.12);
    const plasticBags   = Math.floor((userData.points || 0) * 1.7);

    container.innerHTML = `
        <div class="page-entry">
            <div class="flex justify-between items-center staggered-fade" style="margin-bottom:var(--space-xl);">
                <div>
                    <h1>Eco Profile <span class="material-symbols-outlined glow-pulse" style="color:var(--primary); vertical-align:middle;">verified_user</span></h1>
                    <p class="text-muted">Your green journey & achievements.</p>
                </div>
                <button class="btn btn-danger hover-lift tap-scale" id="btn-logout">
                    <span class="material-symbols-outlined">logout</span>Sign Out
                </button>
            </div>

            <!-- Profile Header Card -->
            <div class="glass-card profile-header staggered-fade hover-lift" style="padding: var(--space-xl); margin-bottom: var(--space-xl);">
                <div class="avatar avatar-xl breeze-float" style="background: linear-gradient(135deg, var(--primary), var(--primary-glow)); color: #060a07;">${userData.name.charAt(0)}</div>
                <div class="profile-info">
                    <div class="prof-name-row">
                        <h2 style="font-size:1.8rem;">${userData.name}</h2>
                        <span class="material-symbols-outlined glow-pulse" style="color:var(--primary); filter:drop-shadow(0 0 6px var(--primary-glow));">verified</span>
                    </div>
                    <p class="text-muted" style="font-size:0.9rem;">${userData.email}</p>
                    <span class="badge badge-amber glow-pulse" style="margin-top:var(--space-sm);">${userData.role}</span>

                    <!-- XP Bar -->
                    <div class="xp-section">
                        <div class="xp-label-row">
                            <div class="level-badge hover-lift">
                                <span class="material-symbols-outlined leaf-sway" style="font-size:1rem;">${lvl.icon}</span>
                                ${lvl.name}
                            </div>
                            ${next ? `<span class="text-muted" style="font-size:0.78rem;">${xpInLevel}/${xpNeeded} XP to ${next.name}</span>` : '<span class="text-neon glow-pulse" style="font-size:0.82rem; font-weight:700;">MAX LEVEL 🏆</span>'}
                        </div>
                        <div class="xp-bar">
                            <div class="xp-fill progress-grow" style="--final-width:${xpPct}%;"></div>
                        </div>
                        <p class="xp-text">${userData.points} total Eco Points</p>
                    </div>
                </div>
            </div>

            <!-- Lifetime Impact Counters -->
            <div class="section-title staggered-fade">
                <span class="material-symbols-outlined earth-pulse">bar_chart</span>
                Lifetime Impact
            </div>
            <div class="bento-grid staggered-fade" style="grid-template-columns:repeat(3,1fr); margin-bottom:var(--space-xl);">
                <div class="glass-card hover-lift" style="text-align:center;">
                    <span class="material-symbols-outlined leaf-sway" style="color:var(--primary); font-size:2.2rem; filter:drop-shadow(0 0 8px var(--primary-glow));">co2</span>
                    <div class="kpi-value" id="val-co2">0</div>
                    <div class="text-muted" style="font-size:0.82rem;">kg CO₂ Saved</div>
                </div>
                <div class="glass-card hover-lift" style="text-align:center;">
                    <span class="material-symbols-outlined breeze-float" style="color:var(--info); font-size:2.2rem;">recycling</span>
                    <div class="kpi-value" id="val-items">0</div>
                    <div class="text-muted" style="font-size:0.82rem;">Items Scanned</div>
                </div>
                <div class="glass-card hover-lift" style="text-align:center;">
                    <span class="material-symbols-outlined glow-pulse" style="color:var(--warning); font-size:2.2rem; filter:drop-shadow(0 0 8px rgba(255,176,32,0.4));">local_fire_department</span>
                    <div class="kpi-value" id="val-streak">0</div>
                    <div class="text-muted" style="font-size:0.82rem;">Day Streak</div>
                </div>
            </div>

            <!-- Environmental Equivalents -->
            <div class="section-title staggered-fade">
                <span class="material-symbols-outlined leaf-sway">nature</span>
                Your Impact Equals...
            </div>
            <div class="impact-eq-grid staggered-fade" style="margin-bottom:var(--space-xl);">
                <div class="glass-card impact-eq-card hover-lift">
                    <div class="impact-eq-icon breeze-float">🌳</div>
                    <div class="impact-eq-value" id="val-trees">0</div>
                    <div class="impact-eq-label">Trees worth of CO₂ absorbed</div>
                </div>
                <div class="glass-card impact-eq-card hover-lift">
                    <div class="impact-eq-icon breeze-float">🚗</div>
                    <div class="impact-eq-value" id="val-km">0</div>
                    <div class="impact-eq-label">km not driven in a car</div>
                </div>
                <div class="glass-card impact-eq-card hover-lift">
                    <div class="impact-eq-icon breeze-float">🛍️</div>
                    <div class="impact-eq-value" id="val-bags">0</div>
                    <div class="impact-eq-label">plastic bags avoided</div>
                </div>
            </div>

            <!-- Badges -->
            <div class="section-title staggered-fade">
                <span class="material-symbols-outlined glow-pulse">military_tech</span>
                Badges Earned
            </div>
            <div class="badges-grid staggered-fade" style="margin-bottom:var(--space-xl);">
                ${BADGES.map(b => `
                    <div class="badge-item ${b.unlocked ? '' : 'locked'} hover-lift tap-scale" title="${b.desc}">
                        <span class="material-symbols-outlined badge-icon ${b.unlocked ? 'glow-pulse' : ''}" style="color:${b.unlocked ? b.color : 'rgba(255,255,255,0.2)'}; font-size:2.2rem; ${b.unlocked ? `filter:drop-shadow(0 0 8px ${b.color}50);` : ''}">${b.icon}</span>
                        <strong>${b.label}</strong>
                        ${b.unlocked ? '' : '<span class="material-symbols-outlined" style="font-size:0.9rem; position:absolute; top:6px; right:6px; color:rgba(255,255,255,0.3);">lock</span>'}
                    </div>
                `).join('')}
            </div>

            <!-- Settings -->
            <div class="section-title staggered-fade">
                <span class="material-symbols-outlined breeze-float">settings</span>
                Settings
            </div>
            <div class="glass-card staggered-fade hover-lift" style="margin-bottom:var(--space-2xl);">
                <div class="settings-row">
                    <div>
                        <div class="settings-label">Notifications</div>
                        <div class="settings-desc">Receive eco tips and activity reminders</div>
                    </div>
                    <label style="position:relative; width:44px; height:24px; cursor:pointer;" class="tap-scale">
                        <input type="checkbox" checked style="opacity:0; width:0; height:0;" id="toggle-notif">
                        <span class="toggle-track" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,255,135,0.3); border-radius:12px; transition:0.3s; border:1px solid rgba(0,255,135,0.4);"></span>
                        <span class="toggle-thumb" style="position:absolute; top:3px; left:3px; width:18px; height:18px; background:var(--primary); border-radius:50%; transition:0.3s;"></span>
                    </label>
                </div>
                <div class="settings-row">
                    <div>
                        <div class="settings-label">Display Name</div>
                        <div class="settings-desc">${userData.name}</div>
                    </div>
                    <button class="btn btn-outline btn-sm hover-lift tap-scale" id="btn-edit-name">
                        <span class="material-symbols-outlined" style="font-size:1rem;">edit</span>Edit
                    </button>
                </div>
                <div class="settings-row">
                    <div>
                        <div class="settings-label">Privacy</div>
                        <div class="settings-desc">Show profile on community leaderboard</div>
                    </div>
                    <span class="badge badge-green glow-pulse">Public</span>
                </div>
            </div>
        </div>
    `;

    // ── Animate Counters ──────────────────────────────────
    animateCount(document.getElementById('val-co2'), 0, userData.co2Total || 0, 1200, 1);
    animateCount(document.getElementById('val-items'), 0, 42, 1100);
    animateCount(document.getElementById('val-streak'), 0, userData.streak || 0, 1000);
    animateCount(document.getElementById('val-trees'), 0, treesPlanted, 1300);
    animateCount(document.getElementById('val-km'), 0, kmAvoided, 1400);
    animateCount(document.getElementById('val-bags'), 0, plasticBags, 1200);

    // ── Sign Out ──────────────────────────────────────────
    document.getElementById('btn-logout').addEventListener('click', () => {
        performSignOut();
    });

    // ── Edit Name ─────────────────────────────────────────
    document.getElementById('btn-edit-name')?.addEventListener('click', () => {
        const newName = prompt('Enter your display name:', userData.name);
        if (newName && newName.trim()) {
            // Update locally — would persist to Firestore in prod
            userData.name = newName.trim();
            container.querySelector('.prof-name-row h2').textContent = userData.name;
            document.querySelector('.settings-row:nth-child(2) .settings-desc').textContent = userData.name;
        }
    });
};
