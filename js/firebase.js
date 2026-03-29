// js/firebase.js
import { getLevel } from './utils.js';
import { showAchievementModal } from './components.js';

// Mock Firebase/Database logic using LocalStorage for extreme speed and hackathon reliability.
// This allows the app to work INSTANTLY without any cloud database configuration or billing errors.

class MockDB {
    constructor() {
        this.store = JSON.parse(localStorage.getItem('greentrack_db')) || {
            users: {
                'demo_user': {
                    uid: 'demo_user',
                    name: 'Guest User',
                    email: 'guest@greentrack.com',
                    points: 150,
                    co2Total: 12.4,
                    streak: 5,
                    role: 'Eco-Member'
                }
            },
            carbon_logs: [],
            waste_logs: [],
            market_orders: [],
            posts: [
                { id: '1', authorName: 'Aisha', content: 'Just scanned my first 100% recyclable plastic!', timestamp: new Date().toISOString(), userId: 'aisha_1' },
                { id: '2', authorName: 'Rahul', content: 'Balcony composting is going great. Highly recommend.', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'rahul_2' }
            ]
        };
    }

    save() {
        localStorage.setItem('greentrack_db', JSON.stringify(this.store));
    }

    async getDocument(col, id) {
        return this.store[col]?.[id] || this.store[col]?.find(doc => doc.id === id) || null;
    }

    async setDocument(col, id, data) {
        if (!this.store[col]) this.store[col] = {};
        this.store[col][id] = { ...data, id };
        this.save();
    }

    async addDocument(col, data) {
        if (!this.store[col]) this.store[col] = [];
        const newDoc = { ...data, id: Math.random().toString(36).substr(2, 9) };
        this.store[col].unshift(newDoc);
        this.save();
        return newDoc.id;
    }

    async getCollection(col) {
        return Array.isArray(this.store[col]) ? this.store[col] : Object.values(this.store[col] || {});
    }

    async addPoints(uid, amount) {
        const user = this.store.users[uid];
        if (!user) return;
        
        const oldPts = user.points || 0;
        user.points = oldPts + amount;
        this.save();

        const oldLevel = getLevel(oldPts).current;
        const newLevel = getLevel(user.points).current;

        if (newLevel.minPts > oldLevel.minPts) {
            // Level Up!
            showAchievementModal(`Reached Level: ${newLevel.name}`, newLevel.icon, newLevel.color);
        }
        
        return user.points;
    }
}


export const firebaseDB = new MockDB();

// Mock Auth logic
export const auth = {
    currentUser: JSON.parse(localStorage.getItem('greentrack_user')) || firebaseDB.store.users['demo_user']
};

export let currentUser = auth.currentUser;

export const setAuthUser = (user) => {
    currentUser = user;
    auth.currentUser = user;
    if (user) {
        localStorage.setItem('greentrack_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('greentrack_user');
    }
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
};

// Auto-initialize auth state
setTimeout(() => {
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: auth.currentUser }));
}, 100);

// ─── Gamification Helper ──────────────────────────────────
export const addEcoPoints = async (amount) => {
    if (!currentUser) return;
    const newPoints = await firebaseDB.addPoints(currentUser.uid, amount);
    currentUser.points = newPoints;
    // Update active user in local storage
    localStorage.setItem('greentrack_user', JSON.stringify(currentUser));
    return newPoints;
};
