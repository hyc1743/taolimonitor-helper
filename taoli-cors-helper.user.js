// ==UserScript==
// @name         TAOLI CORS Helper (Userscript)
// @namespace    https://taolimonitor.life/
// @version      1.0.0
// @description  Proxy fetch requests through GM_xmlhttpRequest to avoid page-level CORS restrictions.
// @author       hyc1743
// @match        https://taolimonitor.life/*
// @match        https://dev.taolimonitor.life/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
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

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url,
        method,
        headers,
        data: body,
        timeout: REQUEST_TIMEOUT_MS,
        responseType: 'text',
        anonymous: true,
        onload: (res) => {
          resolve({
            ok: true,
            status: res.status,
            statusText: res.statusText || '',
            headers: parseResponseHeaders(res.responseHeaders),
            body: typeof res.responseText === 'string' ? res.responseText : '',
            finalUrl: res.finalUrl || url
          });
        },
        onerror: (err) => {
          reject(new Error(err?.error || err?.statusText || 'GM_xmlhttpRequest failed'));
        },
        ontimeout: () => {
          reject(new Error(`Proxy request timeout after ${REQUEST_TIMEOUT_MS} ms`));
        }
      });
    });
  }

  async function taoliRequest(url, init = {}) {
    const method = init.method || 'GET';
    const headers = serializeHeaders(init.headers);
    const body = normalizeBody(method, init.body, headers);

    if (!url || !isTargetAllowed(url)) {
      throw new Error(`Blocked target URL: ${url || 'empty'}`);
    }

    const response = await proxyRequest({ url, method, headers, body });
    if (!response.ok) {
      throw new Error(response.error || 'Unknown proxy error');
    }

    return response;
  }

  function exposeApi() {
    window.taoliCors = {
      getEnabled,
      setEnabled,
      getConfig() {
        return {
          enabled: getEnabled(),
          targetOrigins: [...TARGET_ORIGINS],
          allowedPageOrigins: [...ALLOWED_PAGE_ORIGINS]
        };
      },
      request: taoliRequest
    };
  }

  async function installFetchProxy() {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async function proxiedFetch(input, init = {}) {
      const enabled = getEnabled();
      if (!enabled) {
        return originalFetch(input, init);
      }

      const request = input instanceof Request ? input : new Request(input, init);
      const url = request.url;
      if (!isTargetAllowed(url)) {
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

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: proxyResponse.headers
      });
    };
  }

  if (!isAllowedPageOrigin()) {
    return;
  }

  exposeApi();
  registerMenu();
  installFetchProxy();
})();
