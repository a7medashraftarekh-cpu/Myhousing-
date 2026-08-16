# 🔒 سكني - النسخة المؤمنة 100%

## ⚠️ خطوات الإعداد (مهمة جداً)

### 1. ملء Firebase Config
افتح ملف `firebase-config.js` وملّل الـ values دي من [Firebase Console](https://console.firebase.google.com/):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",              // من Project Settings > General > Web app
  authDomain: "a7medashraf-25193.firebaseapp.com",
  databaseURL: "https://a7medashraf-25193-default-rtdb.firebaseio.com",
  projectId: "a7medashraf-25193",
  storageBucket: "a7medashraf-25193.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",  // من Cloud Messaging
  appId: "YOUR_APP_ID_HERE",                            // من General > Web app
  measurementId: "YOUR_MEASUREMENT_ID_HERE"             // من General > Web app
};
```

### 2. تفعيل Authentication
1. في Firebase Console، روح لـ **Authentication** > **Sign-in method**
2. فعّل **Email/Password**

### 3. رفع قواعد الأمان
في **Realtime Database** > **Rules**، الصق:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "properties": {
      ".read": true,
      "$pid": {
        ".write": "auth != null && (root.child('properties').child($pid).child('ownerId').val() == auth.uid || !root.child('properties').child($pid).exists())"
      }
    },
    "reviews": { ".read": true, "$rid": { ".write": "auth != null" } },
    "bookings": { ".read": "auth != null", "$bid": { ".write": "auth != null" } },
    "messages": { ".read": "auth != null", "$mid": { ".write": "auth != null" } },
    "favorites": { ".read": "auth != null", "$fid": { ".write": "auth != null" } }
  }
}
```

### 4. الملفات الجديدة
| الملف | الوظيفة |
|-------|---------|
| `firebase-config.js` | إعدادات Firebase (لازم تملّلها) |
| `utils.js` | XSS Protection + Rate Limiting + Helpers |
| `auth.js` | دوال المصادقة (تسجيل/دخول/خروج) |
| `db.js` | دوال قاعدة البيانات + Demo Data |
| `database.rules.json` | قواعد أمان Firebase |

### 5. المميزات الجديدة ✅
- 🔐 Firebase Authentication حقيقي
- 📧 Email Verification بعد التسجيل
- 🔑 Forgot Password بالإيميل
- 💪 Password Strength Meter
- 🛡️ XSS Protection على كل المدخلات
- 🔒 HTTPS Enforcement
- ⏱️ Rate Limiting (5 محاولات/15 دقيقة)
- 👤 Auth Guards على كل الصفحات المحمية
- 🧹 إزالة Demo Credentials من الواجهة

### 6. تنظيف (لو عايز تعيد الـ Demo Data)
افتح console في المتصفح واكتب:
```js
localStorage.removeItem('dbSeeded_v2');
location.reload();
```
