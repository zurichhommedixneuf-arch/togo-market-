import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, addDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKDhu8G60PxSuouOoxtM4vzUDaKmPOD8U",
  authDomain: "togo-market-f5cdc.firebaseapp.com",
  projectId: "togo-market-f5cdc",
  storageBucket: "togo-market-f5cdc.firebasestorage.app",
  messagingSenderId: "236346028372",
  appId: "1:236346028372:web:461ffdf7629aad94ac58c1",
  measurementId: "G-GSYMC51HCW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const catLabel = {electronics:'Électronique',fashion:'Mode',home:'Maison',computing:'Informatique',realestate:'Immobilier'};
const covers = ['c1','c2','c3','c4'];

function setError(id, msg){ const el=document.getElementById(id); if(el) el.textContent = msg; }
function translateError(code){
  const map = {
    'auth/email-already-in-use':'Cet email a déjà un compte. Essaie de te connecter.',
    'auth/invalid-email':'Adresse email invalide.',
    'auth/weak-password':'Mot de passe trop court (6 caractères minimum).',
    'auth/invalid-credential':'Email ou mot de passe incorrect.',
    'auth/wrong-password':'Email ou mot de passe incorrect.',
    'auth/user-not-found':'Aucun compte avec cet email.',
    'auth/missing-password':'Entre ton mot de passe.',
    'auth/network-request-failed':'Problème de connexion internet.'
  };
  return map[code] || 'Une erreur est survenue. Réessaie.';
}
function initials(name){ return (name||'TM').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

// --- Charger toutes les boutiques et tous les produits publiés (visibles par tous) ---
async function loadPublicCatalog(){
  try{
    const shopsSnap = await getDocs(collection(db,'boutiques'));
    const shopList = [];
    shopsSnap.forEach(d=>{
      const s = d.data();
      shopList.push({ id:d.id, name:s.shopName, cat:catLabel[s.category]||s.category, city:'Togo', avatar:initials(s.shopName), cover:covers[shopList.length % covers.length], phone:s.phone });
    });
    if(window.tmSetRealStores) window.tmSetRealStores(shopList);
  }catch(e){ console.error('Erreur chargement boutiques', e); }

  try{
    const prodSnap = await getDocs(collection(db,'produits'));
    const prodList = [];
    prodSnap.forEach(d=>{
      const p = d.data();
      prodList.push({ id:'r_'+d.id, name:p.name, cat:p.cat, store:p.shopName, price:p.price, img:p.img, rating:p.rating||'5.0', tag:p.tag||'', sellerId:p.sellerId });
    });
    if(window.tmSetRealProducts) window.tmSetRealProducts(prodList);
  }catch(e){ console.error('Erreur chargement produits', e); }
}
loadPublicCatalog();

async function renderAccountPane(uid){
  const snap = await getDoc(doc(db,'boutiques',uid));
  const accEl = document.getElementById('acc-info');
  const accBtn = document.getElementById('accountBtn');
  if(snap.exists()){
    const s = snap.data();
    window.tmMyShop = { id: uid, name: s.shopName };
    document.getElementById('welcomeName').textContent = 'Bonjour, ' + s.shopName;
    document.getElementById('welcomeShop').textContent = 'Ta boutique « ' + s.shopName + ' » est active sur TOGO MARKET.';
    accEl.innerHTML = '<div class="acc-row"><span>Activité</span><b>'+(catLabel[s.category]||s.category)+'</b></div><div class="acc-row"><span>Téléphone</span><b>'+s.phone+'</b></div><div class="acc-row"><span>Email</span><b>'+s.email+'</b></div>';
    if(accBtn) accBtn.innerHTML = '🏪<small>'+s.shopName.split(' ')[0]+'</small>';
  } else {
    document.getElementById('welcomeName').textContent = 'Bonjour';
    accEl.innerHTML = '';
    if(accBtn) accBtn.innerHTML = '👤<small>Compte</small>';
  }
}

window.tmLoadMyProducts = async function(){
  if(!window.tmUser) return;
  const listEl = document.getElementById('myProductList');
  listEl.innerHTML = '<p style="font-size:12px;color:#7a8f86">Chargement...</p>';
  const q = query(collection(db,'produits'), where('sellerId','==',window.tmUser.uid));
  const snap = await getDocs(q);
  if(snap.empty){ listEl.innerHTML = '<p style="font-size:12px;color:#7a8f86">Tu n\'as encore ajouté aucun produit.</p>'; return; }
  let html = '';
  snap.forEach(d=>{
    const p = d.data();
    html += '<div class="myprod-item"><img src="'+(p.img||'')+'"><div><b>'+p.name+'</b><span>'+(window.tmMoney?window.tmMoney(p.price):p.price+' F')+'</span></div><button onclick="window.tmDeleteProduct(\''+d.id+'\')">Supprimer</button></div>';
  });
  listEl.innerHTML = html;
};

window.tmDeleteProduct = async function(id){
  if(!confirm('Supprimer ce produit ?')) return;
  await deleteDoc(doc(db,'produits',id));
  window.tmLoadMyProducts();
  loadPublicCatalog();
};

let pendingPhoto = '';
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        const scale = Math.min(1, maxW/img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width*scale;
        canvas.height = img.height*scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('prodPhoto').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  pendingPhoto = await compressImage(file);
  document.getElementById('prodPreview').innerHTML = '<img src="'+pendingPhoto+'">';
});

