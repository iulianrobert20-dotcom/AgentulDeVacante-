(() => {
  'use strict';

  const analyticsId = 'G-E180CSG8CC';
  const consentKey = 'adv-cookie-consent-v1';

  function readConsent(){
    try {
      return window.localStorage.getItem(consentKey);
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value){
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (error) {
      // Preferința rămâne valabilă pentru pagina curentă dacă stocarea este blocată.
    }
  }

  function loadAnalytics(){
    if (document.querySelector('script[data-adv-analytics]')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', analyticsId, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
    script.dataset.advAnalytics = 'true';
    document.head.appendChild(script);
  }

  function setupCookieConsent(){
    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.innerHTML = `
      <h2 id="cookie-title">Preferințe pentru statistici</h2>
      <p>Site-ul folosește Google Analytics numai dacă accepți. Cookie-urile necesare funcționării preferinței nu pot fi dezactivate. Poți afla mai multe în <a href="politica-confidentialitate.html#cookie-uri">politica de confidențialitate</a>.</p>
      <div class="cookie-actions">
        <button class="cookie-accept" type="button" data-cookie-choice="accepted">Accept statisticile</button>
        <button class="cookie-reject" type="button" data-cookie-choice="rejected">Continuă fără statistici</button>
      </div>`;
    document.body.appendChild(banner);

    const settings = document.createElement('button');
    settings.className = 'cookie-settings';
    settings.type = 'button';
    settings.textContent = 'Setări cookie';
    settings.setAttribute('aria-label', 'Modifică preferințele pentru cookie-uri');
    document.body.appendChild(settings);

    const applyChoice = (choice) => {
      saveConsent(choice);
      banner.hidden = true;
      settings.hidden = false;
      if (choice === 'accepted') loadAnalytics();
    };

    banner.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cookie-choice]');
      if (button) applyChoice(button.dataset.cookieChoice);
    });
    settings.addEventListener('click', () => {
      banner.hidden = false;
      settings.hidden = true;
      banner.querySelector('button').focus();
    });

    const consent = readConsent();
    if (consent === 'accepted') {
      banner.hidden = true;
      loadAnalytics();
    } else if (consent === 'rejected') {
      banner.hidden = true;
    } else {
      settings.hidden = true;
    }
  }

  function setupRoleDisclosure(){
    if (document.querySelector('.role-disclosure')) return;
    const disclosure = document.createElement('aside');
    disclosure.className = 'role-disclosure';
    disclosure.setAttribute('aria-label', 'Clarificare privind rolul site-ului');
    disclosure.innerHTML = '<div class="container"><strong>Clarificare:</strong> AgentulDeVacante.ro este site-ul personal de prezentare și promovare al lui Stoica Robert și <strong>nu este agenție de turism</strong>. Pachetele turistice sunt oferite și contractate prin <a href="https://www.destine-holidays.ro/" target="_blank" rel="noopener">Destine Holidays</a>, iar agenția organizatoare este indicată în oferta și contractul transmise clientului. <a href="despre-mine.html">Detalii despre rolul meu →</a></div>';
    const footer = document.querySelector('footer');
    const dock = document.querySelector('.social-dock');
    if (footer) footer.parentNode.insertBefore(disclosure, footer);
    else if (dock) dock.parentNode.insertBefore(disclosure, dock);
    else document.body.appendChild(disclosure);
  }

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
    setupRoleDisclosure();
    setupCookieConsent();
    setupMenu();
    setupLeadForm();
    setupTracking();
  });
})();
