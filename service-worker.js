import { DEFAULT_SETTINGS } from './targets.js';

async function getSettings() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

function isOriginAllowed(urlString, allowedOrigins) {
  try {
    const url = new URL(urlString);
    return allowedOrigins.includes(url.origin);
  } catch {
    return false;
  }
}

function getSenderOrigin(sender) {
  try {
    const senderUrl = sender?.url || sender?.tab?.url || '';
    if (!senderUrl) {
      return '';
    }
    return new URL(senderUrl).origin;
  } catch {
    return '';
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(DEFAULT_SETTINGS);
  await chrome.storage.local.set({
    ...DEFAULT_SETTINGS,
    ...current
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'TAOLI_PROXY_REQUEST') {
    return;
  }

  (async () => {
    const settings = await getSettings();
    const { enabled, targetOrigins, onlyCurrentSite, allowedPageOrigins } = settings;

    if (!enabled) {
      sendResponse({ ok: false, error: 'CORS helper is disabled in extension settings.' });
      return;
    }

    const senderOrigin = getSenderOrigin(sender);
    if (onlyCurrentSite && !(allowedPageOrigins || []).includes(senderOrigin)) {
      sendResponse({ ok: false, error: `Blocked page origin: ${senderOrigin || 'unknown'}` });
      return;
    }

    const { url, method = 'GET', headers = {}, body = null } = message.payload || {};

    if (!url || !isOriginAllowed(url, targetOrigins)) {
      sendResponse({ ok: false, error: `Blocked target URL: ${url || 'empty'}` });
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        redirect: 'follow',
        credentials: 'omit'
      });

      const text = await response.text();
      const responseHeaders = {};
      for (const [k, v] of response.headers.entries()) {
        responseHeaders[k] = v;
      }

      sendResponse({
        ok: true,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: text,
        finalUrl: response.url
      });
    } catch (err) {
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  })();

  return true;
});
