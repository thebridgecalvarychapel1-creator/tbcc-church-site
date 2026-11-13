// ============================================
// DONATIONS + CHURCH SHOP — Bridge Calvary Chapel
// File: js/donations.js
// ============================================

var siteContent = {};
var allProducts = [];
var filteredProducts = [];
var currentShopCategory = 'all';
var cart = JSON.parse(localStorage.getItem('bcc_cart') || '[]');
var SHOP_URL_BASE = window.location.origin + window.location.pathname;

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function money(n) { return 'UGX ' + Number(n || 0).toLocaleString(); }
function saveCart() { localStorage.setItem('bcc_cart', JSON.stringify(cart)); updateCartBadge(); }
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }
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

// ============================================
// LOGO & RECEIPT CANVAS
// ============================================
var LOGO_SVG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#005BEA"/><stop offset="1" stop-color="#12D8F5"/></linearGradient></defs>' +
    '<circle cx="60" cy="60" r="58" fill="url(#g)"/>' +
    '<circle cx="60" cy="60" r="50" fill="#031B43"/>' +
    '<text x="60" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" font-weight="900" fill="#ffffff">✝</text>' +
    '</svg>'
);

function loadImage(src) {
    return new Promise(function (resolve) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = src;
    });
}

async function drawReceiptToCanvas(receipt, items, total, customerName, status) {
    var isConfirmed = status === 'confirmed';
    var W = 760;
    var pad = 44;
    var rowH = 90;
    var extra = isConfirmed ? 100 : 60;
    var H = pad + 170 + 40 + (items.length * rowH) + 110 + extra + pad;

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#031B43'; ctx.fillRect(0, 0, W, 130);

    var logo = await loadImage(LOGO_SVG);
    if (logo) { ctx.drawImage(logo, pad, 26, 76, 76); }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('THE BRIDGE', pad + 92, 58);
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('CALVARY CHAPEL', pad + 92, 80);
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#12D8F5';
    ctx.fillText(isConfirmed ? 'OFFICIAL CONFIRMED RECEIPT' : 'ORDER RECEIPT — PENDING', pad + 92, 100);

    var badgeColor = isConfirmed ? '#16A34A' : '#F4C430';
    var badgeText = isConfirmed ? 'CONFIRMED' : 'PENDING';
    var badgeW = 140, badgeH = 42;
    var bx = W - pad - badgeW, by = 44;
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, badgeW, badgeH, 21);
    else ctx.rect(bx, by, badgeW, badgeH);
    ctx.fill();
    ctx.fillStyle = isConfirmed ? '#FFFFFF' : '#3B1F00';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, bx + badgeW / 2, by + 27);
    ctx.textAlign = 'left';

    var y = 160;
    ctx.fillStyle = '#031B43'; ctx.font = 'bold 14px Arial, sans-serif'; ctx.fillText('Receipt No:', pad, y);
    ctx.font = 'bold 15px Arial, sans-serif'; ctx.fillStyle = '#005BEA'; ctx.fillText(receipt.receiptNo, pad + 100, y);

    ctx.font = '11px Arial, sans-serif'; ctx.fillStyle = '#49658A'; ctx.textAlign = 'right';
    ctx.fillText('Date: ' + receipt.date, W - pad, y); ctx.textAlign = 'left';

    y += 24;
    ctx.font = 'bold 12px Arial, sans-serif'; ctx.fillStyle = '#031B43'; ctx.fillText('CUSTOMER', pad, y);
    y += 20;
    ctx.font = '14px Arial, sans-serif'; ctx.fillStyle = '#041A3A'; ctx.fillText(customerName || 'Walk-in Customer', pad, y);

    ctx.font = '11px Arial, sans-serif'; ctx.fillStyle = '#49658A'; ctx.textAlign = 'right';
    ctx.fillText('Order Ref: ' + receipt.orderRef, W - pad, y); ctx.textAlign = 'left';

    y += 22;
    ctx.strokeStyle = '#CBE8FF'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();

    y += 26;
    ctx.fillStyle = '#005BEA'; ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('ITEMS', pad, y); ctx.textAlign = 'right'; ctx.fillText('AMOUNT', W - pad, y); ctx.textAlign = 'left';

    var thumbs = await Promise.all(items.map(function (it) { return it.image_url ? loadImage(it.image_url) : Promise.resolve(null); }));

    items.forEach(function (it, i) {
        var thumb = thumbs[i];
        var thumbX = pad;
        var thumbY = y + 6;
        var thumbSize = 52;

        if (thumb) {
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(thumbX, thumbY, thumbSize, thumbSize, 6);
            else ctx.rect(thumbX, thumbY, thumbSize, thumbSize);
            ctx.clip();
            ctx.drawImage(thumb, thumbX, thumbY, thumbSize, thumbSize);
            ctx.restore();
            ctx.strokeStyle = '#CBE8FF'; ctx.lineWidth = 1;
            ctx.strokeRect(thumbX, thumbY, thumbSize, thumbSize);
        }

        var textX = pad + (thumb ? thumbSize + 12 : 0);

        y += 32;
        ctx.fillStyle = '#041A3A'; ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillText(it.name, textX, y);
        ctx.textAlign = 'right'; ctx.fillText(money(it.price * it.qty), W - pad, y); ctx.textAlign = 'left';
        y += 18;
        ctx.font = '11px Arial, sans-serif'; ctx.fillStyle = '#49658A';
        var v = (it.size ? 'Size ' + it.size + ' ' : '') + (it.color ? '· ' + it.color + ' ' : '') + '· Qty ' + it.qty;
        ctx.fillText(v, textX, y);

        y += thumb ? 20 : 0;
    });

    y += 32;
    ctx.strokeStyle = '#031B43'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 30;
    ctx.fillStyle = '#031B43'; ctx.font = 'bold 18px Arial, sans-serif'; ctx.fillText('TOTAL', pad, y);
    ctx.fillStyle = '#005BEA'; ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'right'; ctx.fillText(money(total), W - pad, y); ctx.textAlign = 'left';

    y += 42;
    if (isConfirmed) {
        ctx.strokeStyle = '#CBE8FF'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
        y += 26;
        ctx.fillStyle = '#031B43'; ctx.font = 'bold 12px Arial, sans-serif'; ctx.fillText('CONFIRMED BY (Church Office)', pad, y);
        y += 34;
        ctx.strokeStyle = '#041A3A';
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + 280, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W - pad - 200, y); ctx.lineTo(W - pad, y); ctx.stroke();
        ctx.font = '10px Arial, sans-serif'; ctx.fillStyle = '#49658A';
        ctx.fillText('Signature', pad, y + 14); ctx.fillText('Date / Stamp', W - pad - 200, y + 14);
    } else {
        ctx.fillStyle = '#92600A'; ctx.font = 'italic 11px Arial, sans-serif';
        ctx.fillText('Pending confirmation — this is not yet a final receipt.', pad, y);
        ctx.fillStyle = '#49658A'; y += 20; ctx.font = '10.5px Arial, sans-serif';
        ctx.fillText('Bring this receipt to the church to collect your items.', pad, y);
    }

    y += 30;
    ctx.fillStyle = '#49658A'; ctx.font = '11px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('The Bridge Calvary Chapel — Jinja, Uganda', W / 2, y);
    y += 16; ctx.fillText('Thank you for your order. God bless you.', W / 2, y); ctx.textAlign = 'left';

    return canvas;
}

