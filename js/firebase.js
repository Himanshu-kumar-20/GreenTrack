// js/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import CONFIG from '../config.js';
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

// Initialize Firebase App
let app, firebaseAuth, googleProvider;
try {
    app = initializeApp(CONFIG.FIREBASE);
    firebaseAuth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} catch (error) {
    console.warn("Firebase initialization failed, check your config.js:", error);
}

// Ensure local fallback auth state matches our mock / fallback demo
export const auth = {
    currentUser: JSON.parse(localStorage.getItem('greentrack_user')) || null
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

// If real firebase auth is hooked up, sync it
if (firebaseAuth) {
    onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
            // Check if user already in mockDB, else create
            const mappedUser = {
                uid: user.uid,
                displayName: user.displayName || 'Google User',
                email: user.email,
                photoURL: user.photoURL,
                points: user.points || 0,
                isAnonymous: false
            };
            setAuthUser(mappedUser);
        } else {
            // Only drop auth if it wasn't a local demo user
            if(currentUser && currentUser.uid !== 'demo_user') {
                 setAuthUser(null);
            }
        }
    });
} else {
    // Auto-initialize mock auth state
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: auth.currentUser }));
    }, 100);
}

export const signInWithGoogleFirebase = async () => {
    if(!firebaseAuth) {
        throw new Error("Firebase not initialized. Check config.js");
    }
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return result.user;
};

export const signOutFirebase = async () => {
    if(firebaseAuth) {
        await signOut(firebaseAuth);
    }
    setAuthUser(null);
};

// ─── Gamification Helper ──────────────────────────────────
export const addEcoPoints = async (amount) => {
    if (!currentUser) return;
    const newPoints = await firebaseDB.addPoints(currentUser.uid, amount);
    currentUser.points = newPoints;
    // Update active user in local storage
    localStorage.setItem('greentrack_user', JSON.stringify(currentUser));
    return newPoints;
};
