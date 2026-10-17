import { DIGINIX_KNOWLEDGE, GROK_SYSTEM_PROMPT } from './knowledge-base.js';
import { GoogleGenAI } from '@google/genai';
import { fetchRelevantBlogs } from './supabase-blogs.js';

function getFallbackReply(query) {
    const raw = (query || '').trim();
    const q = raw.toLowerCase();
    const { leadership, contact, studios } = DIGINIX_KNOWLEDGE;

    // Farewells & Endings (Bye, Allah Hafiz, Khuda Hafiz, See you, Take care, etc.)
    const farewellRegex = /(^|\b)(bye|goodbye|good\s*bye|cya|see\s*ya|see\s*you|allah\s*hafiz|khuda\s*hafiz|alvida|tata|take\s*care|have\s*a\s*nice\s*day|farewell)(\b|$)|اللہ\s*حافظ|خدا\s*حافظ|الوداع/i;
    if (farewellRegex.test(q)) {
        if (/اللہ\s*حافظ|خدا\s*حافظ|الوداع/.test(raw)) {
            return `اللہ حافظ! آپ سے بات کر کے خوشی ہوئی۔ آپ کا دن اچھا گزرے!`;
        }
        return `Goodbye! Nice meeting you, have a nice day!`;
    }

    // Greetings & "How are you" (Hello, Hi, How are you, Salam, etc.)
    const greetingRegex = /(^|\b)(hi|hello|hey|hiya|howdy|salam|assalam|aoa|kese\s*ho|kaise\s*ho|kya\s*haal|how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do|how\'s\s*it\s*going)(\b|$)|سلام|السلام\s*علیکم|کیسے\s*ہو|کیا\s*حال/i;
    if (greetingRegex.test(q)) {
        if (/سلام|السلام\s*علیکم|کیسے\s*ہو|کیا\s*حال/.test(raw)) {
            return `وعلیکم السلام! میں بالکل ٹھیک ہوں، شکریہ۔ میں آج آپ کی کس طرح مدد کر سکتا ہوں؟`;
        }
        return `Hello! How can I help you today?`;
    }

    // Dr. Nadeem Nazir
    if (q.includes('nadeem') || q.includes('nazir') || q.includes('doctor') || q.includes('ceo') || q.includes('advisor') || raw.includes('ندیم') || raw.includes('نذیر') || raw.includes('ڈاکٹر')) {
        const isUrdu = /[\u0600-\u06FF]/.test(raw);
        if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('number') || raw.includes('رابطہ') || raw.includes('نمبر')) {
            return isUrdu 
                ? `آپ ڈاکٹر ندیم نذیر سے ای میل ${contact.email} یا فون ${contact.phone} پر رابطہ کر سکتے ہیں۔`
                : `You can contact Dr. Nadeem Nazir via email at ${contact.email} or phone at ${contact.phone}.`;
        }
        if (q.includes('domain') || q.includes('expertise') || q.includes('specializ') || q.includes('skills')) {
            return `Dr. Nadeem Nazir specializes in Enterprise Software Architecture, Corporate Governance, Cross-Border Tech Law, and Venture Valuations.`;
        }
        return isUrdu 
            ? `ڈاکٹر ندیم نذیر DiginixIT کے چیف ایگزیکٹو اور فاؤنڈنگ سٹریٹجک ایڈوائزر ہیں۔`
            : `Dr. Nadeem Nazir is the Chief Executive & Founding Strategic Advisor at DiginixIT.`;
    }

    // Web Engineering
    if (q.includes('web') || q.includes('engineering') || q.includes('saas') || q.includes('software')) {
        return `DiginixIT builds custom SaaS platforms, serverless web applications, real-time databases, and 3D WebGL interfaces.`;
    }

    // UI/UX Design
    if (q.includes('design') || q.includes('ui') || q.includes('ux') || q.includes('figma')) {
        return `DiginixIT provides bespoke UI/UX design systems, typography-first layouts, and interactive micro-interactions.`;
    }

    // Technical SEO
    if (q.includes('seo') || q.includes('vitals') || q.includes('speed') || q.includes('rank')) {
        return `DiginixIT specializes in Core Web Vitals optimization (<2.5s LCP), Lighthouse performance, and search engine visibility.`;
    }

    // Tech Law & Compliance
    if (q.includes('law') || q.includes('compliance') || q.includes('gdpr') || q.includes('legal') || q.includes('ip')) {
        return `DiginixIT provides tech law consultancy, GDPR/CCPA data privacy compliance audits, IP protection, and SaaS contracts.`;
    }

    // Corporate Finance & Valuation
    if (q.includes('finance') || q.includes('valuation') || q.includes('fundrais') || q.includes('capital')) {
        return `DiginixIT provides SaaS financial modeling, company valuations, unit economics diagnostics, and venture fundraising advisory.`;
    }

    // Specific Contact Queries (Only if user asks)
    if (q.includes('phone') || q.includes('whatsapp') || q.includes('call') || q.includes('cell') || q.includes('نمبر')) {
        return `Phone / WhatsApp: ${contact.phone}`;
    }
    if (q.includes('email') || q.includes('mail') || q.includes('ای میل')) {
        return `Email: ${contact.email}`;
    }
    if (q.includes('address') || q.includes('location') || q.includes('office') || q.includes('studio') || q.includes('کہاں') || q.includes('پتہ')) {
        return `DiginixIT offices are located at Main Boulevard, Lahore and Faisalabad, Pakistan.`;
    }
    if (q.includes('contact') || q.includes('reach') || q.includes('رابطہ')) {
        return `You can contact DiginixIT by phone at ${contact.phone} or by email at ${contact.email}.`;
    }

    // Blog & Articles Overview
    if (q.includes('blog') || q.includes('article') || q.includes('post') || q.includes('insight') || raw.includes('بلاگ') || raw.includes('مضمون') || raw.includes('تحریر')) {
        const blogUrl = process.env.BLOG_PAGE_URL || process.env.BLOG_BASE_URL || 'https://diginixit.com/blog';
        const isUrdu = /[\u0600-\u06FF]/.test(raw);
        return isUrdu
            ? `آپ ہمارے بلاگز اور مضامین اس لنک پر دیکھ سکتے ہیں: ${blogUrl}`
            : `You can explore our published blogs and insights here: ${blogUrl}`;
    }

    // DiginixIT Overview
    if (q.includes('diginix') || q.includes('company') || q.includes('agency') || q.includes('what do you do') || q.includes('کیا کرتے')) {
        return `DiginixIT is a technology agency specializing in Web Engineering, UI/UX Design, Technical SEO, Tech Law, and Corporate Finance.`;
    }

    // Default concise fallback
    return `How can I help you regarding DiginixIT today?`;
}

