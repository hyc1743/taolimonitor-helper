export const TARGET_ORIGINS = [
  "https://api-aws.huobi.pro",
  "https://api.backpack.exchange",
  "https://api.binance.com",
  "https://api.bitget.com",
  "https://api.bybit.com",
  "https://api.gateio.ws",
  "https://api.hbdm.vn",
  "https://api.hyperliquid.xyz",
  "https://fapi.asterdex.com",
  "https://fapi.binance.com",
  "https://sapi.asterdex.com",
  "https://www.okx.com"
];

export const ALLOWED_PAGE_ORIGINS = [
  "https://taolimonitor.life",
  "https://dev.taolimonitor.life"
];

export const DEFAULT_SETTINGS = {
  enabled: true,
  autoProxyFetch: true,
  targetOrigins: TARGET_ORIGINS,
  allowedPageOrigins: ALLOWED_PAGE_ORIGINS
};
