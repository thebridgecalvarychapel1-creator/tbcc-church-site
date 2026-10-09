// ============================================
// DONATIONS + STORE + CART
// File: js/donations.js  (v2 — warm palette, gallery, organized forms)
// ============================================

var siteContent = {};
var donationCategories = [];
var products = [];
var cart = JSON.parse(localStorage.getItem('bcc_cart') || '[]');
var filteredCategories = [];

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function money(n) { return '$' + Number(n || 0).toFixed(2); }
function saveCart() { localStorage.setItem('bcc_cart', JSON.stringify(cart)); updateCartBadge(); }
function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'bcc-toast';
    t.innerHTML = '<i class="fas fa-check-circle"></i> ' + msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 20);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2200);
}

// ============================================
// MODAL
// ============================================
window.openModal = function (html) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    if (!panel || !body) return;
    body.innerHTML = html;
    overlay.classList.add('active');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    body.scrollTop = 0;
    var c = panel.querySelector('.modal-panel-close');
    if (c) c.focus();
};
window.closeModal = function () {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    if (!panel) return;
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('cartDrawer').classList.contains('active')) {
        document.body.style.overflow = '';
    }
};

// ============================================
// RENDER HERO
// ============================================
function renderHero() {
    var h = siteContent.donations_hero || {};
    setText('heroEyebrow', h.eyebrow);
    var titleEl = document.getElementById('heroTitle');
    if (titleEl && h.title_line1) {
        titleEl.innerHTML = escapeHtml(h.title_line1) + '<br>' + escapeHtml(h.title_line2 || '') + ' <span class="accent">' + escapeHtml(h.title_line3 || '') + '</span>';
    }
    setText('heroVerse', h.verse);
    setText('heroDesc', h.description);
    if (h.hero_image) {
        var bg = document.getElementById('heroBg');
        if (bg) bg.style.backgroundImage = 'url("' + h.hero_image + '")';
    }
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var num = h['stat' + i + '_number'];
        var lbl = h['stat' + i + '_label'];
        if (!num) continue;
        var icon = i === 1 ? 'fa-users' : (i === 2 ? 'fa-people-group' : 'fa-church');
        statsHTML += '<div class="hero-stat-row">'
            + '<div class="hero-stat-icon"><i class="fas ' + icon + '"></i></div>'
            + '<div class="hero-stat-content">'
            + '<span class="hero-stat-num">' + escapeHtml(num) + '</span>'
            + '<span class="hero-stat-lbl">' + escapeHtml(lbl || '') + '</span>'
            + '</div></div>';
    }
    setHTML('heroStats', statsHTML);
}

