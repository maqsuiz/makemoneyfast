/**
 * AI Araçları Tarayıcı
 * Yeni çıkan AI araçları ve para kazanma fırsatları
 */

async function scanAITools() {
    try {
        const tools = getAITools();

        return {
            module: 'ai_tools',
            title: '🤖 Yeni AI Araçları',
            icon: '🤖',
            last_updated: new Date().toISOString(),
            data_source: 'Küratörlü AI Araç Veritabanı',
            summary: {
                total_new_tools: tools.length,
                free_tools: tools.filter(t => t.pricing === 'Ücretsiz' || t.pricing === 'Freemium').length,
                money_making_tools: tools.filter(t => t.money_making_potential === 'Yüksek').length
            },
            tools
        };
    } catch (error) {
        console.error('AI araç tarama hatası:', error.message);
        return { module: 'ai_tools', title: '🤖 Yeni AI Araçları', icon: '🤖', tools: [], error: error.message };
    }
}

function getAITools() {
    return [
        {
            name: 'Devin AI',
            category: 'Kod Asistanı',
            description: 'Dünyanın ilk tamamen otonom AI yazılım mühendisi. Komple projeler geliştirebilir, debug edebilir ve deploy edebilir.',
            pricing: 'Ücretli ($500/ay)',
            upvotes: 2840,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Freelance yazılım projelerini otomatize et',
                'Müşteri projelerini 10x hızlı teslim et',
                'Boilerplate kodları otomatik oluştur'
            ],
            link: 'https://devin.ai',
            launch_date: '2024-03',
            trend: 'rising'
        },
        {
            name: 'Sora by OpenAI',
            category: 'Video Üretimi',
            description: 'Metin açıklamasından fotorealistik videolar üretir. 1 dakikaya kadar tutarlı, yüksek kaliteli videolar oluşturur.',
            pricing: 'ChatGPT Plus ($20/ay)',
            upvotes: 5200,
            money_making_potential: 'Yüksek',
            use_cases: [
                'YouTube Shorts / TikTok içerik üretimi',
                'Markalara video reklam hizmeti sat',
                'Stock video satışı (Shutterstock, Adobe Stock)'
            ],
            link: 'https://openai.com/sora',
            launch_date: '2024-12',
            trend: 'hot'
        },
        {
            name: 'Bolt.new',
            category: 'Web Geliştirme',
            description: 'Prompt ile tam çalışan web uygulamaları oluşturur. Backend, frontend ve deployment dahil.',
            pricing: 'Freemium',
            upvotes: 3100,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Müşterilere hızlı MVP geliştir ve sat',
                'SaaS prototipleri oluştur',
                'Freelance web projeleri için kullan'
            ],
            link: 'https://bolt.new',
            launch_date: '2024-10',
            trend: 'rising'
        },
        {
            name: 'Midjourney v7',
            category: 'Görsel Üretimi',
            description: 'AI ile ultra-gerçekçi görseller oluşturur. Yeni versiyon daha tutarlı yüzler ve metinler üretir.',
            pricing: 'Ücretli ($10/ay)',
            upvotes: 4500,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Print-on-demand ürünler tasarla (Etsy, Redbubble)',
                'Sosyal medya içerik paketi sat',
                'Logo ve marka kimliği tasarla'
            ],
            link: 'https://midjourney.com',
            launch_date: '2025-01',
            trend: 'hot'
        },
        {
            name: 'Cursor AI',
            category: 'Kod Asistanı',
            description: 'AI destekli kod editörü. Kod yazarken gerçek zamanlı öneriler, otomatik refactoring ve bug fix.',
            pricing: 'Freemium',
            upvotes: 2100,
            money_making_potential: 'Orta',
            use_cases: [
                'Kodlama hızını 3-5x artır',
                'Freelance projeleri daha hızlı teslim et',
                'Yeni programlama dilleri öğren'
            ],
            link: 'https://cursor.sh',
            launch_date: '2024-06',
            trend: 'rising'
        },
        {
            name: 'ElevenLabs',
            category: 'Ses Üretimi',
            description: 'AI ile ultra-gerçekçi sesli anlatım üretir. 30+ dilde klonlama ve dubbing desteği.',
            pricing: 'Freemium',
            upvotes: 1800,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Podcast / audiobook prodüksiyonu',
                'YouTube kanalları için seslendirme',
                'Kurumsal eğitim materyalleri üret'
            ],
            link: 'https://elevenlabs.io',
            launch_date: '2024-01',
            trend: 'stable'
        },
        {
            name: 'Gamma AI',
            category: 'Sunum & Doküman',
            description: 'AI ile profesyonel sunumlar, belgeler ve web sayfaları oluşturur. Tek prompt ile komple sunum.',
            pricing: 'Freemium',
            upvotes: 1500,
            money_making_potential: 'Orta',
            use_cases: [
                'Kurumsal sunum hizmeti ver',
                'Pitch deck hazırlama servisi',
                'Eğitim materyalleri oluştur ve sat'
            ],
            link: 'https://gamma.app',
            launch_date: '2024-03',
            trend: 'stable'
        },
        {
            name: 'Perplexity AI',
            category: 'Araştırma',
            description: 'AI destekli arama ve araştırma motoru. Kaynaklı, doğrulanmış yanıtlar üretir.',
            pricing: 'Freemium',
            upvotes: 3800,
            money_making_potential: 'Orta',
            use_cases: [
                'SEO araştırma ve içerik üretimi',
                'Pazar araştırma raporları hazırla',
                'Rekabet analizi yap ve raporla'
            ],
            link: 'https://perplexity.ai',
            launch_date: '2024-01',
            trend: 'rising'
        },
        {
            name: 'Kling AI',
            category: 'Video Üretimi',
            description: 'Çin merkezli güçlü AI video üretici. Sora\'ya alternatif, bazı senaryolarda daha iyi sonuçlar.',
            pricing: 'Ücretsiz (günlük limit)',
            upvotes: 1200,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Ücretsiz video içerik üretimi',
                'Kısa video reklamlar oluştur',
                'Sosyal medya videoları üret'
            ],
            link: 'https://klingai.com',
            launch_date: '2024-07',
            trend: 'rising'
        },
        {
            name: 'n8n AI Automation',
            category: 'Otomasyon',
            description: 'Açık kaynak AI otomasyon platformu. No-code ile karmaşık AI iş akışları oluşturur.',
            pricing: 'Ücretsiz (Self-hosted)',
            upvotes: 2200,
            money_making_potential: 'Yüksek',
            use_cases: [
                'Müşterilere AI otomasyon servisi kur',
                'Kendi iş süreçlerini otomatize et',
                'AI chatbot ve asistan servisi sun'
            ],
            link: 'https://n8n.io',
            launch_date: '2024-08',
            trend: 'hot'
        }
    ];
}

module.exports = { scanAITools };
