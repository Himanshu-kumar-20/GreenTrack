// js/pages/community.js
import { showToast, flyPoints, animateCount } from '../components.js';
import { firebaseDB, currentUser } from '../firebase.js';
import { orderBy, limit } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const MOCK_LEADERBOARD = [
    { name: 'Priya Sharma', points: 4820, streak: 28 },
    { name: 'Arjun Mehta',  points: 4210, streak: 21 },
    { name: 'Sana Khan',    points: 3880, streak: 15 },
    { name: 'Dev Patel',    points: 3120, streak: 11 },
    { name: 'Riya Singh',   points: 2740, streak: 9  },
    { name: 'Kiran Das',    points: 2100, streak: 7  },
    { name: 'Amit Joshi',   points: 1850, streak: 5  },
];

const MOCK_TASKS = [
    { badge: 'Weekend Challenge', badgeClass: 'badge-amber', icon: 'handyman', title: 'Build a Bird Feeder', desc: 'Upcycle plastic bottles into a bird feeder. Submit before/after photos.', pts: 200, deadline: '2 days left' },
    { badge: 'Daily Habit',       badgeClass: 'badge-blue',  icon: 'shopping_bag', title: 'Zero Plastic Run', desc: 'Upload a receipt showing you avoided all single-use plastic.', pts: 50, deadline: 'Resets daily' },
    { badge: 'Eco Challenge',     badgeClass: 'badge-green', icon: 'directions_bike', title: 'Cycle to Work', desc: 'Log a cycling commute of at least 3km using GPS proof.', pts: 100, deadline: '5 days left' },
    { badge: 'Community',         badgeClass: 'badge-purple', icon: 'volunteer_activism', title: 'Local Cleanup Drive', desc: 'Participate in a local cleanup and submit group photo.', pts: 300, deadline: 'This weekend' },
];