// ============================================
// CATEGORIES
// ============================================
function renderCategoriesHeader() {
    var h = siteContent.donations_categories_header || {};
    setText('catLabel', h.label);
    setText('catTitle', h.title);
    setText('catDesc', h.description);
    setText('catCount', donationCategories.length + ' Categories');
}
function renderCategories() {
    var grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    if (!filteredCategories.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8B6F47;padding:40px;">No categories found.</p>';
        return;
    }
    grid.innerHTML = filteredCategories.map(function (c) {
        return '<article class="donation-card" data-cat="' + escapeHtml(c.id) + '" tabindex="0" role="button">'
            + '<div class="donation-card-image">'
            + '<img src="' + escapeHtml(c.image_url || '') + '" alt="' + escapeHtml(c.title) + '" onerror="this.style.display=\'none\'">'
            + '<div class="donation-card-icon"><i class="fas ' + escapeHtml(c.icon || 'fa-heart') + '"></i></div>'
            + '</div>'
            + '<div class="donation-body">'
            + '<h3 class="donation-title">' + escapeHtml(c.title) + '</h3>'
            + '<p class="donation-desc">' + escapeHtml(c.description || '') + '</p>'
            + '<div class="donation-amounts">' + (c.amounts || []).map(function (a) { return '<span class="amount-pill">' + escapeHtml(a) + '</span>'; }).join('') + '</div>'
            + '<button class="btn-donate" type="button"><i class="fas fa-hand-holding-heart"></i><span>Donate Now</span></button>'
            + '</div></article>';
    }).join('');

    grid.querySelectorAll('[data-cat]').forEach(function (card) {
        var open = function () {
            var id = card.dataset.cat;
            var cat = donationCategories.find(function (c) { return c.id === id; });
            if (cat) openDonationModal(cat);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

function openDonationModal(cat) {
    var amounts = cat.amounts || ['$10','$25','$50','$100'];
    var amountHTML = amounts.map(function (a) { return '<button class="modal-amount-option" data-amount="' + escapeHtml(a) + '" type="button">' + escapeHtml(a) + '</button>'; }).join('');

    var html = ''
        + '<img style="width:100%;height:200px;object-fit:cover;display:block;" src="' + escapeHtml(cat.image_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
        + '<div class="modal-content">'
        + '<div class="modal-icon-wrapper"><i class="fas ' + escapeHtml(cat.icon || 'fa-heart') + '"></i></div>'
        + '<h2>' + escapeHtml(cat.title) + '</h2>'
        + '<p>' + escapeHtml(cat.description || '') + '</p>'
        + '<div class="modal-section-label">Choose an amount</div>'
        + '<div class="modal-amount-grid" id="donAmountGrid">' + amountHTML + '</div>'
        + '<div class="modal-custom-input"><span>$</span><input type="number" id="customAmount" placeholder="Or enter a custom amount" min="1" step="1"></div>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-secondary" type="button" id="btnAddToCartDonation"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
        +   '<button class="modal-btn modal-btn-primary" type="button" id="btnDonateNow"><i class="fas fa-heart"></i><span>Donate Now</span></button>'
        + '</div>'
        + '</div>';
    openModal(html);

    var selectedAmount = null;
    document.querySelectorAll('#donAmountGrid .modal-amount-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#donAmountGrid .modal-amount-option').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            selectedAmount = btn.dataset.amount;
            document.getElementById('customAmount').value = '';
        });
    });
    document.getElementById('customAmount').addEventListener('input', function () {
        if (this.value) {
            document.querySelectorAll('#donAmountGrid .modal-amount-option').forEach(function (b) { b.classList.remove('active'); });
            selectedAmount = '$' + this.value;
        }
    });

    function getAmount() {
        var custom = document.getElementById('customAmount').value.trim();
        if (custom) return Number(custom);
        if (selectedAmount) return Number(selectedAmount.replace(/[^0-9.]/g, ''));
        return 0;
    }
    document.getElementById('btnDonateNow').addEventListener('click', function () {
        var amt = getAmount();
        if (!amt) { alert('Please select or enter an amount.'); return; }
        openDonationConfirm(cat, amt);
    });
    document.getElementById('btnAddToCartDonation').addEventListener('click', function () {
        var amt = getAmount();
        if (!amt) { alert('Please select or enter an amount.'); return; }
        addDonationToCart(cat, amt);
        closeModal();
        setTimeout(openCart, 300);
    });
}

function openDonationConfirm(cat, amount) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var text = encodeURIComponent('Hello Bridge Calvary Chapel, I would like to donate ' + money(amount) + ' toward the "' + cat.title + '" ministry.');
    var html = ''
        + '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#16A34A,#22C55E);"><i class="fas fa-hand-holding-heart"></i></div>'
        + '<h2>Complete Your Gift</h2>'
        + '<p style="font-size:14px;"><strong>' + escapeHtml(cat.title) + '</strong> — ' + money(amount) + '</p>'
        + '<p>To complete your gift, please contact our church office so we can share verified payment instructions.</p>'
        + '<div class="modal-actions">'
        +   '<a class="modal-btn modal-btn-whatsapp" href="https://wa.me/' + c.whatsapp + '?text=' + text + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Continue on WhatsApp</span></a>'
        +   '<a class="modal-btn modal-btn-email" href="mailto:' + c.email + '?subject=' + encodeURIComponent('Donation — ' + cat.title) + '&body=' + text + '"><i class="fas fa-envelope"></i><span>Continue by Email</span></a>'
        + '</div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button"><span>Close</span></button></div>'
        + '</div>';
    openModal(html);
}

