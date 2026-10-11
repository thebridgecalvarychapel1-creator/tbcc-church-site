// ============================================
// DONATIONS + CHURCH SHOP — Bridge Calvary Chapel
// File: js/donations.js  (full file)
// ============================================

var siteContent = {};
var donationCategories = [];
var allProducts = [];
var filteredProducts = [];
var currentShopCategory = 'all';

// Product cart — separate from donation cart
var cart = JSON.parse(localStorage.getItem('bcc_cart') || '[]');

// Donation pledges cart — kept separate so pledges never mix with purchases
var donationCart = JSON.parse(localStorage.getItem('bcc_donation_cart') || '[]');

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function money(n) { return 'UGX ' + Number(n || 0).toLocaleString(); }
function saveCart() { localStorage.setItem('bcc_cart', JSON.stringify(cart)); updateCartBadge(); }
function saveDonationCart() { localStorage.setItem('bcc_donation_cart', JSON.stringify(donationCart)); updateDonationCartUI(); }
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }

function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'bcc-toast';
    t.innerHTML = '<i class="fas fa-check-circle"></i> ' + escapeHtml(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 20);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2200);
}

function parseGallery(raw) {
    if (Array.isArray(raw)) return raw.slice();
    if (typeof raw === 'string' && raw.length > 2) {
        try {
            var p = JSON.parse(raw);
            if (Array.isArray(p)) return p;
        } catch (e) {
            return raw.split(',').map(function (s) {
                return s.trim().replace(/^["'{]|["'}]$/g, '');
            }).filter(function (s) { return s; });
        }
    }
    return [];
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
    var cartEl = document.getElementById('cartDrawer');
    if (!cartEl || !cartEl.classList.contains('active')) {
        document.body.style.overflow = '';
    }
};

// ============================================
// SUPPORT TABS
// ============================================
function setupSupportTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length) {
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
                var id = 'tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
                var target = document.getElementById(id);
                if (target) target.classList.add('active');
            });
        });
    }
    var giveCard = document.querySelector('.support-card-give');
    if (giveCard) giveCard.addEventListener('click', function () {
        var el = document.getElementById('directGiving');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    var shopCard = document.querySelector('.support-card-shop');
    if (shopCard) shopCard.addEventListener('click', function () {
        var el = document.getElementById('shopSection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
}

// ============================================
// HERO
// ============================================
function renderHero() {
    var h = siteContent.donations_hero || {};
    setText('heroEyebrow', h.eyebrow || 'BRIDGE CALVARY CHAPEL');
    var titleEl = document.getElementById('heroTitle');
    if (titleEl && h.title_line1) {
        titleEl.innerHTML = escapeHtml(h.title_line1) + '<br>' + escapeHtml(h.title_line2 || '') + ' <span class="accent">' + escapeHtml(h.title_line3 || '') + '</span>';
    } else if (titleEl) {
        titleEl.innerHTML = 'Give &amp; Support the Work of the <span class="accent">Ministry</span>';
    }
    setText('heroVerse', h.verse);
    setText('heroDesc', h.description);
    var url = secImg('donations_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var num = h['stat' + i + '_number'];
        var lbl = h['stat' + i + '_label'];
        if (!num) continue;
        var icon = i === 1 ? 'fa-users' : (i === 2 ? 'fa-people-group' : 'fa-church');
        statsHTML += '<div class="hero-stat-row"><div class="hero-stat-icon"><i class="fas ' + icon + '"></i></div><div class="hero-stat-content"><span class="hero-stat-num">' + escapeHtml(num) + '</span><span class="hero-stat-lbl">' + escapeHtml(lbl || '') + '</span></div></div>';
    }
    setHTML('heroStats', statsHTML);
}

// ============================================
// FEATURE CARDS
// ============================================
function renderFeatureCards() {
    var container = document.getElementById('featureCards');
    if (!container) return;
    var features = [
        { icon: 'fa-shield-alt', title: 'Secure Giving', desc: 'Your information is safe & secure.', color: 'blue' },
        { icon: 'fa-tshirt', title: 'Church Merchandise', desc: 'Quality products with a purpose.', color: 'maroon' },
        { icon: 'fa-hand-holding-heart', title: 'Support Our Ministries', desc: 'Help us reach more people.', color: 'blue' },
        { icon: 'fa-headset', title: 'Friendly Support', desc: 'We are here to help.', color: 'maroon' }
    ];
    container.innerHTML = features.map(function (f) {
        return '<div class="feature-card"><div class="feature-icon ' + f.color + '"><i class="fas ' + f.icon + '"></i></div><h4>' + f.title + '</h4><p>' + f.desc + '</p></div>';
    }).join('');
}

// ============================================
// DONATION HEADER
// ============================================
function renderCategoriesHeader() {
    var h = siteContent.donations_categories_header || {};
    setText('catLabel', h.label || 'WHAT YOUR GIFT SUPPORTS');
    setText('catTitle', h.title || (donationCategories.length + ' Categories'));
    setText('catDesc', h.description || 'Choose a ministry or area to support. Every gift makes a difference.');
    setText('catCount', donationCategories.length + ' Categories');
}

// ============================================
// DONATION CARDS
// ============================================
function renderCategories() {
    var grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    if (!donationCategories.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#49658A;padding:40px;">No categories available.</p>';
        return;
    }
    grid.innerHTML = donationCategories.map(function (c) {
        return '<article class="donation-card" data-cat="' + escapeHtml(c.id) + '" tabindex="0" role="button">'
            + '<div class="donation-card-image">'
            +   '<img src="' + escapeHtml(c.image_url || '') + '" alt="' + escapeHtml(c.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="donation-card-icon"><i class="fas ' + escapeHtml(c.icon || 'fa-heart') + '"></i></div>'
            + '</div>'
            + '<div class="donation-body">'
            +   '<h3 class="donation-title">' + escapeHtml(c.title) + '</h3>'
            +   '<p class="donation-desc">' + escapeHtml(c.description || '') + '</p>'
            +   '<div class="donation-actions">'
            +     '<button class="btn-mini btn-donate-mini" type="button" data-action="donate"><i class="fas fa-hand-holding-heart"></i> Donate</button>'
            +     '<button class="btn-mini btn-buy-mini" type="button" data-action="buy"><i class="fas fa-shopping-bag"></i> Buy</button>'
            +   '</div>'
            + '</div>'
            + '</article>';
    }).join('');

    grid.querySelectorAll('[data-cat]').forEach(function (card) {
        var open = function () {
            var cat = donationCategories.find(function (c) { return c.id === card.dataset.cat; });
            if (cat) openDonationPanel(cat);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

// ============================================
// DONATION DETAIL PANEL
// ============================================
function openDonationPanel(cat) {
    var amounts = cat.amounts || ['UGX 10,000', 'UGX 25,000', 'UGX 50,000', 'UGX 100,000'];
    var amountsHTML = amounts.map(function (a) {
        return '<button class="modal-amount-option" data-amount="' + escapeHtml(a) + '" type="button">' + escapeHtml(a) + '</button>';
    }).join('');

    var gallery = parseGallery(cat.gallery);
    if (cat.image_url && gallery.indexOf(cat.image_url) === -1) gallery.unshift(cat.image_url);
    gallery = gallery.filter(function (x) { return x && typeof x === 'string'; });
    if (!gallery.length) gallery = [''];

    var imageHTML = '';
    if (gallery.length > 1) {
        var thumbs = gallery.map(function (img, i) {
            return '<div class="gallery-thumb ' + (i === 0 ? 'active' : '') + '" data-idx="' + i + '"><img src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'"></div>';
        }).join('');
        imageHTML = '<div class="product-gallery"><div class="gallery-thumbs">' + thumbs + '</div><div class="gallery-main"><img id="galleryMainImg" src="' + escapeHtml(gallery[0]) + '" alt="" onerror="this.style.display=\'none\'"></div></div>';
    } else {
        imageHTML = '<img class="modal-hero-image" src="' + escapeHtml(gallery[0]) + '" alt="' + escapeHtml(cat.title || '') + '" onerror="this.style.display=\'none\'">';
    }

    var html = ''
        + imageHTML
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper"><i class="fas ' + escapeHtml(cat.icon || 'fa-heart') + '"></i></div>'
        +   '<h2>' + escapeHtml(cat.title || '') + '</h2>'
        +   '<p class="modal-description">' + escapeHtml(cat.description || '') + '</p>'
        +   (cat.long_description ? '<p class="modal-description">' + escapeHtml(cat.long_description) + '</p>' : '')

        +   '<div class="modal-section-label">What kind of support?</div>'
        +   '<div class="modal-option-row" id="supportTypeRow">'
        +     '<button class="modal-option-btn active" data-type="money" type="button"><i class="fas fa-hand-holding-usd"></i> Donate Money</button>'
        +     '<button class="modal-option-btn" data-type="goods" type="button"><i class="fas fa-box"></i> Donate Goods</button>'
        +   '</div>'

        +   '<div id="moneySection">'
        +     '<div class="modal-section-label">Choose an amount</div>'
        +     '<div class="modal-amount-grid" id="donAmountGrid">' + amountsHTML + '</div>'
        +     '<div class="modal-custom-input"><span>UGX</span><input type="number" id="customAmount" placeholder="Or enter custom amount" min="1000" step="1000"></div>'
        +   '</div>'

        +   '<div id="goodsSection" style="display:none;">'
        +     '<div class="modal-section-label">What would you like to donate?</div>'
        +     '<div class="modal-custom-input"><i class="fas fa-box" style="color:#005BEA;"></i><input type="text" id="goodsItem" placeholder="e.g. Bibles, toys, food items..."></div>'
        +     '<div class="modal-custom-input"><i class="fas fa-sort-numeric-up" style="color:#005BEA;"></i><input type="number" id="goodsQty" placeholder="Quantity" min="1" step="1"></div>'
        +     '<div class="modal-custom-input"><i class="fas fa-clipboard-check" style="color:#7A1F3D;"></i>'
        +       '<select id="goodsCondition" style="flex:1;border:none;outline:none;font-size:13px;font-family:inherit;background:transparent;">'
        +         '<option value="">Condition (optional)</option>'
        +         '<option value="New">New</option>'
        +         '<option value="Like new">Like new</option>'
        +         '<option value="Good">Good</option>'
        +         '<option value="Used">Used</option>'
        +       '</select>'
        +     '</div>'
        +   '</div>'

        +   '<div class="modal-section-label">Your name (optional)</div>'
        +   '<div class="modal-custom-input"><i class="fas fa-user" style="color:#005BEA;"></i><input type="text" id="donorName" placeholder="Your name"></div>'

        +   '<div class="modal-section-label">Message (optional)</div>'
        +   '<div class="modal-custom-input" style="align-items:flex-start;"><textarea id="donorNote" rows="2" placeholder="Any notes we should know..." style="flex:1;border:none;outline:none;font-size:13px;font-family:inherit;resize:vertical;background:transparent;"></textarea></div>'

        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-secondary" type="button" id="btnAddToCartDonation"><i class="fas fa-cart-plus"></i><span>Add to Donation Cart</span></button>'
        +     '<button class="modal-btn modal-btn-primary" type="button" id="btnDonateNow"><i class="fas fa-heart"></i><span>Continue</span></button>'
        +   '</div>'
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

    var currentType = 'money';
    document.querySelectorAll('#supportTypeRow .modal-option-btn').forEach(function (b) {
        b.addEventListener('click', function () {
            document.querySelectorAll('#supportTypeRow .modal-option-btn').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            currentType = b.dataset.type;
            document.getElementById('moneySection').style.display = currentType === 'money' ? 'block' : 'none';
            document.getElementById('goodsSection').style.display = currentType === 'goods' ? 'block' : 'none';
        });
    });

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
            selectedAmount = 'UGX ' + Number(this.value).toLocaleString();
        }
    });

    function getAmountNumber() {
        var custom = document.getElementById('customAmount').value.trim();
        if (custom) return Number(custom);
        if (selectedAmount) return Number(selectedAmount.replace(/[^0-9]/g, ''));
        return 0;
    }

    document.getElementById('btnDonateNow').addEventListener('click', function () {
        var donorName = document.getElementById('donorName').value.trim();
        var note = document.getElementById('donorNote').value.trim();

        if (currentType === 'money') {
            var amt = getAmountNumber();
            if (!amt) { alert('Please select or enter an amount.'); return; }
            openDonationConfirm(cat, amt, donorName, note);
        } else {
            var goods = document.getElementById('goodsItem').value.trim();
            var qty = document.getElementById('goodsQty').value.trim();
            if (!goods) { alert('Please tell us what you would like to donate.'); return; }
            openGoodsConfirm(cat, goods, qty, donorName, note);
        }
    });

    document.getElementById('btnAddToCartDonation').addEventListener('click', function () {
        if (currentType === 'money') {
            var amt = getAmountNumber();
            if (!amt) { alert('Please select or enter an amount.'); return; }
            addDonationToCart(cat, amt);
            closeModal();
            setTimeout(function () { if (window.openDonationCart) window.openDonationCart(); }, 300);
        } else {
            var goods = document.getElementById('goodsItem').value.trim();
            var qty = document.getElementById('goodsQty').value.trim();
            var cond = document.getElementById('goodsCondition') ? document.getElementById('goodsCondition').value : '';
            if (!goods) { alert('Please tell us what you would like to donate.'); return; }
            addGoodsToCart(cat, goods, qty, cond);
            closeModal();
            setTimeout(function () { if (window.openDonationCart) window.openDonationCart(); }, 300);
        }
    });
}

function openDonationConfirm(cat, amount, donorName, note) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var lines = [];
    lines.push('Hello Bridge Calvary Chapel, I would like to give ' + money(amount) + ' toward the "' + cat.title + '" ministry.');
    if (donorName) lines.push('Name: ' + donorName);
    if (note) lines.push('Note: ' + note);
    var text = encodeURIComponent(lines.join('\n'));
    var html = ''
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#16A34A,#22C55E);"><i class="fas fa-hand-holding-heart"></i></div>'
        +   '<h2>Continue Your Gift</h2>'
        +   '<p style="font-size:14px;"><strong>' + escapeHtml(cat.title) + '</strong> — ' + money(amount) + '</p>'
        +   '<p>To complete your gift, please contact our church office so we can share verified payment instructions.</p>'
        +   '<div class="modal-actions">'
        +     '<a class="modal-btn modal-btn-whatsapp" href="https://wa.me/' + c.whatsapp + '?text=' + text + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Continue on WhatsApp</span></a>'
        +     '<a class="modal-btn modal-btn-email" href="mailto:' + c.email + '?subject=' + encodeURIComponent('Donation — ' + cat.title) + '&body=' + text + '"><i class="fas fa-envelope"></i><span>Continue by Email</span></a>'
        +   '</div>'
        +   '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button"><span>Close</span></button></div>'
        + '</div>';
    openModal(html);
}

function openGoodsConfirm(cat, goods, qty, donorName, note) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var lines = [];
    lines.push('Hello Bridge Calvary Chapel, I would like to donate physical items to the "' + cat.title + '" ministry.');
    lines.push('Item: ' + goods);
    if (qty) lines.push('Quantity: ' + qty);
    if (donorName) lines.push('Name: ' + donorName);
    if (note) lines.push('Note: ' + note);
    lines.push('');
    lines.push('Please contact me to coordinate drop-off or collection.');
    var text = encodeURIComponent(lines.join('\n'));
    var html = ''
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#7A1F3D,#A83A5C);"><i class="fas fa-box"></i></div>'
        +   '<h2>Coordinate Your Item Donation</h2>'
        +   '<p style="font-size:14px;"><strong>' + escapeHtml(cat.title) + '</strong> — ' + escapeHtml(goods) + (qty ? ' (' + escapeHtml(qty) + ')' : '') + '</p>'
        +   '<p>Please contact our church office to arrange drop-off or collection. Our team will confirm before promising collection or delivery.</p>'
        +   '<div class="modal-actions">'
        +     '<a class="modal-btn modal-btn-whatsapp" href="https://wa.me/' + c.whatsapp + '?text=' + text + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Continue on WhatsApp</span></a>'
        +     '<a class="modal-btn modal-btn-email" href="mailto:' + c.email + '?subject=' + encodeURIComponent('Item Donation — ' + cat.title) + '&body=' + text + '"><i class="fas fa-envelope"></i><span>Continue by Email</span></a>'
        +   '</div>'
        +   '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button"><span>Close</span></button></div>'
        + '</div>';
    openModal(html);
}

// ============================================
// CARTS
// ============================================
function addDonationToCart(cat, amount) {
    donationCart.push({ type: 'donation', id: cat.id, name: cat.title, image_url: cat.image_url || '', amount: amount, qty: 1 });
    saveDonationCart();
    showToast('Added to donation cart: ' + cat.title);
}
function addGoodsToCart(cat, goods, qty, condition) {
    donationCart.push({
        type: 'donation',
        id: cat.id + '-goods',
        name: cat.title + ' — ' + goods,
        image_url: cat.image_url || '',
        amount: 0,
        qty: Number(qty) || 1,
        goods: goods,
        condition: condition || ''
    });
    saveDonationCart();
    showToast('Added goods donation');
}
function addProductToCart(product, size, color, qty) {
    cart.push({
        type: 'product',
        id: product.id,
        name: product.name,
        image_url: product.image_url || '',
        price: Number(product.price),
        size: size || '',
        color: color || '',
        qty: qty || 1
    });
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
function updateDonationCartUI() {
    var badge = document.getElementById('donationCartCount');
    if (badge) {
        var n = donationCart.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
        badge.textContent = n;
    }
    if (window.updateDonationBadge) window.updateDonationBadge();
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
        var typeLabel = item.type === 'donation' ? (item.goods ? 'Goods Donation' : 'Contribution') : 'Product';
        var variant = (item.size ? 'Size ' + item.size : '') + (item.color ? (item.size ? ' · ' : '') + item.color : '');
        return '<div class="cart-item">'
            + '<div class="cart-item-image"><img src="' + escapeHtml(item.image_url) + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '<div class="cart-item-body">'
            +   '<div class="cart-item-type ' + item.type + '">' + typeLabel + '</div>'
            +   '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>'
            +   (variant ? '<div class="cart-item-variant">' + escapeHtml(variant) + '</div>' : '')
            +   '<div class="cart-item-bottom">'
            +     (item.type === 'product'
                    ? '<div class="cart-item-qty"><button data-minus="' + idx + '">−</button><span>' + item.qty + '</span><button data-plus="' + idx + '">+</button></div>'
                    : '<span style="font-size:10.5px;color:#8B6F47;font-weight:700;">' + (item.goods ? 'Qty ' + (item.qty || 1) : 'Contribution') + '</span>')
            +     '<span class="cart-item-price">' + (item.goods ? '—' : money(lineTotal)) + '</span>'
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
// SHOP
// ============================================
function renderStoreHeader() {
    var h = siteContent.donations_store || {};
    setText('storeTitle', h.title || 'Bridge Calvary Chapel Store');
    setText('storeDesc', h.description || 'Support the church by purchasing official church merchandise.');
}

function getShopCategories() {
    var cats = {};
    allProducts.forEach(function (p) {
        if (p.category && !cats[p.category]) cats[p.category] = true;
    });
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
    if (currentShopCategory === 'all') {
        filteredProducts = allProducts.slice();
    } else {
        filteredProducts = allProducts.filter(function (p) { return p.category === currentShopCategory; });
    }
    renderProducts();
}

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
        return '<article class="product-card" data-product="' + escapeHtml(p.id) + '" tabindex="0" role="button">'
            + '<div class="product-image">'
            +   badge
            +   '<button class="product-fav" type="button" aria-label="Favorite" onclick="event.stopPropagation()"><i class="far fa-heart"></i></button>'
            +   '<img src="' + escapeHtml(p.image_url || '') + '" alt="' + escapeHtml(p.name || '') + '" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="product-body">'
            +   (p.category ? '<div class="product-cat">' + escapeHtml(p.category) + '</div>' : '')
            +   '<h3 class="product-name">' + escapeHtml(p.name) + '</h3>'
            +   '<p class="product-desc">' + escapeHtml(p.description || '') + '</p>'
            +   rating
            +   '<div class="product-price-row"><span class="product-price">' + money(p.price) + '</span>' + oldPrice + '</div>'
            +   '<button class="btn-add-cart" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
            + '</div></article>';
    }).join('');

    grid.querySelectorAll('[data-product]').forEach(function (card) {
        var open = function () {
            var p = allProducts.find(function (x) { return x.id === card.dataset.product; });
            if (p) openProductPanel(p);
        };
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn-add-cart') || e.target.closest('.product-fav')) return;
            open();
        });
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    grid.querySelectorAll('.btn-add-cart').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var p = allProducts.find(function (x) { return x.id === btn.closest('.product-card').dataset.product; });
            if (p) openProductPanel(p);
        });
    });
}

