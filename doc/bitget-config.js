/**
 * Bitget交易所配置文件
 * 包含Bitget的API端点和配置信息
 */

const BitgetConfig = {
    name: 'Bitget',
    badge: 'bgt-badge',
    badgeColor: 'bgt-badge-color',
    color: '#ffb3d9',
    apis: {
        spot: {
            url: 'https://api.bitget.com/api/v2/spot/market/tickers',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=usdt-futures',
            method: 'GET',
            description: '资金费率数据'
        },
        spotVolume: {
            url: 'https://api.bitget.com/api/v2/spot/market/tickers',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=usdt-futures',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            dataPath: 'data',
            symbolField: 'symbol',
            askPriceField: 'askPr',
            bidPriceField: 'bidPr'
        },
        futures: {
            dataPath: 'data',
            symbolField: 'symbol',
            askPriceField: 'askPr',
            bidPriceField: 'bidPr',
            symbolTransform: (symbol) => symbol.replace('_UMCBL', '')
        },
        funding: {
            dataPath: 'data',
            symbolField: 'symbol',
            fundingRateField: 'fundingRate',
            intervalField: 'fundingRateInterval',
            symbolTransform: (symbol) => symbol.replace('_UMCBL', '')
        },
        spotVolume: {
            dataPath: 'data',
            symbolField: 'symbol',
            volumeField: 'quoteVolume'
        },
        futuresVolume: {
            dataPath: 'data',
            symbolField: 'symbol',
            volumeField: 'quoteVolume',
            symbolTransform: (symbol) => symbol.replace('_UMCBL', '')
        },
        fundingCap: {
            dataPath: 'data',
            symbolField: 'symbol',
            fundingCapField: 'maxFundingRate',
            intervalField: 'fundingRateInterval',
            symbolTransform: (symbol) => symbol.replace('_UMCBL', '')
        }
    },
    defaultFundingInterval: 8
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BitgetConfig;
} else if (typeof window !== 'undefined') {
    window.BitgetConfig = BitgetConfig;
}
