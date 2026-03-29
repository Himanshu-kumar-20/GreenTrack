// js/pages/carbon.js
import { formatNumber, sleep } from '../utils.js';
import { showToast, flyPoints, animateCount } from '../components.js';
import { firebaseDB, currentUser } from '../firebase.js';

const TIPS_BY_TYPE = {
    travel: [
        { icon: 'directions_transit', text: 'Take public transit or carpool — cuts per-person emissions by up to 80%.' },
        { icon: 'electric_car', text: 'Consider switching to an EV — zero tailpipe emissions.' },
        { icon: 'pedal_bike', text: 'Cycle trips under 5km — saves ~1.1kg CO₂ per trip.' },
    ],
    food: [
        { icon: 'spa', text: 'One plant-based meal per day can save 0.5 tonnes CO₂ per year.' },
        { icon: 'restaurant', text: 'Reducing beef by 50% saves around 300kg CO₂ annually.' },
        { icon: 'local_grocery_store', text: 'Buy local & seasonal to cut food transport emissions.' },
    ],
    energy: [
        { icon: 'lightbulb', text: 'Replace all bulbs with LEDs — uses 75% less energy.' },
        { icon: 'thermostat', text: 'Lower thermostat by 1°C to save ~5% on heating bills.' },
        { icon: 'solar_power', text: 'Explore rooftop solar — can reduce consumption by 80%.' },
    ],
    flight: [
        { icon: 'train', text: 'A train journey emits 6x less CO₂ than flying the same route.' },
        { icon: 'video_call', text: '2 virtual meetings can replace one short-haul flight.' },
        { icon: 'flight_land', text: 'Choose direct flights — takeoff/landing causes 25% of emissions.' },
    ]
};

const calculateCarbon = (type, params) => {
    switch (type) {
        case 'travel':
            const factors = { petrol: 0.21, diesel: 0.17, electric: 0.05, hybrid: 0.11 };
            return (parseFloat(params.distance) || 0) * (factors[params.vehicle] || 0.12);
        case 'food':
            const mealFactors = { beef: 6.8, chicken: 1.5, plant: 0.4, fish: 1.8 };
            return (mealFactors[params.mealType] || 1) * (parseInt(params.servings) || 1);
        case 'energy':
            return (parseFloat(params.kwh) || 0) * 0.42; // India grid factor
        case 'flight':
            return (parseFloat(params.hours) || 1) * 88;
        default:
            return 5;
    }
};