function downloadReceiptImage(canvas, filename) {
    var link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function shareReceiptImage(canvas, filename) {
    if (!navigator.share || !navigator.canShare) {
        downloadReceiptImage(canvas, filename);
        showToast('Receipt downloaded — attach it in WhatsApp.');
        return;
    }
    try {
        var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
        var file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Receipt', text: 'My order from Bridge Calvary Chapel' });
        } else {
            downloadReceiptImage(canvas, filename);
            showToast('Receipt downloaded.');
        }
    } catch (e) { downloadReceiptImage(canvas, filename); }
}

// ============================================
// PRODUCT SHARING — WhatsApp / Facebook / Instagram / TikTok
// ============================================
function getProductUrl(p) { return SHOP_URL_BASE + '?product=' + encodeURIComponent(p.id); }

// Download image helper for Instagram/TikTok manual posting
async function downloadProductImage(p) {
    if (!p.image_url) { showToast('No image to download'); return; }
    try {
        var img = await loadImage(p.image_url);
        if (!img) throw new Error('Could not load');
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        downloadReceiptImage(canvas, (p.name || 'product').replace(/[^\w]+/g, '_') + '.jpg');
        showToast('Image saved! Now post it on Instagram or TikTok.');
    } catch (e) {
        window.open(p.image_url, '_blank');
    }
}

