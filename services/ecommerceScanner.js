/**
 * E-Ticaret Arbitraj Tarayıcı
 * Trendyol, Amazon.com.tr, Hepsiburada fiyat farklarını tarar
 * 
 * NOT: Gerçek scraping için puppeteer/playwright ve proxy gerekir.
 * Şu anda gerçekçi demo veri kullanılıyor.
 */

async function scanEcommerce() {
    try {
        const products = generateRealisticProducts();
        const opportunities = findArbitrageOpportunities(products);

        return {
            module: 'ecommerce',
            title: 'E-Commerce Arbitrage Scanner',
            last_updated: new Date().toISOString(),
            data_source: 'Simulated Market Data',
            summary: {
                total_products_scanned: products.length,
                opportunities_found: opportunities.length,
                best_opportunity: opportunities[0] || null,
                avg_price_diff: opportunities.length > 0
                    ? (opportunities.reduce((s, o) => s + o.price_difference_percent, 0) / opportunities.length).toFixed(1)
                    : 0
            },
            opportunities,
            all_products: products
        };
    } catch (error) {
        console.error('E-commerce scan error:', error.message);
        return { module: 'ecommerce', title: 'E-Commerce Arbitrage Scanner', opportunities: [], error: error.message };
    }
}

function generateRealisticProducts() {
    const products = [
        {
            name: 'Apple AirPods Pro 2nd Gen',
            category: 'electronics',
            prices: { trendyol: 7499, amazon: 6299, hepsiburada: 6899 },
            urls: {
                trendyol: 'https://www.trendyol.com/apple/airpods-pro',
                amazon: 'https://www.amazon.com.tr/Apple-AirPods-Pro/dp/B0D1XD1ZV3',
                hepsiburada: 'https://www.hepsiburada.com/apple-airpods-pro'
            }
        },
        {
            name: 'Samsung Galaxy S24 Ultra 256GB',
            category: 'phone',
            prices: { trendyol: 54999, amazon: 49999, hepsiburada: 52499 },
            urls: {
                trendyol: 'https://www.trendyol.com/samsung/galaxy-s24-ultra',
                amazon: 'https://www.amazon.com.tr/Samsung-Galaxy-S24-Ultra/dp/B0CS5MFXRR',
                hepsiburada: 'https://www.hepsiburada.com/samsung-galaxy-s24-ultra'
            }
        },
        {
            name: 'Sony WH-1000XM5 Wireless Headphones',
            category: 'electronics',
            prices: { trendyol: 8999, amazon: 7499, hepsiburada: 8299 },
            urls: {
                trendyol: 'https://www.trendyol.com/sony/wh-1000xm5',
                amazon: 'https://www.amazon.com.tr/Sony-WH-1000XM5/dp/B09XS7JWHH',
                hepsiburada: 'https://www.hepsiburada.com/sony-wh-1000xm5'
            }
        },
        {
            name: 'Apple MacBook Air M3 256GB',
            category: 'laptop',
            prices: { trendyol: 42999, amazon: 38999, hepsiburada: 40999 },
            urls: {
                trendyol: 'https://www.trendyol.com/apple/macbook-air-m3',
                amazon: 'https://www.amazon.com.tr/Apple-MacBook-Air-M3/dp/B0CX23V2ZK',
                hepsiburada: 'https://www.hepsiburada.com/apple-macbook-air-m3'
            }
        },
        {
            name: 'PlayStation 5 Slim Digital Edition',
            category: 'gaming',
            prices: { trendyol: 17999, amazon: 15499, hepsiburada: 16499 },
            urls: {
                trendyol: 'https://www.trendyol.com/playstation/ps5-slim',
                amazon: 'https://www.amazon.com.tr/PlayStation-5-Slim/dp/B0CL5KNB9M',
                hepsiburada: 'https://www.hepsiburada.com/playstation-5-slim'
            }
        },
        {
            name: 'DJI Mini 4 Pro Drone',
            category: 'electronics',
            prices: { trendyol: 28999, amazon: 24999, hepsiburada: 26999 },
            urls: {
                trendyol: 'https://www.trendyol.com/dji/mini-4-pro',
                amazon: 'https://www.amazon.com.tr/DJI-Mini-4-Pro/dp/B0CFLKWT1G',
                hepsiburada: 'https://www.hepsiburada.com/dji-mini-4-pro'
            }
        },
        {
            name: 'Apple iPad Air M2 256GB',
            category: 'tablet',
            prices: { trendyol: 25999, amazon: 22999, hepsiburada: 24499 },
            urls: {
                trendyol: 'https://www.trendyol.com/apple/ipad-air-m2',
                amazon: 'https://www.amazon.com.tr/Apple-iPad-Air-M2/dp/B0D3J7GPRX',
                hepsiburada: 'https://www.hepsiburada.com/apple-ipad-air-m2'
            }
        },
        {
            name: 'Dyson V15 Detect Vacuum',
            category: 'home',
            prices: { trendyol: 22999, amazon: 19999, hepsiburada: 21499 },
            urls: {
                trendyol: 'https://www.trendyol.com/dyson/v15-detect',
                amazon: 'https://www.amazon.com.tr/Dyson-V15-Detect/dp/B0B1JMC1SH',
                hepsiburada: 'https://www.hepsiburada.com/dyson-v15-detect'
            }
        },
        {
            name: 'LG C4 55" OLED TV',
            category: 'electronics',
            prices: { trendyol: 44999, amazon: 39999, hepsiburada: 42999 },
            urls: {
                trendyol: 'https://www.trendyol.com/lg/oled55c4',
                amazon: 'https://www.amazon.com.tr/LG-OLED55C4/dp/B0CVSWKBVF',
                hepsiburada: 'https://www.hepsiburada.com/lg-oled55c4'
            }
        },
        {
            name: 'Xiaomi Robot Vacuum X20 Pro',
            category: 'home',
            prices: { trendyol: 16999, amazon: 13999, hepsiburada: 15499 },
            urls: {
                trendyol: 'https://www.trendyol.com/xiaomi/robot-vacuum-x20-pro',
                amazon: 'https://www.amazon.com.tr/Xiaomi-Robot-Vacuum-X20-Pro/dp/B0D5378KC3',
                hepsiburada: 'https://www.hepsiburada.com/xiaomi-robot-vacuum-x20-pro'
            }
        },
        {
            name: 'Apple Watch Ultra 2',
            category: 'electronics',
            prices: { trendyol: 29999, amazon: 26499, hepsiburada: 28499 },
            urls: {
                trendyol: 'https://www.trendyol.com/apple/watch-ultra-2',
                amazon: 'https://www.amazon.com.tr/Apple-Watch-Ultra-2/dp/B0CHX9N594',
                hepsiburada: 'https://www.hepsiburada.com/apple-watch-ultra-2'
            }
        },
        {
            name: 'Nvidia GeForce RTX 4070 Super',
            category: 'computer',
            prices: { trendyol: 24999, amazon: 21499, hepsiburada: 23499 },
            urls: {
                trendyol: 'https://www.trendyol.com/nvidia/rtx-4070-super',
                amazon: 'https://www.amazon.com.tr/NVIDIA-GeForce-RTX-4070-Super/dp/B0CS3SDR41',
                hepsiburada: 'https://www.hepsiburada.com/nvidia-rtx-4070-super'
            }
        }
    ];

    // Add slight random variation to prices
    return products.map(p => {
        const variation = () => Math.floor((Math.random() - 0.5) * 200);
        return {
            ...p,
            prices: {
                trendyol: p.prices.trendyol + variation(),
                amazon: p.prices.amazon + variation(),
                hepsiburada: p.prices.hepsiburada + variation()
            }
        };
    });
}

