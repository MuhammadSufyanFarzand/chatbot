import { DIGINIX_KNOWLEDGE, GROK_SYSTEM_PROMPT } from './knowledge-base.js';

function getFallbackReply(query) {
    const q = (query || '').toLowerCase();
    const { leadership, services, contact, studios } = DIGINIX_KNOWLEDGE;

    if (q.includes('nadeem') || q.includes('nazir') || q.includes('doctor') || q.includes('ceo') || q.includes('advisor')) {
        const doc = leadership.advisor;
        return `**${doc.name}** is the **${doc.role}** at DiginixIT.\n\n` +
            `**About Dr. Nadeem Nazir:**\n${doc.summary}\n\n` +
            `**Core Advisory Domains:**\n` +
            doc.coreDomains.map(d => `• ${d}`).join('\n') + '\n\n' +
            `**Direct Consultations & Appointments:**\n` +
            `• Voice / WhatsApp: [${contact.phone}](tel:${contact.phoneRaw})\n` +
            `• Email: [${contact.email}](mailto:${contact.email})\n` +
            `• LinkedIn: [DiginixIT LinkedIn](${doc.linkedIn})`;
    }

    if (q.includes('web') || q.includes('engineering') || q.includes('saas') || q.includes('software')) {
        const s = services[0];
        return `**${s.title} (${s.pillar})**\n\n${s.summary}\n\n` +
            `**Deliverables:**\n` +
            s.deliverables.map(d => `• ${d}`).join('\n') + '\n\n' +
            `Reach our engineering studio at [${contact.email}](mailto:${contact.email}) or [${contact.phone}](tel:${contact.phoneRaw}).`;
    }

    if (q.includes('design') || q.includes('ui') || q.includes('ux') || q.includes('figma')) {
        const s = services[1];
        return `**${s.title} (${s.pillar})**\n\n${s.summary}\n\n` +
            `**Design Highlights:**\n` +
            s.deliverables.map(d => `• ${d}`).join('\n');
    }

    if (q.includes('seo') || q.includes('vitals') || q.includes('speed') || q.includes('rank')) {
        const s = services[2];
        return `**${s.title} (${s.pillar})**\n\n${s.summary}\n\n` +
            `**Optimization Checklist:**\n` +
            s.deliverables.map(d => `• ${d}`).join('\n');
    }

    if (q.includes('law') || q.includes('compliance') || q.includes('gdpr') || q.includes('legal') || q.includes('ip')) {
        const s = services[3];
        return `**${s.title} (${s.pillar})**\n\n${s.summary}\n\n` +
            `**Compliance Domains:**\n` +
            s.deliverables.map(d => `• ${d}`).join('\n');
    }

    if (q.includes('finance') || q.includes('valuation') || q.includes('fundrais') || q.includes('capital')) {
        const s = services[4];
        return `**${s.title} (${s.pillar})**\n\n${s.summary}\n\n` +
            `**Valuation & Modeling Solutions:**\n` +
            s.deliverables.map(d => `• ${d}`).join('\n');
    }

    if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('address') || q.includes('location')) {
        return `**Contact Channels — DiginixIT:**\n\n` +
            `• **Phone / WhatsApp**: [${contact.phone}](tel:${contact.phoneRaw})\n` +
            `• **Direct Inquiries**: [${contact.email}](mailto:${contact.email})\n` +
            `• **Corporate Headquarters**: ${studios.corporateOffice}\n` +
            `• **Engineering Studio**: ${studios.engineeringStudio}\n` +
            `• **Hours**: ${contact.businessHours}\n` +
            `• **Status**: ${DIGINIX_KNOWLEDGE.company.status} (${DIGINIX_KNOWLEDGE.company.averageResponseTime})`;
    }

    return `**DiginixIT | Build, Protect & Scale Your Business**\n\n` +
        `We are a premier multidisciplinary technology agency specializing in:\n` +
        `1. **Web Engineering**: Custom SaaS, serverless web apps & 3D WebGL\n` +
        `2. **UI/UX Design**: Tokenized, typography-first design systems\n` +
        `3. **Technical SEO**: Sub-2.5s Core Web Vitals & organic discovery\n` +
        `4. **Tech Law & Compliance**: GDPR/CCPA audits & IP protection\n` +
        `5. **Corporate Finance**: Tech valuations & strategic runway models\n\n` +
        `Executive Leadership: **Dr. Nadeem Nazir**\n` +
        `Direct Consultations: [${contact.phone}](tel:${contact.phoneRaw}) | [${contact.email}](mailto:${contact.email})`;
}

export async function chatHandler(req, res) {
    try {
        const { message, history } = req.body || {};
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Valid message string required' });
        }

        const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        const model = process.env.GROK_MODEL || 'grok-beta';

        // Graceful fallback if Grok API key is not yet set
        if (!apiKey) {
            return res.json({
                reply: getFallbackReply(message),
                source: 'local_knowledge',
                note: 'Set GROK_API_KEY in environment variables to enable live xAI completions.'
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

        messages.push({ role: 'user', content: message });

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
                source: 'fallback_knowledge'
            });
        }

        const data = await xaiResponse.json();
        const botReply = data.choices?.[0]?.message?.content || getFallbackReply(message);

        return res.json({
            reply: botReply,
            source: 'grok_api'
        });

    } catch (err) {
        console.error('Chat endpoint exception:', err);
        return res.json({
            reply: getFallbackReply(req.body?.message || ''),
            source: 'error_fallback'
        });
    }
}
