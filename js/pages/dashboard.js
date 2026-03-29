// js/pages/dashboard.js
import { createRingProgress, animateCount, createTicker } from '../components.js';
import { currentUser, firebaseDB } from '../firebase.js';

const ECO_TIPS = [
    { icon: '🌿', tip: 'Carry a reusable bag — saves ~170 plastic bags/year.' },
    { icon: '💧', tip: 'Fix a leaky tap — stops 90L of water wasted per day.' },
    { icon: '⚡', tip: 'Switch to LED bulbs — 75% less energy consumption.' },
    { icon: '🚴', tip: 'Cycle 5km instead of driving — saves 1.1kg of CO₂.' },
    { icon: '🌳', tip: 'Plant one tree to absorb 21kg of CO₂ per year.' },
];

const FEED_DATA = [
    { name: 'Aisha', initial: 'A', action: 'recycled 3 items', pts: '+30', time: '2m ago', color: '#00FF87' },
    { name: 'Rahul', initial: 'R', action: 'logged a plant-based meal', pts: '+15', time: '8m ago', color: '#4F98FF' },
    { name: 'Priya', initial: 'P', action: 'completed a weekly challenge', pts: '+200', time: '22m ago', color: '#FFB020' },
    { name: 'Dev', initial: 'D', action: 'scanned e-waste for disposal', pts: '+25', time: '1h ago', color: '#FF4A6A' },
];

