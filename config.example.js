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
    databaseURL: "https://your-project-id.firebaseio.com" // For Realtime DB
  },
  GOOGLE_MAPS_API_KEY: "YOUR_GOOGLE_MAPS_AP",
  CARBON_INTERFACE_API_KEY: "YcIoat5dvQKfaIm4rtKXtzw",
  RAZORPAY_KEY_ID: "rzp_test_SWWk0fMJPSlAXQ"
};

export default CONFIG;
