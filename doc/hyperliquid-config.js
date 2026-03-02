/**
 * Hyperliquid交易所配置文件
 * 包含Hyperliquid的API端点和配置信息
 */

const HyperliquidConfig = {
    name: 'Hyperliquid',
    badge: 'hypl-badge',
    badgeColor: 'hypl-badge-color',
    color: '#00d4aa',
    apis: {
        spot: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'spotMetaAndAssetCtxs' },
            description: '现货价格数据'
        },
        futures: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'allMids' },
            description: '合约价格数据'
        },
        funding: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'metaAndAssetCtxs' },
            description: '资金费率数据'
        },
        fundingInterval: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'meta' },
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'spotMetaAndAssetCtxs' },
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'metaAndAssetCtxs' },
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://api.hyperliquid.xyz/info',
            method: 'POST',
            body: { type: 'meta' },
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            // spotMetaAndAssetCtxs返回数组: [meta, assetCtxs]
            // meta.universe[i].name 是交易对名称 (如 "PURR/USDC")
            // assetCtxs[i].midPx 是中间价
            dataPath: '',
            isSpotMetaAndAssetCtxs: true,
            symbolTransform: (symbol) => {
                if (!symbol) return '';
                const [base, quote] = symbol.split('/');
                if (!base || quote !== 'USDC') return '';
                return `${base}USDT`;
            }
        },
        futures: {
            // allMids返回对象格式: { "BTC": "89054.5", "ETH": "2975.65" }
            dataPath: '',
            isObjectMap: true,
            priceField: 'value',
            symbolTransform: (symbol) => {
                return symbol + 'USDT';
            }
        },
        funding: {
            // metaAndAssetCtxs返回数组: [meta, assetCtxs]
            // meta.universe[i].name 是币种名
            // assetCtxs[i].funding 是资金费率
            dataPath: '',
            isMetaAndAssetCtxs: true,
            fundingRateField: 'funding',
            symbolTransform: (symbol) => {
                return symbol + 'USDT';
            }
        },
        fundingInterval: {
            dataPath: 'universe',
            symbolField: 'name',
            symbolTransform: (symbol) => {
                return symbol + 'USDT';
            }
        },
        spotVolume: {
            // spotMetaAndAssetCtxs返回数组: [meta, assetCtxs]
            // assetCtxs[i].dayNtlVlm 是24小时成交量
            dataPath: '',
            isSpotMetaAndAssetCtxs: true,
            volumeField: 'dayNtlVlm',
            symbolTransform: (symbol) => {
                if (!symbol) return '';
                const [base, quote] = symbol.split('/');
                if (!base || quote !== 'USDC') return '';
                return `${base}USDT`;
            }
        },
        futuresVolume: {
            // metaAndAssetCtxs返回数组: [meta, assetCtxs]
            // assetCtxs[i].dayNtlVlm 是24小时成交量
            dataPath: '',
            isMetaAndAssetCtxs: true,
            volumeField: 'dayNtlVlm',
            symbolTransform: (symbol) => {
                return symbol + 'USDT';
            }
        },
        fundingCap: {
            dataPath: 'universe',
            symbolField: 'name',
            fundingCapField: 'maxFundingRate',
            symbolTransform: (symbol) => {
                return symbol + 'USDT';
            }
        }
    },
    defaultFundingInterval: 1 // Hyperliquid 每小时结算一次资金费率
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HyperliquidConfig;
} else if (typeof window !== 'undefined') {
    window.HyperliquidConfig = HyperliquidConfig;
}
