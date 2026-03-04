# TAOLI CORS Helper

## Summary

本项目用于解决网页访问交易所 API 的跨域限制问题，包含两套实现：

- Chrome 浏览器扩展（`chrome-extension/`）
- iOS Safari Userscripts 脚本（`ios-userscripts/`）

## 目录结构

- `chrome-extension/`：Chrome 扩展源码（Manifest V3）
- `ios-userscripts/taoli-cors-helper.user.js`：iOS 正式使用脚本

## Chrome 安装

1. 打开 Chrome -> `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择目录：`taolimonitor-helper/chrome-extension`

## iOS Userscripts 使用

1. 在 iPhone/iPad 安装并启用 Userscripts 扩展（`quoid/userscripts`）。
2. 打开 iOS 设置 -> Safari -> 扩展 -> Userscripts：
   - 开启扩展
   - 网站权限设置为允许目标站点访问（建议 All Websites 或至少包含 taolimonitor 站点）
3. 将脚本文件 `ios-userscripts/taoli-cors-helper.user.js` 导入 Userscripts。
4. 打开 `https://taolimonitor.life` 或 `https://dev.taolimonitor.life`，刷新页面生效。
## 注意事项

- 本项目用于开发调试，不建议作为生产环境安全方案。
- 仅代理白名单域名，避免被滥用为通用请求隧道。
- 当前主要针对 JSON / 文本 API，文件上传和二进制流不在主要支持范围内。
