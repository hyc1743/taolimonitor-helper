import { DEFAULT_SETTINGS } from './targets.js';

const enabledEl = document.querySelector('#enabled');
const autoProxyFetchEl = document.querySelector('#autoProxyFetch');
const onlyCurrentSiteEl = document.querySelector('#onlyCurrentSite');
const currentSiteHintEl = document.querySelector('#currentSiteHint');
const targetOriginsEl = document.querySelector('#targetOrigins');
const statusEl = document.querySelector('#status');
const saveBtn = document.querySelector('#save');
let currentTabOrigin = '';

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

function getTabOrigin(tab) {
  if (!tab || !tab.url) {
    return '';
  }

  try {
    return new URL(tab.url).origin;
  } catch {
    return '';
  }
}

async function load() {
  const [settings, activeTab] = await Promise.all([
    chrome.storage.local.get(DEFAULT_SETTINGS),
    getActiveTab()
  ]);

  currentTabOrigin = getTabOrigin(activeTab);
  enabledEl.checked = !!settings.enabled;
  autoProxyFetchEl.checked = !!settings.autoProxyFetch;
  onlyCurrentSiteEl.checked = !!settings.onlyCurrentSite;
  targetOriginsEl.value = (settings.targetOrigins || []).join('\n');
  currentSiteHintEl.textContent = currentTabOrigin
    ? `当前网站: ${currentTabOrigin}`
    : '当前页面不是可识别的网站（如 chrome:// 页面）';
}

function parseOrigins(text) {
  const list = text
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

  const uniq = [];
  const set = new Set();

  for (const item of list) {
    try {
      const origin = new URL(item).origin;
      if (!set.has(origin)) {
        set.add(origin);
        uniq.push(origin);
      }
    } catch {
      // Ignore invalid entries.
    }
  }

  return uniq;
}

async function refreshActiveTab() {
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    return;
  }

  await chrome.tabs.reload(tab.id);
}

saveBtn.addEventListener('click', async () => {
  const targetOrigins = parseOrigins(targetOriginsEl.value);
  const onlyCurrentSite = !!onlyCurrentSiteEl.checked;
  const allowedPageOrigins = (onlyCurrentSite && currentTabOrigin) ? [currentTabOrigin] : [];

  if (onlyCurrentSite && !currentTabOrigin) {
    statusEl.textContent = '当前页面无法识别站点 origin，无法开启仅当前网站模式';
    return;
  }

  await chrome.storage.local.set({
    enabled: enabledEl.checked,
    autoProxyFetch: autoProxyFetchEl.checked,
    targetOrigins,
    onlyCurrentSite,
    allowedPageOrigins
  });

  statusEl.textContent = '已保存，正在刷新当前页...';
  await refreshActiveTab();
  setTimeout(() => {
    statusEl.textContent = '保存成功';
  }, 300);
});

load();
