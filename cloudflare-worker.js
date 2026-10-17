const SYSTEM_PROMPT = `You are the official AI Assistant for DiginixIT (https://diginixit.com), a premier technology, design, legal, and financial consultancy.
Your goal is to answer visitor questions accurately, warmly, professionally, and concisely in English or Urdu.

CONVERSATIONAL RULES (STRICT):
1. Greetings & "How are you": If user says "hello", "hi", "how are you", "salam", respond concisely: "Hello! How can I help you today?"
2. Farewells & Endings: If user says "bye", "goodbye", "allah hafiz", respond warmly: "Goodbye! Nice meeting you, have a nice day!"
3. Dr. Nadeem Nazir: Respond ONLY: "Dr. Nadeem Nazir is the Chief Executive & Founding Strategic Advisor at DiginixIT."
4. All other information: Provide strictly PRECISE, FACTUAL, and TO-THE-POINT answers without unsolicited contact numbers, addresses, or filler words.

Key facts:
- Executive Leadership: Dr. Nadeem Nazir (Chief Executive & Founding Strategic Advisor).
- Core Services: 01 Web Engineering, 02 UI/UX Design, 03 Technical SEO (<2.5s Core Web Vitals), 04 Law & Tech Compliance, 05 Corporate Finance.
- Studio Addresses: Main Boulevard, Lahore & Global Studio Faisalabad, Pakistan.
- Contact: +92 300 7960300, contact@diginix.com.`;

