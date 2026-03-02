/**
 * ASTER交易所配置文件
 * 包含ASTER的API端点和配置信息
 */

const ASTERConfig = {
    name: 'ASTER',
    badge: 'ast-badge',
    badgeColor: 'ast-badge-color',
    color: '#ffb366',
    apis: {
        spot: {
            url: 'https://sapi.asterdex.com/api/v1/ticker/bookTicker',
            method: 'GET',
            description: '现货价格数据'
        },
        futures: {
            url: 'https://fapi.asterdex.com/fapi/v1/ticker/bookTicker',
            method: 'GET',
            description: '合约价格数据'
        },
        funding: {
            url: 'https://fapi.asterdex.com/fapi/v1/premiumIndex',
            method: 'GET',
            description: '资金费率数据'
        },
        fundingInterval: {
            url: 'https://fapi.asterdex.com/fapi/v1/fundingInfo',
            method: 'GET',
            description: '资金费率周期数据'
        },
        futuresVolume: {
            url: 'https://fapi.asterdex.com/fapi/v1/ticker/24hr',
            method: 'GET',
            description: '合约24H成交量数据'
        },
        spotVolume: {
            url: 'https://sapi.asterdex.com/api/v1/ticker/24hr',
            method: 'GET',
            description: '现货24H成交量数据'
        },
        fundingCap: {
            url: 'https://fapi.asterdex.com/fapi/v1/fundingInfo',
            method: 'GET',
            description: '资金费率上限数据'
        }
    },
    dataMapping: {
        spot: {
            dataPath: '',
            symbolField: 'symbol',
            askPriceField: 'askPrice',
            bidPriceField: 'bidPrice',
            filter: (item) => item.symbol && item.symbol.endsWith('USDT')
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
            intervalField: 'fundingIntervalHours',
            symbolTransform: (symbol) => {
                // 如果是USD结尾，转换为USDT格式以匹配资金费率数据
                if (symbol.endsWith('USD') && !symbol.endsWith('USDT')) {
                    return symbol + 'T'; // USD -> USDT
                }
                return symbol;
            }
        },
        futuresVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume'
        },
        spotVolume: {
            dataPath: '',
            symbolField: 'symbol',
            volumeField: 'quoteVolume',
            filter: (item) => item.symbol && item.symbol.endsWith('USDT')
        },
        fundingCap: {
            dataPath: '',
            symbolField: 'symbol',
            fundingCapField: 'fundingFeeCap',
            intervalField: 'fundingIntervalHours',
            symbolTransform: (symbol) => {
                // 如果是USD结尾，转换为USDT格式以匹配资金费率数据
                if (symbol.endsWith('USD') && !symbol.endsWith('USDT')) {
                    return symbol + 'T'; // USD -> USDT
                }
                return symbol;
            }
        }
    }
    // ASTER从API获取实际周期，不使用默认值
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTERConfig;
} else if (typeof window !== 'undefined') {
    window.ASTERConfig = ASTERConfig;
}
