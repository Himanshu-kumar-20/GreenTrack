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
        <div class="page-entry">
            <!-- Community Banner -->
            <div class="community-header staggered-fade" style="background-image:url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200');">
                <div class="community-title">
                    <span class="badge badge-green glow-pulse" style="margin-bottom:var(--space-sm);">Zero Waste Club</span>
                    <h2 style="font-size:2.2rem; text-shadow:0 2px 16px rgba(0,0,0,0.9);">Bangalore Central</h2>
                    <div class="flex items-center gap-sm" style="margin-top:var(--space-sm);">
                        <span class="material-symbols-outlined text-muted leaf-sway" style="font-size:1.1rem;">group</span>
                        <span class="text-muted" style="font-size:0.9rem;"><strong id="member-count">0</strong> Members</span>
                        <span style="margin:0 6px; color:var(--text-muted);">·</span>
                        <span class="badge badge-green glow-pulse">🟢 Active</span>
                    </div>
                </div>
            </div>

            <!-- Community Stats Bar -->
            <div class="community-stats-bar staggered-fade">
                <div class="c-stat hover-lift">
                    <span class="material-symbols-outlined c-stat-icon leaf-sway">co2</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-co2">0</div>
                        <div class="c-stat-label">kg CO₂ Saved</div>
                    </div>
                </div>
                <div class="c-stat hover-lift">
                    <span class="material-symbols-outlined c-stat-icon breeze-float">recycling</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-items">0</div>
                        <div class="c-stat-label">Items Recycled</div>
                    </div>
                </div>
                <div class="c-stat hover-lift">
                    <span class="material-symbols-outlined c-stat-icon glow-pulse">workspace_premium</span>
                    <div>
                        <div class="c-stat-value count-up" id="stat-pts">0</div>
                        <div class="c-stat-label">Total Eco Points</div>
                    </div>
                </div>
            </div>

            <!-- Tab Nav -->
            <div class="c-tabs staggered-fade">
                <span class="c-tab active tap-scale" data-tab="feed">
                    <span class="material-symbols-outlined breeze-float" style="font-size:1rem; vertical-align:middle; margin-right:4px;">forum</span>Feed
                </span>
                <span class="c-tab tap-scale" data-tab="tasks">
                    <span class="material-symbols-outlined leaf-sway" style="font-size:1rem; vertical-align:middle; margin-right:4px;">task_alt</span>Tasks
                </span>
                <span class="c-tab tap-scale" data-tab="leaderboard">
                    <span class="material-symbols-outlined glow-pulse" style="font-size:1rem; vertical-align:middle; margin-right:4px;">leaderboard</span>Leaderboard
                </span>
            </div>

            <div id="tab-content" class="staggered-fade glass-fade"></div>
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
            <div class="glass-card staggered-fade hover-lift" style="margin-bottom:var(--space-md); border-color:rgba(0,255,135,0.1);">
                <div class="flex items-center gap-md">
                    <div class="avatar avatar-sm breeze-float">${currentUser?.displayName?.[0] || 'U'}</div>
                    <input id="feed-input" type="text" class="input-field"
                        style="margin:0; flex:1; background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.08); border-radius:0; padding: 0.5rem 0;"
                        placeholder="Share your eco-win... 🌿">
                    <button class="btn btn-primary btn-sm hover-lift tap-scale" id="btn-post">
                        <span class="material-symbols-outlined">send</span>Post
                    </button>
                </div>
            </div>

            <div class="feed-list" id="community-feed">
                <div class="flex justify-center p-xl">
                    <span class="material-symbols-outlined spin">sync</span>
                </div>
            </div>
        `;

        const feedList = document.getElementById('community-feed');

        try {
            const posts = await firebaseDB.getCollection('posts', [orderBy('timestamp', 'desc'), limit(20)]);

            if (posts.length === 0) {
                feedList.innerHTML = `<p class="text-muted text-center p-xl">No posts yet. Be the first to share your eco-win! 🌿</p>`;
            } else {
                feedList.innerHTML = posts.map((post, i) => `
                    <div class="chat-msg ${post.userId === currentUser?.uid ? 'mine' : ''} staggered-fade hover-lift">
                        <div class="avatar avatar-sm breeze-float" style="align-self:flex-end;">${(post.authorName || 'U')[0]}</div>
                        <div class="chat-bubble">
                            <strong style="display:block; margin-bottom:4px; font-size:0.82rem; color:${post.userId === currentUser?.uid ? 'var(--primary)' : 'var(--text-muted)'};">
                                ${post.userId === currentUser?.uid ? 'You' : post.authorName}
                            </strong>
                            ${post.content}
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-sm);">
                                <button class="like-btn tap-scale" data-post-id="${post.id}">
                                    <span class="material-symbols-outlined" style="font-size:1rem;">favorite</span>
                                    <span class="like-count">${post.likes || 0}</span>
                                </button>
                                <span class="text-muted" style="font-size:0.72rem;">
                                    ${new Date(post.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                                </span>
                            </div>
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
                    <div class="glass-card staggered-fade hover-lift tap-scale" style="display:flex; flex-direction:column; gap:var(--space-sm);">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <span class="badge ${task.badgeClass} glow-pulse">${task.badge}</span>
                            <span class="text-muted" style="font-size:0.75rem;">${task.deadline}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:var(--space-sm);">
                            <span class="material-symbols-outlined leaf-sway" style="color:var(--primary);">${task.icon}</span>
                            <h4>${task.title}</h4>
                        </div>
                        <p class="text-muted" style="font-size:0.85rem; line-height:1.5; flex:1;">${task.desc}</p>
                        <div class="flex justify-between items-center" style="margin-top:var(--space-sm); padding-top:var(--space-sm); border-top:var(--border-glass);">
                            <strong class="text-neon mono-data glow-pulse">+${task.pts} pts</strong>
                            <button class="btn btn-primary btn-sm btn-submit-task hover-lift tap-scale" data-pts="${task.pts}">Submit</button>
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
        const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3; // Silver, Gold, Bronze
        const podiumClasses = top3.length >= 3 ? ['silver', 'gold', 'bronze'] : ['gold', 'silver', 'bronze'];
        const ranks = top3.length >= 3 ? ['#2', '#1', '#3'] : ['#1', '#2', '#3'];

        tabContent.innerHTML = `
            <!-- Podium -->
            <div class="leaderboard-podium staggered-fade">
                ${podiumOrder.map((u, i) => `
                    <div class="podium-item hover-lift">
                        <span class="podium-rank ${podiumClasses[i]} glow-pulse">${ranks[i] === '#1' ? '👑' : ranks[i]}</span>
                        <div class="podium-avatar ${podiumClasses[i]} breeze-float">${(u.name || 'U')[0]}</div>
                        <div class="podium-name">${u.id === currentUser?.uid ? 'You' : (u.name || 'Unknown')}</div>
                        <div class="podium-base ${podiumClasses[i]} glow-pulse">${(u.points || 0).toLocaleString()} pts</div>
                    </div>
                `).join('')}
            </div>

            <!-- Rest of leaderboard -->
            <div class="glass-card">
                <div style="display:flex; padding:var(--space-sm) var(--space-md); border-bottom:var(--border-glass); margin-bottom:var(--space-sm);">
                    <span class="text-muted" style="width:40px; font-size:0.8rem; font-weight:700; text-transform:uppercase;">Rank</span>
                    <span class="text-muted" style="flex:1; font-size:0.8rem; font-weight:700; text-transform:uppercase;">Member</span>
                    <span class="text-muted" style="font-size:0.8rem; font-weight:700; text-transform:uppercase;">Points</span>
                </div>
                ${rest.map((u, i) => `
                    <div class="lb-row ${u.id === currentUser?.uid ? 'me' : ''} staggered-fade hover-lift">
                        <span class="lb-rank">#${i + 4}</span>
                        <div class="flex items-center gap-sm" style="flex:1;">
                            <div class="avatar avatar-xs breeze-float">${(u.name || 'U')[0]}</div>
                            <span style="font-weight:${u.id === currentUser?.uid ? '700' : '500'};">${u.id === currentUser?.uid ? 'You' : (u.name || 'Unknown')}</span>
                        </div>
                        <span class="lb-points glow-pulse">${(u.points || 0).toLocaleString()}</span>
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
