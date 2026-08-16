// ============================================
// firebase-config.js
// ============================================
// ⚠️  ملء البيانات دي من Firebase Console
// 1. افتح https://console.firebase.google.com
// 2. اختار مشروعك: a7medashraf-25193
// 3. Project Settings (الترس) > General > Your apps > Web
// 4. انسخ الـ config واحطه هنا
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "a7medashraf-25193.firebaseapp.com",
  databaseURL: "https://a7medashraf-25193-default-rtdb.firebaseio.com",
  projectId: "a7medashraf-25193",
  storageBucket: "a7medashraf-25193.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
  measurementId: "YOUR_MEASUREMENT_ID_HERE"
};

// Initialize Firebase (compat mode for v9)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
