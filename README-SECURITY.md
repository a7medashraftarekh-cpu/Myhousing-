# 🔒 سكني - النسخة المُؤمنة

## ⚠️ مهم جداً قبل التشغيل

### 1. ملء Firebase Config
في ملف `db.js`، لازم تملّل الـ values دي من **Firebase Console**:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",              // Project Settings > General
  authDomain: "a7medashraftarekh-25193.firebaseapp.com",
  databaseURL: "https://a7medashraftarekh-25193-default-rtdb.firebaseio.com",
  projectId: "a7medashraftarekh-25193",
  storageBucket: "a7medashraftarekh-25193.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Project Settings > Cloud Messaging
  appId: "YOUR_APP_ID"                            // Project Settings > General
};
```

### 2. تفعيل Authentication في Firebase Console
1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختار مشروعك
3. روح لـ **Authentication** > **Sign-in method**
4. فعّل **Email/Password**

### 3. رفع قواعد الأمان
في **Realtime Database** > **Rules**، الصق الكود من `database.rules.json`:
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
    "reviews": {
      ".read": true,
      "$rid": { ".write": "auth != null" }
    },
    "bookings": {
      ".read": "auth != null",
      "$bid": { ".write": "auth != null" }
    },
    "messages": {
      ".read": "auth != null",
      "$mid": { ".write": "auth != null" }
    },
    "favorites": {
      ".read": "auth != null",
      "$fid": { ".write": "auth != null" }
    }
  }
}
```

### 4. ميزات جديدة تم إضافتها ✅

| الميزة | الوصف |
|--------|-------|
| 🔐 **Firebase Authentication** | تسجيل دخول حقيقي بإيميل وباسورد |
| 📧 **Email Verification** | إيميل تأكيد بعد التسجيل |
| 🔑 **Forgot Password** | استعادة كلمة المرور بالإيميل |
| 💪 **Password Strength Meter** | مؤشر قوة كلمة المرور |
| 🛡️ **XSS Protection** | تنظيف كل المدخلات والمخرجات |
| 🔒 **HTTPS Enforcement** | إجبار HTTPS في Production |
| ⏱️ **Rate Limiting** | حد 5 محاولات كل 15 دقيقة |
| 🚫 **No Plaintext Passwords** | Firebase Auth بيدير الباسوردات |
| 👤 **Auth Guards** | حماية الصفحات حسب الدور |
| 🧹 **Removed Demo Credentials** | شيلت البيانات التجريبية من الصفحة |

### 5. الملفات المُعدلة
- `database.rules.json` - قواعد أمان جديدة
- `db.js` - نظام مصادقة وقاعدة بيانات مُعاد كتابته
- `auth.html` - صفحة تسجيل دخول جديدة بالكامل
- `index.html` - تحديث مع auth state
- `dashboard.html` - حماية بالـ auth guard
- `admin.html` - حماية admin فقط
- `property.html` - حماية + XSS sanitization
- `add-property.html` - حماية owner/admin
- `favorites.html` - حماية + XSS sanitization
- `bookings.html` - حماية + XSS sanitization
- `chat.html` - حماية + XSS sanitization

### 6. ملاحظات
- لازم تسحب الملفات دي وتستبدل بيها الملفات القديمة في الـ repo
- شيل `dbSeeded_v2` من localStorage لو عايز تعيد seeding
- الـ demo users هيتعملوا تلقائياً مرة واحدة بس