function openProductPanel(p) {
    if (!p) return;

    var sizes = Array.isArray(p.sizes) ? p.sizes.slice() : [];
    var colors = Array.isArray(p.colors) ? p.colors.slice() : [];

    var gallery = parseGallery(p.gallery);
    if (p.image_url && gallery.indexOf(p.image_url) === -1) {
        gallery.unshift(p.image_url);
    }
    gallery = gallery.filter(function (x) { return x && typeof x === 'string'; });
    if (!gallery.length) gallery = [''];

    var selectedSize = sizes.length ? null : '';
    var selectedColor = colors.length ? null : '';
    var qty = 1;

    var thumbsHTML = '';
    if (gallery.length > 1) {
        thumbsHTML = gallery.map(function (img, i) {
            return '<div class="gallery-thumb ' + (i === 0 ? 'active' : '') + '" data-idx="' + i + '">'
                + '<img src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'">'
                + '</div>';
        }).join('');
    }

    var sizesHTML = sizes.length
        ? '<div class="modal-section-label">Size</div><div class="modal-option-row" id="sizeRow">'
            + sizes.map(function (s) { return '<button class="modal-option-btn" data-size="' + escapeHtml(s) + '" type="button">' + escapeHtml(s) + '</button>'; }).join('')
            + '</div>' : '';

    var colorsHTML = colors.length
        ? '<div class="modal-section-label">Color</div><div class="modal-option-row" id="colorRow">'
            + colors.map(function (c) { return '<button class="modal-option-btn" data-color="' + escapeHtml(c) + '" type="button">' + escapeHtml(c) + '</button>'; }).join('')
            + '</div>' : '';

    var rating = p.rating ? '<div class="product-rating" style="margin:8px 0;"><span class="stars">' + '★'.repeat(Math.round(p.rating)) + '</span> ' + p.rating + (p.stock ? ' · In stock (' + p.stock + ')' : '') + '</div>' : '';

    var galleryHTML;
    if (gallery.length > 1) {
        galleryHTML = '<div class="product-gallery">'
            + '<div class="gallery-thumbs">' + thumbsHTML + '</div>'
            + '<div class="gallery-main"><img id="galleryMainImg" src="' + escapeHtml(gallery[0]) + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '</div>';
    } else {
        galleryHTML = '<img class="modal-hero-image" src="' + escapeHtml(gallery[0]) + '" alt="' + escapeHtml(p.name || '') + '" onerror="this.style.display=\'none\'">';
    }

    var html = ''
        + '<div class="modal-content">'
        +   galleryHTML
        +   '<h2>' + escapeHtml(p.name || '') + '</h2>'
        +   rating
        +   '<p>' + escapeHtml(p.long_description || p.description || '') + '</p>'
        +   '<div class="product-price-row" style="margin:14px 0;">'
        +     '<span class="product-price" style="font-size:24px;">' + money(p.price) + '</span>'
        +     (p.old_price ? '<span class="product-old-price">' + money(p.old_price) + '</span>' : '')
        +   '</div>'
        +   sizesHTML
        +   colorsHTML
        +   '<div class="qty-row" style="margin-top:14px;">'
        +     '<span class="qty-label">Quantity</span>'
        +     '<div class="qty-controls">'
        +       '<button class="qty-btn" id="qtyMinus" type="button">−</button>'
        +       '<span class="qty-value" id="qtyValue">1</span>'
        +       '<button class="qty-btn" id="qtyPlus" type="button">+</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-primary" id="btnAddProduct" type="button"><i class="fas fa-cart-plus"></i><span>Add to Cart</span></button>'
        +   '</div>'
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
        document.querySelectorAll('#sizeRow [data-size]').forEach(function (b) {
            b.addEventListener('click', function () {
                document.querySelectorAll('#sizeRow .modal-option-btn').forEach(function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                selectedSize = b.dataset.size;
            });
        });
    }
    if (colors.length) {
        document.querySelectorAll('#colorRow [data-color]').forEach(function (b) {
            b.addEventListener('click', function () {
                document.querySelectorAll('#colorRow .modal-option-btn').forEach(function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                selectedColor = b.dataset.color;
            });
        });
    }

    document.getElementById('qtyMinus').addEventListener('click', function () {
        if (qty > 1) { qty--; setText('qtyValue', qty); }
    });
    document.getElementById('qtyPlus').addEventListener('click', function () {
        qty++;
        setText('qtyValue', qty);
    });

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
    setText('directTitle', header.title || 'Direct Church Giving');
    setText('directDesc', header.description || 'Bank transfers, mobile money, and other verified donation methods');
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
    var url = secImg('donations_impact');
    if (url) { var bg = document.getElementById('impactBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
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
// PRODUCT CART DRAWER
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
// ORDER SUMMARY (products)
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
            +   '<div class="order-summary-item-type ' + i.type + '">' + (i.type === 'donation' ? (i.goods ? 'Goods' : 'Contribution') : 'Product') + '</div>'
            +   '<div class="order-summary-item-name">' + escapeHtml(i.name) + '</div>'
            +   (variant ? '<div class="order-summary-item-variant">' + escapeHtml(variant) + ' · Qty ' + (i.qty || 1) + '</div>' : '<div class="order-summary-item-variant">Qty ' + (i.qty || 1) + '</div>')
            + '</div>'
            + '<div class="order-summary-item-price">' + (i.goods ? '—' : money(line)) + '</div>'
            + '</div>';
    }).join('');

    var html = ''
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#005BEA,#078BFF);"><i class="fas fa-clipboard-list"></i></div>'
        +   '<h2>Complete Your Order</h2>'
        +   '<p style="font-size:12.5px;">Review items, add your details, then send to our church office.</p>'
        +   '<div class="modal-section-label">Your Items</div>'
        +   '<div class="order-summary-box">' + itemsHTML + '</div>'
        +   '<div class="order-total-box"><span class="order-total-label">Grand Total</span><span class="order-total-value">' + money(t.grandTotal) + '</span></div>'
        +   '<div class="modal-section-label">Your Contact Details</div>'
        +   '<form id="orderForm" class="order-form-grid">'
        +     '<div class="form-group"><label><i class="fas fa-user"></i> Your Name <span class="req">*</span></label><input type="text" name="name" placeholder="Enter your full name" required></div>'
        +     '<div class="form-group"><label><i class="fab fa-whatsapp"></i> WhatsApp / Phone <span class="req">*</span></label><input type="tel" name="phone" placeholder="+256 ..." required></div>'
        +     '<div class="form-group full"><label><i class="fas fa-envelope"></i> Email (optional)</label><input type="email" name="email" placeholder="your@email.com"></div>'
        +     '<div class="form-group full"><label><i class="fas fa-truck"></i> Delivery Preference</label><select name="delivery_method"><option value="Collection at church">Collection at church</option><option value="Delivery within Kampala">Delivery within Kampala</option></select></div>'
        +     '<div class="form-group full"><label><i class="fas fa-map-marker-alt"></i> Delivery Location (if delivery)</label><input type="text" name="delivery_location" placeholder="Enter delivery address"></div>'
        +     '<div class="form-group full"><label><i class="fas fa-comment"></i> Additional Notes</label><textarea name="notes" rows="2" placeholder="Anything you\'d like us to know..."></textarea></div>'
        +   '</form>'
        +   '<div class="modal-section-label" style="margin-top:20px;">Send Your Order</div>'
        +   '<p style="font-size:11.5px;text-align:center;color:#8B6F47;">Choose how you\'d like to send this order to our church office.</p>'
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-whatsapp" id="btnSendWhatsApp" type="button"><i class="fab fa-whatsapp"></i><span>Send on WhatsApp</span></button>'
        +     '<button class="modal-btn modal-btn-email" id="btnSendEmail" type="button"><i class="fas fa-envelope"></i><span>Send by Email</span></button>'
        +   '</div>'
        +   '<p class="form-status"></p>'
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
            var tag = i.goods ? '  [Goods Donation]' : (i.type === 'donation' ? '  [Contribution]' : '  [Product]');
            var priceStr = i.goods ? 'To be coordinated' : money(line);
            lines.push('• ' + i.name + variant + ' — Qty ' + (i.qty || 1) + ' — ' + priceStr + tag);
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
                    currency: 'UGX',
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
// PRAYER
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
        } catch (err) { st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; }
    });
};