// ============================================
// CART
// ============================================
function addDonationToCart(cat, amount) {
    cart.push({ type: 'donation', id: cat.id, name: cat.title, image_url: cat.image_url || '', amount: amount, qty: 1 });
    saveCart();
    showToast('Added to cart: ' + cat.title);
}
function addProductToCart(product, size, color, qty) {
    cart.push({ type: 'product', id: product.id, name: product.name, image_url: product.image_url || '', price: Number(product.price), size: size || '', color: color || '', qty: qty || 1 });
    saveCart();
    showToast('Added: ' + product.name);
}
function cartTotals() {
    var donationTotal = 0, productTotal = 0;
    cart.forEach(function (i) {
        if (i.type === 'donation') donationTotal += Number(i.amount) * (i.qty || 1);
        else productTotal += Number(i.price) * (i.qty || 1);
    });
    return { donationTotal: donationTotal, productTotal: productTotal, grandTotal: donationTotal + productTotal };
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
    body.innerHTML = cart.map(function (item, idx) {
        var price = item.type === 'donation' ? Number(item.amount) : Number(item.price);
        var lineTotal = price * (item.qty || 1);
        var typeLabel = item.type === 'donation' ? 'Contribution' : 'Product';
        var variant = item.type === 'product' && (item.size || item.color) ? ((item.size ? 'Size ' + item.size : '') + (item.color ? ' · ' + item.color : '')) : '';
        return '<div class="cart-item">'
            + '<div class="cart-item-image"><img src="' + escapeHtml(item.image_url) + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '<div class="cart-item-body">'
            +   '<div class="cart-item-type ' + item.type + '">' + typeLabel + '</div>'
            +   '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>'
            +   (variant ? '<div class="cart-item-variant">' + escapeHtml(variant) + '</div>' : '')
            +   '<div class="cart-item-bottom">'
            +     (item.type === 'product'
                    ? '<div class="cart-item-qty"><button data-minus="' + idx + '">−</button><span>' + item.qty + '</span><button data-plus="' + idx + '">+</button></div>'
                    : '<span style="font-size:10.5px;color:#8B6F47;font-weight:700;">Contribution</span>')
            +     '<span class="cart-item-price">' + money(lineTotal) + '</span>'
            +     '<button class="cart-item-remove" data-remove="' + idx + '"><i class="fas fa-trash"></i></button>'
            +   '</div>'
            + '</div></div>';
    }).join('');

    body.querySelectorAll('[data-minus]').forEach(function (b) {
        b.addEventListener('click', function () {
            var i = parseInt(b.dataset.minus, 10);
            if (cart[i].qty > 1) { cart[i].qty--; saveCart(); renderCart(); }
        });
    });
    body.querySelectorAll('[data-plus]').forEach(function (b) {
        b.addEventListener('click', function () {
            var i = parseInt(b.dataset.plus, 10);
            cart[i].qty = (cart[i].qty || 1) + 1;
            saveCart(); renderCart();
        });
    });
    body.querySelectorAll('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
            cart.splice(parseInt(b.dataset.remove, 10), 1);
            saveCart(); renderCart();
        });
    });
    var t = cartTotals();
    setText('cartTotal', money(t.grandTotal));
    if (footer) footer.style.display = 'block';
}

