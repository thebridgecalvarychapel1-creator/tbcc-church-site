// ============================================
// CHURCH SHOP — Bridge Calvary Chapel
// ============================================

var siteContent = {};
var allProducts = [];
var filteredProducts = [];
var allBanners = [];
var currentShopCategory = 'all';
var cart = JSON.parse(localStorage.getItem('bcc_cart') || '[]');
var SHOP_URL_BASE = window.location.origin + window.location.pathname;

// ---------- HELPERS ----------
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function money(n) { return 'UGX ' + Number(n || 0).toLocaleString(); }
function saveCart() { localStorage.setItem('bcc_cart', JSON.stringify(cart)); updateCartBadge(); }
function showToast(msg) {
    var t = document.createElement('div'); t.className = 'bcc-toast';
    t.innerHTML = '<i class="fas fa-check-circle"></i> ' + escapeHtml(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 20);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2200);
}
function parseGallery(raw) {
    if (Array.isArray(raw)) return raw.slice();
    if (typeof raw === 'string' && raw.length > 2) {
        try { var p = JSON.parse(raw); if (Array.isArray(p)) return p; }
        catch (e) { return raw.split(',').map(function (s) { return s.trim().replace(/^["'{]|["'}]$/g, ''); }).filter(function (s) { return s; }); }
    }
    return [];
}

// ---------- MODAL ----------
var modalLastFocused = null;
window.openModal = function (html) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    if (!panel || !body) return;
    modalLastFocused = document.activeElement;
    body.innerHTML = html;
    overlay.classList.add('active');
    panel.removeAttribute('inert');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
    body.scrollTop = 0;
    var c = panel.querySelector('.modal-panel-close');
    if (c) c.focus();
};
window.closeModal = function () {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    if (!panel) return;
    if (document.activeElement && panel.contains(document.activeElement)) document.activeElement.blur();
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('inert', '');
    var cartEl = document.getElementById('cartDrawer');
    if (!cartEl || !cartEl.classList.contains('active')) document.body.style.overflow = '';
    if (modalLastFocused && typeof modalLastFocused.focus === 'function') { try { modalLastFocused.focus(); } catch (e) {} }
    modalLastFocused = null;
};

// ---------- HERO ----------
function renderHero() {
    var h = siteContent.shop_hero || {};
    setText('heroEyebrow', h.eyebrow || 'CHURCH MERCHANDISE');
    var titleEl = document.getElementById('heroTitle');
    if (titleEl && h.title_line1) {
        titleEl.innerHTML = escapeHtml(h.title_line1) + ' <span style="color:var(--cyan-bright);">' + escapeHtml(h.title_line2 || '') + '</span>';
    }
    setText('heroDesc', h.description || 'Support the ministry by purchasing official church merchandise.');
    
    // Render banners purely from the shop_banners table
    renderHeroThumbs();
}

function renderHeroThumbs() {
    var wrap = document.getElementById('heroThumbs');
    if (!wrap) return;

    // If the table is empty, do nothing (keeps the beautiful gradient)
    if (!allBanners.length) { 
        wrap.style.display = 'none'; 
        return; 
    }

    // Build the thumbnails
    wrap.style.display = 'flex';
    wrap.innerHTML = allBanners.map(function (b, idx) {
        return '<div class="hero-thumb ' + (idx === 0 ? 'active' : '') + '" data-img="' + escapeHtml(b.image_url) + '">'
            + '<img src="' + escapeHtml(b.image_url) + '" alt="Banner ' + (idx + 1) + '" onerror="this.parentNode.style.display=\'none\'">'
            + '</div>';
    }).join('');

    var heroBg = document.getElementById('heroBg');
    
    // Set the first banner as the main background (only if it loads successfully)
    if (allBanners.length > 0) {
        var firstImg = new Image();
        firstImg.onload = function() {
            if (heroBg) {
                heroBg.style.backgroundImage = 'url("' + allBanners[0].image_url + '")';
                heroBg.style.display = 'block';
            }
        };
        // We purposely do nothing on error, so the CSS gradient shows instead
        firstImg.src = allBanners[0].image_url;
    }

    // Click to change background safely
    wrap.querySelectorAll('.hero-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            wrap.querySelectorAll('.hero-thumb').forEach(function (t) { t.classList.remove('active'); });
            thumb.classList.add('active');
            var img = thumb.getAttribute('data-img');
            
            var testImg = new Image();
            testImg.onload = function() {
                if (heroBg && img) {
                    heroBg.style.backgroundImage = 'url("' + img + '")';
                    heroBg.style.display = 'block';
                }
            };
            testImg.src = img;
        });
    });
}

// ---------- STORE HEADER ----------
function renderStoreHeader() {
    var h = siteContent.shop_store || {};
    setText('storeTitle', h.title || 'Featured Products');
    setText('storeDesc', h.description || 'Support the church by purchasing official church merchandise.');
}

// ---------- CATEGORIES ----------
function getShopCategories() {
    var cats = {};
    allProducts.forEach(function (p) { if (p.category && !cats[p.category]) cats[p.category] = true; });
    return Object.keys(cats);
}

function renderShopCategoryStrip() {
    var strip = document.getElementById('shopCategoryStrip');
    if (!strip) return;
    var cats = getShopCategories();
    var html = '<button class="shop-cat-chip ' + (currentShopCategory === 'all' ? 'active' : '') + '" data-cat="all" type="button"><i class="fas fa-th"></i> All Products</button>';
    
    cats.forEach(function (cat) { 
        html += '<button class="shop-cat-chip ' + (currentShopCategory === cat ? 'active' : '') + '" data-cat="' + escapeHtml(cat) + '" type="button">' + escapeHtml(cat) + '</button>'; 
    });
    
    strip.innerHTML = html;
    
    strip.querySelectorAll('.shop-cat-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            currentShopCategory = chip.dataset.cat;
            filterProducts();
            renderShopCategoryStrip();
            var section = document.getElementById('shopSection');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function filterProducts() {
    if (currentShopCategory === 'all') filteredProducts = allProducts.slice();
    else filteredProducts = allProducts.filter(function (p) { return p.category === currentShopCategory; });
    renderProducts();
}

// ---------- PRODUCTS ----------
function renderProducts() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!filteredProducts.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#49658A;padding:40px;">No products in this category.</p>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map(function (p) {
        var badge = p.badge ? '<span class="product-badge ' + (p.badge === 'New' ? 'new' : (p.badge === 'Best Seller' ? 'hot' : '')) + '">' + escapeHtml(p.badge) + '</span>' : '';
        var rating = p.rating ? '<div class="product-rating"><span class="stars">' + '★'.repeat(Math.round(p.rating)) + '</span> ' + p.rating + '</div>' : '';
        var oldPrice = p.old_price ? '<span class="product-old-price">' + money(p.old_price) + '</span>' : '';
        var desc = p.description ? '<p class="product-desc">' + escapeHtml(p.description) + '</p>' : '';

        return '<article class="product-card" data-product="' + escapeHtml(p.id) + '" tabindex="0" role="button">'
            + '<div class="product-image">' + badge
            + '<button class="product-share-btn" type="button" aria-label="Share product" data-share-id="' + escapeHtml(p.id) + '"><i class="fas fa-share-alt"></i></button>'
            + '<button class="product-fav" type="button" aria-label="Favorite"><i class="far fa-heart"></i></button>'
            + '<img src="' + escapeHtml(p.image_url || '') + '" alt="' + escapeHtml(p.name || '') + '" onerror="this.style.display=\'none\'"></div>'
            + '<div class="product-body">'
            + (p.category ? '<div class="product-cat">' + escapeHtml(p.category) + '</div>' : '')
            + '<h3 class="product-name">' + escapeHtml(p.name) + '</h3>'
            + desc 
            + rating
            + '<div class="product-price-row"><span class="product-price">' + money(p.price) + '</span>' + oldPrice + '</div>'
            + '<button class="btn-add-cart" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
            + '</div></article>';
    }).join('');

    if (!grid._delegated) {
        grid._delegated = true;
        grid.addEventListener('click', handleProductGridClick);
        grid.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                var card = e.target.closest('.product-card');
                if (card) { e.preventDefault(); openCardProduct(card); }
            }
        });
    }
}

