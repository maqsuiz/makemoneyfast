/**
 * AI Araçları Tarayıcı
 * Yeni çıkan AI araçları ve para kazanma fırsatları
 */

async function scanAITools() {
    try {
        const tools = getAITools();

        return {
            module: 'ai_tools',
            title: 'AI Tools Scanner',
            last_updated: new Date().toISOString(),
            data_source: 'Curated AI Tools Database',
            summary: {
                total_new_tools: tools.length,
                free_tools: tools.filter(t => t.pricing === 'Free' || t.pricing === 'Freemium').length,
                money_making_tools: tools.filter(t => t.money_making_potential === 'High').length
            },
            tools
        };
    } catch (error) {
        console.error('KOMBAI scan error:', error.message);
        return { module: 'kombai_tools', title: 'New KOMBAI Tools', tools: [], error: error.message };
    }
}

function getAITools() {
    return [
        {
            name: 'Devin',
            description: 'World first fully autonomous software engineer. Can build entire projects.',
            category: 'Engineering',
            pricing: 'Private Beta',
            upvotes: 24500,
            money_making_potential: 'High',
            use_cases: ['Automate freelance coding projects', 'Rapid prototyping for clients'],
            trend: 'hot',
            launch_date: '2024-03-12',
            link: 'https://www.cognition-labs.com/introducing-devin'
        },
        {
            name: 'Sora',
            description: 'Text-to-video model. Creates realistic and imaginative video scenes.',
            category: 'Video Generation',
            pricing: 'Coming Soon',
            upvotes: 18200,
            money_making_potential: 'High',
            use_cases: ['YouTube Shorts / TikTok content production', 'Advertising agency quality videos'],
            trend: 'hot',
            launch_date: '2024-02-15',
            link: 'https://openai.com/sora'
        },
        {
            name: 'Bolt.new',
            category: 'Web Development',
            description: 'Create full-stack web apps with prompts. Includes backend, frontend, and deployment.',
            pricing: 'Freemium',
            upvotes: 3100,
            money_making_potential: 'High',
            use_cases: [
                'Develop and sell MVPs rapidly',
                'Create SaaS prototypes',
                'Use for freelance web projects'
            ],
            link: 'https://bolt.new',
            launch_date: '2024-10',
            trend: 'rising'
        },
        {
            name: 'Midjourney v7',
            category: 'Image Generation',
            description: 'Create ultra-realistic images with AI. New version has more consistent faces and text.',
            pricing: 'Paid ($10/mo)',
            upvotes: 4500,
            money_making_potential: 'High',
            use_cases: [
                'Design print-on-demand products (Etsy, Redbubble)',
                'Sell social media content packages',
                'Design logos and brand identity'
            ],
            link: 'https://midjourney.com',
            launch_date: '2025-01',
            trend: 'hot'
        },
        {
            name: 'Cursor',
            category: 'Code Assistant',
            description: 'AI-powered code editor. Real-time suggestions, automatic refactoring, and bug fixes.',
            pricing: 'Freemium',
            upvotes: 2100,
            money_making_potential: 'Medium',
            use_cases: [
                'Increase coding speed 3-5x',
                'Deliver freelance projects faster',
                'Learn new programming languages'
            ],
            link: 'https://cursor.sh',
            launch_date: '2024-06',
            trend: 'rising'
        },
        {
            name: 'ElevenLabs',
            category: 'Voice Generation',
            description: 'Ultra-realistic voiceover generation. Cloning and dubbing support in 30+ languages.',
            pricing: 'Freemium',
            upvotes: 1800,
            money_making_potential: 'High',
            use_cases: [
                'Podcast / audiobook production',
                'Voiceover for YouTube channels',
                'Produce corporate training materials'
            ],
            link: 'https://elevenlabs.io',
            launch_date: '2024-01',
            trend: 'stable'
        },
        {
            name: 'Gamma AI',
            category: 'Presentation & Docs',
            description: 'Create professional presentations, documents, and web pages with AI. Full deck in one prompt.',
            pricing: 'Freemium',
            upvotes: 1500,
            money_making_potential: 'Medium',
            use_cases: [
                'Provide corporate presentation services',
                'Pitch deck preparation service',
                'Create and sell training materials'
            ],
            link: 'https://gamma.app',
            launch_date: '2024-03',
            trend: 'stable'
        },
        {
            name: 'Perplexity',
            category: 'Research',
            description: 'AI-powered search and research engine. Produces cited, verified answers.',
            pricing: 'Freemium',
            upvotes: 3800,
            money_making_potential: 'Medium',
            use_cases: [
                'SEO research and content generation',
                'Prepare market research reports',
                'Competitor analysis and reporting'
            ],
            link: 'https://perplexity.ai',
            launch_date: '2024-01',
            trend: 'rising'
        },
        {
            name: 'Kling AI',
            category: 'Video Generation',
            description: 'Powerful AI video generator. Sora alternative, better results in some scenarios.',
            pricing: 'Free (daily limit)',
            upvotes: 1200,
            money_making_potential: 'High',
            use_cases: [
                'Generate free video content',
                'Create short video ads',
                'Produce social media videos'
            ],
            link: 'https://klingai.com',
            launch_date: '2024-07',
            trend: 'rising'
        },
        {
            name: 'n8n AI Automation',
            category: 'Automation',
            description: 'Open-source AI automation platform. Create complex AI workflows with no-code.',
            pricing: 'Free (Self-hosted)',
            upvotes: 2200,
            money_making_potential: 'High',
            use_cases: [
                'Set up AI automation services for clients',
                'Automate your own business processes',
                'Offer AI chatbot and assistant services'
            ],
            link: 'https://n8n.io',
            launch_date: '2024-08',
            trend: 'hot'
        },
    ];
}

module.exports = { scanAITools };
