// ============================================
// firebase-config.js
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyB7isPvGDPiOyhg7Dc0_6An3xygIshiVZo",
  authDomain: "a7medashraf-25193.firebaseapp.com",
  databaseURL: "https://a7medashraf-25193-default-rtdb.firebaseio.com",
  projectId: "a7medashraf-25193",
  storageBucket: "a7medashraf-25193.firebasestorage.app",
  messagingSenderId: "795637067134",
  appId: "1:795637067134:web:2f370cd29f2518370b572f",
  measurementId: "G-83E6DFJ3Y8"
};

// Initialize Firebase (compat mode for CDN scripts)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
