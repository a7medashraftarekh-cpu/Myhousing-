// ============================================
// AUTH - Authentication Functions
// ============================================

async function registerUser(email, password, userData) {
  checkRateLimit('register');

  const strength = checkPasswordStrength(password);
  if (strength.score < 3) {
    throw new Error('كلمة المرور ضعيفة. لازم تكون 8 أحرف على الأقل وتحتوي على أحرف وأرقام ورموز.');
  }

  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const user = cred.user;

  await user.sendEmailVerification();

  const userRecord = {
    uid: user.uid,
    email: escapeHtml(email),
    name: escapeHtml(userData.name || ''),
    phone: escapeHtml(userData.phone || ''),
    role: userData.role || 'student',
    avatar: userData.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'User') + '&background=random',
    university: escapeHtml(userData.university || ''),
    createdAt: new Date().toISOString(),
    emailVerified: false,
    lastLogin: new Date().toISOString()
  };

  await db.ref('users/' + user.uid).set(userRecord);
  resetRateLimit('register');
  return { user, userRecord };
}

async function loginUser(email, password) {
  checkRateLimit('login');

  const cred = await auth.signInWithEmailAndPassword(email, password);
  const user = cred.user;

  if (!user.emailVerified) {
    await auth.signOut();
    throw new Error('لازم تفعّل الإيميل الأول. اتفقد inbox بتاعك واضغط على لينك التفعيل.');
  }

  const snapshot = await db.ref('users/' + user.uid).get();
  const userData = snapshot.val() || {};

  await db.ref('users/' + user.uid + '/emailVerified').set(true);
  await db.ref('users/' + user.uid + '/lastLogin').set(new Date().toISOString());

  resetRateLimit('login');
  return { user, userData };
}

async function logoutUser() {
  await auth.signOut();
  window.location.href = 'index.html';
}

async function resetPassword(email) {
  checkRateLimit('resetPassword', 3, 60 * 60 * 1000);
  await auth.sendPasswordResetEmail(email);
  resetRateLimit('resetPassword');
}

async function changePassword(newPassword) {
  const strength = checkPasswordStrength(newPassword);
  if (strength.score < 3) {
    throw new Error('كلمة المرور الجديدة ضعيفة.');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('مش مسجل دخول.');
  await user.updatePassword(newPassword);
}

function getCurrentUser() {
  return auth.currentUser;
}

function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

// ===== AUTH GUARDS =====
function requireAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      if (user) resolve(user);
      else {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = 'auth.html?redirect=' + redirect;
        reject(new Error('مش مسجل دخول'));
      }
    });
  });
}

async function requireAdmin() {
  const user = await requireAuth();
  const snapshot = await db.ref('users/' + user.uid + '/role').get();
  if (snapshot.val() !== 'admin') {
    window.location.href = 'index.html';
    throw new Error('مش مسموح. لازم تكون أدمن.');
  }
  return user;
}

async function requireOwner() {
  const user = await requireAuth();
  const snapshot = await db.ref('users/' + user.uid + '/role').get();
  const role = snapshot.val();
  if (role !== 'owner' && role !== 'admin') {
    window.location.href = 'index.html';
    throw new Error('مش مسموح. لازم تكون مالك عقار.');
  }
  return user;
}

async function requireOwnerOrAdmin() {
  const user = await requireAuth();
  const snapshot = await db.ref('users/' + user.uid + '/role').get();
  const role = snapshot.val();
  if (role !== 'owner' && role !== 'admin') {
    window.location.href = 'index.html';
    throw new Error('مش مسموح.');
  }
  return user;
}