export const initCommunity = async (container) => {
    container.innerHTML = `
        <div>
            <!-- Community Banner -->
            <div class="community-header" style="background-image:url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200'); background-size:cover; background-position:center; padding:var(--space-2xl) var(--space-xl); border-radius:var(--radius-lg); margin-bottom:var(--space-xl);">
                <div class="community-title">
                    <span class="badge badge-green" style="margin-bottom:var(--space-sm);">Zero Waste Club</span>
                    <h2 style="font-size:2.2rem; text-shadow:0 2px 16px rgba(0,0,0,0.9);">Bangalore Central</h2>
                    <div class="flex items-center gap-sm" style="margin-top:var(--space-sm);">
                        <span class="material-symbols-outlined text-muted" style="font-size:1.1rem;">group</span>
                        <span class="text-muted" style="font-size:0.9rem;"><strong id="member-count">0</strong> Members</span>
                        <span style="margin:0 6px; color:var(--text-muted);">·</span>
                        <span class="badge badge-green">🟢 Active</span>
                    </div>
                </div>
            </div>

            <!-- Community Stats Bar -->
            <div class="community-stats-bar" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:var(--space-md); margin-bottom:var(--space-xl);">
                <div class="glass-card" style="display:flex; align-items:center; gap:var(--space-md);">
                    <span class="material-symbols-outlined" style="font-size:2rem; color:var(--primary);">co2</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-co2" style="font-size:1.5rem; font-weight:700;">0</div>
                        <div class="c-stat-label text-muted" style="font-size:0.8rem;">kg CO₂ Saved</div>
                    </div>
                </div>
                <div class="glass-card" style="display:flex; align-items:center; gap:var(--space-md);">
                    <span class="material-symbols-outlined" style="font-size:2rem; color:var(--info);">recycling</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-items" style="font-size:1.5rem; font-weight:700;">0</div>
                        <div class="c-stat-label text-muted" style="font-size:0.8rem;">Items Recycled</div>
                    </div>
                </div>
                <div class="glass-card" style="display:flex; align-items:center; gap:var(--space-md);">
                    <span class="material-symbols-outlined" style="font-size:2rem; color:var(--warning);">workspace_premium</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-pts" style="font-size:1.5rem; font-weight:700;">0</div>
                        <div class="c-stat-label text-muted" style="font-size:0.8rem;">Total Eco Points</div>
                    </div>
                </div>
            </div>

            <!-- Tab Nav -->
            <div class="c-tabs" style="display:flex; gap:var(--space-md); border-bottom:var(--border-glass); margin-bottom:var(--space-lg); padding-bottom:var(--space-sm);">
                <span class="c-tab active" data-tab="feed" style="cursor:pointer; font-weight:600;">
                    <span class="material-symbols-outlined" style="font-size:1rem; vertical-align:middle; margin-right:4px;">forum</span>Community Feed
                </span>
                <span class="c-tab" data-tab="tasks" style="cursor:pointer;">
                    <span class="material-symbols-outlined" style="font-size:1rem; vertical-align:middle; margin-right:4px;">task_alt</span>Group Tasks
                </span>
                <span class="c-tab" data-tab="leaderboard" style="cursor:pointer;">
                    <span class="material-symbols-outlined" style="font-size:1rem; vertical-align:middle; margin-right:4px;">leaderboard</span>Leaderboard
                </span>
            </div>

            <div id="tab-content"></div>
        </div>
    `;

    // Animate stats
    animateCount(document.getElementById('member-count'), 0, 1204, 1200);
    animateCount(document.getElementById('stat-co2'), 0, 8420, 1500);
    animateCount(document.getElementById('stat-items'), 0, 3140, 1400);
    animateCount(document.getElementById('stat-pts'), 0, 92800, 1600);

    const tabContent = document.getElementById('tab-content');

    // ── Feed ─────────────────────────────────────────────
    const renderFeed = async () => {
        tabContent.innerHTML = `
            <div class="glass-card" style="margin-bottom:var(--space-xl); border-color:rgba(0,255,135,0.1);">
                <div class="flex items-center gap-md">
                    <div class="avatar avatar-sm">${currentUser?.displayName?.[0] || 'U'}</div>
                    <input id="feed-input" type="text" class="input-field"
                        style="margin:0; flex:1; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.08); border-radius:0; padding: 0.5rem 0;"
                        placeholder="Share your latest eco-win with the community... 🌿">
                    <button class="btn btn-primary btn-sm" id="btn-post" style="border-radius: var(--radius-full); padding: 0.5rem 1.5rem;">
                        Post Activity
                    </button>
                </div>
            </div>

            <div class="feed-grid" id="community-feed" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:var(--space-md);">
                <div class="flex justify-center p-xl" style="grid-column:1/-1;">
                    <span class="material-symbols-outlined spin">sync</span>
                </div>
            </div>
        `;

        const feedList = document.getElementById('community-feed');

        try {
            const posts = await firebaseDB.getCollection('posts', [orderBy('timestamp', 'desc'), limit(20)]);

            if (posts.length === 0) {
                feedList.innerHTML = `<p class="text-muted text-center p-xl" style="grid-column:1/-1;">No posts yet. Be the first to share your eco-win! 🌿</p>`;
            } else {
                feedList.innerHTML = posts.map((post, i) => `
                    <div class="glass-card" style="display:flex; flex-direction:column; gap:var(--space-sm);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div style="display:flex; align-items:center; gap:var(--space-sm);">
                                <div class="avatar avatar-sm" style="background:var(--primary-subtle); color:var(--primary); font-size:1rem;">${(post.authorName || 'U')[0]}</div>
                                <div>
                                    <strong style="display:block; font-size:0.9rem; color:var(--text-main);">
                                        ${post.userId === currentUser?.uid ? 'You' : post.authorName}
                                    </strong>
                                    <span class="text-muted" style="font-size:0.75rem;">
                                        ${new Date(post.timestamp).toLocaleString([], { dateStyle:'short', timeStyle:'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main); margin-top:var(--space-xs);">${post.content}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:var(--space-sm); border-top:var(--border-glass);">
                            <button class="like-btn btn btn-ghost btn-sm" data-post-id="${post.id}" style="padding:0.25rem 0.5rem; color:var(--text-muted);">
                                <span class="material-symbols-outlined" style="font-size:1.1rem; margin-right:4px;">favorite</span>
                                <span class="like-count">${post.likes || 0}</span>
                            </button>
                            <button class="btn btn-ghost btn-sm" style="padding:0.25rem 0.5rem; color:var(--text-muted);">
                                <span class="material-symbols-outlined" style="font-size:1.1rem; margin-right:4px;">chat_bubble</span> Reply
                            </button>
                        </div>
                    </div>
                `).join('');

                // Like button logic
                feedList.querySelectorAll('.like-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        btn.classList.toggle('liked');
                        const countEl = btn.querySelector('.like-count');
                        const icon = btn.querySelector('.material-symbols-outlined');
                        const likes = parseInt(countEl.textContent);
                        countEl.textContent = btn.classList.contains('liked') ? likes + 1 : likes - 1;
                        icon.style.animation = 'none';
                        void icon.offsetWidth;
                        icon.classList.add('heart-pop');
                        icon.addEventListener('animationend', () => icon.classList.remove('heart-pop'), { once: true });
                    });
                });
            }
        } catch (err) {
            feedList.innerHTML = `<p class="text-muted text-center p-xl">Could not load feed. Using offline mode.</p>`;
        }

        document.getElementById('btn-post')?.addEventListener('click', async (e) => {
            const input = document.getElementById('feed-input');
            const content = input.value.trim();
            if (!content) return;

            if (!currentUser) { showToast('Please log in to post.', 'warning'); return; }

            try {
                await firebaseDB.addDocument('posts', {
                    userId: currentUser.uid,
                    authorName: currentUser.displayName || 'Anonymous',
                    content,
                    likes: 0,
                    timestamp: new Date().toISOString()
                });
                input.value = '';
                showToast('Posted! 🌿', 'success');
                flyPoints(5, e);
                renderFeed();
            } catch (err) {
                showToast('Failed to post: ' + err.message, 'error');
            }
        });
    };

    // ── Tasks ─────────────────────────────────────────────
    const renderTasks = () => {
        tabContent.innerHTML = `
            <div class="product-grid">
                ${MOCK_TASKS.map((task, i) => `
                    <div class="glass-card" style="display:flex; flex-direction:column; gap:var(--space-sm);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <span class="badge ${task.badgeClass}">${task.badge}</span>
                            <span class="text-muted" style="font-size:0.75rem;">${task.deadline}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:var(--space-sm);">
                            <span class="material-symbols-outlined" style="color:var(--primary);">${task.icon}</span>
                            <h4>${task.title}</h4>
                        </div>
                        <p class="text-muted" style="font-size:0.85rem; line-height:1.5; flex:1;">${task.desc}</p>
                        <div class="flex justify-between items-center" style="margin-top:var(--space-sm); padding-top:var(--space-sm); border-top:var(--border-glass);">
                            <strong class="text-neon mono-data">+${task.pts} pts</strong>
                            <button class="btn btn-primary btn-sm btn-submit-task" data-pts="${task.pts}">Submit</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.btn-submit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.glass-card');
                const pts = parseInt(btn.dataset.pts);
                btn.textContent = 'Pending...';
                btn.disabled = true;
                btn.classList.replace('btn-primary', 'btn-outline');

                showToast('Task submitted for review!', 'info');

                setTimeout(() => {
                    card.style.borderColor = 'var(--primary)';
                    card.style.boxShadow = '0 0 20px rgba(0,255,135,0.1)';
                    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1rem;">check_circle</span> Approved';
                    btn.classList.replace('btn-outline', 'btn-primary');
                    showToast(`Task approved! +${pts} Eco-Points! 🎉`, 'success');
                    flyPoints(pts, e);
                }, 3000);
            });
        });
    };

    // ── Leaderboard ───────────────────────────────────────
    const renderLeaderboard = async () => {
        tabContent.innerHTML = `
            <div class="flex justify-center p-lg">
                <span class="material-symbols-outlined spin">sync</span>
            </div>
        `;

        let users = MOCK_LEADERBOARD;
        try {
            const fetched = await firebaseDB.getCollection('users', [orderBy('points', 'desc'), limit(10)]);
            if (fetched && fetched.length > 0) users = fetched;
        } catch (e) { /* use mock */ }

        const top3 = users.slice(0, 3);
        const rest = users.slice(3);
        // Handle fewer than 3 users gracefully
        const roles = [
            { class: 'gold', rank: '#1', user: top3[0] || null },
            { class: 'silver', rank: '#2', user: top3[1] || null },
            { class: 'bronze', rank: '#3', user: top3[2] || null }
        ];

        // Display order in the grid: [Silver, Gold, Bronze]
        const displayOrder = [roles[1], roles[0], roles[2]];

        tabContent.innerHTML = `
            <!-- Podium -->
            <div class="leaderboard-podium" id="podium-container">
                ${displayOrder.map(role => {
                    if (!role.user) return `<div class="podium-item inactive" style="opacity:0.2; transform:scale(0.8);">
                        <div class="podium-avatar" style="background:rgba(255,255,255,0.05); color:transparent;">?</div>
                        <div class="podium-base" style="height:30px; background:rgba(255,255,255,0.02);"></div>
                    </div>`;

                    const user = role.user;
                    const initial = (user.name || 'U')[0];
                    return `
                        <div class="podium-item">
                            <div class="podium-rank ${role.class}">${role.rank === '#1' ? '👑' : role.rank}</div>
                            <div class="podium-avatar ${role.class}">${initial}</div>
                            <div class="podium-name">${user.id === currentUser?.uid ? 'You' : (user.name || 'Unknown')}</div>
                            <div class="podium-base ${role.class}">${(user.points || 0).toLocaleString()} pts</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Rest of leaderboard -->
            <div class="glass-card">
                <div style="display:flex; padding:var(--space-sm) var(--space-md); border-bottom:var(--border-glass); margin-bottom:var(--space-sm);">
                    <span class="text-muted" style="width:40px; font-size:0.8rem; font-weight:700; text-transform:uppercase;">Rank</span>
                    <span class="text-muted" style="flex:1; font-size:0.8rem; font-weight:700; text-transform:uppercase;">Member</span>
                    <span class="text-muted" style="font-size:0.8rem; font-weight:700; text-transform:uppercase;">Points</span>
                </div>
                ${rest.map((u, i) => `
                    <div class="lb-row ${u.id === currentUser?.uid ? 'me' : ''}">
                        <span class="lb-rank">#${i + 4}</span>
                        <div class="flex items-center gap-sm" style="flex:1;">
                            <div class="avatar avatar-xs">${(u.name || 'U')[0]}</div>
                            <span style="font-weight:${u.id === currentUser?.uid ? '700' : '500'};">${u.id === currentUser?.uid ? 'You' : (u.name || 'Unknown')}</span>
                        </div>
                        <span class="lb-points">${(u.points || 0).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    };

    // ── Tab Switching ─────────────────────────────────────
    document.querySelectorAll('.c-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.c-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContent.className = '';
            void tabContent.offsetWidth;
            tabContent.className = 'page-enter';
            const activeTab = tab.dataset.tab;
            if (activeTab === 'feed')        renderFeed();
            if (activeTab === 'tasks')       renderTasks();
            if (activeTab === 'leaderboard') renderLeaderboard();
        });
    });

    renderFeed();
};
