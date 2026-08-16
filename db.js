
// ===== CONFIG =====
const FIREBASE_URL = 'https://a7medashraftarekh-25193-default-rtdb.firebaseio.com';
let useFirebase = true;

// ===== IndexedDB (Local Fallback) =====
const DB_NAME = 'MyHousingDB';
const DB_VERSION = 1;
let localDB = null;

function initLocalDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => { localDB = request.result; resolve(localDB); };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      ['properties','users','reviews','bookings','messages','favorites'].forEach(store => {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, {keyPath: 'id'});
      });
    };
  });
}

function localGetAll(store) {
  return new Promise((resolve) => {
    if (!localDB) { resolve([]); return; }
    const tx = localDB.transaction(store, 'readonly');
    tx.objectStore(store).getAll().onsuccess = (e) => resolve(e.target.result);
  });
}

function localPut(store, data) {
  return new Promise((resolve) => {
    if (!localDB) { resolve(); return; }
    const tx = localDB.transaction(store, 'readwrite');
    tx.objectStore(store).put(data).onsuccess = () => resolve();
  });
}

function localDelete(store, id) {
  return new Promise((resolve) => {
    if (!localDB) { resolve(); return; }
    const tx = localDB.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id).onsuccess = () => resolve();
  });
}

// ===== Firebase =====
async function firebaseGet(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    if (!res.ok) { useFirebase = false; return null; }
    return await res.json();
  } catch (e) { useFirebase = false; return null; }
}

async function firebasePut(path, data) {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
    });
  } catch (e) { useFirebase = false; }
}

async function firebaseDelete(path) {
  try { await fetch(`${FIREBASE_URL}/${path}.json`, {method:'DELETE'}); }
  catch (e) { useFirebase = false; }
}

// ===== Unified DB API =====
async function getAll(collection) {
  if (useFirebase) {
    const data = await firebaseGet(collection);
    if (data) {
      const arr = Object.values(data);
      // Sync to local
      for (const item of arr) await localPut(collection, item);
      return arr;
    }
  }
  return await localGetAll(collection);
}

async function getById(collection, id) {
  if (useFirebase) {
    const data = await firebaseGet(`${collection}/${id}`);
    if (data) return data;
  }
  const all = await localGetAll(collection);
  return all.find(x => x.id === id) || null;
}

async function add(collection, data) {
  if (useFirebase) await firebasePut(`${collection}/${data.id}`, data);
  await localPut(collection, data);
}

async function put(collection, data) {
  if (useFirebase) await firebasePut(`${collection}/${data.id}`, data);
  await localPut(collection, data);
}

async function remove(collection, id) {
  if (useFirebase) await firebaseDelete(`${collection}/${id}`);
  await localDelete(collection, id);
}

async function getByIndex(collection, field, value) {
  const all = await getAll(collection);
  return all.filter(item => item[field] === value);
}

// ===== DEMO DATA =====
const AREAS = ['مدينة نصر','المعادي','الحي العاشر','مصر الجديدة','الدقي','المهندسين','القاهرة الجديدة','6 أكتوبر','الشيخ زايد','المقطم','العباسية','السيدة زينب','الإسكندرية - سموحة','الإسكندرية - العجمي','طنطا','المنصورة','الزقازيق','بنها','أسيوط','سوهاج'];
const TITLES = ['غرفة مفروشة للطلاب','شقة كاملة للإيجار','استوديو مودرن','غرفة مشتركة','سكن طلابي مميز','غرفة فردية','استوديو بانوراما','شقة مفروشة بالكامل','سكن مشترك','شقة جديدة'];
const DESCS = ['سكن هادئ ومريح قريب من الجامعة. يتوفر إنترنت عالي السرعة وتكييف.','شقة مجهزة بالكامل بأثاث حديث. قريبة من المترو والأسواق.','غرفة نظيفة في بيئة آمنة. مناسبة للطلاب الجادين.','استوديو أنيق بتصميم عصري. تشطيب سوبر لوكس.','سكن طلابي بخدمات ممتازة. صيانة دورية وأمن 24 ساعة.'];
const AMENITIES = [{id:'wifi',name:'واي فاي',icon:'fa-wifi'},{id:'ac',name:'تكييف',icon:'fa-snowflake'},{id:'fridge',name:'ثلاجة',icon:'fa-box'},{id:'washing',name:'غسالة',icon:'fa-soap'},{id:'tv',name:'تلفزيون',icon:'fa-tv'},{id:'kitchen',name:'مطبخ',icon:'fa-utensils'},{id:'parking',name:'جراج',icon:'fa-car'},{id:'security',name:'أمن',icon:'fa-shield-alt'},{id:'elevator',name:'مصعد',icon:'fa-arrow-up'},{id:'balcony',name:'بلكونة',icon:'fa-sun'}];
const OWNERS = ['أحمد محمد','محمد علي','خالد محمود','عمر حسن','يوسف إبراهيم','سارة أحمد','فاطمة محمود','نورا حسن','ليلى علي','مريم خالد','عبدالله سعيد','طارق فؤاد','سامي راغب','كريم وائل','هشام عادل','داليا محمد','رانيا أحمد','نهى محمود','عبير حسن','منى علي'];
const STUDENTS = ['محمد أحمد','علي حسن','أحمد سعيد','يوسف محمود','عمر خالد','سارة علي','نورا محمد','فاطمة أحمد','مريم حسن','ليلى سعيد','كريم علي','طارق محمود','سامي أحمد','هشام حسن','عبدالله محمد','داليا علي','رانيا سعيد','نهى أحمد','عبير محمود','منى حسن','وائل خالد','رامي فؤاد','حسن علي','محمود سعيد','إبراهيم أحمد'];

