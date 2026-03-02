# TAOLI CORS Helper (Chrome Extension)

这个扩展用于解决网页里访问交易所 API 的跨域限制问题。
原理是：页面脚本把请求发给扩展，扩展后台 `service worker` 代发请求并把结果回传。

## 功能

- 自动代理 `fetch`：默认开启，对配置白名单域名自动走扩展代理
- 手动代理 API：页面可调用 `window.taoliCors.request(...)`
- 站点范围限制：仅对 `https://taolimonitor.life` 和 `https://dev.taolimonitor.life` 生效
- API 白名单配置：在 `targets.js` 里维护

## 安装

1. 打开 Chrome -> `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择目录：`taolimonitor-helper`（项目根目录）

## 使用

### 方式1：自动代理 fetch（默认开启）

页面里正常写：

```js
const r = await fetch('https://api.binance.com/api/v3/ticker/24hr');
const data = await r.json();
console.log(data);
```

如果 URL origin 在白名单中，会自动通过扩展代理发送。

### 方式2：手动调用扩展代理

```js
const result = await window.taoliCors.request('https://api.bybit.com/v5/market/tickers?category=spot');
const json = JSON.parse(result.body);
console.log(json);
```

## 配置项

点击扩展图标后可设置：

- `启用扩展代理`：总开关

保存后会自动刷新当前页。

程序配置在 `targets.js`：

- `ALLOWED_PAGE_ORIGINS`：允许启用代理的网站来源
- `TARGET_ORIGINS`：允许代理请求的 API 来源

## 注意事项

- 这是开发调试用途，不建议作为生产环境安全方案。
- 仅代理白名单域名，避免被滥用为通用请求隧道。
- 当前主要针对 JSON / 文本 API，文件上传和二进制流不在主要支持范围内。