document.getElementById('prodSubmit').onclick = async ()=>{
  setError('prodError','');
  if(!window.tmUser){ setError('prodError','Connecte-toi d\'abord.'); return; }
  const name = document.getElementById('prodName').value.trim();
  const price = Number(document.getElementById('prodPrice').value);
  const cat = document.getElementById('prodCat').value;
  if(!name || !price){ setError('prodError','Remplis le nom et le prix.'); return; }
  if(!pendingPhoto){ setError('prodError','Ajoute une photo du produit.'); return; }
  const btn = document.getElementById('prodSubmit'); btn.disabled = true; btn.textContent = 'Publication...';
  try{
    const shopName = (window.tmMyShop && window.tmMyShop.name) || 'Ma boutique';
    const ref = await addDoc(collection(db,'produits'), { sellerId: window.tmUser.uid, shopName, name, price, cat, img: pendingPhoto, rating:'5.0', tag:'Nouveau', createdAt: serverTimestamp() });
    if(window.tmSetRealProducts) window.tmSetRealProducts([{ id:'r_'+ref.id, name, cat, store:shopName, price, img:pendingPhoto, rating:'5.0', tag:'Nouveau', sellerId:window.tmUser.uid }]);
    document.getElementById('prodName').value=''; document.getElementById('prodPrice').value=''; document.getElementById('prodPreview').innerHTML=''; pendingPhoto='';
    document.getElementById('addProductForm').style.display='none';
    window.tmLoadMyProducts();
  }catch(err){
    setError('prodError', 'Erreur : impossible de publier le produit.');
  }finally{
    btn.disabled = false; btn.textContent = 'Publier le produit';
  }
};

onAuthStateChanged(auth, async (user) => {
  if(user){
    window.tmUser = user;
    await renderAccountPane(user.uid);
  } else {
    window.tmUser = null;
    window.tmMyShop = null;
    const accBtn = document.getElementById('accountBtn');
    if(accBtn) accBtn.innerHTML = '👤<small>Compte</small>';
  }
});

window.tmSignup = async function(){
  setError('signupError','');
  const shopName = document.getElementById('shopName').value.trim();
  const category = document.getElementById('shopCat').value;
  const phone = document.getElementById('shopPhone').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPass').value;
  if(!shopName || !phone || !email || !pass){ setError('signupError','Remplis tous les champs.'); return; }
  const btn = document.getElementById('shopSubmit'); btn.disabled = true; btn.textContent = 'Création en cours...';
  try{
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db,'boutiques',cred.user.uid), { shopName, category, phone, email, createdAt: serverTimestamp() });
    await renderAccountPane(cred.user.uid);
    document.querySelector('.acc-tabs').style.display='none';
    document.getElementById('signupPane').style.display='none';
    document.getElementById('accountPane').style.display='block';
    loadPublicCatalog();
  }catch(err){
    setError('signupError', translateError(err.code));
  }finally{
    btn.disabled = false; btn.textContent = "Créer mon compte →";
  }
};

window.tmLogin = async function(){
  setError('loginError','');
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if(!email || !pass){ setError('loginError','Entre ton email et ton mot de passe.'); return; }
  const btn = document.getElementById('loginSubmit'); btn.disabled = true; btn.textContent = 'Connexion...';
  try{
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await renderAccountPane(cred.user.uid);
    document.querySelector('.acc-tabs').style.display='none';
    document.getElementById('loginPane').style.display='none';
    document.getElementById('accountPane').style.display='block';
  }catch(err){
    setError('loginError', translateError(err.code));
  }finally{
    btn.disabled = false; btn.textContent = 'Se connecter →';
  }
};

window.tmLogout = async function(){
  await signOut(auth);
  document.getElementById('modal').classList.remove('open');
};
