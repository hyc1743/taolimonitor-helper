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

(function () {
  'use strict';

  var REQUEST_TIMEOUT_MS = 15000;

  function createPanel() {
    var panel = document.createElement('div');
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

    var title = document.createElement('div');
    title.textContent = 'CORS Min Test';
    title.style.cssText = 'font-weight:700;color:#fff;margin-bottom:8px;';
    panel.appendChild(title);

    var btn = document.createElement('button');
    btn.textContent = 'Run Test';
    btn.style.cssText =
      'padding:6px 10px;border:0;border-radius:6px;background:#1f6feb;color:#fff;cursor:pointer;';
    panel.appendChild(btn);

    var log = document.createElement('pre');
    log.style.cssText = 'white-space:pre-wrap;margin:8px 0 0;color:#9fef9f;';
    panel.appendChild(log);

    function append(line) {
      log.textContent += (log.textContent ? '\n' : '') + line;
      panel.scrollTop = panel.scrollHeight;
    }

    function testOne(name, url) {
      return new Promise(function (resolve) {
        append('[' + name + '] -> ' + url);

        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          timeout: REQUEST_TIMEOUT_MS,
          onload: function (res) {
            var ok = res.status >= 200 && res.status < 300;
            var preview = (res.responseText || '').slice(0, 120).replace(/\s+/g, ' ');
            append('[' + name + '] status=' + res.status + ' ok=' + ok + ' len=' + (res.responseText || '').length);
            append('[' + name + '] body=' + preview);
            resolve(ok);
          },
          onerror: function (err) {
            append('[' + name + '] ERROR: ' + JSON.stringify(err));
            resolve(false);
          },
          ontimeout: function () {
            append('[' + name + '] TIMEOUT');
            resolve(false);
          }
        });
      });
    }

    btn.addEventListener('click', function () {
      log.textContent = '';
      append('Start...');
      append('GM_xmlhttpRequest exists: ' + (typeof GM_xmlhttpRequest === 'function'));

      if (typeof GM_xmlhttpRequest !== 'function') {
        append('FAIL: GM_xmlhttpRequest unavailable (check @grant / @inject-into content)');
        return;
      }

      testOne('bitget', 'https://api.bitget.com/api/v2/spot/market/tickers')
        .then(function (r1) {
          return testOne('gate', 'https://api.gateio.ws/api/v4/spot/tickers').then(function (r2) {
            return r1 || r2;
          });
        })
        .then(function (pass) {
          append(pass ? 'RESULT: PASS (GM cross-origin works)' : 'RESULT: FAIL');
          document.title = pass ? 'PASS CORS TEST' : 'FAIL CORS TEST';
        });
    });

    var close = document.createElement('button');
    close.textContent = 'x';
    close.style.cssText =
      'position:absolute;top:6px;right:8px;border:0;background:transparent;color:#fff;font-size:16px;cursor:pointer;';
    close.addEventListener('click', function () { panel.remove(); });
    panel.appendChild(close);

    document.documentElement.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel, { once: true });
  } else {
    createPanel();
  }
})();