// ============================================
// PRODUCTS + GALLERY
// ============================================
function renderStoreHeader() {
    var h = siteContent.donations_store || {};
    setText('storeTitle', h.title);
    setText('storeDesc', h.description);
}
function renderProducts() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8B6F47;padding:40px;">No products available.</p>';
        return;
    }
    grid.innerHTML = products.map(function (p) {
        var badge = p.badge ? '<span class="product-badge ' + (p.badge === 'New' ? 'new' : (p.badge === 'Best Seller' ? 'hot' : '')) + '">' + escapeHtml(p.badge) + '</span>' : '';
        var rating = p.rating ? '<div class="product-rating"><span class="stars">' + '★'.repeat(Math.round(p.rating)) + '</span> ' + p.rating + '</div>' : '';
        var oldPrice = p.old_price ? '<span class="product-old-price">' + money(p.old_price) + '</span>' : '';
        return '<article class="product-card" data-product="' + escapeHtml(p.id) + '" tabindex="0" role="button">'
            + '<div class="product-image">'
            + badge
            + '<button class="product-fav" type="button" aria-label="Favorite" onclick="event.stopPropagation()"><i class="far fa-heart"></i></button>'
            + '<img src="' + escapeHtml(p.image_url || '') + '" alt="' + escapeHtml(p.name) + '" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="product-body">'
            + (p.category ? '<div class="product-cat">' + escapeHtml(p.category) + '</div>' : '')
            + '<h3 class="product-name">' + escapeHtml(p.name) + '</h3>'
            + '<p class="product-desc">' + escapeHtml(p.description || '') + '</p>'
            + rating
            + '<div class="product-price-row"><span class="product-price">' + money(p.price) + '</span>' + oldPrice + '</div>'
            + '<button class="btn-add-cart" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
            + '</div></article>';
    }).join('');

    grid.querySelectorAll('[data-product]').forEach(function (card) {
        var open = function () {
            var id = card.dataset.product;
            var p = products.find(function (x) { return x.id === id; });
            if (p) openProductModal(p);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

function openProductModal(p) {
    var sizes = p.sizes || [];
    var colors = p.colors || [];
    var gallery = (p.gallery && p.gallery.length) ? p.gallery : [p.image_url];
    gallery = gallery.filter(function (x) { return x; });
    if (!gallery.length) gallery = [p.image_url || ''];

    var selectedSize = sizes.length ? null : '';
    var selectedColor = colors.length ? null : '';
    var qty = 1;
    var currentImage = gallery[0];

    var thumbsHTML = gallery.map(function (img, i) {
        return '<div class="gallery-thumb ' + (i === 0 ? 'active' : '') + '" data-idx="' + i + '"><img src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'"></div>';
    }).join('');

    var sizesHTML = sizes.length ? '<div class="modal-section-label">Size</div><div class="modal-option-row" id="sizeRow">'
        + sizes.map(function (s) { return '<button class="modal-option-btn" data-size="' + escapeHtml(s) + '" type="button">' + escapeHtml(s) + '</button>'; }).join('')
        + '</div>' : '';
    var colorsHTML = colors.length ? '<div class="modal-section-label">Color</div><div class="modal-option-row" id="colorRow">'
        + colors.map(function (c) { return '<button class="modal-option-btn" data-color="' + escapeHtml(c) + '" type="button">' + escapeHtml(c) + '</button>'; }).join('')
        + '</div>' : '';

    var rating = p.rating ? '<div class="product-rating" style="margin:8px 0;"><span class="stars">' + '★'.repeat(Math.round(p.rating)) + '</span> ' + p.rating + ' · ' + (p.badge || 'In Stock') + '</div>' : '';

    var html = ''
        + '<div class="modal-content">'
        + '<div class="product-gallery">'
        +   '<div class="gallery-thumbs">' + thumbsHTML + '</div>'
        +   '<div class="gallery-main"><img id="galleryMainImg" src="' + escapeHtml(currentImage) + '" alt="' + escapeHtml(p.name) + '" onerror="this.style.display=\'none\'"></div>'
        + '</div>'
        + '<h2>' + escapeHtml(p.name) + '</h2>'
        + rating
        + '<p>' + escapeHtml(p.long_description || p.description || '') + '</p>'
        + '<div class="product-price-row" style="margin:14px 0;"><span class="product-price" style="font-size:24px;">' + money(p.price) + '</span>' + (p.old_price ? '<span class="product-old-price">' + money(p.old_price) + '</span>' : '') + '</div>'
        + sizesHTML + colorsHTML
        + '<div class="qty-row" style="margin-top:14px;">'
        +   '<span class="qty-label">Quantity</span>'
        +   '<div class="qty-controls"><button class="qty-btn" id="qtyMinus" type="button">−</button><span class="qty-value" id="qtyValue">1</span><button class="qty-btn" id="qtyPlus" type="button">+</button></div>'
        + '</div>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-primary" id="btnAddProduct" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
        + '</div>'
        + '</div>';
    openModal(html);

    document.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            document.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('active'); });
            thumb.classList.add('active');
            document.getElementById('galleryMainImg').src = gallery[parseInt(thumb.dataset.idx, 10)];
        });
    });

    if (sizes.length) document.querySelectorAll('#sizeRow [data-size]').forEach(function (b) {
        b.addEventListener('click', function () {
            document.querySelectorAll('#sizeRow .modal-option-btn').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active'); selectedSize = b.dataset.size;
        });
    });
    if (colors.length) document.querySelectorAll('#colorRow [data-color]').forEach(function (b) {
        b.addEventListener('click', function () {
            document.querySelectorAll('#colorRow .modal-option-btn').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active'); selectedColor = b.dataset.color;
        });
    });
    document.getElementById('qtyMinus').addEventListener('click', function () { if (qty > 1) { qty--; setText('qtyValue', qty); } });
    document.getElementById('qtyPlus').addEventListener('click', function () { qty++; setText('qtyValue', qty); });

    document.getElementById('btnAddProduct').addEventListener('click', function () {
        if (sizes.length && !selectedSize) { alert('Please choose a size.'); return; }
        if (colors.length && !selectedColor) { alert('Please choose a color.'); return; }
        addProductToCart(p, selectedSize, selectedColor, qty);
        closeModal();
        setTimeout(openCart, 300);
    });
}