function getWorkerFallback(query, blogUrl = 'https://diginixit.com/blog') {
    const raw = (query || '').trim();
    const q = raw.toLowerCase();
    const isUrdu = /[\u0600-\u06FF]/.test(raw);

    // Farewells
    if (/(^|\b)(bye|goodbye|good\s*bye|cya|see\s*ya|see\s*you|allah\s*hafiz|khuda\s*hafiz|alvida|tata|take\s*care|have\s*a\s*nice\s*day|farewell)(\b|$)|اللہ\s*حافظ|خدا\s*حافظ|الوداع/i.test(q)) {
        return {
            reply: isUrdu ? 'اللہ حافظ! آپ سے بات کر کے خوشی ہوئی۔ آپ کا دن اچھا گزرے!' : 'Goodbye! Nice meeting you, have a nice day!',
            sources: []
        };
    }

    // Greetings
    if (/^(hi|hello|hey|hiya|howdy|salam|assalam|assalamu\s*alaikum|aoa|kese\s*ho|kaise\s*ho|kya\s*haal|how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do|how\'s\s*it\s*going)[\s.?!]*$|^[؟?!.\s]*(سلام|السلام\s*علیکم|کیسے\s*ہو|کیا\s*حال)[؟?!.\s]*$/i.test(q)) {
        return {
            reply: isUrdu ? 'وعلیکم السلام! میں بالکل ٹھیک ہوں، شکریہ۔ میں آج آپ کی کس طرح مدد کر سکتا ہوں؟' : 'Hello! How can I help you today?',
            sources: []
        };
    }

    // Dr. Nadeem Nazir
    if (q.includes('nadeem') || q.includes('nazir') || q.includes('doctor') || q.includes('ceo') || q.includes('advisor') || raw.includes('ندیم') || raw.includes('نذیر') || raw.includes('ڈاکٹر')) {
        if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('number') || raw.includes('رابطہ') || raw.includes('نمبر')) {
            return {
                reply: isUrdu ? 'آپ ڈاکٹر ندیم نذیر سے ای میل contact@diginix.com یا فون +92 300 7960300 پر رابطہ کر سکتے ہیں۔' : 'You can contact Dr. Nadeem Nazir via email at contact@diginix.com or phone at +92 300 7960300.',
                sources: []
            };
        }
        return {
            reply: isUrdu ? 'ڈاکٹر ندیم نذیر DiginixIT کے چیف ایگزیکٹو اور فاؤنڈنگ سٹریٹجک ایڈوائزر ہیں۔' : 'Dr. Nadeem Nazir is the Chief Executive & Founding Strategic Advisor at DiginixIT.',
            sources: []
        };
    }

    // Blogs
    if (q.includes('blog') || q.includes('article') || q.includes('post') || q.includes('insight') || raw.includes('بلاگ') || raw.includes('مضمون')) {
        return {
            reply: isUrdu ? `آپ ہمارے بلاگز اور مضامین اس لنک پر دیکھ سکتے ہیں: ${blogUrl}` : `You can explore our published blogs and insights here: ${blogUrl}`,
            sources: [
                { title: "The Future of Web Development in 2026", url: `${blogUrl}/the-future-of-web-development-in-2026`, excerpt: "Exploring minimal frameworks and spatial WebGL interfaces." },
                { title: "Mastering Design Systems", url: `${blogUrl}/mastering-design-systems`, excerpt: "Configuring clean HSL tokens and atomic components." },
                { title: "Optimizing Core Web Vitals for $10k Sites", url: `${blogUrl}/optimizing-core-web-vitals-for-10k-sites`, excerpt: "Checklist for sub-second LCP and 100/100 Lighthouse scores." }
            ]
        };
    }

    // Services
    if (q.includes('web') || q.includes('engineering') || q.includes('saas')) {
        return { reply: 'DiginixIT builds custom SaaS platforms, serverless web applications, real-time databases, and 3D WebGL interfaces.', sources: [] };
    }
    if (q.includes('design') || q.includes('ui') || q.includes('ux')) {
        return { reply: 'DiginixIT provides bespoke UI/UX design systems, typography-first layouts, and interactive micro-interactions.', sources: [] };
    }
    if (q.includes('seo') || q.includes('vitals') || q.includes('speed')) {
        return { reply: 'DiginixIT specializes in Core Web Vitals optimization (<2.5s LCP), Lighthouse performance, and search engine visibility.', sources: [] };
    }
    if (q.includes('law') || q.includes('compliance') || q.includes('gdpr')) {
        return { reply: 'DiginixIT provides tech law consultancy, GDPR/CCPA data privacy compliance audits, IP protection, and SaaS contracts.', sources: [] };
    }
    if (q.includes('finance') || q.includes('valuation') || q.includes('fundrais')) {
        return { reply: 'DiginixIT provides SaaS financial modeling, company valuations, unit economics diagnostics, and venture fundraising advisory.', sources: [] };
    }

    // Contact
    if (q.includes('contact') || q.includes('phone') || q.includes('email') || raw.includes('رابطہ')) {
        return { reply: 'You can contact DiginixIT by phone at +92 300 7960300 or by email at contact@diginix.com.', sources: [] };
    }

    return {
        reply: 'How can I help you regarding DiginixIT today?',
        sources: []
    };
}

export default {
    async fetch(request, env) {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            });
        }

        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
        }

        try {
            const body = await request.json();
            const message = body.message || "";
            const history = Array.isArray(body.history) ? body.history : [];

            const apiKey = env.GROK_API_KEY || "";
            const model = env.GROK_MODEL || "grok-beta";
            const blogUrl = env.BLOG_PAGE_URL || env.BLOG_BASE_URL || "https://diginixit.com/blog";

            // If no Grok API key, use verified zero-config fallback
            if (!apiKey) {
                const fallback = getWorkerFallback(message, blogUrl);
                return new Response(JSON.stringify(fallback), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
                ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: message }
            ];

            const upstream = await fetch("https://api.x.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: 0.6,
                    max_tokens: 800
                })
            });

            if (!upstream.ok) {
                const fallback = getWorkerFallback(message, blogUrl);
                return new Response(JSON.stringify(fallback), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            const data = await upstream.json();
            const reply = data.choices?.[0]?.message?.content || getWorkerFallback(message, blogUrl).reply;

            return new Response(JSON.stringify({ reply, sources: [] }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
    }
};
