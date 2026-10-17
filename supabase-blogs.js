import { createClient } from '@supabase/supabase-js';
import { DIGINIX_KNOWLEDGE } from './knowledge-base.js';

let supabaseClient = null;

export function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    if (!supabaseClient) {
        try {
            supabaseClient = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            });
        } catch (err) {
            console.warn('[Supabase Blogs] Client init failed, using built-in blogs:', err.message);
            supabaseClient = null;
        }
    }

    return supabaseClient;
}

/**
 * Normalizes a blog record from Supabase, detecting real column names dynamically
 * while supporting standard schema conventions (title, slug/url, content/body, is_published/published/status).
 */
export function normalizeBlogRecord(row) {
    if (!row || typeof row !== 'object') return null;

    const title = row.title || row.blog_title || row.name || 'Untitled Blog';
    const content = row.content || row.body || row.text || row.article || row.description || '';
    const excerpt = row.excerpt || row.summary || row.meta_description || (content ? content.slice(0, 160) + '...' : '');

    // Determine URL or Slug
    const baseUrl = (process.env.BLOG_PAGE_URL || process.env.BLOG_BASE_URL || 'https://diginixit.com/blog').replace(/\/+$/, '');
    let url = row.url || row.link || row.canonical_url || '';
    if (!url && (row.slug || row.blog_slug)) {
        const slug = String(row.slug || row.blog_slug).replace(/^\/+/, '');
        url = `${baseUrl}/${slug}`;
    } else if (!url && row.id) {
        url = `${baseUrl}/${row.id}`;
    }

    // Determine published status
    let isPublished = true;
    if (typeof row.is_published === 'boolean') {
        isPublished = row.is_published;
    } else if (typeof row.published === 'boolean') {
        isPublished = row.published;
    } else if (typeof row.status === 'string') {
        isPublished = row.status.toLowerCase() === 'published';
    } else if (typeof row.state === 'string') {
        isPublished = row.state.toLowerCase() === 'published';
    }

    return {
        id: row.id,
        title: String(title),
        url: String(url),
        excerpt: String(excerpt),
        content: String(content),
        isPublished,
        raw: row
    };
}

/**
 * Built-in local blogs from verified knowledge-base (works with zero external database configuration).
 */
export function getLocalBlogs() {
    const baseUrl = (process.env.BLOG_PAGE_URL || process.env.BLOG_BASE_URL || 'https://diginixit.com/blog').replace(/\/+$/, '');
    const insights = DIGINIX_KNOWLEDGE?.insights || [];

    return insights.map((item, idx) => {
        const slug = (item.title || `article-${idx + 1}`)
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

        return {
            id: `local-${idx + 1}`,
            title: item.title,
            url: `${baseUrl}/${slug}`,
            excerpt: item.summary,
            content: `${item.title}. ${item.summary} By ${item.author || 'DiginixIT'} (${item.category || 'Tech'}).`,
            isPublished: true,
            raw: item
        };
    });
}

/**
 * Safely fetches published blogs from Supabase matching the user's query keywords.
 * If Supabase is not configured or returns no matches, falls back seamlessly to built-in blogs.
 */
export async function fetchRelevantBlogs(query, limit = 3) {
    const client = getSupabaseClient();
    let candidates = [];

    if (client) {
        try {
            const { data, error } = await client
                .from('blogs')
                .select('*')
                .limit(20);

            if (!error && Array.isArray(data) && data.length > 0) {
                candidates = data
                    .map(normalizeBlogRecord)
                    .filter(b => b && b.isPublished);
            }
        } catch (err) {
            console.warn('[Supabase Blogs] Remote fetch failed, falling back to local blogs:', err.message);
        }
    }

    // If external database is not configured or had no data, fall back to built-in blogs
    if (candidates.length === 0) {
        candidates = getLocalBlogs();
    }

    const rawQuery = (query || '').toLowerCase();
    const isExplicitBlogQuery = /blog|article|insight|post|بلاگ|مضمون|پوسٹ|تحریر/.test(rawQuery);

    // Rank by keyword relevance against query
    const queryTokens = rawQuery
        .replace(/[^\w\s\u0600-\u06FF]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 2);

    const scored = candidates.map(blog => {
        let score = 0;
        const titleLower = blog.title.toLowerCase();
        const contentLower = blog.content.toLowerCase();
        const excerptLower = blog.excerpt.toLowerCase();

        queryTokens.forEach(token => {
            if (titleLower.includes(token)) score += 5;
            if (excerptLower.includes(token)) score += 3;
            if (contentLower.includes(token)) score += 1;
        });

        return { blog, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return matches if query matched tokens, or if user explicitly asked for blogs
    let topMatches = [];
    if (scored.length > 0 && scored[0].score > 0) {
        topMatches = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.blog);
    } else if (isExplicitBlogQuery) {
        topMatches = candidates.slice(0, limit);
    }

    const sources = topMatches.map(b => ({
        title: b.title,
        url: b.url,
        excerpt: b.excerpt
    }));

    return { blogs: topMatches, sources, error: null };
}