// ============================================
// DIRECT GIVING
// ============================================
function renderDirectGiving() {
    var d = siteContent.donations_bank || {};
    var header = siteContent.donations_direct || {};
    setText('directTitle', header.title);
    setText('directDesc', header.description);
    var grid = document.getElementById('directGrid');
    if (!grid) return;
    grid.innerHTML = ''
        + '<div class="direct-card">'
        + '<div class="direct-card-icon"><i class="fas fa-university"></i></div>'
        + '<h4>Bank Transfer</h4>'
        + '<p class="direct-detail"><strong>Bank:</strong> ' + escapeHtml(d.bank_name || '—') + '</p>'
        + '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(d.account_name || '—') + '</p>'
        + '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(d.account_number || '—') + '</p>'
        + '<p class="direct-detail"><strong>Branch:</strong> ' + escapeHtml(d.branch || '—') + '</p>'
        + '<p class="direct-detail"><strong>SWIFT:</strong> ' + escapeHtml(d.swift || '—') + '</p>'
        + '<p class="direct-note">' + escapeHtml(d.note || '') + '</p>'
        + '</div>'
        + '<div class="direct-card">'
        + '<div class="direct-card-icon"><i class="fas fa-mobile-alt"></i></div>'
        + '<h4>Mobile Money</h4>'
        + '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(d.mobile_number || '—') + '</p>'
        + '<p class="direct-detail"><strong>Network:</strong> ' + escapeHtml(d.mobile_network || '—') + '</p>'
        + '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(d.mobile_account || '—') + '</p>'
        + '<p class="direct-note">' + escapeHtml(d.mobile_note || '') + '</p>'
        + '</div>'
        + '<div class="direct-card">'
        + '<div class="direct-card-icon"><i class="fas fa-credit-card"></i></div>'
        + '<h4>Card Payment</h4>'
        + '<span class="badge-coming">' + escapeHtml(d.card_status || 'Coming Soon') + '</span>'
        + '<p class="direct-note">' + escapeHtml(d.card_note || '') + '</p>'
        + '</div>';
}

// ============================================
// IMPACT + CONTACT + FOOTER
// ============================================
function renderImpact() {
    var i = siteContent.donations_impact || {};
    setText('impactTitle', i.title);
    setText('impactDesc', i.description);
    if (i.background_image) {
        var bg = document.getElementById('impactBg');
        if (bg) bg.style.backgroundImage = 'url("' + i.background_image + '")';
    }
    var html = '';
    for (var n = 1; n <= 3; n++) {
        var num = i['stat' + n + '_number'];
        var lbl = i['stat' + n + '_label'];
        if (!num) continue;
        var icon = n === 1 ? 'fa-heart' : (n === 2 ? 'fa-people-group' : 'fa-church');
        html += '<div class="impact-stat"><div class="impact-stat-icon"><i class="fas ' + icon + '"></i></div><div class="impact-stat-num">' + escapeHtml(num) + '</div><div class="impact-stat-lbl">' + escapeHtml(lbl || '') + '</div></div>';
    }
    setHTML('impactStats', html);
}
function renderContactAndFooter() {
    var f = siteContent.footer || {};
    setText('contactPhone', f.phone);
    setText('contactEmail', f.email);
    setText('contactAddress', f.address);
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);
}

