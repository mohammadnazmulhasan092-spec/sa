/* ========================================
   DADAR SHOP - Main JavaScript
   Your Trusted Online Marketplace
   ======================================== */

// ---- Cart State ----
let cart = JSON.parse(localStorage.getItem('dadarCart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('dadarWishlist') || '[]');

function saveCart() { localStorage.setItem('dadarCart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('dadarWishlist', JSON.stringify(wishlist)); }

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
  document.querySelectorAll('.mobile-cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function updateWishlistCount() {
  const total = wishlist.length;
  document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = total);
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id && i.variant === product.variant);
  if (existing) existing.qty += product.qty || 1;
  else cart.push({ ...product, qty: product.qty || 1 });
  saveCart();
  updateCartCount();
  renderCartDrawer();
  showToast('Added to cart!', product.name + ' has been added to your cart.', 'success');
}

function removeFromCart(id, variant) {
  cart = cart.filter(i => !(i.id === id && i.variant === variant));
  saveCart();
  updateCartCount();
  renderCartDrawer();
}

function updateCartQty(id, variant, delta) {
  const item = cart.find(i => i.id === id && i.variant === variant);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id, variant);
  else { saveCart(); updateCartCount(); renderCartDrawer(); }
}

function toggleWishlist(product) {
  const idx = wishlist.findIndex(i => i.id === product.id);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast('Removed', product.name + ' removed from wishlist.', 'info');
  } else {
    wishlist.push(product);
    showToast('Added to Wishlist!', product.name + ' added to wishlist.', 'success');
  }
  saveWishlist();
  updateWishlistCount();
  document.querySelectorAll(`[data-wishlist="${product.id}"]`).forEach(btn => {
    btn.classList.toggle('active', wishlist.some(i => i.id === product.id));
  });
}

function isWishlisted(id) { return wishlist.some(i => i.id === id); }

// ---- Cart Drawer ----
function renderCartDrawer() {
  const body = document.querySelector('.cart-drawer-body');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">Your cart is empty</div>
        <div class="empty-desc">Add items to your cart to see them here</div>
        <a href="categories.html" class="btn btn-primary btn-sm">Start Shopping</a>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '৳0';
    if (totalEl) totalEl.textContent = '৳0';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji || '📦'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.variant ? `<div class="cart-item-variant">${item.variant}</div>` : ''}
        <div class="cart-item-price">৳${(item.price * item.qty).toLocaleString()}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateCartQty('${item.id}','${item.variant||''}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}','${item.variant||''}', 1)">+</button>
          <span class="cart-item-remove" onclick="removeFromCart('${item.id}','${item.variant||''}')">🗑️</span>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 1000 ? 0 : 60;
  if (subtotalEl) subtotalEl.textContent = '৳' + subtotal.toLocaleString();
  if (totalEl) totalEl.textContent = '৳' + (subtotal + delivery).toLocaleString();
}

function openCart() {
  document.querySelector('.cart-overlay')?.classList.add('active');
  document.querySelector('.cart-drawer')?.classList.add('active');
  renderCartDrawer();
}

function closeCart() {
  document.querySelector('.cart-overlay')?.classList.remove('active');
  document.querySelector('.cart-drawer')?.classList.remove('active');
}

// ---- Toast ----
function showToast(title, msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✅'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

// ---- Hero Slider ----
function initSlider(selector) {
  const slider = document.querySelector(selector);
  if (!slider) return;
  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  let current = 0, timer;

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    slider.querySelector('.hero-slides').style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function startAuto() { timer = setInterval(next, 4500); }
  function stopAuto() { clearInterval(timer); }

  slider.querySelector('.hero-next')?.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
  slider.querySelector('.hero-prev')?.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); }));
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // Touch
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  goTo(0);
  startAuto();
}

// ---- Countdown Timer ----
function initCountdown(targetEl, endDate) {
  if (!targetEl) return;
  function update() {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) { targetEl.innerHTML = '<span style="color:var(--danger)">Sale Ended</span>'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const nums = targetEl.querySelectorAll('.countdown-num');
    if (nums.length >= 3) {
      nums[0].textContent = String(h).padStart(2, '0');
      nums[1].textContent = String(m).padStart(2, '0');
      nums[2].textContent = String(s).padStart(2, '0');
    }
  }
  update();
  setInterval(update, 1000);
}

