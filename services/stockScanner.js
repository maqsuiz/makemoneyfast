/**
 * Hisse Senedi Tarayıcı
 * BIST ve global piyasa sinyalleri
 */

async function scanStocks() {
    try {
        const stocks = generateStockData();
        const signals = findStockSignals(stocks);

        return {
            module: 'stocks',
            title: '📈 Hisse Senedi Tarayıcı',
            icon: '📈',
            last_updated: new Date().toISOString(),
            data_source: 'Simüle Edilen Piyasa Verisi',
            market_summary: {
                bist100_change: (Math.random() * 4 - 2).toFixed(2),
                sp500_change: (Math.random() * 3 - 1.5).toFixed(2),
                nasdaq_change: (Math.random() * 4 - 2).toFixed(2),
                usd_try: (36.5 + Math.random() * 0.5).toFixed(4),
                eur_try: (38.2 + Math.random() * 0.5).toFixed(4)
            },
            signals,
            all_stocks: stocks
        };
    } catch (error) {
        console.error('Hisse tarama hatası:', error.message);
        return { module: 'stocks', title: '📈 Hisse Senedi Tarayıcı', icon: '📈', signals: [], error: error.message };
    }
}

function generateStockData() {
    const bist_stocks = [
        { ticker: 'THYAO', name: 'Türk Hava Yolları', sector: 'Havacılık', price: 312.5, market: 'BIST' },
        { ticker: 'ASELS', name: 'Aselsan', sector: 'Savunma', price: 57.8, market: 'BIST' },
        { ticker: 'SISE', name: 'Şişe Cam', sector: 'Cam', price: 48.2, market: 'BIST' },
        { ticker: 'KCHOL', name: 'Koç Holding', sector: 'Holding', price: 198.4, market: 'BIST' },
        { ticker: 'BIMAS', name: 'BİM Mağazalar', sector: 'Perakende', price: 680.0, market: 'BIST' },
        { ticker: 'TUPRS', name: 'Tüpraş', sector: 'Enerji', price: 175.6, market: 'BIST' },
        { ticker: 'EREGL', name: 'Ereğli Demir Çelik', sector: 'Metal', price: 52.3, market: 'BIST' },
        { ticker: 'GARAN', name: 'Garanti Bankası', sector: 'Bankacılık', price: 128.7, market: 'BIST' },
        { ticker: 'AKBNK', name: 'Akbank', sector: 'Bankacılık', price: 65.4, market: 'BIST' },
        { ticker: 'SAHOL', name: 'Sabancı Holding', sector: 'Holding', price: 92.1, market: 'BIST' }
    ];

    const global_stocks = [
        { ticker: 'NVDA', name: 'NVIDIA', sector: 'Teknoloji', price: 875.3, market: 'NASDAQ' },
        { ticker: 'AAPL', name: 'Apple', sector: 'Teknoloji', price: 178.5, market: 'NASDAQ' },
        { ticker: 'MSFT', name: 'Microsoft', sector: 'Teknoloji', price: 415.8, market: 'NASDAQ' },
        { ticker: 'GOOGL', name: 'Alphabet', sector: 'Teknoloji', price: 152.3, market: 'NASDAQ' },
        { ticker: 'TSLA', name: 'Tesla', sector: 'Otomotiv', price: 198.7, market: 'NASDAQ' },
        { ticker: 'META', name: 'Meta Platforms', sector: 'Teknoloji', price: 502.4, market: 'NASDAQ' },
        { ticker: 'AMZN', name: 'Amazon', sector: 'E-Ticaret', price: 178.2, market: 'NASDAQ' },
        { ticker: 'AMD', name: 'AMD', sector: 'Yarı İletken', price: 168.9, market: 'NASDAQ' }
    ];

    const allStocks = [...bist_stocks, ...global_stocks];

    return allStocks.map(stock => {
        const change = (Math.random() * 10 - 5);
        const rsi = Math.floor(Math.random() * 70 + 15);
        const volume = Math.floor(Math.random() * 50000000 + 1000000);

        return {
            ...stock,
            price: parseFloat((stock.price * (1 + change / 100)).toFixed(2)),
            change_percent: parseFloat(change.toFixed(2)),
            rsi,
            volume,
            volume_change: parseFloat((Math.random() * 200 - 50).toFixed(1)),
            chart_link: stock.market === 'BIST'
                ? `https://www.tradingview.com/chart/?symbol=BIST:${stock.ticker}`
                : `https://www.tradingview.com/chart/?symbol=NASDAQ:${stock.ticker}`
        };
    });
}

function findStockSignals(stocks) {
    const signals = [];

    stocks.forEach(stock => {
        if (stock.rsi < 30) {
            signals.push({
                ...stock,
                signal_type: 'oversold',
                signal_label: '📉 Aşırı Satım (RSI < 30)',
                description: `${stock.name} RSI ${stock.rsi} ile aşırı satım bölgesinde. Dip fırsatı olabilir.`,
                suggestion: 'Kademeli alım düşünülebilir. Stop-loss belirleyin.',
                urgency: 'bu hafta',
                confidence: Math.floor(Math.random() * 20 + 60)
            });
        }

        if (stock.rsi > 70) {
            signals.push({
                ...stock,
                signal_type: 'overbought',
                signal_label: '📈 Aşırı Alım (RSI > 70)',
                description: `${stock.name} RSI ${stock.rsi} ile aşırı alım bölgesinde. Kar realizasyonu düşünülebilir.`,
                suggestion: 'Pozisyon varsa kademeli satış düşünülebilir.',
                urgency: 'bugün',
                confidence: Math.floor(Math.random() * 20 + 55)
            });
        }

        if (stock.change_percent > 5 && stock.volume_change > 100) {
            signals.push({
                ...stock,
                signal_type: 'breakout',
                signal_label: '🚀 Kırılım (Breakout)',
                description: `${stock.name} %${stock.change_percent.toFixed(1)} artışla yüksek hacimde kırılım yapıyor.`,
                suggestion: 'Momentum trade için uygun olabilir. Hedef fiyat belirleyin.',
                urgency: 'hemen',
                confidence: Math.floor(Math.random() * 20 + 65)
            });
        }

        if (stock.volume_change > 150) {
            signals.push({
                ...stock,
                signal_type: 'volume_spike',
                signal_label: '📊 Hacim Patlaması',
                description: `${stock.name} hacmi %${stock.volume_change.toFixed(0)} arttı. Büyük bir hareket gelebilir.`,
                suggestion: 'Haberleri takip edin. Pozisyon almadan önce analiz yapın.',
                urgency: 'bugün',
                confidence: Math.floor(Math.random() * 20 + 50)
            });
        }
    });

    return signals.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { scanStocks };