// ============================================
// CART OPEN/CLOSE
// ============================================
window.openCart = function () {
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderCart();
};
window.closeCart = function () {
    document.getElementById('cartDrawer').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

// ============================================
// ORDER SUMMARY (organized form)
// ============================================
window.openOrderSummary = function () {
    if (!cart.length) { alert('Your cart is empty.'); return; }
    var t = cartTotals();

    var itemsHTML = cart.map(function (i) {
        var price = i.type === 'donation' ? Number(i.amount) : Number(i.price);
        var line = price * (i.qty || 1);
        var variant = (i.size ? 'Size ' + i.size : '') + (i.color ? (i.size ? ' · ' : '') + i.color : '');
        return '<div class="order-summary-item">'
            + '<div class="order-summary-item-img"><img src="' + escapeHtml(i.image_url) + '" onerror="this.style.display=\'none\'"></div>'
            + '<div class="order-summary-item-body">'
            +   '<div class="order-summary-item-type ' + i.type + '">' + (i.type === 'donation' ? 'Contribution' : 'Product') + '</div>'
            +   '<div class="order-summary-item-name">' + escapeHtml(i.name) + '</div>'
            +   (variant ? '<div class="order-summary-item-variant">' + escapeHtml(variant) + ' · Qty ' + (i.qty || 1) + '</div>' : '<div class="order-summary-item-variant">Qty ' + (i.qty || 1) + '</div>')
            + '</div>'
            + '<div class="order-summary-item-price">' + money(line) + '</div>'
            + '</div>';
    }).join('');

    var html = ''
        + '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#F97316,#7A1F3D);"><i class="fas fa-clipboard-list"></i></div>'
        + '<h2>Complete Your Order</h2>'
        + '<p style="font-size:12.5px;">Step 1: Review your items. Step 2: Add your details. Step 3: Send to our church office.</p>'

        + '<div class="modal-section-label">Your Items</div>'
        + '<div class="order-summary-box">' + itemsHTML + '</div>'

        + '<div class="order-total-box">'
        +   '<span class="order-total-label">Grand Total</span>'
        +   '<span class="order-total-value">' + money(t.grandTotal) + '</span>'
        + '</div>'

        + '<div class="modal-section-label">Your Contact Details</div>'
        + '<form id="orderForm" class="order-form-grid">'
        +   '<div class="form-group"><label><i class="fas fa-user"></i> Your Name <span class="req">*</span></label><input type="text" name="name" placeholder="Enter your full name" required></div>'
        +   '<div class="form-group"><label><i class="fab fa-whatsapp"></i> WhatsApp / Phone <span class="req">*</span></label><input type="tel" name="phone" placeholder="+256 ..." required></div>'
        +   '<div class="form-group full"><label><i class="fas fa-envelope"></i> Email (optional)</label><input type="email" name="email" placeholder="your@email.com"></div>'
        +   '<div class="form-group full"><label><i class="fas fa-truck"></i> Delivery Preference</label>'
        +       '<select name="delivery_method">'
        +         '<option value="Collection at church">Collection at church</option>'
        +         '<option value="Delivery within Kampala">Delivery within Kampala</option>'
        +       '</select>'
        +   '</div>'
        +   '<div class="form-group full"><label><i class="fas fa-map-marker-alt"></i> Delivery Location (if delivery)</label><input type="text" name="delivery_location" placeholder="Enter delivery address"></div>'
        +   '<div class="form-group full"><label><i class="fas fa-comment"></i> Additional Notes</label><textarea name="notes" rows="2" placeholder="Anything you\'d like us to know..."></textarea></div>'
        + '</form>'

        + '<div class="modal-section-label" style="margin-top:20px;">Send Your Order</div>'
        + '<p style="font-size:11.5px;text-align:center;color:#8B6F47;">Choose how you\'d like to send this order to our church office.</p>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-whatsapp" id="btnSendWhatsApp" type="button"><i class="fab fa-whatsapp"></i><span>Send on WhatsApp</span></button>'
        +   '<button class="modal-btn modal-btn-email" id="btnSendEmail" type="button"><i class="fas fa-envelope"></i><span>Send by Email</span></button>'
        + '</div>'
        + '<p class="form-status"></p>'
        + '</div>';
    openModal(html);

    function buildMessage(payload) {
        var lines = [];
        lines.push('Hello Bridge Calvary Chapel, I would like to place an order.');
        lines.push('');
        lines.push('👤 Name: ' + (payload.name || ''));
        lines.push('📱 WhatsApp/Phone: ' + (payload.phone || ''));
        if (payload.email) lines.push('📧 Email: ' + payload.email);
        lines.push('');
        lines.push('🛒 ORDER ITEMS');
        lines.push('──────────────────────');
        cart.forEach(function (i) {
            var price = i.type === 'donation' ? Number(i.amount) : Number(i.price);
            var line = price * (i.qty || 1);
            var variant = (i.size ? ' (Size ' + i.size : '') + (i.color ? ' / ' + i.color + ')' : (i.size ? ')' : ''));
            lines.push('• ' + i.name + variant + ' — Qty ' + (i.qty || 1) + ' — ' + money(line) + (i.type === 'donation' ? '  [Contribution]' : '  [Product]'));
        });
        lines.push('──────────────────────');
        lines.push('💰 TOTAL: ' + money(t.grandTotal));
        if (t.donationTotal > 0) lines.push('   (Contributions: ' + money(t.donationTotal) + ')');
        if (t.productTotal > 0) lines.push('   (Products: ' + money(t.productTotal) + ')');
        lines.push('');
        lines.push('📦 Delivery: ' + (payload.delivery_method || '—'));
        if (payload.delivery_location) lines.push('📍 Location: ' + payload.delivery_location);
        if (payload.notes) lines.push('💬 Notes: ' + payload.notes);
        lines.push('');
        lines.push('Sent from Bridge Calvary Chapel website');
        return lines.join('\n');
    }
    function collectPayload() {
        var p = {};
        new FormData(document.getElementById('orderForm')).forEach(function (v, k) { p[k] = v; });
        return p;
    }
    async function saveOrder(payload) {
        var t2 = cartTotals();
        try {
            var res = await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    customer_name: payload.name,
                    customer_phone: payload.phone,
                    customer_email: payload.email || null,
                    delivery_method: payload.delivery_method,
                    delivery_location: payload.delivery_location || null,
                    notes: payload.notes || null,
                    items: cart,
                    donation_total: t2.donationTotal,
                    product_total: t2.productTotal,
                    grand_total: t2.grandTotal,
                    currency: 'USD',
                    status: 'pending'
                })
            });
            return res.ok;
        } catch (e) { console.warn('save order failed', e); return false; }
    }

    document.getElementById('btnSendWhatsApp').addEventListener('click', async function () {
        var st = document.querySelector('.form-status');
        var p = collectPayload();
        if (!p.name || !p.phone) { alert('Please enter your name and WhatsApp number.'); return; }
        st.textContent = 'Preparing...'; st.className = 'form-status loading';
        await saveOrder(p);
        st.textContent = '✅ Order prepared. Opening WhatsApp...'; st.className = 'form-status success';
        var c = window.CHURCH_CONTACT || { whatsapp: '' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage(p)), '_blank', 'noopener');
    });

    document.getElementById('btnSendEmail').addEventListener('click', async function () {
        var st = document.querySelector('.form-status');
        var p = collectPayload();
        if (!p.name || !p.phone) { alert('Please enter your name and WhatsApp number.'); return; }
        st.textContent = 'Preparing...'; st.className = 'form-status loading';
        await saveOrder(p);
        st.textContent = '✅ Order prepared. Opening email...'; st.className = 'form-status success';
        var c = window.CHURCH_CONTACT || { email: '' };
        window.location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('Bridge Calvary Chapel Order') + '&body=' + encodeURIComponent(buildMessage(p));
    });
};

