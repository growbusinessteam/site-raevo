// All site forms using the existing Kommo webhook pass through durable storage first.
(() => {
  const endpoint = '/api/leads/index.php';
  const matches = value => { try { const url = new URL(String(value), location.href); return url.origin === 'https://hook.growautomacao.com.br' && url.pathname === '/webhook/raevo-site-kommo'; } catch { return false; } };
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (!matches(typeof input === 'string' || input instanceof URL ? input : input?.url)) return originalFetch(input, init);
    // Current forms use JSON bodies. Fail visibly if a new form breaks that contract.
    let payload;
    try { payload = JSON.parse(init?.body); } catch { return Promise.reject(new Error('Formato de envio não suportado.')); }
    payload.id ||= `raevo-${crypto.randomUUID()}`;
    if (!payload.sourceUrl && !payload.values?.pageUrl) payload._page = location.href;
    return originalFetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),keepalive:true});
  };
  if (navigator.sendBeacon) {
    const originalBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, body) => originalBeacon(matches(url) ? endpoint : url, body);
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[action^="mailto:"]').forEach(form => {
      form.addEventListener('submit', async event => {
        event.preventDefault(); if (!form.reportValidity()) return;
        const button=form.querySelector('[type="submit"]'); if(button?.disabled)return;
        const payload={id:form.dataset.submissionId ||= `raevo-${crypto.randomUUID()}`,values:Object.fromEntries(new FormData(form)),source:'site-contato',_page:location.href,submittedAt:form.dataset.submittedAt ||= new Date().toISOString()};
        let status=form.querySelector('[data-capture-status]');if(!status){status=document.createElement('p');status.dataset.captureStatus='';status.setAttribute('role','status');form.append(status);}
        if(button)button.disabled=true;status.textContent='Enviando…';
        try{const response=await originalFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error();status.textContent='Recebemos suas informações. A equipe Raevo entrará em contato.';form.reset();delete form.dataset.submissionId;delete form.dataset.submittedAt;}
        catch{status.textContent='Não foi possível enviar. Confira sua conexão e tente novamente.';}
        finally{if(button)button.disabled=false;}
      });
    });
  });
})();
