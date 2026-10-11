// ============================================
// SUPABASE CLIENT + DATA SERVICE
// File: js/supabase.js
// ============================================

console.log('📦 supabase.js loading...');

const SUPABASE_URL = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

window.CHURCH_CONTACT = {
    whatsapp: '256785228381',
    email: 'thebridgecalvarychapel1@gmail.com',
    name: 'Bridge Calvary Chapel'
};

let supabaseClient = null;

const lib = document.createElement('script');
lib.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
lib.onload = function () {
    if (!window.supabase) {
        console.error('❌ Supabase library failed to attach to window');
        return;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    window.dispatchEvent(new Event('supabase-ready'));
};
lib.onerror = function () {
    console.error('❌ Failed to load Supabase library from CDN');
};
document.head.appendChild(lib);

// ============================================
// DATA SERVICE
// ============================================
window.db = {
    async getSiteContent() {
        if (!supabaseClient) return {};
        const { data, error } = await supabaseClient
            .from('site_content')
            .select('*')
            .eq('is_published', true);
        if (error) { console.error('getSiteContent:', error); return {}; }
        const content = {};
        (data || []).forEach(row => {
            if (!content[row.section]) content[row.section] = {};
            content[row.section][row.key] = row.value;
        });
        return content;
    },

    async getNextService() {
        if (!supabaseClient) return null;
        const { data, error } = await supabaseClient
            .from('services')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) { console.error('getNextService:', error); return null; }
        return data;
    },

    async getMinistries() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('ministries')
            .select('*')
            .eq('is_published', true)
            .order('display_order');
        if (error) { console.error('getMinistries:', error); return []; }
        return data || [];
    },

    async getEvents() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('is_published', true)
            .order('display_order');
        if (error) { console.error('getEvents:', error); return []; }
        return data || [];
    },

    async getSermons() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('sermons')
            .select('*')
            .eq('is_published', true)
            .order('display_order');
        if (error) { console.error('getSermons:', error); return []; }
        return data || [];
    },

    async getSmallGroups() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('small_groups')
            .select('*')
            .eq('is_published', true);
        if (error) { console.error('getSmallGroups:', error); return []; }
        return data || [];
    },

    async getTestimonials() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('testimonials')
            .select('*')
            .eq('is_approved', true);
        if (error) { console.error('getTestimonials:', error); return []; }
        return data || [];
    },

    // ---- LEADERS (for About page leadership section) ----
    async getLeaders() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('leaders')
            .select('*')
            .eq('is_published', true)
            .order('display_order');
        if (error) { console.error('getLeaders:', error); return []; }
        console.log('✅ getLeaders returned', (data || []).length, 'rows');
        return data || [];
    },

    // ---- SHOP POPUP ----
    async getShopPopup() {
        if (!supabaseClient) return null;
        const { data, error } = await supabaseClient
            .from('shop_popup')
            .select('*')
            .eq('enabled', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) { console.error('getShopPopup:', error); return null; }
        return data;
    },

    // ---- LATEST DEVOTION ----
    async getLatestDevotion() {
        if (!supabaseClient) return null;
        const { data, error } = await supabaseClient
            .from('devotions')
            .select('*')
            .eq('is_published', true)
            .order('devotion_date', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) { console.error('getLatestDevotion:', error); return null; }
        return data;
    },

    // ---- ROTATING POPUP CARDS ----
    async getPopupCards() {
        if (!supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('popup_cards')
            .select('*')
            .eq('enabled', true)
            .order('display_order');
        if (error) { console.error('getPopupCards:', error); return []; }
        return data || [];
    },

    async submitGroupRequest(payload) {
        if (!supabaseClient) throw new Error('Supabase not ready');
        const clean = {
            group_name: payload.group_name || '',
            name: payload.name || '',
            email: payload.email || '',
            phone: payload.phone || null,
            message: payload.message || null
        };
        const { error } = await supabaseClient
            .from('group_join_requests')
            .insert([clean]);
        if (error) throw error;
        return true;
    },

    async submitVolunteerRequest(payload) {
        if (!supabaseClient) throw new Error('Supabase not ready');
        const clean = {
            ministry: payload.ministry || '',
            name: payload.name || '',
            email: payload.email || '',
            phone: payload.phone || null,
            message: payload.message || null
        };
        const { error } = await supabaseClient
            .from('volunteer_requests')
            .insert([clean]);
        if (error) throw error;
        return true;
    },

    async subscribeNewsletter(email) {
        if (!supabaseClient) throw new Error('Supabase not ready');
        const { error } = await supabaseClient
            .from('newsletter_subscribers')
            .insert([{ email, consent: true }]);
        if (error) {
            if (error.code === '23505') return { duplicate: true };
            throw error;
        }
        return { success: true };
    }
};

// ============================================
// IMAGE HELPER
// ============================================
window.img = function (content, sectionName) {
    if (!content || !sectionName) return '';
    var s = content[sectionName];
    if (!s) return '';
    return s.image || s.hero_image || s.background_image || s.main_image || s.small_image || '';
};

console.log('✅ supabase.js loaded with getLeaders()');