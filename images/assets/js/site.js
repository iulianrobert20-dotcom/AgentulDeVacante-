(() => {
  'use strict';

  function setupMenu(){
    const button = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-nav]');
    const dock = document.querySelector('.social-dock');
    if (!button || !menu) return;
    button.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '✕' : '☰';
      if (dock) dock.style.display = open ? 'none' : 'flex';
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        menu.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
        if (dock) dock.style.display = 'flex';
      }
    });
  }

  function showToast(message){
    let toast = document.querySelector('.toast');
    if (!toast){
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__advToastTimer);
    window.__advToastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function setupLeadForm(){
    const form = document.querySelector('[data-lead-form]');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lines = [
        'Bună ziua! Doresc o ofertă de vacanță.',
        '',
        `Destinație: ${data.get('destinatie') || 'flexibil'}`,
        `Plecare din: ${data.get('plecare') || 'flexibil'}`,
        `Perioadă: ${data.get('perioada') || 'flexibilă'}`,
        `Durată: ${data.get('durata') || 'flexibilă'}`,
        `Adulți: ${data.get('adulti') || '2'}`,
        `Copii: ${data.get('copii') || '0'}`,
        data.get('varste_copii') ? `Vârsta copiilor: ${data.get('varste_copii')}` : '',
        `Buget total: ${data.get('buget') || 'de stabilit'}`,
        `Masă preferată: ${data.get('masa') || 'oricare'}`,
        data.get('detalii') ? `Alte detalii: ${data.get('detalii')}` : ''
      ].filter(Boolean);
      const url = `https://wa.me/40774171971?text=${encodeURIComponent(lines.join('\n'))}`;
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { method: 'whatsapp_form', page_location: location.href });
      }
      showToast('Se deschide WhatsApp cu cererea completată.');
      window.setTimeout(() => window.open(url, '_blank', 'noopener'), 250);
    });
  }

  function setupTracking(){
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || typeof window.gtag !== 'function') return;
      const href = link.getAttribute('href') || '';
      if (href.includes('wa.me/')) window.gtag('event', 'whatsapp_click', { link_url: href, page_location: location.href });
      else if (href.includes('whatsapp.com/channel')) window.gtag('event', 'whatsapp_channel_click', { page_location: location.href });
      else if (href.startsWith('tel:')) window.gtag('event', 'phone_click', { page_location: location.href });
      else if (href.startsWith('mailto:')) window.gtag('event', 'email_click', { page_location: location.href });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    setupLeadForm();
    setupTracking();
  });
})();
