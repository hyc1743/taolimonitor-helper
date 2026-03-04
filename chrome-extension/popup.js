import { DEFAULT_SETTINGS } from './targets.js';

const enabledEl = document.querySelector('#enabled');
const statusEl = document.querySelector('#status');
const saveBtn = document.querySelector('#save');

async function load() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  enabledEl.checked = !!settings.enabled;
}

async function refreshActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const [tab] = tabs;
  if (!tab || !tab.id) {
    return;
  }

  await chrome.tabs.reload(tab.id);
}

saveBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({
    enabled: enabledEl.checked,
    autoProxyFetch: true,
    targetOrigins: DEFAULT_SETTINGS.targetOrigins,
    allowedPageOrigins: DEFAULT_SETTINGS.allowedPageOrigins
  });

  statusEl.textContent = '已保存，正在刷新当前页...';
  await refreshActiveTab();
  setTimeout(() => {
    statusEl.textContent = '保存成功';
  }, 300);
});

load();
