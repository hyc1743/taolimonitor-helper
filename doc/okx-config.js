/**
 * OKX交易所配置文件
 * 包含OKX的API端点和配置信息
 */

const OKXConfig = {
    name: 'OKX',
    badge: 'okx-badge',
    badgeColor: 'okx-badge-color',
    color: '#ff6666',
    apis: {
        spot: {
            url: 'https://www.okx.com/api/v5/market/tickers?instType=SPOT',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://www.okx.com/api/v5/market/tickers?instType=SWAP',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://www.okx.com/api/v5/public/funding-rate?instType=SWAP&instId=ANY',
            method: 'GET',
            description: '资金费率数据'
        },
        fundingInterval: {
            url: 'https://www.okx.com/api/v5/public/funding-rate?instType=SWAP&instId=ANY',
            method: 'GET',
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://www.okx.com/api/v5/market/tickers?instType=SPOT',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://www.okx.com/api/v5/market/tickers?instType=SWAP',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://www.okx.com/api/v5/public/funding-rate?instType=SWAP&instId=ANY',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            dataPath: 'data',
            symbolField: 'instId',
            askPriceField: 'askPx',
            bidPriceField: 'bidPx',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        futures: {
            dataPath: 'data',
            symbolField: 'instId',
            askPriceField: 'askPx',
            bidPriceField: 'bidPx',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        funding: {
            dataPath: 'data',
            symbolField: 'instId',
            fundingRateField: 'fundingRate',
            fundingTimeField: 'fundingTime',
            nextFundingTimeField: 'nextFundingTime',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        fundingInterval: {
            dataPath: 'data',
            symbolField: 'instId',
            fundingTimeField: 'fundingTime',
            nextFundingTimeField: 'nextFundingTime',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        spotVolume: {
            dataPath: 'data',
            symbolField: 'instId',
            volumeField: 'vol24h',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        futuresVolume: {
            dataPath: 'data',
            symbolField: 'instId',
            volumeField: 'vol24h',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        },
        fundingCap: {
            dataPath: 'data',
            symbolField: 'instId',
            fundingCapField: 'maxFundingRate',
            intervalField: 'fundingTime',
            symbolTransform: (symbol) => {
                if (symbol.endsWith('-USDT-SWAP')) {
                    return symbol.replace('-USDT-SWAP', 'USDT');
                } else if (symbol.endsWith('-USDT')) {
                    return symbol.replace('-USDT', 'USDT');
                }
                return symbol;
            }
        }
    },
    defaultFundingInterval: 8
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OKXConfig;
} else if (typeof window !== 'undefined') {
    window.OKXConfig = OKXConfig;
}