// ---- Search ----
function initSearch() {
  const input = document.querySelector('.search-input');
  const suggestions = document.querySelector('.search-suggestions');
  if (!input || !suggestions) return;

  const popular = ['Smartphone Samsung', 'Nike Shoes', 'Laptop ASUS', 'Face Wash', 'Headphones Sony', 'T-Shirt Men', 'Rice Cooker', 'Baby Diaper'];
  const recent = JSON.parse(localStorage.getItem('dadarSearchHistory') || '[]');

  function renderSuggestions(query) {
    const filtered = query ? popular.filter(p => p.toLowerCase().includes(query.toLowerCase())) : [];
    const recentItems = recent.slice(0, 4);
    let html = '';
    if (recentItems.length && !query) {
      html += `<div class="suggestion-section-title">Recent Searches</div>`;
      html += recentItems.map(r => `<div class="suggestion-item" onclick="doSearch('${r}')"><i>🕐</i><span>${r}</span></div>`).join('');
    }
    if (filtered.length) {
      html += `<div class="suggestion-section-title">Suggestions</div>`;
      html += filtered.map(s => `<div class="suggestion-item" onclick="doSearch('${s}')"><i>🔍</i><span>${s.replace(new RegExp(query,'gi'), m => `<span class="highlight">${m}</span>`)}</span></div>`).join('');
    }
    if (!html) {
      html = `<div class="suggestion-section-title">Popular Searches</div>`;
      html += popular.slice(0,5).map(s => `<div class="suggestion-item" onclick="doSearch('${s}')"><i>🔥</i><span>${s}</span></div>`).join('');
    }
    suggestions.innerHTML = html;
  }

  input.addEventListener('focus', () => { suggestions.classList.add('active'); renderSuggestions(input.value); });
  input.addEventListener('input', () => renderSuggestions(input.value));
  document.addEventListener('click', e => { if (!e.target.closest('.header-search')) suggestions.classList.remove('active'); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(input.value); });
}

window.doSearch = function(q) {
  if (!q.trim()) return;
  const history = JSON.parse(localStorage.getItem('dadarSearchHistory') || '[]');
  if (!history.includes(q)) { history.unshift(q); localStorage.setItem('dadarSearchHistory', JSON.stringify(history.slice(0, 8))); }
  window.location.href = 'search.html?q=' + encodeURIComponent(q);
};

// ---- Mega Menu ----
function initMegaMenu() {
  const btn = document.querySelector('.all-categories-btn');
  const menu = document.querySelector('.mega-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('active'); });
  document.addEventListener('click', e => { if (!e.target.closest('.mega-menu-wrapper')) menu.classList.remove('active'); });

  const items = document.querySelectorAll('.mega-menu-item');
  const rights = document.querySelectorAll('.mega-menu-right');
  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      items.forEach(it => it.classList.remove('active'));
      rights.forEach(r => r.classList.remove('active'));
      item.classList.add('active');
      rights[i]?.classList.add('active');
    });
  });
}

// ---- Dropdowns ----
function initDropdowns() {
  const notifBtn = document.querySelector('.notif-btn');
  const notifDropdown = document.querySelector('.notif-dropdown');
  const accountBtn = document.querySelector('.account-btn');
  const accountDropdown = document.querySelector('.account-dropdown');

  notifBtn?.addEventListener('click', e => {
    e.stopPropagation();
    notifDropdown?.classList.toggle('active');
    accountDropdown?.classList.remove('active');
  });

  accountBtn?.addEventListener('click', e => {
    e.stopPropagation();
    accountDropdown?.classList.toggle('active');
    notifDropdown?.classList.remove('active');
  });

  document.addEventListener('click', () => {
    notifDropdown?.classList.remove('active');
    accountDropdown?.classList.remove('active');
  });
}

// ---- Back to Top ----
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Chat Widget ----
function initChat() {
  const trigger = document.querySelector('.chat-trigger');
  const popup = document.querySelector('.chat-popup');
  const closeBtn = document.querySelector('.chat-close');
  if (!trigger || !popup) return;

  trigger.addEventListener('click', () => popup.classList.toggle('active'));
  closeBtn?.addEventListener('click', () => popup.classList.remove('active'));

  const sendBtn = document.querySelector('.chat-send');
  const chatInput = document.querySelector('.chat-input-row input');
  const chatBody = document.querySelector('.chat-body');

  function addMessage(text, isUser = true) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
    msg.innerHTML = `
      <div class="chat-msg-avatar">${isUser ? '👤' : '💬'}</div>
      <div class="chat-bubble">${text}</div>`;
    chatBody?.appendChild(msg);
    chatBody?.scrollTo(0, chatBody.scrollHeight);
  }

  const replies = ['How can I help you today?', 'I\'ll connect you to our support team shortly.', 'Please check our FAQ section for quick answers.', 'Our team is available 9AM - 10PM.'];
  let replyIndex = 0;

  function sendMessage() {
    const text = chatInput?.value.trim();
    if (!text) return;
    addMessage(text, true);
    chatInput.value = '';
    setTimeout(() => {
      addMessage(replies[replyIndex % replies.length], false);
      replyIndex++;
    }, 800);
  }

  sendBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

