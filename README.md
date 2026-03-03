# TAOLI CORS Helper (Chrome Extension)

## Summary

这个扩展用于解决网页里访问交易所 API 的跨域限制问题。
原理是：页面脚本把请求发给扩展，扩展后台 `service worker` 代发请求并把结果回传。

## 安装

1. 打开 Chrome -> `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择目录：`taolimonitor-helper`（项目根目录）

## 注意事项

- 这是开发调试用途，不建议作为生产环境安全方案。
- 仅代理白名单域名，避免被滥用为通用请求隧道。
- 当前主要针对 JSON / 文本 API，文件上传和二进制流不在主要支持范围内。