function findArbitrageOpportunities(products) {
    const opportunities = products.map(product => {
        const platforms = Object.entries(product.prices);
        const cheapest = platforms.reduce((min, [k, v]) => v < min[1] ? [k, v] : min, platforms[0]);
        const expensive = platforms.reduce((max, [k, v]) => v > max[1] ? [k, v] : max, platforms[0]);
        const diff = ((expensive[1] - cheapest[1]) / cheapest[1] * 100);

        return {
            product_name: product.name,
            category: product.category,
            image: product.image,
            cheapest_platform: formatPlatform(cheapest[0]),
            cheapest_price: cheapest[1],
            expensive_platform: formatPlatform(expensive[0]),
            expensive_price: expensive[1],
            price_difference_tl: expensive[1] - cheapest[1],
            price_difference_percent: parseFloat(diff.toFixed(1)),
            all_prices: {
                'Trendyol': product.prices.trendyol,
                'Amazon': product.prices.amazon,
                'Hepsiburada': product.prices.hepsiburada
            },
            links: product.urls,
            estimated_profit_tl: expensive[1] - cheapest[1]
        };
    });

    return opportunities
        .filter(o => o.price_difference_percent >= 10)
        .sort((a, b) => b.price_difference_percent - a.price_difference_percent);
}

function formatPlatform(key) {
    const map = { trendyol: 'Trendyol', amazon: 'Amazon', hepsiburada: 'Hepsiburada' };
    return map[key] || key;
}

module.exports = { scanEcommerce };