export const initCarbon = async (container) => {
    container.innerHTML = `
        <div class="page-entry">
            <div class="page-header staggered-fade">
                <h1>Carbon Tracker <span class="material-symbols-outlined glow-pulse" style="color:var(--primary); vertical-align:middle;">analytics</span></h1>
                <p class="text-muted">Log daily activities and see your real-time environmental footprint.</p>
            </div>

            <div class="tracker-tabs staggered-fade" id="carbon-tabs">
                <div class="tracker-tab active hover-lift tap-scale" data-type="travel">
                    <span class="material-symbols-outlined breeze-float">directions_car</span>Travel
                </div>
                <div class="tracker-tab hover-lift tap-scale" data-type="food">
                    <span class="material-symbols-outlined breeze-float">restaurant</span>Food
                </div>
                <div class="tracker-tab hover-lift tap-scale" data-type="energy">
                    <span class="material-symbols-outlined breeze-float">bolt</span>Energy
                </div>
                <div class="tracker-tab hover-lift tap-scale" data-type="flight">
                    <span class="material-symbols-outlined breeze-float">flight</span>Flights
                </div>
            </div>

            <div class="glass-card staggered-fade" style="margin-bottom:var(--space-xl);">
                <form id="carbon-form">
                    <div id="dynamic-inputs" class="staggered-fade"></div>
                    <div class="flex items-center justify-between" style="margin-top:var(--space-lg);">
                        <button type="submit" class="btn btn-primary btn-lg hover-lift tap-scale" id="btn-calc">
                            <span class="material-symbols-outlined glow-pulse">calculate</span>
                            Calculate Footprint
                        </button>
                        <div id="calc-spinner" class="hidden flex items-center gap-sm text-muted">
                            <span class="material-symbols-outlined spin">sync</span>
                            <span style="font-size:0.9rem;">Calculating...</span>
                        </div>
                    </div>
                </form>
            </div>

            <div id="result-view" class="hidden">
                <div class="section-title staggered-fade">
                    <span class="material-symbols-outlined earth-pulse">analytics</span>
                    Estimated Impact
                </div>

                <div class="carbon-result-grid staggered-fade">
                    <div class="glass-card big-number-card hover-lift">
                        <p class="text-muted" style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.08em;">CO₂ Generated</p>
                        <div class="big-co2 glow-pulse" id="res-co2">0.0</div>
                        <p class="text-muted">kg CO₂e</p>
                    </div>
                    <div class="glass-card hover-lift" style="text-align:center; padding:var(--space-xl); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--space-sm);">
                        <span class="material-symbols-outlined leaf-sway" style="font-size:3rem; color:var(--secondary); filter:drop-shadow(0 0 10px rgba(127,255,0,0.3));">forest</span>
                        <div style="font-family:var(--font-mono); font-size:2.2rem; font-weight:700;" id="res-trees">0</div>
                        <p class="text-muted" style="font-size:0.85rem;">Trees needed to offset</p>
                    </div>
                </div>

                <!-- Comparison bars -->
                <div class="glass-card staggered-fade" style="margin-bottom:var(--space-md);">
                    <h4 style="margin-bottom:var(--space-md);"><span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">compare_arrows</span>How does it compare?</h4>
                    <div id="compare-bars"></div>
                </div>

                <!-- Doughnut Chart -->
                <div class="glass-card staggered-fade" style="margin-bottom:var(--space-md);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
                        <h4><span class="material-symbols-outlined" style="vertical-align:middle; margin-right:8px;">pie_chart</span>Emission Breakdown</h4>
                        <span class="badge badge-green glow-pulse">This Log</span>
                    </div>
                    <div class="carbon-chart-wrapper glass-fade">
                        <canvas id="carbon-donut"></canvas>
                    </div>
                </div>

                <!-- AI Tips -->
                <div class="glass-card staggered-fade">
                    <div style="display:flex; align-items:center; gap:var(--space-sm); margin-bottom:var(--space-lg);">
                        <span class="material-symbols-outlined breeze-float" style="color:var(--primary);">psychology</span>
                        <h4>AI Insights</h4>
                        <span class="badge badge-green glow-pulse" style="margin-left:auto;">Personalized</span>
                    </div>
                    <div id="ai-tips" class="staggered-fade"></div>

                    <button class="btn btn-primary hover-lift tap-scale" id="btn-log-carbon" style="width:100%; margin-top:var(--space-lg);">
                        <span class="material-symbols-outlined">save</span>
                        Save to Log (+10 pts)
                    </button>
                </div>
            </div>
        </div>
    `;

    let activeType = 'travel';
    let lastCo2 = 0;

    // ── Form Input Templates ──────────────────────────────
    const inputTemplates = {
        travel: `
            <div class="input-group">
                <label class="input-label">Distance Driven (km)</label>
                <input type="number" id="input-distance" class="input-field" placeholder="e.g. 25" min="0" required>
            </div>
            <div class="input-group">
                <label class="input-label">Vehicle Type</label>
                <select id="input-vehicle" class="input-field">
                    <option value="petrol">Petrol / Gas</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric (EV)</option>
                </select>
            </div>`,
        food: `
            <div class="input-group">
                <label class="input-label">Primary Protein Source</label>
                <select id="input-meal" class="input-field">
                    <option value="beef">Beef / Lamb</option>
                    <option value="chicken">Poultry / Pork</option>
                    <option value="fish">Fish / Seafood</option>
                    <option value="plant">Plant-based (Vegan)</option>
                </select>
            </div>
            <div class="input-group">
                <label class="input-label">Number of Servings</label>
                <input type="number" id="input-servings" class="input-field" placeholder="1" min="1" value="1" required>
            </div>`,
        energy: `
            <div class="input-group">
                <label class="input-label">Electricity Used (kWh)</label>
                <input type="number" id="input-kwh" class="input-field" placeholder="e.g. 12" min="0" required>
            </div>
            <div class="input-group">
                <label class="input-label">Duration</label>
                <select id="input-period" class="input-field">
                    <option value="1">Today (daily)</option>
                    <option value="7">This Week</option>
                    <option value="30">This Month</option>
                </select>
            </div>`,
        flight: `
            <div class="input-group">
                <label class="input-label">Flight Duration (hours)</label>
                <input type="number" id="input-hours" class="input-field" placeholder="e.g. 3" min="0.5" step="0.5" required>
            </div>
            <div class="input-group">
                <label class="input-label">Class</label>
                <select id="input-class" class="input-field">
                    <option value="1">Economy</option>
                    <option value="1.5">Business</option>
                    <option value="2">First Class</option>
                </select>
            </div>`
    };

    const updateFormInputs = (type) => {
        document.getElementById('dynamic-inputs').innerHTML = inputTemplates[type] || '';
        document.getElementById('result-view').classList.add('hidden');
    };

    updateFormInputs('travel');

    // ── Tab Switching ─────────────────────────────────────
    container.querySelectorAll('.tracker-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.tracker-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeType = tab.dataset.type;
            updateFormInputs(activeType);
        });
    });

    // ── Form Submit ───────────────────────────────────────
    document.getElementById('carbon-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-calc');
        const spinner = document.getElementById('calc-spinner');
        btn.classList.add('hidden');
        spinner.classList.remove('hidden');

        let params = {};
        if (activeType === 'travel')  params = { distance: document.getElementById('input-distance')?.value, vehicle: document.getElementById('input-vehicle')?.value };
        if (activeType === 'food')    params = { mealType: document.getElementById('input-meal')?.value, servings: document.getElementById('input-servings')?.value };
        if (activeType === 'energy')  params = { kwh: document.getElementById('input-kwh')?.value };
        if (activeType === 'flight')  params = { hours: document.getElementById('input-hours')?.value, classFactor: document.getElementById('input-class')?.value };

        try {
            await sleep(900);
            let co2e = calculateCarbon(activeType, params);
            if (activeType === 'flight' && params.classFactor) co2e *= parseFloat(params.classFactor);

            lastCo2 = co2e;

            // Show results
            const resultView = document.getElementById('result-view');
            resultView.classList.remove('hidden');
            resultView.classList.add('page-enter');

            // Animate numbers
            animateCount(document.getElementById('res-co2'), 0, co2e, 1200, 1);
            animateCount(document.getElementById('res-trees'), 0, Math.ceil(co2e / 21), 1000);

            // Comparison bars
            const avgValues = { travel: 2.6, food: 2.0, energy: 3.1, flight: 120 };
            const avg = avgValues[activeType] || 5;
            const compareEl = document.getElementById('compare-bars');
            compareEl.innerHTML = `
                <div class="compare-row staggered-fade">
                    <span class="compare-label">Your log</span>
                    <div class="compare-bar"><div class="compare-fill progress-grow" style="--final-width:${Math.min((co2e/Math.max(co2e,avg))*100,100)}%; background:${co2e > avg ? 'var(--error)' : 'var(--primary)'};"></div></div>
                    <span class="compare-value" style="color:${co2e > avg ? 'var(--error)' : 'var(--primary)'}">${co2e.toFixed(1)}kg</span>
                </div>
                <div class="compare-row staggered-fade" style="animation-delay: 0.1s">
                    <span class="compare-label">Avg person</span>
                    <div class="compare-bar"><div class="compare-fill progress-grow" style="--final-width:${Math.min((avg/Math.max(co2e,avg))*100,100)}%; background:var(--text-muted);"></div></div>
                    <span class="compare-value" style="color:var(--text-muted);">${avg}kg</span>
                </div>
            `;

            // Donut chart
            if (typeof Chart !== 'undefined') {
                const donutCtx = document.getElementById('carbon-donut')?.getContext('2d');
                if (donutCtx) {
                    const breakdown = {
                        'Direct Emissions': co2e * 0.65,
                        'Indirect (Lifecycle)': co2e * 0.25,
                        'Infrastructure': co2e * 0.10
                    };
                    new Chart(donutCtx, {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(breakdown),
                            datasets: [{
                                data: Object.values(breakdown),
                                backgroundColor: ['rgba(255,74,106,0.8)', 'rgba(255,176,32,0.8)', 'rgba(79,152,255,0.8)'],
                                borderColor: ['rgba(255,74,106,1)', 'rgba(255,176,32,1)', 'rgba(79,152,255,1)'],
                                borderWidth: 2,
                                hoverOffset: 6,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '68%',
                            plugins: {
                                legend: { position: 'right', labels: { color: '#8FA396', padding: 16, font: { size: 12 } } },
                                tooltip: {
                                    backgroundColor: 'rgba(10,20,13,0.95)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderWidth: 1,
                                    callbacks: { label: (ctx) => ` ${ctx.parsed.toFixed(2)} kg CO₂` }
                                }
                            }
                        }
                    });
                }
            }

            // AI Tips
            const tips = TIPS_BY_TYPE[activeType] || [];
            document.getElementById('ai-tips').innerHTML = tips.map((tip, i) => `
                <div class="ai-tip-item staggered-fade" style="animation-delay: ${0.2 + (i * 0.1)}s">
                    <div class="ai-tip-icon breeze-float"><span class="material-symbols-outlined">${tip.icon}</span></div>
                    <p style="font-size:0.88rem; color:var(--text-muted); margin:0; line-height:1.5;">${tip.text}</p>
                </div>
            `).join('');

        } catch (err) {
            showToast('Calculation failed: ' + err.message, 'error');
        } finally {
            btn.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });

    // ── Save Log ──────────────────────────────────────────
    document.addEventListener('click', async (e) => {
        if (e.target.closest('#btn-log-carbon')) {
            const btn = document.getElementById('btn-log-carbon');
            if (!btn || !lastCo2) return;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined spin">sync</span> Saving...';

            try {
                if (currentUser) {
                    await firebaseDB.addDocument('carbon_logs', {
                        userId: currentUser.uid,
                        type: activeType,
                        co2e: lastCo2,
                        timestamp: new Date().toISOString()
                    });
                }
                showToast('Carbon log saved! +10 Eco-Points 🌿', 'success');
                flyPoints(10, e);
                btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Saved!';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save to Log (+10 pts)';
                }, 2500);
            } catch (err) {
                showToast('Failed to save: ' + err.message, 'error');
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save to Log (+10 pts)';
            }
        }
    });
};
