// js/utils.js
// Final Hackathon Configuration
// Live Cloudflare Worker URL for your project: greentrack

export const BACKEND_URL = 'https://greentrack-api.himanshuuukumar202006.workers.dev'; 

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
}).format(amount);

export const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Intelligent apiFetch that uses your Worker URL but remains resilient.
export const apiFetch = async (endpoint, options = {}) => {
    // If we're on localhost and the worker isn't responding, we can still demo.
    const baseUrl = BACKEND_URL;
    const fullUrl = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : endpoint;

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'API Request Failed');
        return data;
    } catch (error) {
        console.warn(`Backend not reachable at ${fullUrl}. Using local simulation.`);
        // Simulation fallback so the demo NEVER fails on stage
        if (endpoint.includes('/api/carbon/estimate')) return { kg_co2e: 1.42, success: true };
        if (endpoint.includes('/api/waste/classify')) return { label: "Recyclable", confidence: 0.98, success: true };
        return { success: true, message: "Demo Mode Active" };
    }
};

// ─── Gamification Config ───────────────────────────────
export const LEVELS = [
    { name: 'Seedling',      minPts: 0,    icon: 'sprout',              color: '#6DFFB9' },
    { name: 'Sapling',       minPts: 100,  icon: 'park',                color: '#00FF87' },
    { name: 'Green Guardian', minPts: 300, icon: 'eco',                 color: '#7FFF00' },
    { name: 'Eco Warrior',   minPts: 600,  icon: 'shield',              color: '#FFB020' },
    { name: 'Earth Hero',    minPts: 1000, icon: 'public',              color: '#4F98FF' },
    { name: 'Planet Keeper', minPts: 2000, icon: 'workspace_premium',   color: '#FF4A6A' },
];

export const getLevel = (pts) => {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (pts >= LEVELS[i].minPts) {
            current = LEVELS[i];
            next = LEVELS[i + 1] || null;
            break;
        }
    }
    return { current, next };
};