// ============================================
// DONATION WIZARD
// ============================================
(function () {
    var wizardState = {
        step: 1,
        donor: { name: '', phone: '', email: '', contact_method: 'WhatsApp' },
        delivery: 'pickup',
        address: { district: '', town: '', street: '', landmark: '', notes: '' },
        pickup: { date: '', time: '', notes: '' }
    };

    function q(id) { return document.getElementById(id); }

    window.openDonationCart = function () {
        updateDonationCartUI();
        var html = ''
            + '<div class="wizard">'
            +   '<div class="wizard-title">Donation Cart</div>'
            +   '<div class="wizard-subtitle">Review your pledges, then send them to the church office.</div>'
            +   renderDonationCartItems()
            +   '<div class="wizard-actions">'
            +     '<button class="modal-btn modal-btn-secondary" type="button" onclick="closeModal()"><span>Continue Browsing</span></button>'
            +     (donationCart.length
                    ? '<button class="modal-btn modal-btn-primary" type="button" id="donCheckoutBtn"><span>Proceed to Send</span> <i class="fas fa-arrow-right"></i></button>'
                    : '')
            +   '</div>'
            + '</div>';
        openModal(html);
        var btn = document.getElementById('donCheckoutBtn');
        if (btn) btn.addEventListener('click', function () { window.startDonationWizard(); });
        bindDonationCartRemove();
    };

    function renderDonationCartItems() {
        if (!donationCart.length) {
            return '<div class="wizard-empty"><i class="fas fa-hand-holding-heart"></i><p>Your donation cart is empty.</p></div>';
        }
        return '<div class="wizard-list">'
            + donationCart.map(function (it, idx) {
                var money_line = it.goods ? (it.goods + (it.condition ? ' · ' + it.condition : '')) : money(it.amount);
                return '<div class="wizard-item" data-idx="' + idx + '">'
                    + '<div class="wizard-item-img"><img src="' + escapeHtml(it.image_url) + '" onerror="this.style.display=\'none\'"></div>'
                    + '<div class="wizard-item-body">'
                    +   '<div class="wizard-item-name">' + escapeHtml(it.name) + '</div>'
                    +   '<div class="wizard-item-meta">' + escapeHtml(money_line) + ' · Qty ' + (it.qty || 1) + '</div>'
                    + '</div>'
                    + '<button class="wizard-item-remove" data-remove="' + idx + '" type="button"><i class="fas fa-times"></i></button>'
                    + '</div>';
            }).join('')
            + '</div>';
    }

    function bindDonationCartRemove() {
        document.querySelectorAll('.wizard-item-remove[data-remove]').forEach(function (b) {
            b.addEventListener('click', function () {
                var i = parseInt(b.dataset.remove, 10);
                donationCart.splice(i, 1);
                saveDonationCart();
                window.openDonationCart();
            });
        });
    }

    window.startDonationWizard = function () {
        if (!donationCart.length) { alert('Your donation cart is empty.'); return; }
        wizardState.step = 1;
        renderWizardStep();
    };

    function wizardProgress(step) {
        var labels = ['Cart', 'Your Details', 'Pickup or Delivery', 'Review & Send'];
        return '<div class="wizard-progress">'
            + labels.map(function (l, i) {
                var n = i + 1;
                var cls = n < step ? 'done' : (n === step ? 'current' : '');
                return '<div class="wizard-progress-step ' + cls + '">'
                    + '<span class="wizard-progress-num">' + n + '</span>'
                    + '<span class="wizard-progress-label">' + l + '</span>'
                    + '</div>';
            }).join('')
            + '</div>';
    }

    function renderWizardStep() {
        var step = wizardState.step;
        var body = '';

        if (step === 1) {
            body = ''
                + '<div class="wizard-title">Review Your Donation</div>'
                + '<div class="wizard-subtitle">These are the pledges you are about to send.</div>'
                + renderDonationCartItems();
        }

        if (step === 2) {
            body = ''
                + '<div class="wizard-title">Your Contact Details</div>'
                + '<div class="wizard-subtitle">We use these to confirm your gift. No account needed.</div>'
                + '<div class="wizard-form">'
                +   '<label>Full Name *<input type="text" id="wzName" value="' + escapeHtml(wizardState.donor.name) + '"></label>'
                +   '<label>Phone / WhatsApp *<input type="tel" id="wzPhone" value="' + escapeHtml(wizardState.donor.phone) + '"></label>'
                +   '<label>Email (optional)<input type="email" id="wzEmail" value="' + escapeHtml(wizardState.donor.email) + '"></label>'
                +   '<label>Preferred contact<select id="wzContact">'
                +     '<option' + (wizardState.donor.contact_method === 'WhatsApp' ? ' selected' : '') + '>WhatsApp</option>'
                +     '<option' + (wizardState.donor.contact_method === 'Phone' ? ' selected' : '') + '>Phone</option>'
                +     '<option' + (wizardState.donor.contact_method === 'Email' ? ' selected' : '') + '>Email</option>'
                +   '</select></label>'
                + '</div>';
        }

        if (step === 3) {
            body = ''
                + '<div class="wizard-title">How Should We Receive It?</div>'
                + '<div class="wizard-subtitle">Choose one. For physical items we will coordinate drop-off.</div>'
                + '<div class="wizard-choice-row">'
                +   '<button class="wizard-choice ' + (wizardState.delivery === 'pickup' ? 'active' : '') + '" data-choice="pickup" type="button">'
                +     '<i class="fas fa-church"></i>'
                +     '<span class="wizard-choice-title">Deliver to the Church</span>'
                +     '<span class="wizard-choice-sub">Drop off at the church office at an agreed time.</span>'
                +   '</button>'
                +   '<button class="wizard-choice ' + (wizardState.delivery === 'delivery' ? 'active' : '') + '" data-choice="delivery" type="button">'
                +     '<i class="fas fa-truck"></i>'
                +     '<span class="wizard-choice-title">Church Picks Up</span>'
                +     '<span class="wizard-choice-sub">Give us your location and we will collect the items.</span>'
                +   '</button>'
                + '</div>'
                + (wizardState.delivery === 'pickup'
                    ? '<div class="wizard-form">'
                        + '<label>Preferred drop-off date<input type="date" id="wzPickupDate" value="' + escapeHtml(wizardState.pickup.date) + '"></label>'
                        + '<label>Preferred time<input type="time" id="wzPickupTime" value="' + escapeHtml(wizardState.pickup.time) + '"></label>'
                        + '<label>Notes for the church office<textarea id="wzPickupNotes" rows="2">' + escapeHtml(wizardState.pickup.notes) + '</textarea></label>'
                      + '</div>'
                    : '<div class="wizard-form">'
                        + '<label>District / City<input type="text" id="wzDistrict" value="' + escapeHtml(wizardState.address.district) + '"></label>'
                        + '<label>Town / Area<input type="text" id="wzTown" value="' + escapeHtml(wizardState.address.town) + '"></label>'
                        + '<label>Street / Village<input type="text" id="wzStreet" value="' + escapeHtml(wizardState.address.street) + '"></label>'
                        + '<label>Nearest landmark<input type="text" id="wzLandmark" value="' + escapeHtml(wizardState.address.landmark) + '"></label>'
                        + '<label>Additional directions<textarea id="wzAddressNotes" rows="2">' + escapeHtml(wizardState.address.notes) + '</textarea></label>'
                      + '</div>'
                );
        }

        if (step === 4) body = renderWizardReview();

        var html = ''
            + '<div class="wizard">'
            +   wizardProgress(step)
            +   body
            +   '<div class="wizard-nav">'
            +     (step > 1 ? '<button class="modal-btn modal-btn-secondary" id="wzBack" type="button"><i class="fas fa-arrow-left"></i> Back</button>' : '')
            +     (step < 4 ? '<button class="modal-btn modal-btn-primary" id="wzNext" type="button">Continue <i class="fas fa-arrow-right"></i></button>' : '')
            +   '</div>'
            + '</div>';

        openModal(html);
        if (step === 1) bindDonationCartRemove();
        if (step === 3) bindWizardChoice();
        var back = document.getElementById('wzBack');
        var next = document.getElementById('wzNext');
        if (back) back.addEventListener('click', function () { wizardState.step--; renderWizardStep(); });
        if (next) next.addEventListener('click', advanceWizard);
        if (step === 4) bindWizardSend();
    }

    function bindWizardChoice() {
        document.querySelectorAll('.wizard-choice').forEach(function (b) {
            b.addEventListener('click', function () {
                wizardState.delivery = b.dataset.choice;
                renderWizardStep();
            });
        });
    }

    function advanceWizard() {
        var step = wizardState.step;
        if (step === 2) {
            var name = (q('wzName') || {}).value || '';
            var phone = (q('wzPhone') || {}).value || '';
            var email = (q('wzEmail') || {}).value || '';
            var contact = (q('wzContact') || {}).value || 'WhatsApp';
            if (!name.trim() || !phone.trim()) { alert('Please enter your name and phone number.'); return; }
            wizardState.donor = { name: name.trim(), phone: phone.trim(), email: email.trim(), contact_method: contact };
        }
        if (step === 3) {
            if (wizardState.delivery === 'pickup') {
                wizardState.pickup = {
                    date: (q('wzPickupDate') || {}).value || '',
                    time: (q('wzPickupTime') || {}).value || '',
                    notes: (q('wzPickupNotes') || {}).value || ''
                };
            } else {
                wizardState.address = {
                    district: (q('wzDistrict') || {}).value || '',
                    town: (q('wzTown') || {}).value || '',
                    street: (q('wzStreet') || {}).value || '',
                    landmark: (q('wzLandmark') || {}).value || '',
                    notes: (q('wzAddressNotes') || {}).value || ''
                };
                if (!wizardState.address.district && !wizardState.address.town) {
                    alert('Please enter the district or town where we should pick up the items.'); return;
                }
            }
        }
        wizardState.step++;
        renderWizardStep();
    }

    function renderWizardReview() {
        var lines = donationCart.map(function (it) {
            var meta = it.goods ? (it.goods + (it.condition ? ' · ' + it.condition : '')) : money(it.amount);
            return '<div class="wizard-review-item"><strong>' + escapeHtml(it.name) + '</strong> — ' + escapeHtml(meta) + ' · Qty ' + (it.qty || 1) + '</div>';
        }).join('');
        var d = wizardState.donor;
        var fulfil = wizardState.delivery === 'pickup'
            ? 'Drop off at church'
              + (wizardState.pickup.date ? ' on ' + escapeHtml(wizardState.pickup.date) : '')
              + (wizardState.pickup.time ? ' at ' + escapeHtml(wizardState.pickup.time) : '')
              + (wizardState.pickup.notes ? ' — ' + escapeHtml(wizardState.pickup.notes) : '')
            : 'Church picks up from '
              + escapeHtml(wizardState.address.district || '')
              + (wizardState.address.town ? ', ' + escapeHtml(wizardState.address.town) : '')
              + (wizardState.address.street ? ', ' + escapeHtml(wizardState.address.street) : '')
              + (wizardState.address.landmark ? ' (near ' + escapeHtml(wizardState.address.landmark) + ')' : '');
        return ''
            + '<div class="wizard-title">Review &amp; Send</div>'
            + '<div class="wizard-subtitle">Check everything, then send to the church office.</div>'
            + '<div class="wizard-review-box">'
            +   '<div class="wizard-review-label">Donation items</div>'
            +   (lines || '<em>No items</em>')
            +   '<div class="wizard-review-label" style="margin-top:14px;">Your details</div>'
            +   '<div class="wizard-review-item"><strong>' + escapeHtml(d.name) + '</strong> · ' + escapeHtml(d.phone) + (d.email ? ' · ' + escapeHtml(d.email) : '') + ' · prefer ' + escapeHtml(d.contact_method) + '</div>'
            +   '<div class="wizard-review-label" style="margin-top:14px;">Receiving method</div>'
            +   '<div class="wizard-review-item">' + fulfil + '</div>'
            + '</div>'
            + '<div class="wizard-note">Sending this message does <strong>not</strong> confirm a payment or delivery. The church office will contact you to confirm.</div>'
            + '<div class="wizard-actions">'
            +   '<button class="modal-btn modal-btn-whatsapp" id="donSendWhats" type="button"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>'
            +   '<button class="modal-btn modal-btn-email" id="donSendEmail" type="button"><i class="fas fa-envelope"></i> Send via Email</button>'
            + '</div>';
    }

    function buildDonationMessage() {
        var d = wizardState.donor;
        var lines = [];
        lines.push('Hello Bridge Calvary Chapel, I would like to pledge the following:');
        lines.push('');
        donationCart.forEach(function (it) {
            if (it.goods) {
                lines.push('• [Item donation] ' + it.name + ' — ' + it.goods + (it.condition ? ' (' + it.condition + ')' : '') + ' · Qty ' + (it.qty || 1));
            } else {
                lines.push('• [Money pledge] ' + it.name + ' — ' + money(it.amount));
            }
        });
        lines.push('');
        lines.push('My details:');
        lines.push('Name: ' + d.name);
        lines.push('Phone: ' + d.phone);
        if (d.email) lines.push('Email: ' + d.email);
        lines.push('Preferred contact: ' + d.contact_method);
        lines.push('');
        if (wizardState.delivery === 'pickup') {
            lines.push('Drop-off: ' + (wizardState.pickup.date || 'date to confirm') + (wizardState.pickup.time ? ' at ' + wizardState.pickup.time : ''));
            if (wizardState.pickup.notes) lines.push('Notes: ' + wizardState.pickup.notes);
        } else {
            var a = wizardState.address;
            lines.push('Pickup from:');
            lines.push('District: ' + (a.district || ''));
            if (a.town) lines.push('Town/Area: ' + a.town);
            if (a.street) lines.push('Street/Village: ' + a.street);
            if (a.landmark) lines.push('Landmark: ' + a.landmark);
            if (a.notes) lines.push('Directions: ' + a.notes);
        }
        lines.push('');
        lines.push('Sent from the Bridge Calvary Chapel website.');
        return lines.join('\n');
    }

    function bindWizardSend() {
        var wa = document.getElementById('donSendWhats');
        var em = document.getElementById('donSendEmail');
        if (wa) wa.addEventListener('click', function () {
            var c = window.CHURCH_CONTACT || { whatsapp: '' };
            window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildDonationMessage()), '_blank', 'noopener');
            donationCart = [];
            saveDonationCart();
            setTimeout(showThankYou, 400);
        });
        if (em) em.addEventListener('click', function () {
            var c = window.CHURCH_CONTACT || { email: '' };
            window.location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('Donation pledge — Bridge Calvary Chapel') + '&body=' + encodeURIComponent(buildDonationMessage());
            donationCart = [];
            saveDonationCart();
            setTimeout(showThankYou, 400);
        });
    }

    function showThankYou() {
        var html = ''
            + '<div class="wizard thankyou">'
            +   '<div class="thankyou-icon"><i class="fas fa-heart"></i></div>'
            +   '<h2>Thank You!</h2>'
            +   '<p>Your pledge has been prepared. The church office will reach out to confirm everything with you.</p>'
            +   '<div class="wizard-actions">'
            +     '<a class="modal-btn modal-btn-primary" href="https://www.youtube.com/@TBCCChurchmedia" target="_blank" rel="noopener"><i class="fab fa-youtube"></i> Subscribe to Our Channel</a>'
            +     '<button class="modal-btn modal-btn-secondary" type="button" onclick="closeModal()"><span>Continue Browsing</span></button>'
            +     '<a class="modal-btn modal-btn-secondary" href="index.html"><span>Return Home</span></a>'
            +   '</div>'
            + '</div>';
        openModal(html);
    }

    // Badge on the Give button
    function attachDonationBadge() {
        var giveBtn = document.querySelector('.btn-give');
        if (!giveBtn || document.getElementById('donationBadge')) return;
        var b = document.createElement('span');
        b.id = 'donationBadge';
        b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:50px;background:#F4C430;color:#031B43;font-size:9.5px;font-weight:800;margin-left:6px;';
        b.textContent = '0';
        giveBtn.appendChild(b);
        updateDonationBadge();
    }
    window.updateDonationBadge = function () {
        var b = document.getElementById('donationBadge');
        if (!b) return;
        var n = donationCart.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
        b.textContent = n;
        b.style.display = n > 0 ? 'inline-flex' : 'none';
    };

    document.addEventListener('DOMContentLoaded', function () {
        attachDonationBadge();
        window.updateDonationBadge();
        var btn = document.getElementById('donationCartBtn');
        if (btn) btn.addEventListener('click', function () { window.openDonationCart(); });
        var giveBtn = document.querySelector('.btn-give');
        if (giveBtn) giveBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); window.openDonationCart(); });
    });
})();

// ============================================
// LOAD DATA
// ============================================
async function loadDonationData() {
    console.log('📥 Loading donations + shop data...');
    try {
        var content = await window.db.getSiteContent();
        siteContent = content || {};

        var base = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
        var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

        var catRes = await fetch(base + 'donation_categories?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key);
        var prodRes = await fetch(base + 'products?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key);
        var catData = await catRes.json();
        var prodData = await prodRes.json();
        donationCategories = Array.isArray(catData) ? catData : [];
        allProducts = Array.isArray(prodData) ? prodData : [];
        filteredProducts = allProducts.slice();

        renderHero();
        renderFeatureCards();
        renderCategoriesHeader();
        renderCategories();
        renderDirectGiving();
        renderStoreHeader();
        renderShopCategoryStrip();
        renderProducts();
        renderImpact();
        renderContactAndFooter();
        updateCartBadge();
        updateDonationCartUI();
        renderCart();

        console.log('✅ Loaded: ' + donationCategories.length + ' categories, ' + allProducts.length + ' products');
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
    if (navbar) window.addEventListener('scroll', function () { navbar.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(4,26,58,0.4)' : 'none'; }, { passive: true });

    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', open);
            var icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        });
    }

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

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCart(); } });

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

    setupSupportTabs();
});