async function seedDatabase() {
  await initLocalDB();
  const existing = await getAll('properties');
  if (existing.length > 0) return;

  // Seed Users
  for (let i=1; i<=20; i++) await add('users',{id:`owner_${i}`,name:OWNERS[i-1],email:`owner${i}@example.com`,phone:`01${String(Math.floor(Math.random()*1e9)).padStart(9,'0')}`,password:'password123',role:'owner',avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(OWNERS[i-1])}&background=random`,createdAt:new Date(Date.now()-Math.random()*31536000000).toISOString()});
  for (let i=1; i<=50; i++) await add('users',{id:`student_${i}`,name:STUDENTS[i-1]||STUDENTS[0],email:`student${i}@example.com`,phone:`01${String(Math.floor(Math.random()*1e9)).padStart(9,'0')}`,password:'password123',role:'student',avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(STUDENTS[i-1]||STUDENTS[0])}&background=random`,university:['جامعة القاهرة','جامعة عين شمس','جامعة الإسكندرية','جامعة المنصورة','جامعة طنطا'][Math.floor(Math.random()*5)],createdAt:new Date(Date.now()-Math.random()*31536000000).toISOString()});
  await add('users',{id:'admin_1',name:'المدير العام',email:'admin@myhousing.com',phone:'01111111111',password:'admin123',role:'admin',avatar:'https://ui-avatars.com/api/?name=Admin&background=dc3545&color=fff',createdAt:new Date().toISOString()});

  // Seed Properties
  const types=['shared_room','private_room','studio','apartment'];
  const typeNames={'shared_room':'غرفة مشتركة','private_room':'غرفة خاصة','studio':'استوديو','apartment':'شقة'};
  for (let i=1; i<=120; i++) {
    const type=types[Math.floor(Math.random()*4)];
    const area=AREAS[Math.floor(Math.random()*AREAS.length)];
    const title=TITLES[Math.floor(Math.random()*TITLES.length)];
    const price=type==='shared_room'?1500+Math.floor(Math.random()*2000):type==='private_room'?2500+Math.floor(Math.random()*2500):type==='studio'?3500+Math.floor(Math.random()*3500):5000+Math.floor(Math.random()*10000);
    const shuf=[...AMENITIES].sort(()=>0.5-Math.random());
    const am=shuf.slice(0,3+Math.floor(Math.random()*6));
    const imgs=[]; for(let j=0;j<3+Math.floor(Math.random()*4);j++) imgs.push(`https://picsum.photos/seed/prop${i}img${j}/800/600`);
    const ownerId=`owner_${Math.floor(Math.random()*20)+1}`;
    const owner=await getById('users',ownerId);
    await add('properties',{id:`prop_${i}`,title:`${title} - ${area}`,type,typeName:typeNames[type],price,location:area,area,address:`شارع ${Math.floor(Math.random()*200)+1}، ${area}`,rooms:type==='apartment'?2+Math.floor(Math.random()*3):1,studentsPerRoom:type==='shared_room'?2+Math.floor(Math.random()*3):1,internet:am.some(a=>a.id==='wifi'),furnished:Math.random()>0.3,ac:am.some(a=>a.id==='ac'),images:imgs,ownerId,ownerName:owner?owner.name:OWNERS[0],ownerPhone:owner?owner.phone:'',ownerAvatar:owner?owner.avatar:'',rating:parseFloat((3+Math.random()*2).toFixed(1)),reviewsCount:Math.floor(Math.random()*30),description:DESCS[Math.floor(Math.random()*DESCS.length)],amenities:am,availableFrom:new Date(Date.now()+Math.random()*2592000000).toISOString().split('T')[0],availableTo:new Date(Date.now()+31536000000+Math.random()*31536000000).toISOString().split('T')[0],status:Math.random()>0.1?'active':'pending',createdAt:new Date(Date.now()-Math.random()*15552000000).toISOString(),views:Math.floor(Math.random()*500),coordinates:{lat:30+Math.random()*2,lng:31+Math.random()*2}});
  }

  // Seed Reviews
  let rid=1; const props=await getAll('properties'); const studs=await getAll('users'); const students2=studs.filter(u=>u.role==='student');
  for(const p of props){for(let j=0;j<p.reviewsCount;j++){const s=students2[Math.floor(Math.random()*students2.length)]; await add('reviews',{id:`review_${rid++}`,propertyId:p.id,userId:s.id,userName:s.name,userAvatar:s.avatar,rating:Math.floor(3+Math.random()*3),comment:['مكان رائع ونظيف جداً!','سعر ممتاز مقارنة بالخدمات.','الموقع ممتاز قريب من الجامعة.','المالك محترم جداً.','الإنترنت سريع والغرفة مكيفة.','بيئة هادئة مناسبة للمذاكرة.','الصور مطابقة للواقع.','أفضل سكن جربته!','قريب من المترو.'][Math.floor(Math.random()*9)],createdAt:new Date(Date.now()-Math.random()*15552000000).toISOString()});}}

  // Seed Bookings
  let bid=1; const statuses=['pending','confirmed','cancelled','completed']; const allProps=await getAll('properties');
  for(let i=0;i<80;i++){const s=students2[Math.floor(Math.random()*students2.length)]; const p=allProps[Math.floor(Math.random()*allProps.length)]; await add('bookings',{id:`booking_${bid++}`,propertyId:p.id,propertyTitle:p.title,propertyImage:p.images[0],userId:s.id,userName:s.name,userPhone:s.phone,ownerId:p.ownerId,ownerName:p.ownerName,status:statuses[Math.floor(Math.random()*4)],startDate:new Date(Date.now()+Math.random()*2592000000).toISOString().split('T')[0],endDate:new Date(Date.now()+15768000000+Math.random()*15768000000).toISOString().split('T')[0],totalPrice:p.price*6,message:'أرغب في حجز هذا السكن.',createdAt:new Date(Date.now()-Math.random()*7776000000).toISOString()});}

  // Seed Messages
  let mid=1; const owners2=studs.filter(u=>u.role==='owner');
  for(let i=0;i<150;i++){const s=students2[Math.floor(Math.random()*students2.length)]; const o=owners2[Math.floor(Math.random()*owners2.length)]; const cid=[s.id,o.id].sort().join('_'); const fromS=Math.random()>0.5; await add('messages',{id:`msg_${mid++}`,chatId:cid,senderId:fromS?s.id:o.id,senderName:fromS?s.name:o.name,senderAvatar:fromS?s.avatar:o.avatar,receiverId:fromS?o.id:s.id,content:['مرحباً، هل العقار متاح؟','نعم متاح. متى تريد المعاينة؟','هل يمكن خفض السعر؟','السعر قابل للتفاوض.','هل يوجد إنترنت؟','نعم إنترنت فايبر.','أريد حجز الغرفة.','ممتاز، سأرسل لك العقد.','هل يوجد موقف سيارات؟','نعم جراج متاح.','شكراً لك!','العفو، في خدمتك.'][Math.floor(Math.random()*12)],createdAt:new Date(Date.now()-Math.random()*7776000000).toISOString(),read:Math.random()>0.3});}

  // Seed Favorites
  let fid=1;
  for(let i=0;i<200;i++){const s=students2[Math.floor(Math.random()*students2.length)]; const p=allProps[Math.floor(Math.random()*allProps.length)]; const ex=await getAll('favorites'); if(!ex.some(f=>f.userId===s.id&&f.propertyId===p.id)) await add('favorites',{id:`fav_${fid++}`,userId:s.id,propertyId:p.id,createdAt:new Date(Date.now()-Math.random()*7776000000).toISOString()});}
}