// ============================================
// PRAYER REQUEST
// ============================================
window.openPrayerRequest = function () {
    openModal('<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#7A1F3D,#A83A5C);"><i class="fas fa-pray"></i></div>'
        + '<h2>Request Prayer</h2>'
        + '<p>We would be honored to pray for you.</p>'
        + '<form id="prayerForm" class="order-form-grid">'
        + '<div class="form-group full"><label><i class="fas fa-user"></i> Your Name <span class="req">*</span></label><input type="text" name="name" required></div>'
        + '<div class="form-group full"><label><i class="fas fa-envelope"></i> Email <span class="req">*</span></label><input type="email" name="email" required></div>'
        + '<div class="form-group full"><label><i class="fas fa-pray"></i> Prayer Request <span class="req">*</span></label><textarea name="message" rows="4" required></textarea></div>'
        + '</form>'
        + '<button class="modal-btn modal-btn-primary" id="btnSubmitPrayer" type="button" style="margin-top:14px;"><i class="fas fa-pray"></i><span>Submit</span></button>'
        + '<p class="form-status"></p>'
        + '</div>');

    document.getElementById('btnSubmitPrayer').addEventListener('click', async function () {
        var st = document.querySelector('.form-status');
        var p = {};
        new FormData(document.getElementById('prayerForm')).forEach(function (v, k) { p[k] = v; });
        if (!p.name || !p.email || !p.message) { alert('Please fill in all required fields.'); return; }
        st.textContent = 'Submitting...'; st.className = 'form-status loading';
        try {
            await window.db.submitVolunteerRequest({ ministry: 'Prayer Request', name: p.name, email: p.email, message: p.message });
            st.textContent = '✅ Thank you! We will pray for you.'; st.className = 'form-status success';
        } catch (err) {
            st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error';
        }
    });
};

