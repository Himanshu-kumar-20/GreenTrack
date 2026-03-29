# GreenTrack 🌿

GreenTrack is a Sustainable Living & Eco-Community Platform offering a full Single Page Application built with a Vanilla HTML/CSS/JS frontend, fueled by a Firebase & Node.js/Express backend. 

## Features
- **Carbon Tracker:** Estimate CO2 based on your daily actions.
- **Waste Classifier:** AI-powered visual recognition of trash types.
- **Marketplace:** Direct connection between farmers and consumers.
- **Eco-Community:** Leaderboards, Feeds, and point-driven challenges.

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys**
   - Rename `config.example.js` to `config.js` in the project root.
   - Supply your Firebase keys (Auth, Firestore, Storage, Realtime Database).
   - Add your Google Maps API Key, Razorpay Key, and Carbon Interface API key.
   
3. **Start the Express API server**
   ```bash
   npm run start
   ```

4. **Serve the Frontend**
   In a separate terminal, use any static file server like `serve`:
   ```bash
   npx serve .
   ```

## 🔐 Demo Accounts
- To streamline hackathon judging, the login page features a `/demo-login` bypass, ensuring an instant display of all dashboard functionalities with pre-seeded data.