export async function chatHandler(req, res) {
    try {
        const { message, history } = req.body || {};
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Valid message string required' });
        }

        const raw = message.trim();
        const q = raw.toLowerCase();

        // 1. Direct Farewell Handler (Bye, Allah Hafiz, Take care, etc.)
        const farewellRegex = /(^|\b)(bye|goodbye|good\s*bye|cya|see\s*ya|see\s*you|allah\s*hafiz|khuda\s*hafiz|alvida|tata|take\s*care|have\s*a\s*nice\s*day|farewell)(\b|$)|اللہ\s*حافظ|خدا\s*حافظ|الوداع/i;
        if (farewellRegex.test(q)) {
            const reply = /اللہ\s*حافظ|خدا\s*حافظ|الوداع/.test(raw)
                ? `اللہ حافظ! آپ سے بات کر کے خوشی ہوئی۔ آپ کا دن اچھا گزرے!`
                : `Goodbye! Nice meeting you, have a nice day!`;
            return res.json({ reply, sources: [], source: 'farewell' });
        }

        // 2. Direct Greeting Handler (Hello, Hi, How are you, Salam, etc.)
        const greetingRegex = /^(hi|hello|hey|hiya|howdy|salam|assalam|assalamu\s*alaikum|aoa|kese\s*ho|kaise\s*ho|kya\s*haal|how\s*are\s*you|how\s*r\s*u|how\s*do\s*you\s*do|how\'s\s*it\s*going)[\s.?!]*$|^[؟?!.\s]*(سلام|السلام\s*علیکم|کیسے\s*ہو|کیا\s*حال)[؟?!.\s]*$/i;
        if (greetingRegex.test(q)) {
            const reply = /سلام|السلام\s*علیکم|کیسے\s*ہو|کیا\s*حال/.test(raw)
                ? `وعلیکم السلام! میں بالکل ٹھیک ہوں، شکریہ۔ میں آج آپ کی کس طرح مدد کر سکتا ہوں؟`
                : `Hello! How can I help you today?`;
            return res.json({ reply, sources: [], source: 'greeting' });
        }

        // 3. Direct Leadership / Dr. Nadeem Nazir Query
        if (q.includes('nadeem') || q.includes('nazir') || raw.includes('ندیم') || raw.includes('نذیر')) {
            return res.json({ reply: getFallbackReply(message), sources: [], source: 'leadership' });
        }

        // 4. Retrieve published blogs from Supabase if available
        let blogData = { blogs: [], sources: [] };
        try {
            blogData = await fetchRelevantBlogs(message, 3);
        } catch (bErr) {
            console.warn('[Blogs Retrieval] Error:', bErr);
        }

        const hasMatchingBlogs = Array.isArray(blogData.blogs) && blogData.blogs.length > 0;
        const blogContext = hasMatchingBlogs
            ? blogData.blogs.map((b, i) => `[Article ${i + 1}] Title: "${b.title}"\nURL: ${b.url}\nExcerpt: ${b.excerpt}\nContent:\n${b.content.slice(0, 1200)}`).join('\n\n')
            : '';

        const userPromptWithBlogs = hasMatchingBlogs
            ? `Here is official blog content published by DiginixIT:\n\n${blogContext}\n\nUser Question: ${message}\n\nPlease answer the user's question using the blog content above accurately, concisely, and to the point.`
            : message;

        const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        const model = process.env.GROK_MODEL || 'grok-beta';
        const geminiKey = process.env.GEMINI_API_KEY;

        // If Grok key is not available but Gemini is available, use Gemini
        if (!apiKey && geminiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey: geminiKey });
                const contents = [];
                if (Array.isArray(history)) {
                    const recent = history.slice(-8);
                    recent.forEach(m => {
                        if (m && (m.role === 'user' || m.role === 'assistant') && m.content) {
                            contents.push({
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: String(m.content) }]
                            });
                        }
                    });
                }
                contents.push({
                    role: 'user',
                    parts: [{ text: userPromptWithBlogs }]
                });

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: {
                        systemInstruction: GROK_SYSTEM_PROMPT,
                        temperature: 0.2,
                        maxOutputTokens: 250
                    }
                });

                const botReply = response.text || getFallbackReply(message);
                return res.json({
                    reply: botReply,
                    sources: blogData.sources,
                    source: hasMatchingBlogs ? 'supabase_blogs' : 'gemini_api'
                });
            } catch (geminiErr) {
                console.error('Gemini API call failed, using fallback:', geminiErr);
                return res.json({
                    reply: getFallbackReply(message),
                    sources: blogData.sources,
                    source: 'local_knowledge'
                });
            }
        }

        // Graceful fallback if neither API key is set
        if (!apiKey) {
            if (hasMatchingBlogs) {
                const isUrdu = /[\u0600-\u06FF]/.test(raw);
                const topBlog = blogData.blogs[0];
                const botReply = isUrdu
                    ? `ہمارے بلاگ "${topBlog.title}" کے مطابق:\n${topBlog.excerpt || topBlog.content.slice(0, 200)}`
                    : `Based on our article "**${topBlog.title}**":\n${topBlog.excerpt || topBlog.content.slice(0, 200)}`;
                return res.json({
                    reply: botReply,
                    sources: blogData.sources,
                    source: 'blogs'
                });
            }
            return res.json({
                reply: getFallbackReply(message),
                sources: [],
                source: 'local_knowledge',
                note: 'Set GROK_API_KEY, GEMINI_API_KEY, or SUPABASE_URL in environment variables to enable live completions.'
            });
        }

        const messages = [
            { role: 'system', content: GROK_SYSTEM_PROMPT }
        ];

        if (Array.isArray(history)) {
            const recent = history.slice(-8);
            recent.forEach(m => {
                if (m && (m.role === 'user' || m.role === 'assistant') && m.content) {
                    messages.push({ role: m.role, content: String(m.content) });
                }
            });
        }

        messages.push({ role: 'user', content: userPromptWithBlogs });

        const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.6,
                max_tokens: 800
            })
        });

        if (!xaiResponse.ok) {
            console.error('xAI API responded with status:', xaiResponse.status);
            return res.json({
                reply: getFallbackReply(message),
                sources: blogData.sources,
                source: 'fallback_knowledge'
            });
        }

        const data = await xaiResponse.json();
        const botReply = data.choices?.[0]?.message?.content || getFallbackReply(message);

        return res.json({
            reply: botReply,
            sources: blogData.sources,
            source: hasMatchingBlogs ? 'supabase_blogs' : 'grok_api'
        });

    } catch (err) {
        console.error('Chat endpoint exception:', err);
        return res.json({
            reply: getFallbackReply(req.body?.message || ''),
            source: 'error_fallback'
        });
    }
}
