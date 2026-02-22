// ============================================================
//  TIJWAAL – Firebase Configuration
//  Paste your firebaseConfig here once and all pages use it.
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCbCgE1ggA8daD7lOudhumCUJ8Eh0mxGNg",
    authDomain: "tijwaal-ed5c0.firebaseapp.com",
    projectId: "tijwaal-ed5c0",
    storageBucket: "tijwaal-ed5c0.firebasestorage.app",
    messagingSenderId: "795198460357",
    appId: "1:795198460357:web:e807a36dcb890d901d3bac"
};

// Initialize Firebase (compat SDK – works in plain HTML without a bundler)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Expose globally so all pages can import this file and use `auth` and `db`
window.firebaseAuth = auth;
window.firebaseDB = db;