// ===== SEARCH =====
async function searchProperties(filters={}){
  let props=await getAll('properties');
  if(filters.status) props=props.filter(p=>p.status===filters.status);
  if(filters.type&&filters.type!=='all') props=props.filter(p=>p.type===filters.type);
  if(filters.location&&filters.location!=='all') props=props.filter(p=>p.location.includes(filters.location)||p.area===filters.location);
  if(filters.minPrice) props=props.filter(p=>p.price>=parseInt(filters.minPrice));
  if(filters.maxPrice) props=props.filter(p=>p.price<=parseInt(filters.maxPrice));
  if(filters.internet) props=props.filter(p=>p.internet);
  if(filters.furnished) props=props.filter(p=>p.furnished);
  if(filters.ac) props=props.filter(p=>p.ac);
  if(filters.search){const t=filters.search.toLowerCase(); props=props.filter(p=>p.title.toLowerCase().includes(t)||p.description.toLowerCase().includes(t)||p.location.toLowerCase().includes(t));}
  if(filters.sort){switch(filters.sort){case'price_asc':props.sort((a,b)=>a.price-b.price);break;case'price_desc':props.sort((a,b)=>b.price-a.price);break;case'rating':props.sort((a,b)=>b.rating-a.rating);break;case'newest':props.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));break;case'views':props.sort((a,b)=>b.views-a.views);break;}}
  return props;
}

