# TAOLI CORS Helper (Chrome Extension)

这个扩展用于解决网页里访问交易所 API 的跨域限制问题。
原理是：页面脚本把请求发给扩展，扩展后台 `service worker` 代发请求并把结果回传。

## 功能

- 自动代理 `fetch`：对配置白名单域名自动走扩展代理
- 手动代理 API：页面可调用 `window.taoliCors.request(...)`
- 可视化配置：在扩展 popup 中开关代理、编辑白名单域名
- 站点范围控制：可开启“仅对当前网站生效”
- 默认白名单：已根据 `doc/*.js` 里的 API 地址初始化

## 安装

1. 打开 Chrome -> `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择目录：`chrome-cors-helper`

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
- `自动代理 fetch 请求`：是否重写页面 `window.fetch`
- `仅对当前网站生效`：开启后只允许当前 tab 的网站使用代理能力
- `允许代理的 API 域名`：每行一个 `origin`

保存后会自动刷新当前页。

## 注意事项

- 这是开发调试用途，不建议作为生产环境安全方案。
- 仅代理白名单域名，避免被滥用为通用请求隧道。
- 当前主要针对 JSON / 文本 API，文件上传和二进制流不在主要支持范围内。
