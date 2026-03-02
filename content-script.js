const SETTINGS_EVENT = 'TAOLI_SETTINGS_UPDATE';
const DEFAULT_SETTINGS = {
  enabled: true,
  autoProxyFetch: true,
  allowedPageOrigins: [
    'https://taolimonitor.life',
    'https://dev.taolimonitor.life'
  ],
  targetOrigins: []
};
let bridgeInjected = false;

function injectBridgeScript(onLoad) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected-bridge.js');
  script.dataset.extensionId = chrome.runtime.id;
  script.onload = () => {
    if (typeof onLoad === 'function') {
      onLoad();
    }
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

function isCurrentPageAllowed(settings) {
  const allowed = settings.allowedPageOrigins || [];
  return allowed.includes(location.origin);
}

window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || data.source !== 'TAOLI_PAGE' || data.type !== 'TAOLI_PROXY_REQUEST') {
    return;
  }

  chrome.storage.local.get(DEFAULT_SETTINGS).then((settings) => {
    if (!isCurrentPageAllowed(settings)) {
      window.postMessage({
        source: 'TAOLI_EXTENSION',
        type: 'TAOLI_PROXY_RESPONSE',
        requestId: data.requestId,
        response: { ok: false, error: `Blocked page origin: ${location.origin}` }
      }, '*');
      return;
    }

    chrome.runtime.sendMessage({
      type: 'TAOLI_PROXY_REQUEST',
      payload: data.payload
    }, (response) => {
      const error = chrome.runtime.lastError;
      window.postMessage({
        source: 'TAOLI_EXTENSION',
        type: 'TAOLI_PROXY_RESPONSE',
        requestId: data.requestId,
        response: response || { ok: false, error: error?.message || 'Unknown runtime error' }
      }, '*');
    });
  });
});

function postSettings(settings) {
  const pageAllowed = isCurrentPageAllowed(settings);
  window.postMessage({
    source: 'TAOLI_EXTENSION',
    type: SETTINGS_EVENT,
    settings: {
      autoProxyFetch: !!settings.enabled && !!settings.autoProxyFetch && pageAllowed,
      targetOrigins: settings.targetOrigins || []
    }
  }, '*');
}

async function pushSettingsToPage() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  postSettings(settings);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return;
  }

  if (
    changes.enabled ||
    changes.autoProxyFetch ||
    changes.allowedPageOrigins ||
    changes.targetOrigins
  ) {
    pushSettingsToPage();
    syncBridgeInjection();
  }
});

async function syncBridgeInjection() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  if (!isCurrentPageAllowed(settings)) {
    return;
  }

  if (!bridgeInjected) {
    bridgeInjected = true;
    injectBridgeScript(() => {
      postSettings(settings);
    });
    return;
  }

  postSettings(settings);
}

syncBridgeInjection();
