/**
 * Backpack交易所配置文件
 * 包含Backpack的API端点和配置信息
 */

const BackpackConfig = {
    name: 'Backpack',
    badge: 'backpack-badge',
    badgeColor: 'backpack-badge-color',
    color: '#ff0000',
    apis: {
        // 币种信息API（用于获取所有交易对和市场类型）
        markets: {
            url: 'https://api.backpack.exchange/api/v1/markets',
            method: 'GET',
            description: '币种信息数据'
        },
        // 现货和合约价格数据（深度数据）
        spot: {
            url: 'https://api.backpack.exchange/api/v1/depth',
            method: 'GET',
            description: '现货价格数据',
            params: {
                limit: 5
            }
        },
        futures: {
            url: 'https://api.backpack.exchange/api/v1/depth',
            method: 'GET',
            description: '合约价格数据',
            params: {
                limit: 5
            }
        },
        // 24H成交量数据
        spotVolume: {
            url: 'https://api.backpack.exchange/api/v1/tickers',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        futuresVolume: {
            url: 'https://api.backpack.exchange/api/v1/tickers',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        // 资金费率数据（仅合约）
        funding: {
            url: 'https://api.backpack.exchange/api/v1/fundingRates',
            method: 'GET',
            description: '资金费率数据',
            params: {
                limit: 1
            }
        }
    },
    dataMapping: {
        // 币种信息映射
        markets: {
            dataPath: '',
            symbolField: 'symbol',
            marketTypeField: 'marketType',
            fundingIntervalField: 'fundingInterval',
            baseSymbolField: 'baseSymbol',
            quoteSymbolField: 'quoteSymbol',
            symbolTransform: (symbol) => {
                // Backpack的symbol格式：现货"BONK_USDC"，合约"BTC_USDC_PERP"
                // 转换为标准USDT格式以便与其他交易所对比：现货"BONKUSDT"，合约"BTCUSDT"
                if (symbol.endsWith('_USDC_PERP')) {
                    // 合约：BTC_USDC_PERP -> BTCUSDT
                    return symbol.replace('_USDC_PERP', 'USDT');
                } else if (symbol.includes('_USDC')) {
                    // 现货：BONK_USDC -> BONKUSDT
                    return symbol.replace('_USDC', 'USDT');
                }
                return symbol;
            },
            // 过滤条件：只选择USDC交易对
            filter: (item) => {
                return item.symbol && (item.symbol.includes('_USDC_PERP') || item.symbol.includes('_USDC'));
            }
        },
        // 现货价格数据映射
        spot: {
            dataPath: '',
            symbolField: 'symbol',
            customParser: (item, symbol) => {
                // 自定义解析器处理Backpack的深度数据
                const asks = item.asks || [];
                const bids = item.bids || [];
                
                if (asks.length === 0 || bids.length === 0) {
                    return null;
                }
                
                const askPrice = parseFloat(asks[0][0]);
                const bidPrice = parseFloat(bids[0][0]);
                
                return {
                    symbol: symbol,
                    askPrice: askPrice,
                    bidPrice: bidPrice
                };
            }
        },
        // 合约价格数据映射
        futures: {
            dataPath: '',
            symbolField: 'symbol',
            customParser: (item, symbol) => {
                // 自定义解析器处理Backpack的深度数据
                const asks = item.asks || [];
                const bids = item.bids || [];
                
                if (asks.length === 0 || bids.length === 0) {
                    return null;
                }
                
                const askPrice = parseFloat(asks[0][0]);
                const bidPrice = parseFloat(bids[0][0]);
                
                return {
                    symbol: symbol,
                    askPrice: askPrice,
                    bidPrice: bidPrice
                };
            }
        },
        // 现货成交量数据映射
        spotVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume',
            symbolTransform: (symbol) => {
                // 转换symbol格式，将USDC当作USDT处理
                if (symbol.includes('_USDC') && !symbol.includes('_PERP')) {
                    return symbol.replace('_USDC', 'USDT');
                }
                return symbol;
            },
            // 过滤条件：只选择现货USDC交易对
            filter: (item) => {
                return item.symbol && item.symbol.includes('_USDC') && !item.symbol.includes('_PERP');
            }
        },
        // 合约成交量数据映射
        futuresVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume',
            symbolTransform: (symbol) => {
                // 转换symbol格式，将USDC当作USDT处理
                if (symbol.endsWith('_USDC_PERP')) {
                    return symbol.replace('_USDC_PERP', 'USDT');
                }
                return symbol;
            },
            // 过滤条件：只选择合约USDC交易对
            filter: (item) => {
                return item.symbol && item.symbol.endsWith('_USDC_PERP');
            }
        },
        // 资金费率数据映射
        funding: {
            dataPath: '',
            symbolField: 'symbol',
            fundingRateField: 'fundingRate',
            symbolTransform: (symbol) => {
                // 转换symbol格式，将USDC当作USDT处理
                if (symbol.endsWith('_USDC_PERP')) {
                    return symbol.replace('_USDC_PERP', 'USDT');
                }
                return symbol;
            }
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackpackConfig;
} else if (typeof window !== 'undefined') {
    window.BackpackConfig = BackpackConfig;
}
