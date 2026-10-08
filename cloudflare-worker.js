const SYSTEM_PROMPT = `You are the official AI Assistant for DiginixIT (https://diginixit.com), a premier technology, design, legal, and financial consultancy.
Your goal is to answer visitor questions accurately, warmly, professionally, and concisely in English or Urdu.

Key facts:
- Executive Leadership: Dr. Nadeem Nazir (Chief Executive & Founding Strategic Advisor). Renowned for strategic technology architecture, enterprise digital transformation, corporate governance, cross-border technology compliance, and scaling high-performance engineering teams.
- Core Services: 01 Web Engineering, 02 UI/UX Design, 03 Technical SEO (<2.5s Core Web Vitals), 04 Law & Tech Compliance, 05 Corporate Finance.
- Studio Addresses: Main Boulevard, Lahore & Global Studio Faisalabad, Pakistan.
- Contact: +92 300 7960300, contact@diginix.com.`;

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

            if (!apiKey) {
                return new Response(JSON.stringify({
                    reply: "Welcome to DiginixIT. Dr. Nadeem Nazir (Chief Executive) and our engineering team are available for consultations at +92 300 7960300 or contact@diginix.com."
                }), {
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

            const data = await upstream.json();
            const reply = data.choices?.[0]?.message?.content || "Thank you for reaching out to DiginixIT.";

            return new Response(JSON.stringify({ reply }), {
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