// Show the full share menu with all platforms
function shareProductMenu(p) {
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper"><i class="fas fa-share-alt"></i></div>'
        + '<h2>Share This Product</h2>'
        + '<p style="font-size:12.5px;color:#49658A;margin-bottom:16px;">Choose a platform. WhatsApp and Facebook show the image preview. Instagram and TikTok require posting the image manually from your phone.</p>'

        // WhatsApp row
        + '<div class="share-row">'
        +   '<button class="share-btn whatsapp" id="shWa"><i class="fab fa-whatsapp"></i> WhatsApp</button>'
        +   '<button class="share-btn" id="shFb"><i class="fab fa-facebook-f"></i> Facebook</button>'
        + '</div>'

        // Instagram + TikTok row — download image then open app
        + '<div class="share-row">'
        +   '<button class="share-btn" id="shIg"><i class="fab fa-instagram"></i> Instagram</button>'
        +   '<button class="share-btn" id="shTt"><i class="fab fa-tiktok"></i> TikTok</button>'
        + '</div>'

        // Email + copy row
        + '<div class="share-row">'
        +   '<button class="share-btn" id="shEmail"><i class="fas fa-envelope"></i> Gmail</button>'
        +   '<button class="share-btn primary" id="shCopy"><i class="fas fa-link"></i> Copy Link</button>'
        + '</div>'

        + '<p style="font-size:10.5px;color:#49658A;text-align:center;margin-top:12px;">For Instagram/TikTok, the image is downloaded first — then open the app and create your post with it.</p>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button></div>'
        + '</div>';
    openModal(html);

    var url = getProductUrl(p);
    var text = p.name + ' — ' + money(p.price) + '\n\n' + url;

    // WhatsApp — open with text + link (image preview appears via OG tags)
    document.getElementById('shWa').addEventListener('click', function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    });

    // Facebook — open share dialog (image preview via OG tags)
    document.getElementById('shFb').addEventListener('click', function () {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
    });

    // Instagram — download image, then open Instagram app/website
    document.getElementById('shIg').addEventListener('click', async function () {
        await downloadProductImage(p);
        setTimeout(function () {
            window.open('https://www.instagram.com/', '_blank');
        }, 600);
    });

    // TikTok — download image, then open TikTok
    document.getElementById('shTt').addEventListener('click', async function () {
        await downloadProductImage(p);
        setTimeout(function () {
            window.open('https://www.tiktok.com/', '_blank');
        }, 600);
    });

    // Gmail
    document.getElementById('shEmail').addEventListener('click', function () {
        window.open('https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent(p.name) + '&body=' + encodeURIComponent(text), '_blank');
    });

    // Copy link
    document.getElementById('shCopy').addEventListener('click', function () {
        copyProductLink(encodeURIComponent(url));
    });
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

// ============================================
// MODAL
// ============================================
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
    if (giveCard) giveCard.addEventListener('click', function () { var el = document.getElementById('directGiving'); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    var shopCard = document.querySelector('.support-card-shop');
    if (shopCard) shopCard.addEventListener('click', function () { var el = document.getElementById('shopSection'); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
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
        titleEl.innerHTML = 'Give &amp; Support the <span class="accent">Ministry</span>';
    }
    setText('heroVerse', h.verse || '"Each of you should give what you have decided in your heart to give..." — 2 Corinthians 9:7');
    setText('heroDesc', h.description || 'Your generous gifts help us serve people, spread the Gospel, and meet real community needs.');
    var url = secImg('donations_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var num = h['stat' + i + '_number']; var lbl = h['stat' + i + '_label'];
        if (!num) continue;
        var icon = i === 1 ? 'fa-users' : (i === 2 ? 'fa-people-group' : 'fa-church');
        statsHTML += '<div class="hero-stat-row"><div class="hero-stat-icon"><i class="fas ' + icon + '"></i></div><div class="hero-stat-content"><span class="hero-stat-num">' + escapeHtml(num) + '</span><span class="hero-stat-lbl">' + escapeHtml(lbl || '') + '</span></div></div>';
    }
    setHTML('heroStats', statsHTML);
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
    var bankName = d.bank_name || 'Stanbic Bank Uganda';
    var accountName = d.account_name || 'Bridge Calvary Chapel';
    var accountNum = d.account_number || '903001234567';
    var branch = d.branch || 'Jinja Main Branch';
    var swift = d.swift || 'SBICUGKA';
    var bankNote = d.note || 'Use "Donation - [Your Name]" as the reference.';
    var mobileNum = d.mobile_number || '+256 785 228 381';
    var mobileNet = d.mobile_network || 'MTN MoMo / Airtel Money';
    var mobileAcct = d.mobile_account || 'Bridge Calvary Chapel';
    var mobileNote = d.mobile_note || 'Send via mobile money with "Donation" as reference.';
    var cardStatus = d.card_status || 'Coming Soon';
    var cardNote = d.card_note || 'Online card payments will be available soon. Please use bank transfer or mobile money in the meantime.';
    grid.innerHTML = ''
        + '<div class="direct-card"><div class="direct-card-icon"><i class="fas fa-university"></i></div><h4>Bank Transfer</h4>'
        + '<p class="direct-detail"><strong>Bank:</strong> ' + escapeHtml(bankName) + '</p>'
        + '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(accountName) + '</p>'
        + '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(accountNum) + '</p>'
        + '<p class="direct-detail"><strong>Branch:</strong> ' + escapeHtml(branch) + '</p>'
        + '<p class="direct-detail"><strong>SWIFT:</strong> ' + escapeHtml(swift) + '</p>'
        + '<p class="direct-note">' + escapeHtml(bankNote) + '</p></div>'
        + '<div class="direct-card"><div class="direct-card-icon"><i class="fas fa-mobile-alt"></i></div><h4>Mobile Money</h4>'
        + '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(mobileNum) + '</p>'
        + '<p class="direct-detail"><strong>Network:</strong> ' + escapeHtml(mobileNet) + '</p>'
        + '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(mobileAcct) + '</p>'
        + '<p class="direct-note">' + escapeHtml(mobileNote) + '</p></div>'
        + '<div class="direct-card"><div class="direct-card-icon"><i class="fas fa-credit-card"></i></div><h4>Card Payment</h4>'
        + '<span class="badge-coming">' + escapeHtml(cardStatus) + '</span>'
        + '<p class="direct-note">' + escapeHtml(cardNote) + '</p></div>';
}

// ============================================
// STORE
// ============================================
function renderStoreHeader() {
    var h = siteContent.donations_store || {};
    setText('storeTitle', h.title || 'Bridge Calvary Chapel Store');
    setText('storeDesc', h.description || 'Support the church by purchasing official church merchandise.');
}
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
    cats.forEach(function (cat) { html += '<button class="shop-cat-chip ' + (currentShopCategory === cat ? 'active' : '') + '" data-cat="' + escapeHtml(cat) + '" type="button">' + escapeHtml(cat) + '</button>'; });
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

// ============================================
// PRODUCTS
// ============================================
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
            + '<div class="product-image">' + badge
            + '<button class="product-share-btn" type="button" aria-label="Share product" data-share-id="' + escapeHtml(p.id) + '"><i class="fas fa-share-alt"></i></button>'
            + '<button class="product-fav" type="button" aria-label="Favorite"><i class="far fa-heart"></i></button>'
            + '<img src="' + escapeHtml(p.image_url || '') + '" alt="' + escapeHtml(p.name || '') + '" onerror="this.style.display=\'none\'"></div>'
            + '<div class="product-body">'
            + (p.category ? '<div class="product-cat">' + escapeHtml(p.category) + '</div>' : '')
            + '<h3 class="product-name">' + escapeHtml(p.name) + '</h3>'
            + '<p class="product-desc">' + escapeHtml(p.description || '') + '</p>' + rating
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

// ============================================
// PRODUCT PANEL
// ============================================
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

// ============================================
// CART
// ============================================
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

// ============================================
// ORDER REFERENCE + RECEIPT NUMBERS
// ============================================
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

// ============================================
// ORDER FLOW — Receipt FIRST, then submit to WhatsApp/Email
// ============================================
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
        var c = window.CHURCH_CONTACT || { whatsapp: '256785228381' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage()), '_blank');
    });
    document.getElementById('btnSendEmail').addEventListener('click', function () {
        var c = window.CHURCH_CONTACT || { email: 'thebridgecalvarychapel1@gmail.com' };
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Order ' + orderRef) + '&body=' + encodeURIComponent(buildMessage()), '_blank');
    });

    document.getElementById('btnDownloadPendingReceipt').addEventListener('click', async function () {
        var receipt = { receiptNo: pendingReceiptNo, orderRef: orderRef, date: orderDate };
        var canvas = await drawReceiptToCanvas(receipt, cart, total, p.name || 'Walk-in Customer', 'pending');
        downloadReceiptImage(canvas, pendingReceiptNo + '.png');
        showToast('Receipt downloaded');
    });
    document.getElementById('btnSharePendingReceipt').addEventListener('click', async function () {
        var receipt = { receiptNo: pendingReceiptNo, orderRef: orderRef, date: orderDate };
        var canvas = await drawReceiptToCanvas(receipt, cart, total, p.name || 'Walk-in Customer', 'pending');
        await shareReceiptImage(canvas, pendingReceiptNo + '.png');
    });
}

