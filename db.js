
const FIREBASE_URL = 'https://a7medashraf-25193-default-rtdb.firebaseio.com';

// Firebase REST helpers
async function firebaseGet(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.error('Firebase GET error:', e);
    return null;
  }
}

async function firebasePut(path, data) {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Firebase PUT error:', e);
  }
}

async function firebaseDelete(path) {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'DELETE' });
  } catch (e) {
    console.error('Firebase DELETE error:', e);
  }
}

// DB Operations
async function getAll(collection) {
  const data = await firebaseGet(collection);
  return data ? Object.values(data) : [];
}

async function getById(collection, id) {
  return await firebaseGet(`${collection}/${id}`);
}

async function add(collection, data) {
  await firebasePut(`${collection}/${data.id}`, data);
}

async function put(collection, data) {
  await firebasePut(`${collection}/${data.id}`, data);
}

async function remove(collection, id) {
  await firebaseDelete(`${collection}/${id}`);
}

async function getByIndex(collection, field, value) {
  const all = await getAll(collection);
  return all.filter(item => item[field] === value);
}

// Demo Data Generators
const AREAS = [
  'مدينة نصر', 'المعادي', 'الحي العاشر', 'مصر الجديدة', 'الدقي', 'المهندسين',
  'القاهرة الجديدة', '6 أكتوبر', 'الشيخ زايد', 'المقطم', 'العباسية', 'السيدة زينب',
  'الإسكندرية - سموحة', 'الإسكندرية - العجمي', 'الإسكندرية - جليم', 'طنطا',
  'المنصورة', 'الزقازيق', 'بنها', 'الفيوم', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر'
];

const TITLES = [
  'غرفة مفروشة للطلاب', 'شقة كاملة للإيجار', 'استوديو مودرن', 'غرفة مشتركة',
  'سكن طلابي مميز', 'شقة عائلية', 'غرفة فردية', 'استوديو بانوراما',
  'شقة مفروشة بالكامل', 'غرفة في فيلا', 'سكن مشترك', 'شقة جديدة',
  'استوديو اقتصادي', 'غرفة ماستر', 'شقة فاخرة', 'سكن طلابي هادئ',
  'غرفة بإطلالة', 'شقة قريبة من الجامعة', 'استوديو ديلوكس', 'غرفة مكيفة'
];

const DESCRIPTIONS = [
  'سكن هادئ ومريح قريب من الجامعة والمواصلات. يتوفر إنترنت عالي السرعة وتكييف.',
  'شقة مجهزة بالكامل بأثاث حديث. قريبة من المترو والأسواق.',
  'غرفة نظيفة في بيئة آمنة. مناسبة للطلاب الجادين.',
  'استوديو أنيق بتصميم عصري. تشطيب سوبر لوكس.',
  'سكن طلابي بخدمات ممتازة. صيانة دورية وأمن 24 ساعة.',
  'غرفة واسعة بإطلالة رائعة. قريبة من المكتبات والمقاهي.',
  'شقة عائلية في حي راقي. مناسبة للعائلات الصغيرة.',
  'استوديو اقتصادي بسعر ممتاز. كل الخدمات متوفرة.',
  'سكن مشترك مع طلاب محترمين. بيئة دراسية مثالية.',
  'غرفة فاخرة في عمارة حديثة. مصعد وجراج متاح.'
];

const AMENITIES_LIST = [
  {id: 'wifi', name: 'واي فاي', icon: 'fa-wifi'},
  {id: 'ac', name: 'تكييف', icon: 'fa-snowflake'},
  {id: 'fridge', name: 'ثلاجة', icon: 'fa-box'},
  {id: 'washing', name: 'غسالة', icon: 'fa-soap'},
  {id: 'tv', name: 'تلفزيون', icon: 'fa-tv'},
  {id: 'kitchen', name: 'مطبخ', icon: 'fa-utensils'},
  {id: 'parking', name: 'جراج', icon: 'fa-car'},
  {id: 'security', name: 'أمن', icon: 'fa-shield-alt'},
  {id: 'elevator', name: 'مصعد', icon: 'fa-arrow-up'},
  {id: 'gym', name: 'جيم', icon: 'fa-dumbbell'},
  {id: 'pool', name: 'حمام سباحة', icon: 'fa-swimming-pool'},
  {id: 'balcony', name: 'بلكونة', icon: 'fa-sun'}
];

