const products=[
{id:1,name:'Montre connectée Pro',cat:'electronics',store:'Tech Kpalimé',price:45000,img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85',rating:'4.8',tag:'Tendance'},
{id:2,name:'Smartphone nouvelle génération',cat:'electronics',store:'Tech Kpalimé',price:185000,img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85',rating:'4.7',tag:'Nouveau'},
{id:3,name:'Ordinateur portable Pro',cat:'computing',store:'Digital House',price:395000,img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=85',rating:'4.9',tag:'Pro'},
{id:4,name:'Casque audio sans fil',cat:'electronics',store:'Tech Kpalimé',price:35000,img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85',rating:'4.6',tag:''},
{id:5,name:'Fauteuil moderne',cat:'home',store:'Maison & Ambiance',price:120000,img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85',rating:'4.8',tag:'Maison'},
{id:6,name:'Sneakers tendance',cat:'fashion',store:'Style Togo',price:28000,img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85',rating:'4.7',tag:'Populaire'},
{id:7,name:'Terrain résidentiel',cat:'realestate',store:'Togo Immo',price:0,img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85',rating:'4.5',tag:'Immobilier'},
{id:8,name:'TV Smart 55 pouces',cat:'electronics',store:'Tech Kpalimé',price:285000,img:'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=85',rating:'4.7',tag:''}
];
window.tmProducts=products;
const demoStores=[
{id:'demo1',name:'Tech Kpalimé',cat:'Électronique',city:'Lomé',avatar:'TK',cover:'c1'},
{id:'demo2',name:'Maison & Ambiance',cat:'Maison',city:'Agoè',avatar:'MA',cover:'c2'},
{id:'demo3',name:'Style Togo',cat:'Mode',city:'Lomé',avatar:'ST',cover:'c3'},
{id:'demo4',name:'Digital House',cat:'Informatique',city:'Lomé',avatar:'DI',cover:'c4'}
];
let stores=demoStores.slice();
let current=products.slice(),cart=JSON.parse(localStorage.getItem('tm_cart')||'[]');
const money=n=>n?new Intl.NumberFormat('fr-FR').format(n)+' F CFA':'Prix sur demande';
window.tmMoney=money;
const grid=document.getElementById('productGrid');
function productCard(p){return `<article class="product"><div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy">${p.tag?`<span class="tag">${p.tag}</span>`:''}<button class="heart" aria-label="Favori">♡</button></div><div class="product-body"><span class="product-store">${p.store}</span><h3>${p.name}</h3><div class="rating">★★★★★ <span>${p.rating}</span></div><div class="price">${money(p.price)}</div><div class="product-bottom"><button class="add" onclick="addToCart('${p.id}')">Ajouter</button><button class="buy" onclick="buyNow('${p.id}')">Commander</button></div></div></article>`}
function renderProducts(){grid.innerHTML=current.map(productCard).join('');}
function renderStores(){document.getElementById('storeGrid').innerHTML=stores.map(s=>`<article class="store" onclick="openShop('${s.id}')"><div class="store-cover ${s.cover||'c1'}"></div><div class="store-body"><div class="avatar">${s.avatar}</div><div><b>${s.name}</b><small>${s.cat||''} · ${s.city||'Togo'}</small></div><span class="verified">✓</span></div></article>`).join('')}
function openShop(id){const s=stores.find(x=>x.id===id);if(!s)return;document.getElementById('shopViewName').textContent=s.name;document.getElementById('shopViewMeta').textContent=(s.cat||'')+' · '+(s.city||'Togo');document.getElementById('shopAvatar').textContent=s.avatar;const wa=document.getElementById('shopWhatsapp');wa.href=s.phone?`https://wa.me/${s.phone.replace(/[^0-9]/g,'')}`:'https://wa.me/22896894394';const list=products.filter(p=>id.startsWith('demo')?p.store===s.name:p.sellerId===id);const shopGrid=document.getElementById('shopProductGrid');const empty=document.getElementById('shopEmpty');if(list.length){shopGrid.innerHTML=list.map(productCard).join('');shopGrid.style.display='grid';empty.style.display='none'}else{shopGrid.innerHTML='';shopGrid.style.display='none';empty.style.display='block'}document.getElementById('shopView').classList.add('open');document.getElementById('shopOverlay').classList.add('show')}
function closeShop(){document.getElementById('shopView').classList.remove('open');document.getElementById('shopOverlay').classList.remove('show')}
document.getElementById('closeShop').onclick=closeShop;document.getElementById('shopOverlay').onclick=closeShop;
window.tmSetRealStores=function(list){stores=demoStores.concat(list);renderStores()};
window.tmSetRealProducts=function(list){list.forEach(p=>{if(!products.find(x=>x.id===p.id))products.push(p)});current=products.slice();renderProducts()};
window.tmRefreshGrid=function(){current=products.slice();renderProducts()};
window.tmOpenShop=openShop;
function addToCart(id){const p=products.find(x=>x.id==id),found=cart.find(x=>x.id==id);if(found)found.qty++;else cart.push({...p,qty:1});saveCart();openCart();}
function buyNow(id){addToCart(id);}
function saveCart(){localStorage.setItem('tm_cart',JSON.stringify(cart));document.getElementById('cartCount').textContent=cart.reduce((s,x)=>s+x.qty,0);renderCart();}
function renderCart(){const el=document.getElementById('cartItems');if(!cart.length){el.innerHTML='<div style="text-align:center;color:#7b8999;padding:50px 10px">Votre panier est vide.<br>Ajoutez quelques produits pour commencer.</div>';document.getElementById('cartTotal').textContent='0 F CFA';return}el.innerHTML=cart.map(x=>`<div class="cart-item"><img src="${x.img}" alt=""><div><b>${x.name}</b><small>${x.qty} × ${money(x.price)}</small></div><button onclick="removeItem('${x.id}')">Supprimer</button></div>`).join('');document.getElementById('cartTotal').textContent=money(cart.reduce((s,x)=>s+(x.price*x.qty),0));}
function removeItem(id){cart=cart.filter(x=>x.id!=id);saveCart();}
function openCart(){document.getElementById('cart').classList.add('open');document.getElementById('overlay').classList.add('show');}
function closeCart(){document.getElementById('cart').classList.remove('open');document.getElementById('overlay').classList.remove('show');}
function search(){const q=document.getElementById('searchInput').value.toLowerCase().trim(),cat=document.getElementById('searchCat').value;current=products.filter(p=>(cat==='all'||p.cat===cat)&&(p.name.toLowerCase().includes(q)||p.store.toLowerCase().includes(q)));renderProducts();document.getElementById('produits').scrollIntoView({behavior:'smooth'});}
document.getElementById('searchBtn').onclick=search;document.getElementById('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')search()});document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{document.getElementById('searchCat').value=b.dataset.cat;document.getElementById('searchInput').value='';search()});document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');current=products.slice();if(b.dataset.sort==='priceAsc')current.sort((a,b)=>a.price-b.price);if(b.dataset.sort==='priceDesc')current.sort((a,b)=>b.price-a.price);renderProducts()});
document.getElementById('cartBtn').onclick=openCart;document.getElementById('closeCart').onclick=closeCart;document.getElementById('overlay').onclick=closeCart;document.getElementById('orderBtn').onclick=()=>{if(!cart.length)return alert('Votre panier est vide.');const lines=cart.map(x=>`• ${x.name} × ${x.qty} — ${money(x.price*x.qty)}`).join('%0A');const total=money(cart.reduce((s,x)=>s+x.price*x.qty,0));const payVal=document.querySelector('input[name="paymethod"]:checked').value;const payLabel=payVal==='yas'?'YAS Togo':payVal==='moov'?'Moov Money':'Paiement à la livraison';window.open(`https://wa.me/22896894394?text=${encodeURIComponent('Bonjour TOGO MARKET, je souhaite commander :\n')}${lines}%0A%0ATotal : ${encodeURIComponent(total)}%0AMode de paiement : ${encodeURIComponent(payLabel)}`,'_blank')};
const modal=document.getElementById('modal');function openModal(){modal.classList.add('open')}function closeModal(){modal.classList.remove('open');document.getElementById('loginError').textContent='';document.getElementById('signupError').textContent=''}
document.getElementById('modalClose').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};
document.getElementById('locationBtn').onclick=()=>alert('Zone de livraison sélectionnée : Lomé. La sélection de ville sera ajoutée avec le système de comptes et de livraison.');

function showPane(name){document.getElementById('loginPane').style.display=name==='login'?'block':'none';document.getElementById('signupPane').style.display=name==='signup'?'block':'none';document.getElementById('accountPane').style.display=name==='account'?'block':'none';document.getElementById('tabLogin').classList.toggle('active',name==='login');document.getElementById('tabSignup').classList.toggle('active',name==='signup');document.querySelector('.acc-tabs').style.display=name==='account'?'none':'flex'}
document.getElementById('tabLogin').onclick=()=>showPane('login');document.getElementById('tabSignup').onclick=()=>showPane('signup');
document.getElementById('sellBtn').onclick=()=>{openModal();showPane(window.tmUser?'account':'signup')};
document.getElementById('sellHero').onclick=()=>{openModal();showPane(window.tmUser?'account':'signup')};
document.getElementById('ctaSell').onclick=()=>{openModal();showPane(window.tmUser?'account':'signup')};
document.getElementById('accountBtn').onclick=()=>{openModal();showPane(window.tmUser?'account':'login')};

document.getElementById('loginSubmit').onclick=()=>window.tmLogin();
document.getElementById('shopSubmit').onclick=()=>window.tmSignup();
document.getElementById('logoutBtn').onclick=()=>window.tmLogout();
document.getElementById('subInfo').onclick=()=>{document.getElementById('subInfo').classList.add('active');document.getElementById('subProducts').classList.remove('active');document.getElementById('myShopPane').style.display='block';document.getElementById('myProductsPane').style.display='none'};
document.getElementById('subProducts').onclick=()=>{document.getElementById('subProducts').classList.add('active');document.getElementById('subInfo').classList.remove('active');document.getElementById('myProductsPane').style.display='block';document.getElementById('myShopPane').style.display='none';if(window.tmLoadMyProducts)window.tmLoadMyProducts()};
document.getElementById('viewMyShop').onclick=()=>{if(!window.tmUser)return;closeModal();openShop(window.tmUser.uid)};
document.getElementById('openAddProduct').onclick=()=>{document.getElementById('addProductForm').style.display='block'};

renderProducts();renderStores();saveCart();