// ---- FAQ Accordion ----
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ---- Product Tabs ----
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const parent = btn.closest('.product-tabs') || document.querySelector('.product-tabs');
      parent?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent?.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}

// ---- Quantity Selector (Detail Page) ----
function initQtySelector() {
  const input = document.querySelector('.qty-selector input');
  const decBtn = document.querySelector('.qty-selector .qty-dec');
  const incBtn = document.querySelector('.qty-selector .qty-inc');
  if (!input) return;

  decBtn?.addEventListener('click', () => { const v = Math.max(1, parseInt(input.value) - 1); input.value = v; });
  incBtn?.addEventListener('click', () => { const v = Math.min(99, parseInt(input.value) + 1); input.value = v; });
  input.addEventListener('change', () => { const v = Math.max(1, Math.min(99, parseInt(input.value) || 1)); input.value = v; });
}

// ---- Gallery Thumbs ----
function initGallery() {
  const main = document.querySelector('.gallery-main');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!main || !thumbs.length) return;

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const emoji = thumb.dataset.emoji || thumb.querySelector('span')?.textContent;
      const mainSpan = main.querySelector('span');
      if (mainSpan && emoji) mainSpan.textContent = emoji;
    });
  });
  thumbs[0]?.classList.add('active');
}

// ---- Filter Range ----
function initPriceRange() {
  const range = document.querySelector('.price-range');
  const display = document.querySelector('.price-max-display');
  if (!range || !display) return;
  range.addEventListener('input', () => { display.textContent = '৳' + parseInt(range.value).toLocaleString(); });
}

// ---- View Toggle ----
function initViewToggle() {
  const grid = document.querySelector('.view-grid');
  const list = document.querySelector('.view-list');
  const products = document.querySelector('.products-grid');
  if (!grid || !list || !products) return;

  grid.addEventListener('click', () => {
    grid.classList.add('active'); list.classList.remove('active');
    products.className = products.className.replace(/grid-\d/, 'grid-4');
  });
  list.addEventListener('click', () => {
    list.classList.add('active'); grid.classList.remove('active');
    products.className = 'products-list';
  });
}

// ---- Checkout Steps ----
function initCheckout() {
  const steps = document.querySelectorAll('.checkout-step');
  const panels = document.querySelectorAll('.checkout-panel');
  const nextBtns = document.querySelectorAll('.next-step');
  const prevBtns = document.querySelectorAll('.prev-step');
  let current = 0;

  function goTo(n) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === n);
      s.classList.toggle('completed', i < n);
    });
    panels.forEach((p, i) => p.style.display = i === n ? 'block' : 'none');
    current = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextBtns.forEach(btn => btn.addEventListener('click', () => { if (current < steps.length - 1) goTo(current + 1); }));
  prevBtns.forEach(btn => btn.addEventListener('click', () => { if (current > 0) goTo(current - 1); }));

  if (panels.length) { panels.forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none'); }
}

// ---- Payment Method Select ----
function initPaymentMethods() {
  document.querySelectorAll('.payment-method').forEach(m => {
    m.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(x => x.classList.remove('active'));
      m.classList.add('active');
    });
  });
  document.querySelectorAll('.delivery-option').forEach(o => {
    o.addEventListener('click', () => {
      document.querySelectorAll('.delivery-option').forEach(x => x.classList.remove('active'));
      o.classList.add('active');
    });
  });
  document.querySelectorAll('.address-card').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.address-card').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });
}

// ---- Wishlist Buttons ----
function initWishlistButtons() {
  document.querySelectorAll('[data-wishlist]').forEach(btn => {
    const id = btn.dataset.wishlist;
    if (isWishlisted(id)) btn.classList.add('active');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const name = btn.dataset.name || 'Product';
      const emoji = btn.dataset.emoji || '📦';
      toggleWishlist({ id, name, emoji });
    });
  });
}