export const initDashboard = async (container) => {
    // Skeleton
    container.innerHTML = `<div style="height:60vh;display:flex;align-items:center;justify-content:center;"><div class="skeleton-avatar" style="width:60px;height:60px;"></div></div>`;

    let userData = {
        name: currentUser?.displayName || 'Eco Warrior',
        points: 0,
        co2Total: 0,
        streak: 1,
        role: 'Member'
    };

    if (currentUser) {
        try {
            const doc = await firebaseDB.getDocument('users', currentUser.uid);
            if (doc) userData = { ...userData, ...doc };
        } catch (e) { /* use defaults */ }
    }

    const firstName = userData.name.split(' ')[0];
    const randomTip = ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)];
    const level = Math.max(1, Math.floor(userData.points / 100) + 1);
    const xpInLevel = userData.points % 100;

    // Weekly CO₂ chart data (mock)
    const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = weekLabels.map(() => +(Math.random() * 4 + 0.5).toFixed(1));

    container.innerHTML = `
        <div class="page-entry">
            <div class="page-header staggered-fade">
                <h1>Hey, ${firstName} 🌿</h1>
                <p class="text-muted">Here's your environmental impact at a glance.</p>
            </div>

            ${createTicker()}

            <div class="bento-grid">
                <!-- Hero: CO₂ Ring -->
                <div class="glass-card bento-hero staggered-fade" style="padding:var(--space-xl);">
                    <div style="margin-bottom:var(--space-md);">
                        <h4 class="text-muted" style="font-weight:500; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.08em;">CO₂ Saved (Today)</h4>
                    </div>
                    <div id="ring-wrap" class="earth-pulse" style="transform:scale(1.15); margin:var(--space-lg) 0;">
                        ${createRingProgress(userData.co2Total, 20, 'kg Saved')}
                    </div>
                    <p class="text-muted" style="font-size:0.85rem; margin-top:var(--space-md);">🏆 Top 15% in your community</p>
                    <div class="progress-bar" style="margin-top:var(--space-sm);">
                        <div class="progress-fill progress-grow" style="--final-width: ${Math.min((userData.co2Total/20)*100, 100)}%;"></div>
                    </div>
                </div>

                <!-- Streak Card -->
                <div class="glass-card bento-card staggered-fade">
                    <span class="material-symbols-outlined breeze-float" style="color:var(--warning); font-size:2rem; filter:drop-shadow(0 0 8px rgba(255,176,32,0.4));">local_fire_department</span>
                    <div class="kpi-value count-up" id="val-streak">0</div>
                    <p class="text-muted" style="font-size:0.85rem;">Day Streak</p>
                    <div class="progress-bar" style="margin-top:var(--space-sm);">
                        <div class="progress-fill progress-grow" style="--final-width: ${Math.min((userData.streak/30)*100,100)}%; background:linear-gradient(90deg,var(--warning),#FF8C00);"></div>
                    </div>
                    <p class="text-muted" style="font-size:0.72rem; margin-top:4px;">${userData.streak}/30 days</p>
                </div>

                <!-- Points Card -->
                <div class="glass-card bento-card staggered-fade">
                    <span class="material-symbols-outlined earth-pulse" style="color:#a78bfa; font-size:2rem; filter:drop-shadow(0 0 8px rgba(167,139,250,0.4));">workspace_premium</span>
                    <div class="kpi-value text-neon count-up" id="val-points">0</div>
                    <p class="text-muted" style="font-size:0.85rem;">Eco Points</p>
                    <span class="badge badge-purple hover-lift" style="margin-top:var(--space-xs); align-self:flex-start;">Level ${level}</span>
                </div>

                <!-- Quick Actions -->
                <div class="bento-actions staggered-fade">
                    <button class="btn btn-outline hover-lift tap-scale" id="dash-btn-waste">
                        <span class="material-symbols-outlined glow-pulse">document_scanner</span>
                        AI Scanner
                    </button>
                    <button class="btn btn-primary hover-lift tap-scale" id="dash-btn-carbon">
                        <span class="material-symbols-outlined">add_circle</span>
                        Market
                    </button>
                </div>

                <!-- Weekly Chart -->
                <div class="glass-card sparkline-area staggered-fade">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="font-size:1rem;">Weekly CO₂ Trend</h4>
                            <p class="text-muted" style="font-size:0.82rem;">kg of CO₂ logged per day</p>
                        </div>
                        <span class="badge badge-green hover-lift">This Week</span>
                    </div>
                    <div class="chart-wrapper glass-fade">
                        <canvas id="weekly-chart"></canvas>
                    </div>
                </div>

                <!-- Eco Tip -->
                <div class="glass-card eco-tip-card staggered-fade">
                    <span class="eco-tip-icon leaf-sway">${randomTip.icon}</span>
                    <div>
                        <div style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--primary); margin-bottom:4px;">Daily Eco Tip</div>
                        <p style="font-size:0.9rem; line-height:1.5;">${randomTip.tip}</p>
                    </div>
                </div>

                <!-- Weekly Challenge -->
                <div class="glass-card challenge-card staggered-fade">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-md);">
                        <div>
                            <span class="badge badge-amber" style="margin-bottom:var(--space-xs);">Weekly Challenge</span>
                            <h4>Zero-Plastic Week</h4>
                            <p class="text-muted" style="font-size:0.85rem; margin-top:4px;">Go 7 days without single-use plastic.</p>
                        </div>
                        <strong class="text-neon mono-data glow-pulse" style="font-size:1.4rem; white-space:nowrap;">+500 pts</strong>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill progress-grow" style="--final-width: 43%; background:linear-gradient(90deg,var(--warning),#FF8C00);"></div>
                    </div>
                    <p class="text-muted" style="font-size:0.78rem; margin-top:6px;">3 of 7 days complete</p>
                </div>
            </div>

            <div class="section-title staggered-fade" style="margin-top:var(--space-xl);">
                <span class="material-symbols-outlined">group</span>
                Community Activity
            </div>
            <div class="glass-panel staggered-fade" style="border-radius:var(--radius-lg); padding:var(--space-sm);">
                <div class="feed-list" id="dashboard-feed">
                    ${FEED_DATA.map((item, i) => `
                        <div class="feed-item staggered-fade" style="animation-delay: ${0.5 + (i * 0.1)}s">
                            <div class="avatar avatar-sm hover-lift" style="background:linear-gradient(135deg,${item.color},${item.color}88); color:#060a07;">${item.initial}</div>
                            <div style="flex:1; min-width:0;">
                                <span style="font-weight:600;">${item.name}</span>
                                <span class="text-muted"> ${item.action}</span>
                                <div style="color:var(--primary); font-size:0.82rem; font-weight:700; margin-top:2px;">${item.pts} points</div>
                            </div>
                            <span class="text-muted" style="font-size:0.78rem; white-space:nowrap;">${item.time}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // ── Animate Counters ──────────────────────────────────
    animateCount(document.getElementById('val-streak'), 0, userData.streak || 0, 1000);
    animateCount(document.getElementById('val-points'), 0, userData.points || 0, 1200);

    // ── Render Sparkline Chart ────────────────────────────
    if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('weekly-chart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: weekLabels,
                    datasets: [{
                        label: 'CO₂ (kg)',
                        data: weekData,
                        borderColor: 'var(--primary)',
                        backgroundColor: 'rgba(0,255,135,0.08)',
                        borderWidth: 2.5,
                        pointBackgroundColor: 'var(--primary)',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(10,20,13,0.95)',
                            borderColor: 'rgba(0,255,135,0.2)',
                            borderWidth: 1,
                            titleColor: '#00FF87',
                            bodyColor: '#8FA396',
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.04)' },
                            ticks: { color: 'var(--text-muted)', font: { size: 11 } }
                        },
                        y: {
                            grid: { color: 'rgba(255,255,255,0.04)' },
                            ticks: { color: 'var(--text-muted)', font: { size: 11 } },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // ── Nav Buttons ──────────────────────────────────────
    document.getElementById('dash-btn-waste')?.addEventListener('click', () => window.location.hash = 'waste');
    document.getElementById('dash-btn-carbon')?.addEventListener('click', () => window.location.hash = 'carbon');
};
