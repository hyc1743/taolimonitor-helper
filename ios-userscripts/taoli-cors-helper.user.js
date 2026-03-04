// ==UserScript==
// @name         TAOLI CORS Helper (Userscript)
// @namespace    https://taolimonitor.life/
// @version      1.1.1
// @description  Proxy page fetch requests through GM_xmlhttpRequest to avoid page-level CORS restrictions.
// @author       hyc1743
// @match        https://taolimonitor.life/*
// @match        https://dev.taolimonitor.life/*
// @run-at       document-start
// @inject-into  content
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      api.backpack.exchange
// @connect      api.bitget.com
// @connect      api.gateio.ws
// @connect      api.hbdm.vn
// @connect      api-aws.huobi.pro
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_ORIGINS = [
    'https://api.backpack.exchange',
    'https://api.bitget.com',
    'https://api.gateio.ws',
    'https://api.hbdm.vn',
    'https://api-aws.huobi.pro'
  ];

  const ALLOWED_PAGE_ORIGINS = [
    'https://taolimonitor.life',
    'https://dev.taolimonitor.life'
  ];

  const ENABLED_KEY = 'taoli_cors_enabled';
  const REQUEST_TIMEOUT_MS = 30000;

  const CHANNEL_REQUEST = 'TAOLI_PROXY_REQUEST';
  const CHANNEL_RESPONSE = 'TAOLI_PROXY_RESPONSE';
  const CHANNEL_SETTINGS = 'TAOLI_SETTINGS_UPDATE';
  const SOURCE_PAGE = 'TAOLI_PAGE';
  const SOURCE_CONTENT = 'TAOLI_CONTENT';

  function isAllowedPageOrigin() {
    return ALLOWED_PAGE_ORIGINS.includes(window.location.origin);
  }

  function isTargetAllowed(urlString) {
    try {
      const origin = new URL(urlString, window.location.href).origin;
      return TARGET_ORIGINS.includes(origin);
    } catch {
      return false;
    }
  }

  function getEnabled() {
    try {
      return GM_getValue(ENABLED_KEY, true);
    } catch {
      return true;
    }
  }

  function setEnabled(enabled) {
    try {
      GM_setValue(ENABLED_KEY, !!enabled);
    } catch {
      // Ignore storage write error.
    }
  }

  function registerMenu() {
    if (typeof GM_registerMenuCommand !== 'function') {
      return;
    }

    const enabled = getEnabled();
    const title = enabled ? '关闭 TAOLI 代理' : '开启 TAOLI 代理';
    GM_registerMenuCommand(title, () => {
      setEnabled(!enabled);
      window.location.reload();
    });
  }

  function getGmRequestFunction() {
    if (typeof GM_xmlhttpRequest === 'function') {
      return GM_xmlhttpRequest;
    }
    if (typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function') {
      return GM.xmlHttpRequest.bind(GM);
    }
    return null;
  }

  function parseResponseHeaders(rawHeaders) {
    const headers = {};

    if (!rawHeaders) {
      return headers;
    }

    const lines = rawHeaders.split(/\r?\n/);
    for (const line of lines) {
      if (!line) {
        continue;
      }
      const index = line.indexOf(':');
      if (index <= 0) {
        continue;
      }
      const key = line.slice(0, index).trim().toLowerCase();
      const value = line.slice(index + 1).trim();
      if (key) {
        headers[key] = value;
      }
    }

    return headers;
  }

  function proxyRequest(payload) {
    const { url, method = 'GET', headers = {}, body = null } = payload || {};
    const gmRequest = getGmRequestFunction();

    if (!gmRequest) {
      return Promise.reject(new Error('GM_xmlhttpRequest is not available'));
    }

    return new Promise((resolve, reject) => {
      gmRequest({
        url,
        method,
        headers,
        data: body,
        timeout: REQUEST_TIMEOUT_MS,
        onload: (res) => {
          resolve({
            ok: true,
            status: res.status,
            statusText: res.statusText || '',
            headers: parseResponseHeaders(res.responseHeaders),
            body: typeof res.responseText === 'string' ? res.responseText : '',
            finalUrl: res.finalUrl || res.responseURL || url
          });
        },
        onerror: (err) => {
          reject(new Error(err?.error || err?.statusText || 'GM request failed'));
        },
        ontimeout: () => {
          reject(new Error(`Proxy request timeout after ${REQUEST_TIMEOUT_MS} ms`));
        }
      });
    });
  }

  function postSettingsToPage() {
    window.postMessage({
      source: SOURCE_CONTENT,
      type: CHANNEL_SETTINGS,
      settings: {
        enabled: !!getEnabled(),
        targetOrigins: TARGET_ORIGINS
      }
    }, '*');
  }

  function setupContentMessageHandler() {
    window.addEventListener('message', async (event) => {
      if (event.source !== window) {
        return;
      }

      const data = event.data;
      if (!data || data.source !== SOURCE_PAGE || data.type !== CHANNEL_REQUEST) {
        return;
      }

      const requestId = data.requestId;
      const payload = data.payload || {};

      if (!getEnabled()) {
        window.postMessage({
          source: SOURCE_CONTENT,
          type: CHANNEL_RESPONSE,
          requestId,
          response: { ok: false, error: 'TAOLI proxy is disabled' }
        }, '*');
        return;
      }

      if (!payload.url || !isTargetAllowed(payload.url)) {
        window.postMessage({
          source: SOURCE_CONTENT,
          type: CHANNEL_RESPONSE,
          requestId,
          response: { ok: false, error: `Blocked target URL: ${payload.url || 'empty'}` }
        }, '*');
        return;
      }

      try {
        const response = await proxyRequest(payload);
        window.postMessage({
          source: SOURCE_CONTENT,
          type: CHANNEL_RESPONSE,
          requestId,
          response
        }, '*');
      } catch (err) {
        window.postMessage({
          source: SOURCE_CONTENT,
          type: CHANNEL_RESPONSE,
          requestId,
          response: {
            ok: false,
            error: err instanceof Error ? err.message : String(err)
          }
        }, '*');
      }
    });
  }

  function injectPageBridge() {
    const script = document.createElement('script');
    script.textContent = `(() => {
      const CHANNEL_REQUEST = '${CHANNEL_REQUEST}';
      const CHANNEL_RESPONSE = '${CHANNEL_RESPONSE}';
      const CHANNEL_SETTINGS = '${CHANNEL_SETTINGS}';
      const SOURCE_PAGE = '${SOURCE_PAGE}';
      const SOURCE_CONTENT = '${SOURCE_CONTENT}';

      const state = {
        enabled: true,
        targetOrigins: [],
        pending: new Map(),
        seq: 0
      };

      function isAllowed(urlString) {
        try {
          const origin = new URL(urlString, location.href).origin;
          return state.targetOrigins.includes(origin);
        } catch {
          return false;
        }
      }

      function serializeHeaders(headersInput) {
        const out = {};
        if (!headersInput) {
          return out;
        }

        try {
          const headers = new Headers(headersInput);
          for (const [k, v] of headers.entries()) {
            out[k] = v;
          }
        } catch {
          // Ignore invalid headers.
        }
        return out;
      }

      function normalizeBody(method, body, headers) {
        const upper = (method || 'GET').toUpperCase();
        if (upper === 'GET' || upper === 'HEAD' || body == null) {
          return null;
        }

        if (typeof body === 'string') {
          return body;
        }

        if (body instanceof URLSearchParams) {
          if (!headers['content-type']) {
            headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
          }
          return body.toString();
        }

        if (typeof body === 'object') {
          if (!headers['content-type']) {
            headers['content-type'] = 'application/json;charset=UTF-8';
          }
          return JSON.stringify(body);
        }

        return String(body);
      }

      function proxyRequest(payload) {
        const requestId = 'taoli_' + Date.now() + '_' + state.seq++;

        return new Promise((resolve, reject) => {
          state.pending.set(requestId, { resolve, reject });

          window.postMessage({
            source: SOURCE_PAGE,
            type: CHANNEL_REQUEST,
            requestId,
            payload
          }, '*');

          setTimeout(() => {
            const task = state.pending.get(requestId);
            if (task) {
              state.pending.delete(requestId);
              task.reject(new Error('Proxy request timeout after 30 seconds'));
            }
          }, 30000);
        });
      }

      window.addEventListener('message', (event) => {
        if (event.source !== window) {
          return;
        }

        const data = event.data;
        if (!data || data.source !== SOURCE_CONTENT) {
          return;
        }

        if (data.type === CHANNEL_SETTINGS) {
          state.enabled = !!data.settings?.enabled;
          state.targetOrigins = Array.isArray(data.settings?.targetOrigins)
            ? data.settings.targetOrigins
            : [];
          return;
        }

        if (data.type === CHANNEL_RESPONSE) {
          const task = state.pending.get(data.requestId);
          if (!task) {
            return;
          }

          state.pending.delete(data.requestId);
          task.resolve(data.response);
        }
      });

      const originalFetch = window.fetch.bind(window);

      window.fetch = async function taoliFetch(input, init = {}) {
        if (!state.enabled) {
          return originalFetch(input, init);
        }

        const request = input instanceof Request ? input : new Request(input, init);
        const url = request.url;

        if (!isAllowed(url)) {
          return originalFetch(input, init);
        }

        const method = request.method || init.method || 'GET';
        const headers = serializeHeaders(init.headers || request.headers);

        let body = null;
        if (init.body !== undefined) {
          body = normalizeBody(method, init.body, headers);
        } else if (input instanceof Request) {
          try {
            const raw = await input.clone().text();
            body = normalizeBody(method, raw, headers);
          } catch {
            body = null;
          }
        }

        const proxyResponse = await proxyRequest({
          url,
          method,
          headers,
          body
        });

        if (!proxyResponse || !proxyResponse.ok) {
          throw new Error(proxyResponse?.error || 'Proxy request failed');
        }

        return new Response(proxyResponse.body, {
          status: proxyResponse.status,
          statusText: proxyResponse.statusText,
          headers: proxyResponse.headers
        });
      };

      window.taoliCors = {
        request: async (url, init = {}) => {
          const method = init.method || 'GET';
          const headers = serializeHeaders(init.headers);
          const body = normalizeBody(method, init.body, headers);
          const proxyResponse = await proxyRequest({ url, method, headers, body });
          if (!proxyResponse.ok) {
            throw new Error(proxyResponse.error || 'Proxy request failed');
          }
          return proxyResponse;
        }
      };
    })();`;

    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  if (!isAllowedPageOrigin()) {
    return;
  }

  registerMenu();
  setupContentMessageHandler();
  injectPageBridge();
  postSettingsToPage();
})();
