/**
 * HTX交易所配置文件
 * 包含HTX的API端点和配置信息
 */

const HTXConfig = {
    name: 'HTX',
    badge: 'htx-badge',
    badgeColor: 'htx-badge-color',
    color: '#ff9900',
    apis: {
        spot: {
            url: 'https://api-aws.huobi.pro/market/tickers',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://api.hbdm.vn/v2/linear-swap-ex/market/detail/batch_merged?business_type=swap',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://api.hbdm.vn/linear-swap-api/v1/swap_batch_funding_rate',
            method: 'GET',
            description: '资金费率数据'
        },
        fundingInterval: {
            url: 'https://api.hbdm.vn/linear-swap-api/v1/swap_query_elements',
            method: 'GET',
            description: '资金费率周期数据'
        },
        spotVolume: {
            url: 'https://api-aws.huobi.pro/market/tickers',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.hbdm.vn/v2/linear-swap-ex/market/detail/batch_merged?business_type=swap',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        fundingCap: {
            url: 'https://api.hbdm.vn/linear-swap-api/v1/swap_query_elements',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            dataPath: 'data',
            symbolField: 'symbol',
            askPriceField: 'ask',
            bidPriceField: 'bid',
            symbolTransform: (symbol) => {
                // HTX现货symbol是小写，如"dymusdt"，需要转换为"DYMusdt"格式
                if (symbol && symbol.toLowerCase().endsWith('usdt')) {
                    return symbol.toUpperCase();
                }
                return symbol;
            }
        },
        futures: {
            dataPath: 'ticks',
            symbolField: 'contract_code',
            askPriceField: 'ask',
            bidPriceField: 'bid',
            symbolTransform: (symbol) => {
                // contract_code是"BTC-USDT"格式，需要转换为"BTCUSDT"
                if (symbol && symbol.includes('-')) {
                    return symbol.replace('-', '');
                }
                return symbol;
            },
            // 过滤条件：只选择trade_partition为USDT的
            filter: (item) => {
                return item.trade_partition === 'USDT';
            }
            // 注意：ask和bid是数组格式，已在api-handler.js中处理
        },
        funding: {
            dataPath: 'data',
            symbolField: 'symbol',
            fundingRateField: 'funding_rate',
            symbolTransform: (symbol) => {
                // HTX资金费率API返回的symbol是币种名（如"SATS"），需要转换为"币种USDT"格式
                if (symbol && !symbol.endsWith('USDT')) {
                    return symbol + 'USDT';
                }
                return symbol;
            },
            // 过滤条件：只选择trade_partition为USDT的
            filter: (item) => {
                return item.trade_partition === 'USDT';
            }
        },
        fundingInterval: {
            dataPath: 'data',
            symbolField: 'contract_code',
            intervalField: 'settle_period',
            symbolTransform: (symbol) => {
                // contract_code是"BTC-USDT"格式，需要转换为"BTCUSDT"
                if (symbol && symbol.includes('-')) {
                    return symbol.replace('-', '');
                }
                return symbol;
            }
        },
        spotVolume: {
            dataPath: 'data',
            symbolField: 'symbol',
            volumeField: 'vol',
            symbolTransform: (symbol) => {
                // HTX现货symbol是小写，如"dymusdt"，需要转换为"DYMusdt"格式
                if (symbol && symbol.toLowerCase().endsWith('usdt')) {
                    return symbol.toUpperCase();
                }
                return symbol;
            }
        },
        futuresVolume: {
            dataPath: 'ticks',
            symbolField: 'contract_code',
            volumeField: 'vol',
            symbolTransform: (symbol) => {
                // contract_code是"BTC-USDT"格式，需要转换为"BTCUSDT"
                if (symbol && symbol.includes('-')) {
                    return symbol.replace('-', '');
                }
                return symbol;
            },
            // 过滤条件：只选择trade_partition为USDT的
            filter: (item) => {
                return item.trade_partition === 'USDT';
            }
        },
        fundingCap: {
            dataPath: 'data',
            symbolField: 'contract_code',
            fundingCapField: 'funding_rate_cap',
            intervalField: 'settle_period',
            symbolTransform: (symbol) => {
                // contract_code是"BTC-USDT"格式，需要转换为"BTCUSDT"
                if (symbol && symbol.includes('-')) {
                    return symbol.replace('-', '');
                }
                return symbol;
            }
        }
    },
    defaultFundingInterval: 8
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTXConfig;
} else if (typeof window !== 'undefined') {
    window.HTXConfig = HTXConfig;
}