function handleProductGridClick(e) {
    var shareBtn = e.target.closest('.product-share-btn');
    if (shareBtn) {
        e.preventDefault(); e.stopPropagation();
        var pid = shareBtn.getAttribute('data-share-id');
        var p = allProducts.find(function (x) { return String(x.id) === String(pid); });
        if (p) shareProductMenu(p);
        return;
    }
    var favBtn = e.target.closest('.product-fav');
    if (favBtn) { e.preventDefault(); e.stopPropagation(); return; }
    var addBtn = e.target.closest('.btn-add-cart');
    if (addBtn) {
        e.preventDefault(); e.stopPropagation();
        var card = addBtn.closest('.product-card');
        if (card) openCardProduct(card);
        return;
    }
    var card = e.target.closest('.product-card');
    if (card) openCardProduct(card);
}

function openCardProduct(card) {
    var p = allProducts.find(function (x) { return String(x.id) === String(card.dataset.product); });
    if (p) openProductPanel(p);
}

// ---------- PRODUCT PANEL ----------
function openProductPanel(p) {
    if (!p) return;
    var sizes = Array.isArray(p.sizes) ? p.sizes.slice() : [];
    var colors = Array.isArray(p.colors) ? p.colors.slice() : [];
    var gallery = parseGallery(p.gallery);
    if (p.image_url && gallery.indexOf(p.image_url) === -1) gallery.unshift(p.image_url);
    gallery = gallery.filter(function (x) { return x && typeof x === 'string'; });
    if (!gallery.length) gallery = [''];
    var selectedSize = sizes.length ? null : '';
    var selectedColor = colors.length ? null : '';
    var qty = 1;

    var thumbsHTML = '';
    if (gallery.length > 1) {
        thumbsHTML = gallery.map(function (img, i) {
            return '<div class="gallery-thumb ' + (i === 0 ? 'active' : '') + '" data-idx="' + i + '"><img src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'"></div>';
        }).join('');
    }
    var sizesHTML = sizes.length ? '<div class="modal-section-label">Size</div><div class="modal-option-row" id="sizeRow">'
        + sizes.map(function (s) { return '<button class="modal-option-btn" type="button" data-size="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>'; }).join('') + '</div>' : '';

    var colorsHTML = colors.length ? '<div class="modal-section-label">Color</div><div class="modal-option-row" id="colorRow">'
        + colors.map(function (c) {
            var colorCode = c.toLowerCase() === 'red' ? '#FF0000' : c.toLowerCase() === 'blue' ? '#0000FF' : c.toLowerCase() === 'green' ? '#008000' : c.toLowerCase() === 'black' ? '#000000' : c.toLowerCase() === 'white' ? '#FFFFFF' : c;
            return '<button class="modal-option-btn color-swatch" style="background-color: ' + colorCode + ';" type="button" data-color="' + escapeHtml(c) + '" title="' + escapeHtml(c) + '"></button>';
        }).join('') + '</div>' : '';

    var galleryHTML;
    if (gallery.length > 1) {
        galleryHTML = '<div class="product-gallery"><div class="gallery-thumbs">' + thumbsHTML + '</div><div class="gallery-main"><img id="galleryMainImg" src="' + escapeHtml(gallery[0]) + '" alt="" onerror="this.style.display=\'none\'"></div></div>';
    } else {
        galleryHTML = '<img class="modal-hero-image" src="' + escapeHtml(gallery[0]) + '" alt="' + escapeHtml(p.name || '') + '" onerror="this.style.display=\'none\'">';
    }
    
    var html = '<div class="modal-content">' + galleryHTML
        + '<h2>' + escapeHtml(p.name || '') + '</h2>'
        + '<p>' + escapeHtml(p.long_description || p.description || '') + '</p>'
        + '<div class="product-price-row" style="margin:14px 0;"><span class="product-price" style="font-size:24px;">' + money(p.price) + '</span>'
        + (p.old_price ? '<span class="product-old-price">' + money(p.old_price) + '</span>' : '') + '</div>'
        + sizesHTML + colorsHTML
        + '<div class="qty-row" style="margin-top:14px;"><span class="qty-label">Quantity</span><div class="qty-controls">'
        + '<button class="qty-btn" id="qtyMinus" type="button">−</button><span class="qty-value" id="qtyValue">1</span><button class="qty-btn" id="qtyPlus" type="button">+</button></div></div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-primary" id="btnAddProduct" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button></div>'
        + '<div class="share-row">'
        +   '<button class="share-btn primary" type="button" id="sharePanelBtn"><i class="fas fa-share-alt"></i> Share Product</button>'
        +   '<button class="share-btn" type="button" id="copyLinkBtn"><i class="fas fa-link"></i> Copy Link</button>'
        + '</div>'
        + '</div>';
    openModal(html);

    document.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            document.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('active'); });
            thumb.classList.add('active');
            var idx = parseInt(thumb.dataset.idx, 10);
            var mainImg = document.getElementById('galleryMainImg');
            if (mainImg) mainImg.src = gallery[idx];
        });
    });
    if (sizes.length) {
        var sizeBtns = document.querySelectorAll('#sizeRow .modal-option-btn');
        sizeBtns.forEach(function (b) {
            b.addEventListener('click', function (e) {
                e.preventDefault();
                sizeBtns.forEach(function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                selectedSize = b.dataset.size;
            });
        });
    }
    if (colors.length) {
        var colorBtns = document.querySelectorAll('#colorRow .modal-option-btn');
        colorBtns.forEach(function (b) {
            b.addEventListener('click', function (e) {
                e.preventDefault();
                colorBtns.forEach(function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                selectedColor = b.dataset.color;
            });
        });
    }
    document.getElementById('qtyMinus').addEventListener('click', function () { if (qty > 1) { qty--; setText('qtyValue', qty); } });
    document.getElementById('qtyPlus').addEventListener('click', function () { qty++; setText('qtyValue', qty); });
    document.getElementById('btnAddProduct').addEventListener('click', function () {
        if (sizes.length && !selectedSize) { alert('Please choose a size.'); return; }
        if (colors.length && !selectedColor) { alert('Please choose a color.'); return; }
        addProductToCart(p, selectedSize, selectedColor, qty);
        closeModal();
        setTimeout(openCart, 300);
    });
    document.getElementById('sharePanelBtn').addEventListener('click', function () { shareProductMenu(p); });
    document.getElementById('copyLinkBtn').addEventListener('click', function () { copyProductLink(encodeURIComponent(getProductUrl(p))); });
}

// ---------- SHARING ----------
function getProductUrl(p) { return SHOP_URL_BASE + '?product=' + encodeURIComponent(p.id); }

async function downloadProductImage(p) {
    if (!p.image_url) { showToast('No image to download'); return; }
    try {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise(function (r, j) { img.onload = r; img.onerror = j; img.src = p.image_url; });
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        var link = document.createElement('a');
        link.download = (p.name || 'product').replace(/[^\w]+/g, '_') + '.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showToast('Image saved!');
    } catch (e) { window.open(p.image_url, '_blank'); }
}

function shareProductMenu(p) {
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper"><i class="fas fa-share-alt"></i></div>'
        + '<h2>Share This Product</h2>'
        + '<p style="font-size:12.5px;color:#49658A;">Choose how to share — as an image or as a link with preview.</p>'
        + '<div class="share-row">'
        +   '<button class="share-btn primary" id="shImage"><i class="fas fa-image"></i> Share Image</button>'
        +   '<button class="share-btn whatsapp" id="shLink"><i class="fas fa-link"></i> Share Link</button>'
        + '</div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button></div>'
        + '</div>';
    openModal(html);
    document.getElementById('shImage').addEventListener('click', function () { closeModal(); shareProductImage(p); });
    document.getElementById('shLink').addEventListener('click', function () { closeModal(); shareProductLink(p); });
}

async function shareProductImage(p) {
    if (!p.image_url) { showToast('No image'); return; }
    try {
        var img = new Image(); img.crossOrigin = 'anonymous';
        await new Promise(function (r, j) { img.onload = r; img.onerror = j; img.src = p.image_url; });
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/jpeg', 0.92); });
        var file = new File([blob], 'product.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: p.name, text: p.name + ' — ' + money(p.price) });
            return;
        }
        downloadProductImage(p);
    } catch (e) { downloadProductImage(p); }
}

function shareProductLink(p) {
    var url = getProductUrl(p);
    var text = p.name + ' — ' + money(p.price) + '\n\n' + url;
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper"><i class="fas fa-share-alt"></i></div>'
        + '<h2>Share Link</h2>'
        + '<div class="share-row">'
        +   '<button class="share-btn whatsapp" id="shWa"><i class="fab fa-whatsapp"></i> WhatsApp</button>'
        +   '<button class="share-btn" id="shFb"><i class="fab fa-facebook-f"></i> Facebook</button>'
        + '</div>'
        + '<div class="share-row">'
        +   '<button class="share-btn" id="shEmail"><i class="fas fa-envelope"></i> Gmail</button>'
        +   '<button class="share-btn primary" id="shCopy"><i class="fas fa-link"></i> Copy Link</button>'
        + '</div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button></div>'
        + '</div>';
    openModal(html);
    document.getElementById('shWa').addEventListener('click', function () { window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank'); });
    document.getElementById('shFb').addEventListener('click', function () { window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank'); });
    document.getElementById('shEmail').addEventListener('click', function () { window.open('https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent(p.name) + '&body=' + encodeURIComponent(text), '_blank'); });
    document.getElementById('shCopy').addEventListener('click', function () { copyProductLink(encodeURIComponent(url)); });
}

function copyProductLink(encodedUrl) {
    var url = decodeURIComponent(encodedUrl);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { showToast('Link copied!'); closeModal(); });
    } else {
        var inp = document.createElement('input');
        inp.value = url; document.body.appendChild(inp); inp.select();
        document.execCommand('copy'); inp.remove();
        showToast('Link copied!'); closeModal();
    }
}

// ---------- CART ----------
function addProductToCart(product, size, color, qty) {
    cart.push({ type: 'product', id: product.id, name: product.name, image_url: product.image_url || '', price: Number(product.price), size: size || '', color: color || '', qty: qty || 1 });
    saveCart(); showToast('Added: ' + product.name);
}
function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var count = cart.reduce(function (sum, i) { return sum + (i.qty || 1); }, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    var countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = '(' + count + ')';
}
function renderCart() {
    var body = document.getElementById('cartBody');
    var footer = document.getElementById('cartFooter');
    if (!body) return;
    if (!cart.length) {
        body.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>';
        if (footer) footer.style.display = 'none';
        return;
    }
    var total = 0;
    body.innerHTML = cart.map(function (item, idx) {
        total += item.price * item.qty;
        var variant = (item.size ? 'Size ' + item.size : '') + (item.color ? (item.size ? ' · ' : '') + item.color : '');
        return '<div class="cart-item">'
            + '<div class="cart-item-image"><img src="' + escapeHtml(item.image_url) + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '<div class="cart-item-body">'
            + '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>'
            + (variant ? '<div class="cart-item-variant">' + escapeHtml(variant) + '</div>' : '')
            + '<div class="cart-item-bottom">'
            + '<div class="cart-item-qty"><button data-minus="' + idx + '">−</button><span>' + item.qty + '</span><button data-plus="' + idx + '">+</button></div>'
            + '<span class="cart-item-price">' + money(item.price * item.qty) + '</span>'
            + '<button class="cart-item-remove" data-remove="' + idx + '"><i class="fas fa-trash"></i></button>'
            + '</div></div></div>';
    }).join('');
    body.querySelectorAll('[data-minus]').forEach(function (b) { b.addEventListener('click', function () { var i = parseInt(b.dataset.minus, 10); if (cart[i].qty > 1) { cart[i].qty--; saveCart(); renderCart(); } }); });
    body.querySelectorAll('[data-plus]').forEach(function (b) { b.addEventListener('click', function () { var i = parseInt(b.dataset.plus, 10); cart[i].qty = (cart[i].qty || 1) + 1; saveCart(); renderCart(); }); });
    body.querySelectorAll('[data-remove]').forEach(function (b) { b.addEventListener('click', function () { cart.splice(parseInt(b.dataset.remove, 10), 1); saveCart(); renderCart(); }); });
    setText('cartTotal', money(total));
    if (footer) footer.style.display = 'block';
}
window.openCart = function () {
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartDrawer').removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    renderCart();
};
window.closeCart = function () {
    document.getElementById('cartDrawer').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartDrawer').setAttribute('inert', '');
    document.body.style.overflow = '';
};

// ---------- ORDER FLOW ----------
function generateOrderRef() {
    var d = new Date();
    var ymd = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'TBCC-' + ymd + '-' + rand;
}
function generateReceiptNumber(orderRef, status) {
    var prefix = status === 'confirmed' ? 'RCPT-CONF-' : 'RCPT-PEND-';
    var d = new Date();
    var ymd = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var tail = orderRef.split('-').pop();
    return prefix + ymd + '-' + tail;
}

window.openOrderSummary = function () {
    if (!cart.length) { alert('Your cart is empty.'); return; }
    var total = 0;
    var itemsHTML = cart.map(function (i) {
        var line = Number(i.price) * (i.qty || 1); total += line;
        var variant = (i.size ? 'Size ' + i.size : '') + (i.color ? (i.size ? ' · ' : '') + i.color : '');
        return '<div class="order-summary-item"><div class="order-summary-item-img"><img src="' + escapeHtml(i.image_url) + '" onerror="this.style.display=\'none\'"></div>'
            + '<div class="order-summary-item-body"><div class="order-summary-item-name">' + escapeHtml(i.name) + '</div>'
            + (variant ? '<div class="order-summary-item-variant">' + escapeHtml(variant) + ' · Qty ' + (i.qty || 1) + '</div>' : '<div class="order-summary-item-variant">Qty ' + (i.qty || 1) + '</div>')
            + '</div><div class="order-summary-item-price">' + money(line) + '</div></div>';
    }).join('');

    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper"><i class="fas fa-clipboard-list"></i></div>'
        + '<h2>Complete Your Order</h2>'
        + '<div class="modal-section-label">Your Items</div>'
        + '<div class="order-summary-box">' + itemsHTML + '</div>'
        + '<div class="order-total-box"><span class="order-total-label">Grand Total</span><span class="order-total-value">' + money(total) + '</span></div>'
        + '<div class="modal-section-label">Your Contact Details</div>'
        + '<form id="orderForm" class="order-form-grid">'
        + '<div class="form-group full"><label>Your Name <span class="req">*</span></label><input type="text" name="name" required></div>'
        + '<div class="form-group full"><label>WhatsApp / Phone <span class="req">*</span></label><input type="tel" name="phone" required></div>'
        + '<div class="form-group full"><label>Email (optional)</label><input type="email" name="email"></div>'
        + '<div class="form-group full"><label>Delivery Preference</label><select name="delivery_method"><option>Collection at church</option><option>Delivery within Uganda</option></select></div>'
        + '<div class="form-group full"><label>District (if delivery)</label><input type="text" name="delivery_location" placeholder="e.g. Jinja, Mbale, Gulu..."></div>'
        + '<div class="form-group full"><label>Additional Notes</label><textarea name="notes" rows="2"></textarea></div>'
        + '</form>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-primary" id="btnGenerateReceipt"><i class="fas fa-file-invoice"></i> Generate Receipt &amp; Send</button>'
        + '</div>'
        + '</div>';
    openModal(html);

    document.getElementById('btnGenerateReceipt').addEventListener('click', function () {
        var p = {};
        new FormData(document.getElementById('orderForm')).forEach(function (v, k) { p[k] = v; });
        if (!p.name || !p.phone) { alert('Please enter name and phone.'); return; }
        var orderRef = generateOrderRef();
        var orderDate = new Date().toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' });
        openReceiptScreen(p, orderRef, orderDate, total);
    });
};

function openReceiptScreen(p, orderRef, orderDate, total) {
    var pendingReceiptNo = generateReceiptNumber(orderRef, 'pending');

    var itemsHTML = cart.map(function (i) {
        var line = i.price * i.qty;
        var variant = (i.size ? 'Size ' + i.size + ' ' : '') + (i.color ? '· ' + i.color + ' ' : '') + '· Qty ' + i.qty;
        return '<div class="rc-item">'
            + '<span style="display:flex;align-items:center;gap:8px;">'
            +   '<img src="' + escapeHtml(i.image_url) + '" style="width:38px;height:38px;border-radius:6px;object-fit:cover;" onerror="this.style.display=\'none\'">'
            +   '<span>' + escapeHtml(i.name) + '<br><small style="color:#49658A;">(' + variant + ')</small></span>'
            + '</span>'
            + '<span>' + money(line) + '</span></div>';
    }).join('');

    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#005BEA,#12D8F5);"><i class="fas fa-file-invoice"></i></div>'
        + '<h2>Your Pending Receipt</h2>'
        + '<p style="text-align:center;font-size:12.5px;color:#49658A;">Review your receipt, then send it to the church below.</p>'
        + '<div class="receipt-card">'
        +   '<div class="rc-header">'
        +     '<div class="rc-shop">THE BRIDGE CALVARY CHAPEL<small>ORDER RECEIPT — PENDING</small></div>'
        +     '<div class="rc-ref"><strong>' + orderRef + '</strong>' + orderDate + '</div>'
        +   '</div>'
        +   itemsHTML
        +   '<div class="rc-total"><span>TOTAL</span><span>' + money(total) + '</span></div>'
        +   '<div class="rc-footer">Receipt No: ' + pendingReceiptNo + '<br>Bring this receipt to the church. Official receipt will be issued on collection.</div>'
        + '</div>'
        + '<div class="share-row">'
        +   '<button class="share-btn" id="btnDownloadPendingReceipt"><i class="fas fa-download"></i> Download Receipt</button>'
        +   '<button class="share-btn primary" id="btnSharePendingReceipt"><i class="fas fa-share-alt"></i> Share Receipt</button>'
        + '</div>'
        + '<div class="modal-section-label">Send Order to Church</div>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-whatsapp" id="btnSendWhatsApp"><i class="fab fa-whatsapp"></i> Send WhatsApp</button>'
        +   '<button class="modal-btn modal-btn-email" id="btnSendEmail"><i class="fas fa-envelope"></i> Send Gmail</button>'
        + '</div>'
        + '<p style="font-size:10.5px;color:#49658A;text-align:center;margin-top:10px;">The church will confirm your order by phone. Keep the receipt number.</p>'
        + '</div>';
    openModal(html);

    function buildMessage() {
        var lines = ['Hello Bridge Calvary Chapel, I would like to place an order.', '', '🧾 Order Ref: ' + orderRef, '🧾 Pending Receipt No: ' + pendingReceiptNo, '📅 ' + orderDate, '', '👤 Name: ' + (p.name || ''), '📱 Phone: ' + (p.phone || '')];
        if (p.email) lines.push('📧 Email: ' + p.email);
        lines.push('', '🛒 ITEMS:');
        cart.forEach(function (i) {
            lines.push('• ' + i.name + (i.size ? ' (' + i.size + (i.color ? '/' + i.color : '') + ')' : '') + ' — Qty ' + i.qty + ' — ' + money(i.price * i.qty));
        });
        lines.push('', '💰 TOTAL: ' + money(total));
        if (p.delivery_method) lines.push('🚚 Delivery: ' + p.delivery_method);
        if (p.delivery_location) lines.push('📍 District: ' + p.delivery_location);
        if (p.notes) lines.push('💬 Notes: ' + p.notes);
        lines.push('', 'Status: PENDING — awaiting confirmation.');
        return lines.join('\n');
    }

    document.getElementById('btnSendWhatsApp').addEventListener('click', function () {
        var c = window.CHURCH_CONTACT || { whatsapp: '256793240756' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage()), '_blank');
    });
    document.getElementById('btnSendEmail').addEventListener('click', function () {
        var c = window.CHURCH_CONTACT || { email: 'thebridgecalvarychapel1@gmail.com' };
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Order ' + orderRef) + '&body=' + encodeURIComponent(buildMessage()), '_blank');
    });

    document.getElementById('btnDownloadPendingReceipt').addEventListener('click', async function () {
        await downloadReceiptPng(p, orderRef, orderDate, pendingReceiptNo, total);
    });
    document.getElementById('btnSharePendingReceipt').addEventListener('click', async function () {
        await shareReceiptPng(p, orderRef, orderDate, pendingReceiptNo, total);
    });
}

// ---------- RECEIPT CANVAS ----------
var LOGO_SVG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#005BEA"/><stop offset="1" stop-color="#12D8F5"/></linearGradient></defs><circle cx="60" cy="60" r="58" fill="url(#g)"/><circle cx="60" cy="60" r="50" fill="#031B43"/><text x="60" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="#ffffff">✝</text></svg>'
);
function loadImage(src) { return new Promise(function (resolve) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { resolve(i); }; i.onerror = function () { resolve(null); }; i.src = src; }); }

async function drawReceipt(receipt, items, total, customerName, status) {
    var isConfirmed = status === 'confirmed';
    var W = 760, pad = 44, rowH = 90;
    var H = pad + 170 + 40 + (items.length * rowH) + 110 + 60 + pad;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#031B43'; ctx.fillRect(0, 0, W, 130);

    var logo = await loadImage(LOGO_SVG);
    if (logo) ctx.drawImage(logo, pad, 26, 76, 76);

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px Arial'; ctx.fillText('THE BRIDGE', pad + 92, 58);
    ctx.font = 'bold 15px Arial'; ctx.fillText('CALVARY CHAPEL', pad + 92, 80);
    ctx.font = '11px Arial'; ctx.fillStyle = '#12D8F5'; ctx.fillText('ORDER RECEIPT — PENDING', pad + 92, 100);

    var bx = W - pad - 140, by = 44;
    ctx.fillStyle = '#F4C430';
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, 140, 42, 21); else ctx.rect(bx, by, 140, 42);
    ctx.fill();
    ctx.fillStyle = '#3B1F00'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText('PENDING', bx + 70, by + 27); ctx.textAlign = 'left';

    var y = 160;
    ctx.fillStyle = '#031B43'; ctx.font = 'bold 14px Arial'; ctx.fillText('Receipt No:', pad, y);
    ctx.fillStyle = '#005BEA'; ctx.font = 'bold 15px Arial'; ctx.fillText(receipt.receiptNo, pad + 100, y);
    ctx.font = '11px Arial'; ctx.fillStyle = '#49658A'; ctx.textAlign = 'right';
    ctx.fillText('Date: ' + receipt.date, W - pad, y); ctx.textAlign = 'left';

    y += 24; ctx.fillStyle = '#031B43'; ctx.font = 'bold 12px Arial'; ctx.fillText('CUSTOMER', pad, y);
    y += 20; ctx.fillStyle = '#041A3A'; ctx.font = '14px Arial'; ctx.fillText(customerName || 'Walk-in', pad, y);
    ctx.font = '11px Arial'; ctx.fillStyle = '#49658A'; ctx.textAlign = 'right'; ctx.fillText('Order: ' + receipt.orderRef, W - pad, y); ctx.textAlign = 'left';
    y += 22; ctx.strokeStyle = '#CBE8FF'; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();

    y += 26; ctx.fillStyle = '#005BEA'; ctx.font = 'bold 12px Arial'; ctx.fillText('ITEMS', pad, y); ctx.textAlign = 'right'; ctx.fillText('AMOUNT', W - pad, y); ctx.textAlign = 'left';

    var thumbs = await Promise.all(items.map(function (it) { return it.image_url ? loadImage(it.image_url) : Promise.resolve(null); }));
    items.forEach(function (it, i) {
        var thumb = thumbs[i];
        if (thumb) { ctx.save(); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(pad, y + 6, 52, 52, 6); else ctx.rect(pad, y + 6, 52, 52); ctx.clip(); ctx.drawImage(thumb, pad, y + 6, 52, 52); ctx.restore(); }
        var tx = pad + (thumb ? 64 : 0);
        y += 32; ctx.fillStyle = '#041A3A'; ctx.font = 'bold 14px Arial'; ctx.fillText(it.name, tx, y);
        ctx.textAlign = 'right'; ctx.fillText(money(it.price * it.qty), W - pad, y); ctx.textAlign = 'left';
        y += 18; ctx.font = '11px Arial'; ctx.fillStyle = '#49658A';
        ctx.fillText((it.size ? 'Size ' + it.size + ' ' : '') + (it.color ? '· ' + it.color + ' ' : '') + '· Qty ' + it.qty, tx, y);
        y += thumb ? 20 : 0;
    });

    y += 32; ctx.strokeStyle = '#031B43'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 30; ctx.fillStyle = '#031B43'; ctx.font = 'bold 18px Arial'; ctx.fillText('TOTAL', pad, y);
    ctx.fillStyle = '#005BEA'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'right'; ctx.fillText(money(total), W - pad, y); ctx.textAlign = 'left';

    y += 42;
    ctx.fillStyle = '#92600A'; ctx.font = 'italic 11px Arial'; ctx.fillText('Pending confirmation — bring this receipt to the church.', pad, y);

    y += 30; ctx.fillStyle = '#49658A'; ctx.font = '11px Arial'; ctx.textAlign = 'center';
    ctx.fillText('The Bridge Calvary Chapel — Jinja, Uganda', W / 2, y);
    y += 16; ctx.fillText('Thank you for your order. God bless you.', W / 2, y);
    return canvas;
}

async function downloadReceiptPng(p, orderRef, orderDate, pendingNo, total) {
    var receipt = { receiptNo: pendingNo, orderRef: orderRef, date: orderDate };
    var canvas = await drawReceipt(receipt, cart, total, p.name || 'Walk-in', 'pending');
    var link = document.createElement('a'); link.download = pendingNo + '.png'; link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('Receipt downloaded');
}

async function shareReceiptPng(p, orderRef, orderDate, pendingNo, total) {
    var receipt = { receiptNo: pendingNo, orderRef: orderRef, date: orderDate };
    var canvas = await drawReceipt(receipt, cart, total, p.name || 'Walk-in', 'pending');
    try {
        var blob = await new Promise(function (r) { canvas.toBlob(r, 'image/png'); });
        var file = new File([blob], pendingNo + '.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Receipt', text: 'My order from Bridge Calvary Chapel' });
            return;
        }
        downloadReceiptPng(p, orderRef, orderDate, pendingNo, total);
    } catch (e) { downloadReceiptPng(p, orderRef, orderDate, pendingNo, total); }
}

