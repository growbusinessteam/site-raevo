(function setupRaevoTrackingPersistence() {
  const storageKey = 'raevoTrackingParametersV1';
  const additionalTrackingParameters = new Set([
    'fbclid',
    'gclid',
    'gbraid',
    'wbraid',
    'msclkid',
    'ttclid',
    'campaign_id',
    'adset_id',
    'ad_id',
    'adgroup_id',
    'placement',
    'device',
    'network',
  ]);

  function isTrackingParameter(name) {
    return name.toLowerCase().startsWith('utm_') || additionalTrackingParameters.has(name.toLowerCase());
  }

  function readStoredParameters() {
    try {
      return new URLSearchParams(sessionStorage.getItem(storageKey) || '');
    } catch (error) {
      console.warn('Raevo tracking parameters could not be read', error);
      return new URLSearchParams();
    }
  }

  function saveParameters(parameters) {
    try {
      sessionStorage.setItem(storageKey, parameters.toString());
    } catch (error) {
      console.warn('Raevo tracking parameters could not be saved', error);
    }
  }

  function captureCurrentParameters() {
    const parameters = readStoredParameters();
    new URLSearchParams(window.location.search).forEach((value, name) => {
      if (value && isTrackingParameter(name)) {
        parameters.set(name, value);
      }
    });
    saveParameters(parameters);
    return parameters;
  }

  function getParameters() {
    return readStoredParameters();
  }

  function appendParameters(rawUrl) {
    if (!rawUrl || /^(#|mailto:|tel:|sms:|javascript:)/i.test(rawUrl)) {
      return rawUrl;
    }

    const isAbsoluteUrl = /^[a-z][a-z\d+.-]*:/i.test(rawUrl);
    const targetUrl = new URL(rawUrl, window.location.href);
    if (!['http:', 'https:', 'file:'].includes(targetUrl.protocol)) {
      return rawUrl;
    }
    if (window.location.protocol !== 'file:' && targetUrl.origin !== window.location.origin) {
      return rawUrl;
    }

    getParameters().forEach((value, name) => {
      if (value && !targetUrl.searchParams.has(name)) {
        targetUrl.searchParams.set(name, value);
      }
    });

    if (window.location.protocol === 'file:' || isAbsoluteUrl) {
      return targetUrl.href;
    }
    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  }

  function syncLinks(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href]').forEach((link) => {
      const originalHref = link.getAttribute('href');
      const trackedHref = appendParameters(originalHref);
      if (trackedHref && trackedHref !== originalHref) {
        link.setAttribute('href', trackedHref);
      }
    });
  }

  captureCurrentParameters();

  window.RaevoTracking = Object.freeze({
    append: appendParameters,
    get(name) {
      return getParameters().get(name) || '';
    },
    getAll: getParameters,
    queryString() {
      const query = getParameters().toString();
      return query ? `?${query}` : '';
    },
    syncLinks,
  });

  function syncDocumentLinks() {
    syncLinks(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDocumentLinks, { once: true });
  } else {
    syncDocumentLinks();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const trackedHref = appendParameters(link.getAttribute('href'));
    if (trackedHref) link.setAttribute('href', trackedHref);
  }, true);
})();
