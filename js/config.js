// config.example.js
// Rename to config.js and add your real keys before deploying.
// Note: In a real production app, ensure these keys are secured or restricted
// via HTTP domains/referrer restrictions.

const CONFIG = {
  FIREBASE: {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://your-project-id.firebaseio.com"
  },

  // ── Real Google OAuth (No Firebase needed, works with Vercel) ──────────────
  // To enable real Google Sign-In:
  // 1. Go to https://console.cloud.google.com/
  // 2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
  // 3. Application type: Web application
  // 4. Add Authorized origins: http://localhost:3000 and your Vercel domain
  // 5. Paste the Client ID below (looks like: XXXXXXXXXX-abc123.apps.googleusercontent.com)
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID",

  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_AP",
  CARBON_INTERFACE_API_KEY: "YcIoat5dvQKfaIm4rtKXtzw",
  RAZORPAY_KEY_ID: "rzp_test_SWWk0fMJPSlAXQ"
};

export default CONFIG;