// ===== HELPERS =====
async function getPropertyReviews(pid){const all=await getAll('reviews'); return all.filter(r=>r.propertyId===pid);}
async function getUserFavorites(uid){const all=await getAll('favorites'); return all.filter(f=>f.userId===uid);}
async function getUserBookings(uid){const all=await getAll('bookings'); return all.filter(b=>b.userId===uid);}
async function getOwnerBookings(oid){const all=await getAll('bookings'); return all.filter(b=>b.ownerId===oid);}
async function getChatMessages(cid){const all=await getAll('messages'); return all.filter(m=>m.chatId===cid).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));}
async function getUserChats(uid){
  const all=await getAll('messages'); const map=new Map();
  all.forEach(msg=>{if(msg.senderId===uid||msg.receiverId===uid){if(!map.has(msg.chatId))map.set(msg.chatId,{chatId:msg.chatId,lastMessage:msg,unread:0}); if(msg.receiverId===uid&&!msg.read)map.get(msg.chatId).unread++;}});
  return Array.from(map.values()).sort((a,b)=>new Date(b.lastMessage.createdAt)-new Date(a.lastMessage.createdAt));
}
async function toggleFavorite(uid,pid){const all=await getAll('favorites'); const ex=all.find(f=>f.userId===uid&&f.propertyId===pid); if(ex){await remove('favorites',ex.id); return false;} else {await add('favorites',{id:`fav_${Date.now()}`,userId:uid,propertyId:pid,createdAt:new Date().toISOString()}); return true;}}
async function isFavorite(uid,pid){const all=await getAll('favorites'); return all.some(f=>f.userId===uid&&f.propertyId===pid);}
async function authenticateUser(email,password){const all=await getAll('users'); return all.find(u=>u.email===email&&u.password===password)||null;}
async function registerUser(data){const all=await getAll('users'); if(all.some(u=>u.email===data.email)) throw new Error('Email already exists'); await add('users',data); return data;}
async function incrementPropertyViews(pid){const p=await getById('properties',pid); if(p){p.views=(p.views||0)+1; await put('properties',p);}}

// ===== AUTH =====
function setCurrentUser(user){localStorage.setItem('currentUser',JSON.stringify(user));}
function getCurrentUser(){const u=localStorage.getItem('currentUser'); return u?JSON.parse(u):null;}
function logout(){localStorage.removeItem('currentUser'); window.location.href='index.html';}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  await initLocalDB();
  await seedDatabase();
});