// ---- Account Nav ----
function initAccountNav() {
  const items = document.querySelectorAll('.account-nav-item');
  const panels = document.querySelectorAll('.account-panel');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.dataset.panel;
      if (!panelId) return;
      items.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(panelId)?.classList.add('active');
    });
  });
}

// ---- Coupon Code ----
function initCoupon() {
  const applyBtns = document.querySelectorAll('.btn-apply, .apply-coupon');
  applyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || document.querySelector('.coupon-input');
      if (!input) return;
      const code = input.value.trim().toUpperCase();
      if (code === 'DADAR10') { showToast('Coupon Applied!', '10% discount applied.', 'success'); }
      else if (code === 'WELCOME50') { showToast('Coupon Applied!', '৳50 discount applied.', 'success'); }
      else if (code) { showToast('Invalid Coupon', 'This coupon code is not valid.', 'error'); }
    });
  });
}

// ---- Order Tracking Search ----
function initTracking() {
  const trackBtn = document.querySelector('.track-btn');
  if (!trackBtn) return;
  trackBtn.addEventListener('click', () => {
    const input = document.querySelector('.track-input');
    const id = input?.value.trim();
    const result = document.querySelector('.tracking-result');
    if (!id) { showToast('Error', 'Please enter a tracking number.', 'error'); return; }
    if (result) { result.style.display = 'block'; }
    showToast('Order Found!', 'Tracking details loaded below.', 'success');
  });
}

// ---- Newsletter ----
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input?.value) return;
      showToast('Subscribed!', 'Thank you for subscribing to Dadar Shop newsletter!', 'success');
      input.value = '';
    });
  });
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Message Sent!', 'We\'ll get back to you within 24 hours.', 'success');
    form.reset();
  });
}

// ---- Auth Forms ----
function initAuthForms() {
  const toggleBtns = document.querySelectorAll('.toggle-pass');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  });

  const loginForm = document.querySelector('.login-form');
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Login Successful!', 'Welcome back to Dadar Shop!', 'success');
    setTimeout(() => window.location.href = 'account.html', 1200);
  });

  const registerForm = document.querySelector('.register-form');
  registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Account Created!', 'Welcome to Dadar Shop!', 'success');
    setTimeout(() => window.location.href = 'account.html', 1200);
  });
}

// ---- Sticky Header ----
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100 && currentScroll > lastScroll) header.style.transform = 'translateY(-100%)';
    else header.style.transform = 'translateY(0)';
    lastScroll = currentScroll;
  }, { passive: true });
}

// ---- Lazy Images ----
function initLazyImages() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; observer.unobserve(img); }
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

// ---- Variant Selection ----
function initVariantSelection() {
  document.querySelectorAll('.variant-options').forEach(group => {
    group.querySelectorAll('.variant-option').forEach(opt => {
      if (!opt.classList.contains('disabled')) {
        opt.addEventListener('click', () => {
          group.querySelectorAll('.variant-option').forEach(o => o.classList.remove('active'));
          opt.classList.add('active');
        });
      }
    });
  });
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const menuItems = document.querySelectorAll('.mobile-nav-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const href = item.dataset.href;
      if (href) window.location.href = href;
    });
  });
}

// ---- Reading URL Params ----
function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ---- Init All ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateWishlistCount();
  renderCartDrawer();

  document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);

  initSlider('.hero-slider');
  initSearch();
  initMegaMenu();
  initDropdowns();
  initBackToTop();
  initChat();
  initFAQ();
  initTabs();
  initQtySelector();
  initGallery();
  initPriceRange();
  initViewToggle();
  initCheckout();
  initPaymentMethods();
  initWishlistButtons();
  initAccountNav();
  initCoupon();
  initTracking();
  initNewsletter();
  initContactForm();
  initAuthForms();
  initBackToTop();
  initLazyImages();
  initVariantSelection();
  initMobileMenu();

  // Auto countdown (flash sale)
  const countdownEnd = new Date(Date.now() + 6 * 3600000 + 23 * 60000 + 45000);
  initCountdown(document.querySelector('.countdown'), countdownEnd);

  // Scroll progress
  window.addEventListener('scroll', () => {
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      progress.style.width = Math.min(100, pct) + '%';
    }
  }, { passive: true });

  // Search page
  const searchQuery = getUrlParam('q');
  if (searchQuery) {
    const el = document.querySelector('.search-query span');
    if (el) el.textContent = searchQuery;
    const countEl = document.querySelector('.search-total-count');
    if (countEl) countEl.textContent = Math.floor(Math.random() * 400 + 50);
  }
});

// Global helpers
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.showToast = showToast;