const OWNER_NAMES = [
  'أحمد محمد', 'محمد علي', 'خالد محمود', 'عمر حسن', 'يوسف إبراهيم',
  'سارة أحمد', 'فاطمة محمود', 'نورا حسن', 'ليلى علي', 'مريم خالد',
  'عبدالله سعيد', 'طارق فؤاد', 'سامي راغب', 'كريم وائل', 'هشام عادل',
  'داليا محمد', 'رانيا أحمد', 'نهى محمود', 'عبير حسن', 'منى علي'
];

const STUDENT_NAMES = [
  'محمد أحمد', 'علي حسن', 'أحمد سعيد', 'يوسف محمود', 'عمر خالد',
  'سارة علي', 'نورا محمد', 'فاطمة أحمد', 'مريم حسن', 'ليلى سعيد',
  'كريم علي', 'طارق محمود', 'سامي أحمد', 'هشام حسن', 'عبدالله محمد',
  'داليا علي', 'رانيا سعيد', 'نهى أحمد', 'عبير محمود', 'منى حسن',
  'وائل خالد', 'رامي فؤاد', 'حسن علي', 'محمود سعيد', 'إبراهيم أحمد'
];

async function seedDatabase() {
  const existing = await getAll('properties');
  if (existing.length > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  // Seed Users
  const owners = [];
  for (let i = 1; i <= 20; i++) {
    const o = {
      id: `owner_${i}`,
      name: OWNER_NAMES[i - 1],
      email: `owner${i}@example.com`,
      phone: `01${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
      password: 'password123',
      role: 'owner',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(OWNER_NAMES[i-1])}&background=random`,
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    };
    owners.push(o);
    await add('users', o);
  }

  const students = [];
  for (let i = 1; i <= 50; i++) {
    const s = {
      id: `student_${i}`,
      name: STUDENT_NAMES[i - 1] || STUDENT_NAMES[0],
      email: `student${i}@example.com`,
      phone: `01${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
      password: 'password123',
      role: 'student',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(STUDENT_NAMES[i-1] || STUDENT_NAMES[0])}&background=random`,
      university: ['جامعة القاهرة', 'جامعة عين شمس', 'جامعة الإسكندرية', 'جامعة المنصورة', 'جامعة طنطا'][Math.floor(Math.random() * 5)],
      createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString()
    };
    students.push(s);
    await add('users', s);
  }

  await add('users', {
    id: 'admin_1',
    name: 'المدير العام',
    email: 'admin@myhousing.com',
    phone: '01111111111',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc3545&color=fff',
    createdAt: new Date().toISOString()
  });

  // Seed Properties
  const types = ['shared_room', 'private_room', 'studio', 'apartment'];
  const typeNames = {'shared_room': 'غرفة مشتركة', 'private_room': 'غرفة خاصة', 'studio': 'استوديو', 'apartment': 'شقة'};

  for (let i = 1; i <= 120; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const area = AREAS[Math.floor(Math.random() * AREAS.length)];
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const price = type === 'shared_room' ? 1500 + Math.floor(Math.random() * 2000) :
                  type === 'private_room' ? 2500 + Math.floor(Math.random() * 2500) :
                  type === 'studio' ? 3500 + Math.floor(Math.random() * 3500) :
                  5000 + Math.floor(Math.random() * 10000);

    const numAmenities = 3 + Math.floor(Math.random() * 6);
    const shuffled = [...AMENITIES_LIST].sort(() => 0.5 - Math.random());
    const amenities = shuffled.slice(0, numAmenities);

    const numImages = 3 + Math.floor(Math.random() * 4);
    const images = [];
    for (let j = 0; j < numImages; j++) {
      images.push(`https://picsum.photos/seed/prop${i}img${j}/800/600`);
    }

    const owner = owners[Math.floor(Math.random() * owners.length)];
    const rating = (3 + Math.random() * 2).toFixed(1);
    const reviewsCount = Math.floor(Math.random() * 30);

    await add('properties', {
      id: `prop_${i}`,
      title: `${title} - ${area}`,
      type: type,
      typeName: typeNames[type],
      price: price,
      location: area,
      area: area,
      address: `شارع ${Math.floor(Math.random() * 200) + 1}، ${area}`,
      rooms: type === 'apartment' ? 2 + Math.floor(Math.random() * 3) : 1,
      studentsPerRoom: type === 'shared_room' ? 2 + Math.floor(Math.random() * 3) : 1,
      internet: amenities.some(a => a.id === 'wifi'),
      furnished: Math.random() > 0.3,
      ac: amenities.some(a => a.id === 'ac'),
      images: images,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerAvatar: owner.avatar,
      rating: parseFloat(rating),
      reviewsCount: reviewsCount,
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      amenities: amenities,
      availableFrom: new Date(Date.now() + Math.random() * 2592000000).toISOString().split('T')[0],
      availableTo: new Date(Date.now() + 31536000000 + Math.random() * 31536000000).toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'active' : 'pending',
      createdAt: new Date(Date.now() - Math.random() * 15552000000).toISOString(),
      views: Math.floor(Math.random() * 500),
      coordinates: {lat: 30.0 + Math.random() * 2, lng: 31.0 + Math.random() * 2}
    });
  }

  // Seed Reviews
  let reviewId = 1;
  const allProps = await getAll('properties');
  for (const prop of allProps) {
    const numReviews = prop.reviewsCount;
    for (let j = 0; j < numReviews; j++) {
      const student = students[Math.floor(Math.random() * students.length)];
      await add('reviews', {
        id: `review_${reviewId++}`,
        propertyId: prop.id,
        userId: student.id,
        userName: student.name,
        userAvatar: student.avatar,
        rating: Math.floor(3 + Math.random() * 3),
        comment: [
          'مكان رائع ونظيف جداً، أنصح به بشدة!',
          'سعر ممتاز مقارنة بالخدمات المقدمة.',
          'الموقع ممتاز قريب من الجامعة.',
          'المالك محترم جداً والتعامل معه سهل.',
          'الإنترنت سريع والغرفة مكيفة.',
          'بيئة هادئة مناسبة للمذاكرة.',
          'الصور مطابقة للواقع تماماً.',
          'ممتاز بس ياريت يتحسن النظافة.',
          'أفضل سكن جربته في حياتي!',
          'قريب من المترو والمواصلات.'
        ][Math.floor(Math.random() * 10)],
        createdAt: new Date(Date.now() - Math.random() * 15552000000).toISOString()
      });
    }
  }

  // Seed Bookings
  let bookingId = 1;
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  for (let i = 0; i < 80; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const prop = allProps[Math.floor(Math.random() * allProps.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    await add('bookings', {
      id: `booking_${bookingId++}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyImage: prop.images[0],
      userId: student.id,
      userName: student.name,
      userPhone: student.phone,
      ownerId: prop.ownerId,
      ownerName: prop.ownerName,
      status: status,
      startDate: new Date(Date.now() + Math.random() * 2592000000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15768000000 + Math.random() * 15768000000).toISOString().split('T')[0],
      totalPrice: prop.price * 6,
      message: 'أرغب في حجز هذا السكن. يرجى التواصل معي.',
      createdAt: new Date(Date.now() - Math.random() * 7776000000).toISOString()
    });
  }

  // Seed Messages
  let msgId = 1;
  for (let i = 0; i < 150; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const chatId = [student.id, owner.id].sort().join('_');
    const isFromStudent = Math.random() > 0.5;
    await add('messages', {
      id: `msg_${msgId++}`,
      chatId: chatId,
      senderId: isFromStudent ? student.id : owner.id,
      senderName: isFromStudent ? student.name : owner.name,
      senderAvatar: isFromStudent ? student.avatar : owner.avatar,
      receiverId: isFromStudent ? owner.id : student.id,
      content: [
        'مرحباً، هل العقار متاح؟',
        'نعم متاح. متى تريد المعاينة؟',
        'هل يمكن خفض السعر قليلاً؟',
        'السعر قابل للتفاوض.',
        'هل يوجد إنترنت؟',
        'نعم إنترنت فايبر.',
        'أريد حجز الغرفة.',
        'ممتاز، سأرسل لك العقد.',
        'هل يوجد موقف سيارات؟',
        'نعم جراج متاح.',
        'شكراً لك!',
        'العفو، في خدمتك.'
      ][Math.floor(Math.random() * 12)],
      createdAt: new Date(Date.now() - Math.random() * 7776000000).toISOString(),
      read: Math.random() > 0.3
    });
  }

  // Seed Favorites
  let favId = 1;
  for (let i = 0; i < 200; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const prop = allProps[Math.floor(Math.random() * allProps.length)];
    const existing = await getAll('favorites');
    const alreadyExists = existing.some(f => f.userId === student.id && f.propertyId === prop.id);
    if (!alreadyExists) {
      await add('favorites', {
        id: `fav_${favId++}`,
        userId: student.id,
        propertyId: prop.id,
        createdAt: new Date(Date.now() - Math.random() * 7776000000).toISOString()
      });
    }
  }

  console.log('Database seeded successfully!');
}

// Search Properties
async function searchProperties(filters = {}) {
  let properties = await getAll('properties');

  if (filters.status) {
    properties = properties.filter(p => p.status === filters.status);
  }
  if (filters.type && filters.type !== 'all') {
    properties = properties.filter(p => p.type === filters.type);
  }
  if (filters.location && filters.location !== 'all') {
    properties = properties.filter(p => p.location.includes(filters.location) || p.area === filters.location);
  }
  if (filters.minPrice) {
    properties = properties.filter(p => p.price >= parseInt(filters.minPrice));
  }
  if (filters.maxPrice) {
    properties = properties.filter(p => p.price <= parseInt(filters.maxPrice));
  }
  if (filters.internet) {
    properties = properties.filter(p => p.internet);
  }
  if (filters.furnished) {
    properties = properties.filter(p => p.furnished);
  }
  if (filters.ac) {
    properties = properties.filter(p => p.ac);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    properties = properties.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term)
    );
  }
  if (filters.sort) {
    switch(filters.sort) {
      case 'price_asc': properties.sort((a, b) => a.price - b.price); break;
      case 'price_desc': properties.sort((a, b) => b.price - a.price); break;
      case 'rating': properties.sort((a, b) => b.rating - a.rating); break;
      case 'newest': properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'views': properties.sort((a, b) => b.views - a.views); break;
    }
  }

  return properties;
}

// Helpers
async function getPropertyReviews(propertyId) {
  const all = await getAll('reviews');
  return all.filter(r => r.propertyId === propertyId);
}

async function getUserFavorites(userId) {
  const all = await getAll('favorites');
  return all.filter(f => f.userId === userId);
}

async function getUserBookings(userId) {
  const all = await getAll('bookings');
  return all.filter(b => b.userId === userId);
}

async function getOwnerBookings(ownerId) {
  const all = await getAll('bookings');
  return all.filter(b => b.ownerId === ownerId);
}

async function getChatMessages(chatId) {
  const all = await getAll('messages');
  return all.filter(m => m.chatId === chatId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function getUserChats(userId) {
  const allMessages = await getAll('messages');
  const chatMap = new Map();

  allMessages.forEach(msg => {
    if (msg.senderId === userId || msg.receiverId === userId) {
      if (!chatMap.has(msg.chatId)) {
        chatMap.set(msg.chatId, {
          chatId: msg.chatId,
          lastMessage: msg,
          unread: 0
        });
      }
      if (msg.receiverId === userId && !msg.read) {
        chatMap.get(msg.chatId).unread++;
      }
    }
  });

  return Array.from(chatMap.values()).sort((a, b) =>
    new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );
}

async function toggleFavorite(userId, propertyId) {
  const favorites = await getAll('favorites');
  const existing = favorites.find(f => f.userId === userId && f.propertyId === propertyId);

  if (existing) {
    await remove('favorites', existing.id);
    return false;
  } else {
    await add('favorites', {
      id: `fav_${Date.now()}`,
      userId: userId,
      propertyId: propertyId,
      createdAt: new Date().toISOString()
    });
    return true;
  }
}

async function isFavorite(userId, propertyId) {
  const favorites = await getAll('favorites');
  return favorites.some(f => f.userId === userId && f.propertyId === propertyId);
}

async function authenticateUser(email, password) {
  const users = await getAll('users');
  return users.find(u => u.email === email && u.password === password) || null;
}

async function registerUser(userData) {
  const users = await getAll('users');
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email already exists');
  }
  await add('users', userData);
  return userData;
}

async function incrementPropertyViews(propertyId) {
  const prop = await getById('properties', propertyId);
  if (prop) {
    prop.views = (prop.views || 0) + 1;
    await put('properties', prop);
  }
}

// Auth helpers
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  await seedDatabase();
});