// ============================================
// CONFIRMED RECEIPT (staff)
// ============================================
window.openConfirmedReceipt = function () {
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#16A34A,#059669);"><i class="fas fa-check"></i></div>'
        + '<h2>Issue Confirmed Receipt</h2>'
        + '<p style="font-size:12.5px;">For staff use only. Enter the customer\'s pending receipt number after the items have been handed over.</p>'
        + '<form id="confirmForm" class="order-form-grid">'
        +   '<div class="form-group full"><label>Pending Receipt No. <span class="req">*</span></label><input type="text" name="pending_receipt" placeholder="RCPT-PEND-YYYYMMDD-XXXX" required></div>'
        +   '<div class="form-group full"><label>Order Reference <span class="req">*</span></label><input type="text" name="order_ref" placeholder="TBCC-YYYYMMDD-XXXX" required></div>'
        +   '<div class="form-group full"><label>Customer Name <span class="req">*</span></label><input type="text" name="customer_name" required></div>'
        +   '<div class="form-group full"><label>Items (one per line: Name | Qty | Price) <span class="req">*</span></label><textarea name="items_raw" rows="4" placeholder="T-Shirt | 2 | 35000&#10;Cap | 1 | 25000" required></textarea></div>'
        + '</form>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-primary" id="genConfirmed"><i class="fas fa-file-signature"></i> Generate Confirmed Receipt</button>'
        + '</div>'
        + '</div>';
    openModal(html);
    document.getElementById('genConfirmed').addEventListener('click', async function () {
        var p = {};
        new FormData(document.getElementById('confirmForm')).forEach(function (v, k) { p[k] = v; });
        if (!p.pending_receipt || !p.order_ref || !p.customer_name || !p.items_raw) { alert('Please fill all fields.'); return; }
        var items = p.items_raw.split('\n').map(function (line) {
            var parts = line.split('|').map(function (s) { return s.trim(); });
            if (parts.length < 3) return null;
            return { name: parts[0], qty: parseInt(parts[1]) || 1, price: parseFloat(parts[2]) || 0 };
        }).filter(Boolean);
        if (!items.length) { alert('Please provide at least one valid item.'); return; }
        var total = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
        var confirmedNo = p.pending_receipt.replace('RCPT-PEND-', 'RCPT-CONF-');
        var receipt = { receiptNo: confirmedNo, orderRef: p.order_ref, date: new Date().toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' }) };
        var canvas = await drawReceiptToCanvas(receipt, items, total, p.customer_name, 'confirmed');
        downloadReceiptImage(canvas, confirmedNo + '.png');
        showToast('Confirmed receipt downloaded');
    });
};

// ============================================
// DONATION WIZARDS (UNCHANGED)
// ============================================
var monetaryWizard = { step: 1, fund: 'general', amount: 0, donor: { name: '', email: '', phone: '' }, notes: '' };
var materialWizard = { step: 1, category: null, items: '', qty: '', condition: 'New', donor: { name: '', email: '', phone: '', address: '' }, deliveryMethod: 'dropoff', notes: '' };

window.openMonetaryDonation = function () { monetaryWizard = { step: 1, fund: 'general', amount: 0, donor: { name: '', email: '', phone: '' }, notes: '' }; renderMonetaryStep(); };
function fundChoice(val, icon, title, sub) {
    var active = monetaryWizard.fund === val ? 'active' : '';
    return '<div class="donation-panel-choice ' + active + '" data-value="' + val + '"><i class="fas ' + icon + '"></i>'
        + '<div class="donation-panel-choice-title">' + title + '</div>'
        + '<div class="donation-panel-choice-sub">' + sub + '</div></div>';
}
function renderMonetaryStep() {
    var step = monetaryWizard.step; var body = '';
    if (step === 1) {
        body = '<div class="wizard-title">Step 1: Choose a Fund</div><div class="wizard-subtitle">Where should your gift go?</div>'
            + '<div class="donation-panel-choice-row">'
            + fundChoice('general', 'fa-church', 'General', 'Ministry operations')
            + fundChoice('missions', 'fa-globe-africa', 'Missions', 'Outreach')
            + fundChoice('building', 'fa-hard-hat', 'Building', 'Repairs')
            + fundChoice('benevolence', 'fa-hands-helping', 'Benevolence', 'Help families')
            + '</div>';
    } else if (step === 2) {
        body = '<div class="wizard-title">Step 2: Amount</div>'
            + '<div class="amount-preset-grid">'
            + ['10000', '25000', '50000', '100000'].map(function (a) {
                return '<button class="amount-preset ' + (monetaryWizard.amount === parseInt(a) ? 'active' : '') + '" onclick="setMonetaryAmount(' + a + ')">UGX ' + parseInt(a).toLocaleString() + '</button>';
            }).join('') + '</div>'
            + '<div class="modal-custom-input"><span>UGX</span><input type="number" id="monCustomAmount" placeholder="Custom amount" value="' + (monetaryWizard.amount || '') + '"></div>'
            + '<div class="modal-custom-input"><i class="fas fa-comment"></i><input type="text" id="monNotes" placeholder="Note or prayer request" value="' + escapeHtml(monetaryWizard.notes) + '"></div>';
    } else if (step === 3) {
        body = '<div class="wizard-title">Step 3: Your Details</div><div class="wizard-form">'
            + '<label>Full Name *<input type="text" id="monName" value="' + escapeHtml(monetaryWizard.donor.name) + '"></label>'
            + '<label>Email *<input type="email" id="monEmail" value="' + escapeHtml(monetaryWizard.donor.email) + '"></label>'
            + '<label>Phone<input type="tel" id="monPhone" value="' + escapeHtml(monetaryWizard.donor.phone) + '"></label></div>';
    } else if (step === 4) {
        var fundName = { general: 'General Fund', missions: 'Missions', building: 'Building Fund', benevolence: 'Benevolence' }[monetaryWizard.fund];
        body = '<div class="wizard-title">Step 4: Review</div>'
            + '<div class="donation-summary-receipt"><h4>Summary</h4>'
            + '<div class="donation-summary-row"><span class="label">Fund</span><span class="value">' + fundName + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Amount</span><span class="value">' + money(monetaryWizard.amount) + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Donor</span><span class="value">' + escapeHtml(monetaryWizard.donor.name) + '</span></div>'
            + '<div class="donation-summary-row total"><span class="label">Total</span><span class="value">' + money(monetaryWizard.amount) + '</span></div></div>'
            + '<div class="wizard-note">This is a pledge. The church will share verified payment instructions.</div>'
            + '<div class="wizard-actions"><button class="modal-btn modal-btn-whatsapp" id="monWhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</button>'
            + '<button class="modal-btn modal-btn-email" id="monEmailBtn"><i class="fas fa-envelope"></i> Email</button></div>';
    }
    var html = '<div class="wizard"><div class="wizard-progress">' + [1, 2, 3, 4].map(function (n) {
        var cls = n < step ? 'done' : (n === step ? 'current' : '');
        return '<div class="wizard-progress-step ' + cls + '"><span class="wizard-progress-num">' + n + '</span></div>';
    }).join('') + '</div>' + body + '<div class="wizard-nav">'
        + (step > 1 ? '<button class="modal-btn modal-btn-secondary" id="monBack"><i class="fas fa-arrow-left"></i> Back</button>' : '')
        + (step < 4 ? '<button class="modal-btn modal-btn-primary" id="monNext">Continue <i class="fas fa-arrow-right"></i></button>' : '')
        + '</div></div>';
    openModal(html);
    if (step === 1) document.querySelectorAll('.donation-panel-choice').forEach(function (b) {
        b.addEventListener('click', function () { monetaryWizard.fund = b.dataset.value; renderMonetaryStep(); });
    });
    var back = document.getElementById('monBack'); var next = document.getElementById('monNext');
    if (back) back.addEventListener('click', function () { monetaryWizard.step--; renderMonetaryStep(); });
    if (next) next.addEventListener('click', advanceMonetary);
    if (step === 4) {
        document.getElementById('monWhatsApp').addEventListener('click', function () { submitMonetary('whatsapp'); });
        document.getElementById('monEmailBtn').addEventListener('click', function () { submitMonetary('email'); });
    }
}
window.setMonetaryAmount = function (amt) { monetaryWizard.amount = amt; renderMonetaryStep(); };
function advanceMonetary() {
    var step = monetaryWizard.step;
    if (step === 2) {
        var c = document.getElementById('monCustomAmount'); if (c && c.value) monetaryWizard.amount = parseInt(c.value) || 0;
        var n = document.getElementById('monNotes'); if (n) monetaryWizard.notes = n.value;
        if (!monetaryWizard.amount || monetaryWizard.amount < 1000) { alert('Minimum UGX 1,000.'); return; }
    }
    if (step === 3) {
        var name = document.getElementById('monName').value.trim();
        var email = document.getElementById('monEmail').value.trim();
        var phone = document.getElementById('monPhone').value.trim();
        if (!name || !email) { alert('Please enter name and email.'); return; }
        monetaryWizard.donor = { name: name, email: email, phone: phone };
    }
    monetaryWizard.step++; renderMonetaryStep();
}
function submitMonetary(method) {
    var fundName = { general: 'General Fund', missions: 'Missions', building: 'Building Fund', benevolence: 'Benevolence' }[monetaryWizard.fund];
    var c = window.CHURCH_CONTACT || { whatsapp: '256785228381', email: 'thebridgecalvarychapel1@gmail.com' };
    var msg = '🙏 MONETARY DONATION PLEDGE\n━━━━━━━━━━━━━━\nFund: ' + fundName + '\nAmount: ' + money(monetaryWizard.amount) + '\nStatus: PLEDGE\n━━━━━━━━━━━━━━\nDonor: ' + monetaryWizard.donor.name + '\nEmail: ' + monetaryWizard.donor.email + (monetaryWizard.donor.phone ? '\nPhone: ' + monetaryWizard.donor.phone : '') + (monetaryWizard.notes ? '\nNote: ' + monetaryWizard.notes : '') + '\n━━━━━━━━━━━━━━\nPlease send verified payment instructions.';
    saveDonationToSupabase({ type: 'monetary', fund: monetaryWizard.fund, amount: monetaryWizard.amount, donor_name: monetaryWizard.donor.name, donor_email: monetaryWizard.donor.email, donor_phone: monetaryWizard.donor.phone, notes: monetaryWizard.notes, status: 'pledge' });
    if (method === 'whatsapp') window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
    else window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Donation Pledge') + '&body=' + encodeURIComponent(msg), '_blank');
    showThankYouDonation('monetary', monetaryWizard.amount);
}

window.openMaterialDonation = function () { materialWizard = { step: 1, category: null, items: '', qty: '', condition: 'New', donor: { name: '', email: '', phone: '', address: '' }, deliveryMethod: 'dropoff', notes: '' }; renderMaterialStep(); };
function renderMaterialStep() {
    var step = materialWizard.step; var body = '';
    if (step === 1) {
        var cats = [
            { id: 'bibles', icon: 'fa-bible', name: 'Bibles & Books', desc: 'Study Bibles' },
            { id: 'clothing', icon: 'fa-tshirt', name: 'Clothing & Shoes', desc: 'Gently used' },
            { id: 'food', icon: 'fa-bread-slice', name: 'Food & Essentials', desc: 'Rice, beans' },
            { id: 'school', icon: 'fa-graduation-cap', name: 'School Supplies', desc: 'Books, pens' },
            { id: 'medical', icon: 'fa-medkit', name: 'Medical Items', desc: 'First aid' },
            { id: 'household', icon: 'fa-home', name: 'Household Items', desc: 'Blankets' }
        ];
        body = '<div class="wizard-title">Step 1: Category</div><div class="material-category-grid">'
            + cats.map(function (c) {
                var sel = materialWizard.category === c.id ? 'selected' : '';
                return '<div class="material-category-card ' + sel + '" data-cat="' + c.id + '"><div class="material-category-icon"><i class="fas ' + c.icon + '"></i></div>'
                    + '<div class="material-category-info"><h4>' + c.name + '</h4><p>' + c.desc + '</p></div></div>';
            }).join('') + '</div>';
    } else if (step === 2) {
        body = '<div class="wizard-title">Step 2: Items</div><div class="wizard-form">'
            + '<label>Description *<input type="text" id="matItems" placeholder="e.g. 5 Bibles, 2 bags of rice" value="' + escapeHtml(materialWizard.items) + '"></label>'
            + '<label>Quantity<input type="text" id="matQty" value="' + escapeHtml(materialWizard.qty) + '"></label>'
            + '<label>Condition<select id="matCondition">'
            + ['New', 'Like new', 'Good', 'Used'].map(function (o) { return '<option ' + (materialWizard.condition === o ? 'selected' : '') + '>' + o + '</option>'; }).join('')
            + '</select></label></div>';
    } else if (step === 3) {
        body = '<div class="wizard-title">Step 3: Your Details</div><div class="wizard-form">'
            + '<label>Full Name *<input type="text" id="matName" value="' + escapeHtml(materialWizard.donor.name) + '"></label>'
            + '<label>Email<input type="email" id="matEmail" value="' + escapeHtml(materialWizard.donor.email) + '"></label>'
            + '<label>Phone *<input type="tel" id="matPhone" value="' + escapeHtml(materialWizard.donor.phone) + '"></label>'
            + '<label>Address<input type="text" id="matAddress" value="' + escapeHtml(materialWizard.donor.address) + '"></label></div>';
    } else if (step === 4) {
        body = '<div class="wizard-title">Step 4: Delivery</div>'
            + '<div class="donation-panel-choice-row">'
            + '<div class="donation-panel-choice ' + (materialWizard.deliveryMethod === 'dropoff' ? 'active' : '') + '" data-delivery="dropoff"><i class="fas fa-church"></i><div class="donation-panel-choice-title">Drop Off</div><div class="donation-panel-choice-sub">At the church</div></div>'
            + '<div class="donation-panel-choice ' + (materialWizard.deliveryMethod === 'collection' ? 'active' : '') + '" data-delivery="collection"><i class="fas fa-truck"></i><div class="donation-panel-choice-title">Collection</div><div class="donation-panel-choice-sub">We collect</div></div></div>'
            + '<div class="wizard-form"><label>Notes<textarea id="matNotes" rows="2">' + escapeHtml(materialWizard.notes) + '</textarea></label></div>';
    } else if (step === 5) {
        var catNames = { bibles: 'Bibles & Books', clothing: 'Clothing & Shoes', food: 'Food & Essentials', school: 'School Supplies', medical: 'Medical Items', household: 'Household Items' };
        body = '<div class="wizard-title">Step 5: Review</div>'
            + '<div class="donation-summary-receipt"><h4>Summary</h4>'
            + '<div class="donation-summary-row"><span class="label">Category</span><span class="value">' + (catNames[materialWizard.category] || '') + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Items</span><span class="value">' + escapeHtml(materialWizard.items) + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Donor</span><span class="value">' + escapeHtml(materialWizard.donor.name) + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Method</span><span class="value">' + (materialWizard.deliveryMethod === 'dropoff' ? 'Drop Off' : 'Collection') + '</span></div>'
            + '</div><div class="wizard-note">This is a request. The church will contact you to confirm.</div>'
            + '<div class="wizard-actions"><button class="modal-btn modal-btn-whatsapp" id="matWhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</button>'
            + '<button class="modal-btn modal-btn-email" id="matEmailBtn"><i class="fas fa-envelope"></i> Email</button></div>';
    }
    var html = '<div class="wizard"><div class="wizard-progress">' + [1, 2, 3, 4, 5].map(function (n) {
        var cls = n < step ? 'done' : (n === step ? 'current' : '');
        return '<div class="wizard-progress-step ' + cls + '"><span class="wizard-progress-num">' + n + '</span></div>';
    }).join('') + '</div>' + body + '<div class="wizard-nav">'
        + (step > 1 ? '<button class="modal-btn modal-btn-secondary" id="matBack"><i class="fas fa-arrow-left"></i> Back</button>' : '')
        + (step < 5 ? '<button class="modal-btn modal-btn-primary" id="matNext">Continue <i class="fas fa-arrow-right"></i></button>' : '')
        + '</div></div>';
    openModal(html);
    if (step === 1) document.querySelectorAll('.material-category-card').forEach(function (b) {
        b.addEventListener('click', function () { materialWizard.category = b.dataset.cat; renderMaterialStep(); });
    });
    if (step === 4) document.querySelectorAll('.donation-panel-choice').forEach(function (b) {
        b.addEventListener('click', function () { materialWizard.deliveryMethod = b.dataset.delivery; renderMaterialStep(); });
    });
    var back = document.getElementById('matBack'); var next = document.getElementById('matNext');
    if (back) back.addEventListener('click', function () { materialWizard.step--; renderMaterialStep(); });
    if (next) next.addEventListener('click', advanceMaterial);
    if (step === 5) {
        document.getElementById('matWhatsApp').addEventListener('click', function () { submitMaterial('whatsapp'); });
        document.getElementById('matEmailBtn').addEventListener('click', function () { submitMaterial('email'); });
    }
}
function advanceMaterial() {
    var step = materialWizard.step;
    if (step === 1 && !materialWizard.category) { alert('Please select a category.'); return; }
    if (step === 2) {
        var i = document.getElementById('matItems').value.trim();
        if (!i) { alert('Please describe items.'); return; }
        materialWizard.items = i; materialWizard.qty = document.getElementById('matQty').value.trim();
        materialWizard.condition = document.getElementById('matCondition').value;
    }
    if (step === 3) {
        var name = document.getElementById('matName').value.trim();
        var phone = document.getElementById('matPhone').value.trim();
        if (!name || !phone) { alert('Please enter name and phone.'); return; }
        materialWizard.donor = { name: name, email: document.getElementById('matEmail').value.trim(), phone: phone, address: document.getElementById('matAddress').value.trim() };
    }
    if (step === 4) { var n = document.getElementById('matNotes'); if (n) materialWizard.notes = n.value; }
    materialWizard.step++; renderMaterialStep();
}
function submitMaterial(method) {
    var catNames = { bibles: 'Bibles & Books', clothing: 'Clothing & Shoes', food: 'Food & Essentials', school: 'School Supplies', medical: 'Medical Items', household: 'Household Items' };
    var c = window.CHURCH_CONTACT || { whatsapp: '256785228381', email: 'thebridgecalvarychapel1@gmail.com' };
    var msg = '🙏 MATERIAL DONATION REQUEST\n━━━━━━━━━━━━━━\nCategory: ' + (catNames[materialWizard.category] || '')
        + '\nItems: ' + materialWizard.items + '\nQuantity: ' + (materialWizard.qty || '—')
        + '\nCondition: ' + materialWizard.condition + '\nMethod: ' + (materialWizard.deliveryMethod === 'dropoff' ? 'Drop Off' : 'Collection')
        + '\nStatus: REQUEST\n━━━━━━━━━━━━━━\nDonor: ' + materialWizard.donor.name + '\nPhone: ' + materialWizard.donor.phone
        + (materialWizard.donor.email ? '\nEmail: ' + materialWizard.donor.email : '')
        + (materialWizard.donor.address ? '\nAddress: ' + materialWizard.donor.address : '')
        + '\n━━━━━━━━━━━━━━\nPlease contact me to arrange drop-off or collection.';
    saveDonationToSupabase({ type: 'material', category: materialWizard.category, items: materialWizard.items, quantity: materialWizard.qty, condition: materialWizard.condition, donor_name: materialWizard.donor.name, donor_email: materialWizard.donor.email, donor_phone: materialWizard.donor.phone, donor_address: materialWizard.donor.address, delivery_method: materialWizard.deliveryMethod, notes: materialWizard.notes, status: 'request' });
    if (method === 'whatsapp') window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
    else window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Material Donation') + '&body=' + encodeURIComponent(msg), '_blank');
    showThankYouDonation('material', 0);
}
async function saveDonationToSupabase(payload) {
    try {
        await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/donation_submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        });
    } catch (e) { console.warn(e); }
}
function showThankYouDonation(type, amount) {
    var title = type === 'monetary' ? 'Thank You for Your Gift!' : 'Thank You for Your Donation!';
    var msg = type === 'monetary' ? 'Your pledge of ' + money(amount) + ' has been prepared. Our team will contact you with payment instructions.' : 'Your donation request has been prepared. Our team will contact you to arrange drop-off or collection.';
    openModal('<div class="wizard" style="text-align:center;">'
        + '<div class="thankyou-icon"><i class="fas fa-heart"></i></div>'
        + '<h2 style="font-size:22px;color:var(--navy-deep);margin-bottom:8px;">' + title + '</h2>'
        + '<p style="font-size:13px;color:var(--text-blue-gray);margin-bottom:20px;">' + msg + '</p>'
        + '<div class="wizard-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div></div>');
}

// ============================================
// LOAD
// ============================================
async function loadDonationData() {
    try {
        if (window.db && window.db.getSiteContent) siteContent = await window.db.getSiteContent() || {};
        var base = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
        var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';
        var prodRes = await fetch(base + 'products?select=*&is_published=eq.true&order=display_order.asc&apikey=' + key);
        var prodData = await prodRes.json();
        allProducts = Array.isArray(prodData) ? prodData : [];
        filteredProducts = allProducts.slice();
        renderHero(); renderDirectGiving(); renderStoreHeader();
        renderShopCategoryStrip(); renderProducts();
        updateCartBadge(); renderCart();
    } catch (err) { console.error(err); }
}

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
    setupSupportTabs(); loadDonationData();
});