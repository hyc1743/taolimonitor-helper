/**
 * Gate交易所配置文件
 * 包含Gate的API端点和配置信息
 */

const GateConfig = {
    name: 'Gate',
    badge: 'gt-badge',
    badgeColor: 'gt-badge-color',
    color: '#b3b3ff',
    apis: {
        spot: {
            url: 'https://api.gateio.ws/api/v4/spot/tickers',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://api.gateio.ws/api/v4/futures/usdt/tickers',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://api.gateio.ws/api/v4/futures/usdt/contracts',
            method: 'GET',
            description: '资金费率数据（从contracts API获取）'
        },
        fundingInterval: {
            url: 'https://api.gateio.ws/api/v4/futures/usdt/contracts',
            method: 'GET',
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://api.gateio.ws/api/v4/spot/tickers',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.gateio.ws/api/v4/futures/usdt/tickers',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://api.gateio.ws/api/v4/futures/usdt/contracts',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            symbolField: 'currency_pair',
            askPriceField: 'lowest_ask',
            bidPriceField: 'highest_bid',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        futures: {
            symbolField: 'contract',
            askPriceField: 'lowest_ask',
            bidPriceField: 'highest_bid',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        funding: {
            dataPath: '',
            symbolField: 'name',
            fundingRateField: 'funding_rate',
            intervalField: 'funding_interval',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        fundingInterval: {
            dataPath: '',
            symbolField: 'name',
            intervalField: 'funding_interval',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        spotVolume: {
            symbolField: 'currency_pair',
            volumeField: 'quote_volume',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        futuresVolume: {
            symbolField: 'contract',
            volumeField: 'volume_24h_quote',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        },
        fundingCap: {
            dataPath: '',
            symbolField: 'name',
            fundingCapField: 'funding_rate_limit',
            intervalField: 'funding_interval',
            symbolTransform: (symbol) => symbol.replace('_USDT', 'USDT')
        }
    },
    defaultFundingInterval: 8
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GateConfig;
} else if (typeof window !== 'undefined') {
    window.GateConfig = GateConfig;
}
