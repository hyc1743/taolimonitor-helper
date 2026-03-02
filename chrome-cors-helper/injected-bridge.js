(function () {
  const REQUEST_SOURCE = 'TAOLI_PAGE';
  const RESPONSE_SOURCE = 'TAOLI_EXTENSION';
  const CHANNEL_REQUEST = 'TAOLI_PROXY_REQUEST';
  const CHANNEL_RESPONSE = 'TAOLI_PROXY_RESPONSE';
  const CHANNEL_SETTINGS = 'TAOLI_SETTINGS_UPDATE';
  const SETTINGS_KEY = '__TAOLI_CORS_SETTINGS__';

  const state = {
    settings: {
      autoProxyFetch: true,
      targetOrigins: []
    },
    counter: 0,
    pending: new Map()
  };

  function isAllowed(url) {
    try {
      const origin = new URL(url, location.href).origin;
      return state.settings.targetOrigins.includes(origin);
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
      return out;
    } catch {
      return out;
    }
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
    const requestId = `taoli_${Date.now()}_${state.counter++}`;

    return new Promise((resolve, reject) => {
      state.pending.set(requestId, { resolve, reject });
      window.postMessage({
        source: REQUEST_SOURCE,
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
    if (!data || data.source !== RESPONSE_SOURCE) {
      return;
    }

    if (data.type === CHANNEL_SETTINGS) {
      state.settings = {
        ...state.settings,
        ...(data.settings || {})
      };
      window[SETTINGS_KEY] = { ...state.settings };
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

  async function proxiedFetch(input, init = {}) {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = request.url;
    const method = request.method || init.method || 'GET';

    if (!state.settings.autoProxyFetch || !isAllowed(url)) {
      return originalFetch(input, init);
    }

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
    } else {
      body = null;
    }

    const proxyResponse = await proxyRequest({
      url,
      method,
      headers,
      body
    });

    if (!proxyResponse || !proxyResponse.ok) {
      throw new Error(proxyResponse?.error || 'Unknown proxy error');
    }

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: proxyResponse.headers
    });
  }

  window.fetch = proxiedFetch;

  window.taoliCors = {
    setSettings(settings) {
      state.settings = {
        ...state.settings,
        ...settings
      };
      window[SETTINGS_KEY] = state.settings;
    },
    getSettings() {
      return { ...state.settings };
    },
    async request(url, init = {}) {
      const method = init.method || 'GET';
      const headers = serializeHeaders(init.headers);
      const body = normalizeBody(method, init.body, headers);
      const proxyResponse = await proxyRequest({
        url,
        method,
        headers,
        body
      });
      if (!proxyResponse.ok) {
        throw new Error(proxyResponse.error || 'Unknown proxy error');
      }
      return proxyResponse;
    }
  };
})();
