(function () {
    'use strict';

    var christmasEvent = {
        name: 'Christmas Celebration',
        date: '2026-12-25',
        label: '25 December 2026'
    };

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
    }

    function field(label, input, wide) {
        return '<label class="event-registration-field' + (wide ? ' is-wide' : '') + '">'
            + '<span>' + label + '</span>' + input + '</label>';
    }

    function buildForm() {
        var typeOptions = ['Special Song', 'Drama', 'Dance', 'Poetry', 'Worship Presentation', 'Other'];
        return '<article class="event-registration-card">'
            + '<header class="event-registration-card-header">'
            + '<span class="event-registration-card-icon"><i class="fas fa-gift" aria-hidden="true"></i></span>'
            + '<div><h3>Christmas Celebration</h3><p><i class="far fa-calendar" aria-hidden="true"></i> 25 December 2026</p></div>'
            + '</header>'
            + '<form class="event-registration-form" data-event-registration novalidate>'
            + '<div class="event-registration-fields">'
            + field('Full name of team leader or individual *', '<input name="full_name" type="text" autocomplete="name" maxlength="100" required>')
            + field('Phone number *', '<input name="phone_number" type="tel" autocomplete="tel" inputmode="tel" maxlength="25" placeholder="+256..." required>')
            + field('Team or group name (optional)', '<input name="team_name" type="text" maxlength="100" placeholder="Enter a team name if applicable">', true)
            + field('What will you present? *', '<select name="presentation_type" required><option value="">Choose one presentation</option>'
                + typeOptions.map(function (option) { return '<option value="' + option + '">' + option + '</option>'; }).join('')
                + '</select>')
            + field('Number of people in the team *', '<input name="group_size" type="number" min="1" max="100" step="1" inputmode="numeric" placeholder="1" required>')
            + field('Brief description of the presentation *', '<textarea name="presentation_description" maxlength="1000" placeholder="Tell us about your presentation" required></textarea>', true)
            + field('Additional information (optional)', '<textarea name="additional_information" maxlength="1000" placeholder="Anything else we should know?"></textarea>', true)
            + '</div>'
            + '<p class="event-registration-message" data-registration-message role="status" aria-live="polite"></p>'
            + '<div class="event-registration-actions">'
            + '<button class="event-registration-submit" type="submit" data-submit-mode="save"><i class="fas fa-paper-plane" aria-hidden="true"></i> SUBMIT REGISTRATION</button>'
            + '<button class="event-registration-whatsapp-submit" type="submit" data-submit-mode="whatsapp"><i class="fab fa-whatsapp" aria-hidden="true"></i> SUBMIT &amp; SHARE ON WHATSAPP</button>'
            + '</div>'
            + '<a class="event-registration-whatsapp" data-registration-whatsapp hidden target="_blank" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i> Notify the church on WhatsApp</a>'
            + '</form></article>';
    }

    function registrationPanelMarkup() {
        return '<button class="event-join-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">'
            + '<i class="fas fa-tree" aria-hidden="true"></i><span>CHRISTMAS</span></button>'
            + '<div class="event-registration-backdrop" aria-hidden="true" hidden>'
            + '<section class="event-registration-panel" role="dialog" aria-modal="true" aria-labelledby="eventRegistrationTitle" tabindex="-1">'
            + '<button class="event-registration-close" type="button" aria-label="Close event registration"><i class="fas fa-times" aria-hidden="true"></i></button>'
            + '<div class="event-christmas-lights" aria-hidden="true"></div>'
            + '<span class="event-pine-branch event-pine-branch-left" aria-hidden="true"><i class="fas fa-leaf"></i><i class="fas fa-leaf"></i><i class="fas fa-leaf"></i></span>'
            + '<span class="event-pine-branch event-pine-branch-right" aria-hidden="true"><i class="fas fa-leaf"></i><i class="fas fa-leaf"></i><i class="fas fa-leaf"></i></span>'
            + '<header class="event-registration-heading"><span class="event-registration-eyebrow">Christmas 2026</span>'
            + '<h2 id="eventRegistrationTitle">JOIN OUR CHRISTMAS CELEBRATION</h2>'
            + '<p>Would you like to share your talent with us this Christmas? Register your team or presentation below.</p></header>'
            + '<div class="event-registration-grid">' + buildForm() + '</div>'
            + '</section></div>';
    }

    function showMessage(form, message, success) {
        var output = form.querySelector('[data-registration-message]');
        output.textContent = message;
        output.classList.toggle('is-success', !!success);
    }

    function makeWhatsAppMessage(payload) {
        var lines = [
            'Christmas Celebration registration (25 December 2026)',
            'Name: ' + payload.full_name,
            'Phone: ' + payload.phone_number,
            'Team/group: ' + (payload.team_name || 'Individual'),
            'Presentation: ' + payload.presentation_type,
            'Team members: ' + payload.group_size,
            'Description: ' + payload.presentation_description
        ];
        if (payload.additional_information) lines.push('Additional information: ' + payload.additional_information);
        return lines.join('\n');
    }

    function readForm(form) {
        var data = new FormData(form);
        var payload = {
            full_name: String(data.get('full_name') || '').trim(),
            phone_number: String(data.get('phone_number') || '').trim(),
            team_name: String(data.get('team_name') || '').trim() || null,
            presentation_type: data.get('presentation_type'),
            group_size: Number(data.get('group_size')),
            presentation_description: String(data.get('presentation_description') || '').trim(),
            additional_information: String(data.get('additional_information') || '').trim() || null,
            event_name: christmasEvent.name,
            event_date: christmasEvent.date
        };
        var phoneDigits = payload.phone_number.replace(/\D/g, '');
        if (payload.full_name.length < 2) throw new Error("Please enter the team leader or individual's full name.");
        if (phoneDigits.length < 7 || phoneDigits.length > 15) throw new Error('Enter a valid phone number.');
        if (payload.team_name && payload.team_name.length > 100) throw new Error('Team name must be 100 characters or fewer.');
        if (!payload.presentation_type) throw new Error('Choose one presentation type.');
        if (!Number.isInteger(payload.group_size) || payload.group_size < 1 || payload.group_size > 100) {
            throw new Error('Team size must be a whole number between 1 and 100.');
        }
        if (!payload.presentation_description) throw new Error('Please describe your presentation.');
        if (payload.presentation_description.length > 1000 || (payload.additional_information && payload.additional_information.length > 1000)) {
            throw new Error('Descriptions must be 1,000 characters or fewer.');
        }
        return payload;
    }

    function handleSubmit(form) {
        form.addEventListener('submit', async function (submitEvent) {
            submitEvent.preventDefault();
            if (form.dataset.submitting === 'true' || form.dataset.submitted === 'true') return;

            var submitButton = submitEvent.submitter || form.querySelector('.event-registration-submit');
            var shouldOpenWhatsApp = submitButton.getAttribute('data-submit-mode') === 'whatsapp';
            var payload;
            try {
                payload = readForm(form);
                if (!form.reportValidity()) return;
            } catch (error) {
                showMessage(form, error.message, false);
                return;
            }

            var whatsappWindow = shouldOpenWhatsApp ? window.open('about:blank', '_blank') : null;
            if (whatsappWindow) whatsappWindow.opener = null;
            var submitButtons = Array.prototype.slice.call(form.querySelectorAll('button[type="submit"]'));
            submitButtons.forEach(function (button) {
                button.disabled = true;
                button.setAttribute('aria-busy', 'true');
            });
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving registration...';
            form.dataset.submitting = 'true';
            showMessage(form, '', false);

            try {
                if (!window.db || typeof window.db.submitEventRegistration !== 'function') {
                    throw new Error('Registration service is not available.');
                }
                await window.db.submitEventRegistration(payload);
                form.dataset.submitted = 'true';
                showMessage(form, 'Thank you for registering! We are excited to have you be part of our Christmas Celebration at The Bridge Calvary Chapel Jinja.', true);
                var contact = window.CHURCH_CONTACT || {};
                var phone = String(contact.whatsapp || '').replace(/\D/g, '');
                var whatsAppLink = form.querySelector('[data-registration-whatsapp]');
                if (phone) {
                    whatsAppLink.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(makeWhatsAppMessage(payload));
                    whatsAppLink.hidden = false;
                    if (whatsappWindow) whatsappWindow.location.href = whatsAppLink.href;
                } else if (whatsappWindow) {
                    whatsappWindow.close();
                }
                form.querySelector('[data-submit-mode="save"]').innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> REGISTRATION SAVED';
                form.querySelector('[data-submit-mode="whatsapp"]').innerHTML = whatsappWindow
                    ? '<i class="fab fa-whatsapp" aria-hidden="true"></i> OPENING WHATSAPP...'
                    : shouldOpenWhatsApp
                        ? '<i class="fab fa-whatsapp" aria-hidden="true"></i> USE WHATSAPP LINK BELOW'
                        : '<i class="fab fa-whatsapp" aria-hidden="true"></i> REGISTRATION SAVED';
            } catch (error) {
                console.error('Event registration failed:', error);
                if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
                showMessage(form, error.code === 'PGRST205'
                    ? 'The registration table is not available yet. Please ask the site administrator to run the event_registrations.sql setup in Supabase.'
                    : 'We could not save your registration. Please check your connection and try again.', false);
                submitButtons.forEach(function (button) {
                    button.disabled = false;
                    button.removeAttribute('aria-busy');
                });
                form.querySelector('[data-submit-mode="save"]').innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> SUBMIT REGISTRATION';
                form.querySelector('[data-submit-mode="whatsapp"]').innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i> SUBMIT &amp; SHARE ON WHATSAPP';
            } finally {
                form.dataset.submitting = 'false';
                if (form.dataset.submitted === 'true') {
                    submitButtons.forEach(function (button) { button.removeAttribute('aria-busy'); });
                }
            }
        });
    }

    function initialize() {
        if (!document.body || document.querySelector('.event-join-trigger')) return;
        document.body.insertAdjacentHTML('beforeend', registrationPanelMarkup());

        var trigger = document.querySelector('.event-join-trigger');
        var backdrop = document.querySelector('.event-registration-backdrop');
        var panel = document.querySelector('.event-registration-panel');
        var closeButton = panel.querySelector('.event-registration-close');
        var priorFocus = null;

        function closePanel() {
            if (!backdrop.classList.contains('is-open')) return;
            backdrop.classList.remove('is-open');
            backdrop.setAttribute('aria-hidden', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            window.setTimeout(function () { backdrop.hidden = true; }, 240);
            if (priorFocus) priorFocus.focus();
        }

        function openPanel() {
            priorFocus = document.activeElement;
            backdrop.hidden = false;
            backdrop.setAttribute('aria-hidden', 'false');
            trigger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            window.requestAnimationFrame(function () { backdrop.classList.add('is-open'); });
            window.setTimeout(function () {
                var firstInput = panel.querySelector('input, select, textarea');
                if (backdrop.classList.contains('is-open') && firstInput) firstInput.focus();
            }, 50);
        }

        trigger.addEventListener('click', openPanel);
        closeButton.addEventListener('click', closePanel);
        backdrop.addEventListener('click', function (event) {
            if (event.target === backdrop) closePanel();
        });
        document.addEventListener('keydown', function (event) {
            if (!backdrop.classList.contains('is-open')) return;
            if (event.key === 'Escape') {
                closePanel();
            } else if (event.key === 'Tab') {
                var focusable = panel.querySelectorAll('button:not(:disabled), a[href]:not([hidden]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        handleSubmit(panel.querySelector('[data-event-registration]'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}());
