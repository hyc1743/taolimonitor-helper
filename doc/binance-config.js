/**
 * Binance交易所配置文件
 * 包含Binance的API端点和配置信息
 */

const BinanceConfig = {
    name: 'Binance',
    badge: 'bnc-badge',
    badgeColor: 'bnc-badge-color',
    color: '#b3d9ff',
    apis: {
        spot: {
            url: 'https://api.binance.com/api/v3/ticker/bookTicker',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://fapi.binance.com/fapi/v1/ticker/bookTicker',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://fapi.binance.com/fapi/v1/premiumIndex',
            method: 'GET',
            description: '资金费率数据'
        },
        fundingInterval: {
            url: 'https://fapi.binance.com/fapi/v1/fundingInfo',
            method: 'GET',
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://api.binance.com/api/v3/ticker/24hr',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://fapi.binance.com/fapi/v1/fundingInfo',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            symbolField: 'symbol',
            askPriceField: 'askPrice',
            bidPriceField: 'bidPrice'
        },
        futures: {
            symbolField: 'symbol',
            askPriceField: 'askPrice',
            bidPriceField: 'bidPrice'
        },
        funding: {
            symbolField: 'symbol',
            fundingRateField: 'lastFundingRate',
            intervalField: 'fundingIntervalHours'
        },
        fundingInterval: {
            dataPath: '',
            symbolField: 'symbol',
            intervalField: 'fundingIntervalHours'
        },
        spotVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume'
        },
        futuresVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume'
        },
        fundingCap: {
            dataPath: '',
            symbolField: 'symbol',
            fundingCapField: 'adjustedFundingRateCap',
            intervalField: 'fundingIntervalHours'
        }
    }
    // Binance从API获取实际周期，不使用默认值
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BinanceConfig;
} else if (typeof window !== 'undefined') {
    window.BinanceConfig = BinanceConfig;
}
