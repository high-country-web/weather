// Keep diagnostics useful without printing tokens, query strings, or response bodies.
(() => {
  function resourcePath(url) {
    try {
      return new URL(url, location.href).pathname;
    } catch (_) {
      return '(unknown resource)';
    }
  }
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target && target !== window && (target.src || target.href)) {
        console.warn(`[Boone assets] Resource failed: ${resourcePath(target.src || target.href)}`);
      }
    },
    true,
  );
  document.addEventListener('DOMContentLoaded', () => {
    console.info('[Boone assets] Page scripts loaded');
    if (!window.jQuery) return;
    const started = new WeakMap();
    jQuery(document).ajaxSend((event, xhr, settings) => {
      if (!settings.url.startsWith('/api/weather')) return;
      started.set(xhr, Date.now());
      console.info(`[Boone weather] Request: ${resourcePath(settings.url)}`);
    });
    jQuery(document).ajaxComplete((event, xhr, settings) => {
      if (!started.has(xhr)) return;
      const ok = xhr.status >= 200 && xhr.status < 300;
      console[ok ? 'info' : 'warn'](
        `[Boone weather] ${ok ? 'Response' : 'Request failed'}: ${resourcePath(settings.url)}; HTTP ${xhr.status}; ${Date.now() - started.get(xhr)}ms`,
      );
      started.delete(xhr);
    });
  });
})();

// Slides are rendered in the browser; report only lifecycle events to Express.
(() => {
  let viewId;
  let warned = false;
  window.setBooneViewId = (id) => {
    viewId = id;
  };
  window.reportBooneSlide = (event, slide, position, total) => {
    if (!viewId) return;
    fetch('/api/view-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewId, event, slide, position, total }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Slide log unavailable');
      })
      .catch(() => {
        if (!warned) console.warn('[Boone slides] Server logging unavailable; playback continues');
        warned = true;
      });
  };
})();
