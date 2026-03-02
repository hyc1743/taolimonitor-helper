/**
 * Bybit交易所配置文件
 * 包含Bybit的API端点和配置信息
 */

const BybitConfig = {
    name: 'Bybit',
    badge: 'byb-badge',
    badgeColor: 'byb-badge-color',
    color: '#b3ffb3',
    apis: {
        spot: {
            url: 'https://api.bybit.com/v5/market/tickers?category=spot',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://api.bybit.com/v5/market/tickers?category=linear',
            method: 'GET',
            description: '合约价格数据（包含资金费率）'
        },
        fundingInterval: {
            url: 'https://api.bybit.com/v5/market/tickers?category=linear',
            method: 'GET',
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://api.bybit.com/v5/market/tickers?category=spot',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.bybit.com/v5/market/tickers?category=linear',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://api.bybit.com/v5/market/tickers?category=linear',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            askPriceField: 'ask1Price',
            bidPriceField: 'bid1Price'
        },
        futures: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            askPriceField: 'ask1Price',
            bidPriceField: 'bid1Price',
            fundingRateField: 'fundingRate',
            nextFundingTimeField: 'nextFundingTime'
        },
        fundingInterval: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            intervalField: 'fundingIntervalHour'
        },
        spotVolume: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            volumeField: 'turnover24h'
        },
        futuresVolume: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            volumeField: 'turnover24h'
        },
        fundingCap: {
            dataPath: 'result.list',
            symbolField: 'symbol',
            fundingCapField: 'fundingCap',
            intervalField: 'fundingIntervalHour'
        }
    }
    // Bybit从API获取实际周期，不使用默认值
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BybitConfig;
} else if (typeof window !== 'undefined') {
    window.BybitConfig = BybitConfig;
}