// ============================================
// LOAD DATA
// ============================================
async function loadDonationData() {
    console.log('📥 Loading donations data...');
    try {
        var content = await window.db.getSiteContent();
        siteContent = content || {};

        var base = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
        var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

        var [catRes, prodRes] = await Promise.all([
            fetch(base + 'donation_categories?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key),
            fetch(base + 'products?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key)
        ]);
        var catData = await catRes.json();
        var prodData = await prodRes.json();
        donationCategories = Array.isArray(catData) ? catData : [];
        products = Array.isArray(prodData) ? prodData : [];
        filteredCategories = donationCategories.slice();

        renderHero();
        renderCategoriesHeader();
        renderCategories();
        renderDirectGiving();
        renderStoreHeader();
        renderProducts();
        renderImpact();
        renderContactAndFooter();
        updateCartBadge();
        renderCart();

        console.log('✅ Loaded: ' + donationCategories.length + ' categories, ' + products.length + ' products');
    } catch (err) {
        console.error('❌ Load error:', err);
    }
}

if (window.db) setTimeout(loadDonationData, 100);
else window.addEventListener('supabase-ready', loadDonationData);
setTimeout(function () { if (window.db && Object.keys(siteContent).length === 0) loadDonationData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ donations.js initialized');

    var navbar = document.getElementById('navbar');
    if (navbar) window.addEventListener('scroll', function () {
        navbar.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(26,10,26,0.5)' : 'none';
    }, { passive: true });

    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) navToggle.addEventListener('click', function () {
        var open = navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', open);
        var icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
    });

    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    var cartBtn = document.getElementById('cartBtn');
    var cartClose = document.getElementById('cartClose');
    var cartOverlay = document.getElementById('cartOverlay');
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    var cartClear = document.getElementById('cartClear');
    if (cartClear) cartClear.addEventListener('click', function () {
        if (confirm('Clear your cart?')) { cart = []; saveCart(); renderCart(); }
    });

    var cartCheckout = document.getElementById('cartCheckout');
    if (cartCheckout) cartCheckout.addEventListener('click', function () {
        closeCart();
        setTimeout(openOrderSummary, 350);
    });

    var btnPrayer = document.getElementById('btnPrayerRequest');
    if (btnPrayer) btnPrayer.addEventListener('click', openPrayerRequest);

    var search = document.getElementById('catSearch');
    if (search) search.addEventListener('input', function () {
        var q = this.value.toLowerCase().trim();
        filteredCategories = donationCategories.filter(function (c) {
            return !q || (c.title || '').toLowerCase().indexOf(q) > -1 || (c.description || '').toLowerCase().indexOf(q) > -1;
        });
        renderCategories();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeModal(); closeCart(); }
    });

    var nl = document.getElementById('footerNewsletter');
    if (nl) nl.addEventListener('submit', async function (e) {
        e.preventDefault();
        var input = nl.querySelector('input[type="email"]');
        var email = input.value.trim();
        if (!email || email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }
        try {
            var r = await window.db.subscribeNewsletter(email);
            alert(r.duplicate ? 'You are already subscribed!' : '✅ Thank you for subscribing!');
            input.value = '';
        } catch (err) { console.error(err); alert('❌ Something went wrong.'); }
    });

    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});