// ---------- LOAD ----------
async function loadShopData() {
    try {
        // 1. Load Site Content (for texts)
        if (window.db && window.db.getSiteContent) siteContent = await window.db.getSiteContent() || {};
        
        var base = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
        var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

        // 2. Load Products
        var prodRes = await fetch(base + 'products?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key);
        var prodData = await prodRes.json();
        allProducts = Array.isArray(prodData) ? prodData : [];
        filteredProducts = allProducts.slice();

        // 3. Load Banners from the NEW table
        var banRes = await fetch(base + 'shop_banners?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key);
        var banData = await banRes.json();
        allBanners = Array.isArray(banData) ? banData : [];

        // 4. Render everything
        renderHero();
        renderStoreHeader();
        renderShopCategoryStrip();
        renderProducts();
        updateCartBadge();
        renderCart();
    } catch (err) { console.error(err); }
}

// ---------- DOM READY ----------
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', function () {
        var n = document.getElementById('navbar');
        if (n) n.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(4,26,58,0.4)' : 'none';
    }, { passive: true });
    var navToggle = document.getElementById('navToggle'), navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        var icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times');
    });
    var overlay = document.getElementById('modalOverlay'), closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    var cartBtn = document.getElementById('cartBtn'), cartClose = document.getElementById('cartClose'), cartOverlay = document.getElementById('cartOverlay');
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    var cartClear = document.getElementById('cartClear');
    if (cartClear) cartClear.addEventListener('click', function () {
        if (confirm('Clear cart?')) { cart = []; saveCart(); renderCart(); }
    });
    var cartCheckout = document.getElementById('cartCheckout');
    if (cartCheckout) cartCheckout.addEventListener('click', function () { closeCart(); setTimeout(openOrderSummary, 350); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCart(); } });
    var nl = document.getElementById('footerNewsletter');
    if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); alert('✅ Subscribed!'); nl.reset(); });
    var y = document.getElementById('currentYear'); if (y) y.textContent = new Date().getFullYear();
    loadShopData();
});
// ============================================
// FESTIVE CHRISTMAS MODE LOGIC
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    var festiveBtn = document.getElementById('festiveBtn');
    var isFestive = localStorage.getItem('festiveMode') === 'true';
    var animationInterval;

    // Check if the user previously turned it on
    if (isFestive) {
        document.body.classList.add('festive-mode');
        startFestiveAnimations();
    }

    if (festiveBtn) {
        festiveBtn.addEventListener('click', function() {
            document.body.classList.toggle('festive-mode');
            
            if (document.body.classList.contains('festive-mode')) {
                localStorage.setItem('festiveMode', 'true');
                startFestiveAnimations();
            } else {
                localStorage.setItem('festiveMode', 'false');
                stopFestiveAnimations();
            }
        });
    }

    function startFestiveAnimations() {
        if (animationInterval) return; // Already running
        
        // Create snow and balls every 300ms
        animationInterval = setInterval(function() {
            createSnowflake();
            // 1 in 4 chance to create a Christmas ball instead of just snow
            if (Math.random() < 0.25) {
                createChristmasBall();
            }
        }, 300);
    }

    function stopFestiveAnimations() {
        clearInterval(animationInterval);
        animationInterval = null;
        // Remove all existing snowflakes and balls from the screen
        document.querySelectorAll('.snowflake, .christmas-ball').forEach(function(el) { el.remove(); });
    }

    function createSnowflake() {
        var snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        // Randomize size, position, and speed
        var size = Math.random() * 1.5 + 0.5; // 0.5em to 2em
        snowflake.innerHTML = '❅'; // Snowflake character
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.fontSize = size + 'em';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.animationDuration = (Math.random() * 3 + 3) + 's'; // 3s to 6s to fall
        
        document.body.appendChild(snowflake);
        
        // Remove element after it falls
        setTimeout(function() { snowflake.remove(); }, 6000);
    }

    function createChristmasBall() {
        var ball = document.createElement('div');
        ball.classList.add('christmas-ball');
        
        // Randomize size and position
        var size = Math.random() * 20 + 15; // 15px to 35px
        var colors = ['#ff0000', '#005BEA', '#F4C430', '#16A34A', '#ffffff']; // Red, Blue, Gold, Green, White
        
        ball.style.width = size + 'px';
        ball.style.height = size + 'px';
        ball.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        ball.style.left = Math.random() * 100 + 'vw';
        ball.style.animationDuration = (Math.random() * 2 + 4) + 's'; // 4s to 6s to drop
        
        document.body.appendChild(ball);
        
        // Remove element after it falls
        setTimeout(function() { ball.remove(); }, 7000);
    }
});