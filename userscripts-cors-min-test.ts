// ==UserScript==
// @name         Userscripts iOS CORS Min Test
// @namespace    https://taolimonitor.life/
// @version      1.0.0
// @description  Minimal GM_xmlhttpRequest CORS test without console
// @match        https://taolimonitor.life/*
// @match        https://dev.taolimonitor.life/*
// @run-at       document-end
// @inject-into  content
// @grant        GM_xmlhttpRequest
// @connect      api.bitget.com
// @connect      api.gateio.ws
// ==/UserScript==

type GMRequestConfig = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: string | null;
  timeout?: number;
  responseType?: 'text' | 'json' | 'blob' | 'arraybuffer' | 'document';
  anonymous?: boolean;
  onload?: (response: GMResponse) => void;
  onerror?: (error: unknown) => void;
  ontimeout?: () => void;
};

type GMResponse = {
  status: number;
  statusText?: string;
  responseText?: string;
  responseHeaders?: string;
  finalUrl?: string;
};

declare function GM_xmlhttpRequest(config: GMRequestConfig): void;

(() => {
  const REQUEST_TIMEOUT_MS = 15_000;

  function createPanel(): void {
    const panel = document.createElement('div');
    panel.style.cssText = [
      'position:fixed',
      'right:12px',
      'bottom:12px',
      'z-index:2147483647',
      'width:320px',
      'max-height:50vh',
      'overflow:auto',
      'background:#111',
      'color:#0f0',
      'font:12px/1.4 Menlo,Monaco,monospace',
      'padding:10px',
      'border-radius:8px',
      'box-shadow:0 4px 16px rgba(0,0,0,.35)'
    ].join(';');

    const title = document.createElement('div');
    title.textContent = 'CORS Min Test';
    title.style.cssText = 'font-weight:700;color:#fff;margin-bottom:8px;';
    panel.appendChild(title);

    const btn = document.createElement('button');
    btn.textContent = 'Run Test';
    btn.style.cssText =
      'padding:6px 10px;border:0;border-radius:6px;background:#1f6feb;color:#fff;cursor:pointer;';
    panel.appendChild(btn);

    const log = document.createElement('pre');
    log.style.cssText = 'white-space:pre-wrap;margin:8px 0 0;color:#9fef9f;';
    panel.appendChild(log);

    function append(line: string): void {
      log.textContent += (log.textContent ? '\n' : '') + line;
      panel.scrollTop = panel.scrollHeight;
    }

    function testOne(name: string, url: string): Promise<boolean> {
      return new Promise((resolve) => {
        append(`[${name}] -> ${url}`);

        GM_xmlhttpRequest({
          method: 'GET',
          url,
          timeout: REQUEST_TIMEOUT_MS,
          onload: (res) => {
            const ok = res.status >= 200 && res.status < 300;
            const preview = (res.responseText || '').slice(0, 120).replace(/\s+/g, ' ');
            append(`[${name}] status=${res.status} ok=${ok} len=${(res.responseText || '').length}`);
            append(`[${name}] body=${preview}`);
            resolve(ok);
          },
          onerror: (err) => {
            append(`[${name}] ERROR: ${JSON.stringify(err)}`);
            resolve(false);
          },
          ontimeout: () => {
            append(`[${name}] TIMEOUT`);
            resolve(false);
          }
        });
      });
    }

    btn.addEventListener('click', async () => {
      log.textContent = '';
      append('Start...');
      append(`GM_xmlhttpRequest exists: ${typeof GM_xmlhttpRequest === 'function'}`);

      if (typeof GM_xmlhttpRequest !== 'function') {
        append('FAIL: GM_xmlhttpRequest unavailable (check @grant / @inject-into content)');
        return;
      }

      const r1 = await testOne('bitget', 'https://api.bitget.com/api/v2/spot/market/tickers');
      const r2 = await testOne('gate', 'https://api.gateio.ws/api/v4/spot/tickers');

      const pass = r1 || r2;
      append(pass ? 'RESULT: PASS (GM cross-origin works)' : 'RESULT: FAIL');
      document.title = pass ? 'PASS CORS TEST' : 'FAIL CORS TEST';
    });

    const close = document.createElement('button');
    close.textContent = 'x';
    close.style.cssText =
      'position:absolute;top:6px;right:8px;border:0;background:transparent;color:#fff;font-size:16px;cursor:pointer;';
    close.addEventListener('click', () => panel.remove());
    panel.appendChild(close);

    document.documentElement.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel, { once: true });
  } else {
    createPanel();
  }
})();
