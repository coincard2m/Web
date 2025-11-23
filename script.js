document.addEventListener('DOMContentLoaded', () => {

  const PRODUCTS_KEY = 'webshop_products_v1';

  const CART_KEY = 'webshop_cart_v1';

  const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1605792657669-1a6c4b1e6f26?q=80&w=800&auto=format&fit=crop&crop=entropy';



  const productGrid = document.getElementById('productGrid');

  const addPanel = document.getElementById('addPanel');

  const productForm = document.getElementById('productForm');

  // form fields

  const pTitle = document.getElementById('pTitle');

  const pPrice = document.getElementById('pPrice');

  const pImage = document.getElementById('pImage');

  const pDesc = document.getElementById('pDesc');

  // preview controls

  const pFit = document.getElementById('pFit');

  const pAlignX = document.getElementById('pAlignX');

  const pAlignY = document.getElementById('pAlignY');

  const pZoom = document.getElementById('pZoom');

  const pPreview = document.getElementById('pPreview');

  const pZoomValue = document.getElementById('pZoomValue');



  const panelClose = document.getElementById('panelClose');

  const resetFormBtn = document.getElementById('resetForm');

  const addBtn = document.getElementById('addBtn');

  const cancelEditBtn = document.getElementById('cancelEdit');



  const hamburger = document.getElementById('hamburger');

  const hamburgerMenu = document.getElementById('hamburgerMenu');

  const menuAdd = document.getElementById('menuAdd');

  const menuDelete = document.getElementById('menuDelete');



  const deleteBar = document.getElementById('deleteBar');

  const deleteCountEl = document.getElementById('deleteCount');

  const confirmDeleteBtn = document.getElementById('confirmDelete');

  const cancelDeleteBtn = document.getElementById('cancelDelete');



  // state

  let saved = loadProducts(); // array of product objects

  let cart = loadCart();

  let deleteMode = false;

  let selectedIds = new Set();

  let editingId = null;



  // ensure elements exist

  if (!productForm || !productGrid) {

    console.error('Missing core DOM elements: productForm/productGrid.');

    return;

  }



  // helper - localStorage

  function loadProducts() {

    try {

      const raw = localStorage.getItem(PRODUCTS_KEY);

      return raw ? JSON.parse(raw) : [];

    } catch (e) {

      console.warn(e);

      return [];

    }

  }

  function saveProducts(list) {

    try {

      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));

    } catch (e) {

      console.warn(e);

    }

  }

  function loadCart() {

    try {

      const raw = localStorage.getItem(CART_KEY);

      return raw ? JSON.parse(raw) : [];

    } catch (e) {

      console.warn(e);

      return [];

    }

  }

  function saveCart() {

    try {

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

    } catch (e) {

      console.warn(e);

    }

  }



  // wire static cards (only cart button)

  function wireStaticCardButtons() {

    document.querySelectorAll('#productGrid .card[data-id^="static-"]').forEach(card => {

      const btnCart = card.querySelector('.btn-cart');

      if (btnCart) btnCart.addEventListener('click', () => {

        const title = card.querySelector('.card-title').textContent;

        const priceText = card.querySelector('.card-price').textContent;

        alert(`✓ "${title}" added to cart!\n${priceText}`);

        cart.push({ title, price: priceText });

        saveCart();

      });

    });

  }



  // wire dynamic card buttons (for user-created products)

  function wireDynamicCardButtons(card, productId) {

    const btnEdit = card.querySelector('.btn-edit');

    const btnCart = card.querySelector('.btn-cart');

    const btnDelete = card.querySelector('.btn-delete');

    if (btnEdit) btnEdit.addEventListener('click', () => startEdit(productId));

    if (btnCart) btnCart.addEventListener('click', () => addToCart(productId));

    if (btnDelete) btnDelete.addEventListener('click', () => removeItem(productId, card));

  }



  function addToCart(productId) {

    const product = saved.find(p => String(p.id) === String(productId));

    if (!product) return;

    cart.push({ id: productId, title: product.title, price: product.price, qty: 1 });

    saveCart();

    alert(`✓ "${product.title}" added to cart!`);

  }



  // initially render existing saved products (do not remove static products)

  wireStaticCardButtons();

  initialRenderSaved();



  function initialRenderSaved() {

    saved.forEach(prod => renderProductCard(prod, false));

  }



  // update preview and zoom value

  function updatePreview() {

    if (!pPreview) return;

    const url = (pImage && pImage.value.trim()) || PLACEHOLDER_IMG;

    pPreview.src = url;

    pPreview.style.objectFit = (pFit && pFit.value) || 'cover';

    const posX = (pAlignX && pAlignX.value) || 'center';

    const posY = (pAlignY && pAlignY.value) || 'center';

    pPreview.style.objectPosition = `${posX} ${posY}`;

    const zoom = (pZoom && pZoom.value) || 1;

    pPreview.style.transform = `scale(${zoom})`;

  }

  function updateZoomDisplay() {

    if (!pZoom || !pZoomValue) return;

    pZoomValue.textContent = `${Math.round(Number(pZoom.value) * 100)}%`;

  }



  // wire preview controls (safely)

  if (pImage) pImage.addEventListener('input', updatePreview);

  if (pFit) pFit.addEventListener('change', updatePreview);

  if (pAlignX) pAlignX.addEventListener('change', updatePreview);

  if (pAlignY) pAlignY.addEventListener('change', updatePreview);

  if (pZoom) {

    pZoom.addEventListener('input', () => { updatePreview(); updateZoomDisplay(); });

    updateZoomDisplay();

  }



  // Panel open/close via menu

  function openPanel() { addPanel.classList.remove('panel-hidden'); addPanel.setAttribute('aria-hidden','false'); }

  function closePanel() { addPanel.classList.add('panel-hidden'); addPanel.setAttribute('aria-hidden','true'); }



  if (hamburger) {

    hamburger.addEventListener('click', e => {

      e.stopPropagation();

      hamburgerMenu && hamburgerMenu.classList.toggle('show');

    });

    document.addEventListener('click', e => {

      if (hamburgerMenu && !hamburgerMenu.contains(e.target) && e.target !== hamburger) {

        hamburgerMenu.classList.remove('show');

      }

    });

  }

  if (menuAdd) menuAdd.addEventListener('click', () => { hamburgerMenu && hamburgerMenu.classList.remove('show'); openPanel(); });

  if (panelClose) panelClose.addEventListener('click', closePanel);

  if (resetFormBtn) resetFormBtn.addEventListener('click', () => productForm.reset());



  // delete mode handlers (safe guards if elements missing)

  function enableDeleteMode(enable) {

    deleteMode = !!enable;

    document.documentElement.classList.toggle('delete-mode', deleteMode);

    if (deleteBar) deleteBar.classList.toggle('hidden', !deleteMode);

    selectedIds.clear();

    updateDeleteCount();

  }

  if (menuDelete) menuDelete.addEventListener('click', () => enableDeleteMode(!deleteMode));

  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => enableDeleteMode(false));

  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => {

    if (!selectedIds.size) { alert('Chưa có mục được chọn'); return; }

    if (!confirm(`Xác nhận xóa ${selectedIds.size} mục?`)) return;

    // remove from DOM and saved

    selectedIds.forEach(id => {

      const card = productGrid.querySelector(`.card[data-id="${id}"]`);

      if (card && card.parentNode) card.parentNode.removeChild(card);

      saved = saved.filter(p => String(p.id) !== String(id));

    });

    saveProducts(saved);

    enableDeleteMode(false);

    alert('Đã xóa sản phẩm.');

  });

  function updateDeleteCount() { if (deleteCountEl) deleteCountEl.textContent = String(selectedIds.size || 0); }



  // Add/Edit product logic

  function startEdit(id) {

    const idx = saved.findIndex(x => String(x.id) === String(id));

    if (idx === -1) return;

    const item = saved[idx];

    editingId = id;

    pTitle.value = item.title || '';

    pPrice.value = item.price || '';

    pImage.value = item.img || '';

    pDesc.value = item.desc || '';

    if (pFit) pFit.value = item.fit || 'cover';

    if (pAlignX) pAlignX.value = item.alignX || 'center';

    if (pAlignY) pAlignY.value = item.alignY || 'center';

    if (pZoom) pZoom.value = item.zoom !== undefined ? item.zoom : 1;

    updatePreview();

    updateZoomDisplay();

    if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';

    if (addBtn) addBtn.textContent = 'Lưu thay đổi';

    openPanel();

  }

  if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => {

    editingId = null; productForm.reset(); updatePreview(); updateZoomDisplay();

    cancelEditBtn.style.display = 'none'; addBtn && (addBtn.textContent = 'Thêm sản phẩm'); closePanel();

  });



  // render saved items

  function renderSavedItems() {

    // Remove older saved cards

    document.querySelectorAll('#productGrid .card[data-saved="true"]').forEach(node => node.remove());

    // add saved back

    saved.slice().reverse().forEach(prod => renderProductCard(prod, true));

  }



  // render product card with buy button + controls (3 buttons for user-created)

  function renderProductCard(product, prepend = true) {

    const art = document.createElement('article');

    art.className = 'card newly-added';

    art.dataset.id = String(product.id);

    art.dataset.saved = "true";

    art.innerHTML = `

      <div class="card-image">

        <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.title)}">

      </div>

      <a class="buy-btn-full" href="#!">🛒 Mua ngay</a>

      <div class="card-body">

        <h3 class="card-title">${escapeHtml(product.title)}</h3>

        <p class="card-price">₫${Number(product.price).toLocaleString('vi-VN')}</p>

        <p class="card-desc">${escapeHtml(product.desc || '')}</p>

        <div class="user-controls">

          <button class="btn-small btn-edit" type="button">Sửa</button>

          <button class="btn-small add-cart btn-cart" type="button">Thêm giỏ</button>

          <button class="btn-small danger btn-delete" type="button">Xóa</button>

        </div>

      </div>

    `;

    const imgEl = art.querySelector('img');

    if (product.fit) imgEl.style.objectFit = product.fit;

    if (product.alignX || product.alignY) imgEl.style.objectPosition = `${product.alignX || 'center'} ${product.alignY || 'center'}`;

    imgEl.style.transform = `scale(${product.zoom || 1})`;

    imgEl.onerror = function() { this.src = PLACEHOLDER_IMG; };



    if (prepend) productGrid.insertBefore(art, productGrid.firstChild);

    else productGrid.appendChild(art);



    // wire button handlers for this card

    wireDynamicCardButtons(art, product.id);



    setTimeout(() => art.classList.remove('newly-added'), 500);

  }



  // handle submit: add or save edit

  productForm.addEventListener('submit', (e) => {

    e.preventDefault();

    const title = (pTitle && pTitle.value.trim()) || '';

    const price = Number((pPrice && pPrice.value) || 0);

    const img = (pImage && pImage.value.trim()) || PLACEHOLDER_IMG;

    const desc = (pDesc && pDesc.value.trim()) || '';

    const fit = pFit ? pFit.value : 'cover';

    const alignX = pAlignX ? pAlignX.value : 'center';

    const alignY = pAlignY ? pAlignY.value : 'center';

    const zoom = pZoom ? Number(pZoom.value) : 1;



    if (!title) { alert('Nhập tên sản phẩm'); return; }



    if (editingId) {

      // update existing saved product

      const idx = saved.findIndex(x => String(x.id) === String(editingId));

      if (idx !== -1) {

        saved[idx] = { ...saved[idx], title, price, img, desc, fit, alignX, alignY, zoom };

        saveProducts(saved);

        renderSavedItems();

      }

      editingId = null;

      addBtn && (addBtn.textContent = 'Thêm sản phẩm');

      cancelEditBtn && (cancelEditBtn.style.display = 'none');

      productForm.reset();

      updatePreview(); updateZoomDisplay();

      closePanel();

      return;

    }



    const product = { id: Date.now(), title, price, img, desc, fit, alignX, alignY, zoom };

    saved.unshift(product);

    saveProducts(saved);

    renderProductCard(product, true);

    productForm.reset();

    updatePreview(); updateZoomDisplay();

    closePanel();

  });



  // utility: sanitize

  function escapeHtml(input) {

    return String(input || '')

      .replace(/&/g, '&amp;')

      .replace(/</g, '&lt;')

      .replace(/>/g, '&gt;')

      .replace(/"/g, '&quot;')

      .replace(/'/g, '&#39;');

  }

});

