// ============================================
// DB - Database API Functions
// ============================================

// ===== DATABASE API =====
async function getAll(collection) {
  const snapshot = await db.ref(collection).get();
  const data = snapshot.val();
  return data ? Object.values(data) : [];
}

async function getById(collection, id) {
  const snapshot = await db.ref(collection + '/' + id).get();
  return snapshot.val();
}

async function add(collection, data) {
  const cleanData = sanitizeObject(data);
  const ref = data.id ? db.ref(collection + '/' + data.id) : db.ref(collection).push();
  await ref.set(cleanData);
  return Object.assign({}, cleanData, { id: ref.key || data.id });
}

async function put(collection, data) {
  const cleanData = sanitizeObject(data);
  await db.ref(collection + '/' + data.id).set(cleanData);
  return cleanData;
}

async function remove(collection, id) {
  await db.ref(collection + '/' + id).remove();
}

async function getByIndex(collection, field, value) {
  const all = await getAll(collection);
  return all.filter(item => item[field] === value);
}

// ===== SEARCH =====
async function searchProperties(filters) {
  filters = filters || {};
  let props = await getAll('properties');

  if (filters.status) {
    props = props.filter(function(p) { return p.status === filters.status; });
  }
  if (filters.type && filters.type !== 'all') {
    props = props.filter(function(p) { return p.type === filters.type; });
  }
  if (filters.location && filters.location !== 'all') {
    props = props.filter(function(p) {
      return (p.location && p.location.includes(filters.location)) || p.area === filters.location;
    });
  }
  if (filters.minPrice) {
    props = props.filter(function(p) { return p.price >= parseInt(filters.minPrice); });
  }
  if (filters.maxPrice) {
    props = props.filter(function(p) { return p.price <= parseInt(filters.maxPrice); });
  }
  if (filters.internet) {
    props = props.filter(function(p) { return p.internet; });
  }
  if (filters.furnished) {
    props = props.filter(function(p) { return p.furnished; });
  }
  if (filters.ac) {
    props = props.filter(function(p) { return p.ac; });
  }
  if (filters.search) {
    var t = filters.search.toLowerCase();
    props = props.filter(function(p) {
      return (p.title && p.title.toLowerCase().includes(t)) ||
             (p.description && p.description.toLowerCase().includes(t)) ||
             (p.location && p.location.toLowerCase().includes(t));
    });
  }

  if (filters.sort) {
    switch (filters.sort) {
      case 'price_asc':
        props.sort(function(a, b) { return a.price - b.price; });
        break;
      case 'price_desc':
        props.sort(function(a, b) { return b.price - a.price; });
        break;
      case 'rating':
        props.sort(function(a, b) { return b.rating - a.rating; });
        break;
      case 'newest':
        props.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        break;
      case 'views':
        props.sort(function(a, b) { return b.views - a.views; });
        break;
    }
  }

  return props;
}

// ===== HELPERS =====
async function getPropertyReviews(pid) {
  var all = await getAll('reviews');
  return all.filter(function(r) { return r.propertyId === pid; });
}

async function getUserFavorites(uid) {
  var all = await getAll('favorites');
  return all.filter(function(f) { return f.userId === uid; });
}

async function getUserBookings(uid) {
  var all = await getAll('bookings');
  return all.filter(function(b) { return b.userId === uid; });
}

async function getOwnerBookings(oid) {
  var all = await getAll('bookings');
  return all.filter(function(b) { return b.ownerId === oid; });
}

async function getChatMessages(cid) {
  var all = await getAll('messages');
  return all.filter(function(m) { return m.chatId === cid; })
            .sort(function(a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
}

async function getUserChats(uid) {
  var all = await getAll('messages');
  var map = new Map();
  all.forEach(function(msg) {
    if (msg.senderId === uid || msg.receiverId === uid) {
      if (!map.has(msg.chatId)) {
        map.set(msg.chatId, { chatId: msg.chatId, lastMessage: msg, unread: 0 });
      }
      if (msg.receiverId === uid && !msg.read) {
        map.get(msg.chatId).unread++;
      }
    }
  });
  return Array.from(map.values()).sort(function(a, b) {
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });
}

async function toggleFavorite(uid, pid) {
  var all = await getAll('favorites');
  var ex = all.find(function(f) { return f.userId === uid && f.propertyId === pid; });
  if (ex) {
    await remove('favorites', ex.id);
    return false;
  } else {
    await add('favorites', {
      id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId: uid,
      propertyId: pid,
      createdAt: new Date().toISOString()
    });
    return true;
  }
}

async function isFavorite(uid, pid) {
  var all = await getAll('favorites');
  return all.some(function(f) { return f.userId === uid && f.propertyId === pid; });
}

async function incrementPropertyViews(pid) {
  var p = await getById('properties', pid);
  if (p) {
    p.views = (p.views || 0) + 1;
    await put('properties', p);
  }
}

// ===== DEMO DATA =====
var AREAS = ['مدينة نصر','المعادي','الحي العاشر','مصر الجديدة','الدقي','المهندسين','القاهرة الجديدة','6 أكتوبر','الشيخ زايد','المقطم','العباسية','السيدة زينب','الإسكندرية - سموحة','الإسكندرية - العجمي','طنطا','المنصورة','الزقازيق','بنها','أسيوط','سوهاج'];
var TITLES = ['غرفة مفروشة للطلاب','شقة كاملة للإيجار','استوديو مودرن','غرفة مشتركة','سكن طلابي مميز','غرفة فردية','استوديو بانوراما','شقة مفروشة بالكامل','سكن مشترك','شقة جديدة'];
var DESCS = ['سكن هادئ ومريح قريب من الجامعة. يتوفر إنترنت عالي السرعة وتكييف.','شقة مجهزة بالكامل بأثاث حديث. قريبة من المترو والأسواق.','غرفة نظيفة في بيئة آمنة. مناسبة للطلاب الجادين.','استوديو أنيق بتصميم عصري. تشطيب سوبر لوكس.','سكن طلابي بخدمات ممتازة. صيانة دورية وأمن 24 ساعة.'];
var AMENITIES = [{id:'wifi',name:'واي فاي',icon:'fa-wifi'},{id:'ac',name:'تكييف',icon:'fa-snowflake'},{id:'fridge',name:'ثلاجة',icon:'fa-box'},{id:'washing',name:'غسالة',icon:'fa-soap'},{id:'tv',name:'تلفزيون',icon:'fa-tv'},{id:'kitchen',name:'مطبخ',icon:'fa-utensils'},{id:'parking',name:'جراج',icon:'fa-car'},{id:'security',name:'أمن',icon:'fa-shield-alt'},{id:'elevator',name:'مصعد',icon:'fa-arrow-up'},{id:'balcony',name:'بلكونة',icon:'fa-sun'}];
var OWNERS = ['أحمد محمد','محمد علي','خالد محمود','عمر حسن','يوسف إبراهيم','سارة أحمد','فاطمة محمود','نورا حسن','ليلى علي','مريم خالد','عبدالله سعيد','طارق فؤاد','سامي راغب','كريم وائل','هشام عادل','داليا محمد','رانيا أحمد','نهى محمود','عبير حسن','منى علي'];
var STUDENTS = ['محمد أحمد','علي حسن','أحمد سعيد','يوسف محمود','عمر خالد','سارة علي','نورا محمد','فاطمة أحمد','مريم حسن','ليلى سعيد','كريم علي','طارق محمود','سامي أحمد','هشام حسن','عبدالله محمد','داليا علي','رانيا سعيد','نهى أحمد','عبير محمود','منى حسن','وائل خالد','رامي فؤاد','حسن علي','محمود سعيد','إبراهيم أحمد'];

async function seedDatabase() {
  if (localStorage.getItem('dbSeeded_v2') === 'true') return;

  var existing = await getAll('properties');
  if (existing.length > 0) {
    localStorage.setItem('dbSeeded_v2', 'true');
    return;
  }

  // Seed Users
  for (var i = 1; i <= 20; i++) {
    var email = 'owner' + i + '@example.com';
    try {
      var cred = await auth.createUserWithEmailAndPassword(email, 'TempPass123!');
      await db.ref('users/' + cred.user.uid).set({
        uid: cred.user.uid,
        name: OWNERS[i-1],
        email: email,
        phone: '01' + String(Math.floor(Math.random()*1e9)).padStart(9,'0'),
        role: 'owner',
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(OWNERS[i-1]) + '&background=random',
        createdAt: new Date(Date.now()-Math.random()*31536000000).toISOString()
      });
    } catch (e) {
      // User might already exist
    }
  }

  for (var i = 1; i <= 50; i++) {
    var email = 'student' + i + '@example.com';
    try {
      var cred = await auth.createUserWithEmailAndPassword(email, 'TempPass123!');
      await db.ref('users/' + cred.user.uid).set({
        uid: cred.user.uid,
        name: STUDENTS[i-1] || STUDENTS[0],
        email: email,
        phone: '01' + String(Math.floor(Math.random()*1e9)).padStart(9,'0'),
        role: 'student',
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(STUDENTS[i-1] || STUDENTS[0]) + '&background=random',
        university: ['جامعة القاهرة','جامعة عين شمس','جامعة الإسكندرية','جامعة المنصورة','جامعة طنطا'][Math.floor(Math.random()*5)],
        createdAt: new Date(Date.now()-Math.random()*31536000000).toISOString()
      });
    } catch (e) {
      // User might already exist
    }
  }

  try {
    var cred = await auth.createUserWithEmailAndPassword('admin@myhousing.com', 'Admin@Secure123!');
    await db.ref('users/' + cred.user.uid).set({
      uid: cred.user.uid,
      name: 'المدير العام',
      email: 'admin@myhousing.com',
      phone: '01111111111',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc3545&color=fff',
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    // User might already exist
  }

  // Seed Properties
  var types = ['shared_room','private_room','studio','apartment'];
  var typeNames = {'shared_room':'غرفة مشتركة','private_room':'غرفة خاصة','studio':'استوديو','apartment':'شقة'};
  var users = await getAll('users');
  var owners = users.filter(function(u) { return u.role === 'owner'; });

  for (var i = 1; i <= 120; i++) {
    var type = types[Math.floor(Math.random()*4)];
    var area = AREAS[Math.floor(Math.random()*AREAS.length)];
    var title = TITLES[Math.floor(Math.random()*TITLES.length)];
    var price = type === 'shared_room' ? 1500+Math.floor(Math.random()*2000) : type === 'private_room' ? 2500+Math.floor(Math.random()*2500) : type === 'studio' ? 3500+Math.floor(Math.random()*3500) : 5000+Math.floor(Math.random()*10000);
    var shuf = AMENITIES.slice().sort(function() { return 0.5-Math.random(); });
    var am = shuf.slice(0, 3+Math.floor(Math.random()*6));
    var imgs = [];
    for (var j = 0; j < 3+Math.floor(Math.random()*4); j++) {
      imgs.push('https://picsum.photos/seed/prop' + i + 'img' + j + '/800/600');
    }
    var owner = owners[Math.floor(Math.random()*owners.length)] || { uid: 'unknown', name: OWNERS[0], phone: '', avatar: '' };

    await add('properties', {
      id: 'prop_' + i,
      title: title + ' - ' + area,
      type: type,
      typeName: typeNames[type],
      price: price,
      location: area,
      area: area,
      address: 'شارع ' + (Math.floor(Math.random()*200)+1) + '، ' + area,
      rooms: type === 'apartment' ? 2+Math.floor(Math.random()*3) : 1,
      studentsPerRoom: type === 'shared_room' ? 2+Math.floor(Math.random()*3) : 1,
      internet: am.some(function(a) { return a.id === 'wifi'; }),
      furnished: Math.random() > 0.3,
      ac: am.some(function(a) { return a.id === 'ac'; }),
      images: imgs,
      ownerId: owner.uid,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerAvatar: owner.avatar,
      rating: parseFloat((3+Math.random()*2).toFixed(1)),
      reviewsCount: Math.floor(Math.random()*30),
      description: DESCS[Math.floor(Math.random()*DESCS.length)],
      amenities: am,
      availableFrom: new Date(Date.now()+Math.random()*2592000000).toISOString().split('T')[0],
      availableTo: new Date(Date.now()+31536000000+Math.random()*31536000000).toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'active' : 'pending',
      createdAt: new Date(Date.now()-Math.random()*15552000000).toISOString(),
      views: Math.floor(Math.random()*500),
      coordinates: { lat: 30+Math.random()*2, lng: 31+Math.random()*2 }
    });
  }

  // Seed Reviews
  var rid = 1;
  var props = await getAll('properties');
  var studs = users.filter(function(u) { return u.role === 'student'; });
  for (var pi = 0; pi < props.length; pi++) {
    var p = props[pi];
    for (var j = 0; j < Math.floor(Math.random()*8); j++) {
      var s = studs[Math.floor(Math.random()*studs.length)];
      if (s) {
        await add('reviews', {
          id: 'rev_' + (rid++),
          propertyId: p.id,
          userId: s.uid,
          userName: s.name,
          userAvatar: s.avatar,
          rating: Math.floor(Math.random()*3)+3,
          comment: ['ممتاز','جيد جداً','مكان نظيف','خدمة رائعة','أنصح به','سعر مناسب','موقع ممتاز'][Math.floor(Math.random()*7)],
          createdAt: new Date(Date.now()-Math.random()*7776000000).toISOString()
        });
      }
    }
  }

  // Seed Bookings
  var bid = 1;
  for (var i = 0; i < 80; i++) {
    var s = studs[Math.floor(Math.random()*studs.length)];
    var p = props[Math.floor(Math.random()*props.length)];
    if (s && p) {
      await add('bookings', {
        id: 'book_' + (bid++),
        propertyId: p.id,
        propertyTitle: p.title,
        userId: s.uid,
        userName: s.name,
        ownerId: p.ownerId,
        status: ['pending','approved','rejected','cancelled'][Math.floor(Math.random()*4)],
        startDate: new Date(Date.now()+Math.random()*2592000000).toISOString().split('T')[0],
        endDate: new Date(Date.now()+15552000000+Math.random()*15552000000).toISOString().split('T')[0],
        price: p.price,
        createdAt: new Date(Date.now()-Math.random()*7776000000).toISOString()
      });
    }
  }

  // Seed Messages
  var mid = 1;
  var owners2 = users.filter(function(u) { return u.role === 'owner'; });
  for (var i = 0; i < 150; i++) {
    var s = studs[Math.floor(Math.random()*studs.length)];
    var o = owners2[Math.floor(Math.random()*owners2.length)];
    if (s && o) {
      var cid = [s.uid, o.uid].sort().join('_');
      var fromS = Math.random() > 0.5;
      await add('messages', {
        id: 'msg_' + (mid++),
        chatId: cid,
        senderId: fromS ? s.uid : o.uid,
        senderName: fromS ? s.name : o.name,
        senderAvatar: fromS ? s.avatar : o.avatar,
        receiverId: fromS ? o.uid : s.uid,
        content: ['مرحباً، هل العقار متاح؟','نعم متاح. متى تريد المعاينة؟','هل يمكن خفض السعر؟','السعر قابل للتفاوض.','هل يوجد إنترنت؟','نعم إنترنت فايبر.','أريد حجز الغرفة.','ممتاز، سأرسل لك العقد.','هل يوجد موقف سيارات؟','نعم جراج متاح.','شكراً لك!','العفو، في خدمتك.'][Math.floor(Math.random()*12)],
        createdAt: new Date(Date.now()-Math.random()*7776000000).toISOString(),
        read: Math.random() > 0.3
      });
    }
  }

  // Seed Favorites
  var fid = 1;
  for (var i = 0; i < 200; i++) {
    var s = studs[Math.floor(Math.random()*studs.length)];
    var p = props[Math.floor(Math.random()*props.length)];
    if (s && p) {
      var ex = await getAll('favorites');
      if (!ex.some(function(f) { return f.userId === s.uid && f.propertyId === p.id; })) {
        await add('favorites', { id: 'fav_' + (fid++), userId: s.uid, propertyId: p.id, createdAt: new Date(Date.now()-Math.random()*7776000000).toISOString() });
      }
    }
  }

  localStorage.setItem('dbSeeded_v2', 'true');
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async function() {
  try {
    await seedDatabase();
  } catch (e) {
    console.error('Seed error:', e);
  }
});
