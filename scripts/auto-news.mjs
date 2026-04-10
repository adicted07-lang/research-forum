import Anthropic from "@anthropic-ai/sdk";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ADMIN_EMAIL = "adicted07@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

const ARTICLE_CATEGORIES = ["news", "how_to", "opinion", "interview"];

const INDUSTRIES = [
  "Transport and Logistics", "Aerospace and Defence", "Packaging",
  "Automotive", "Agriculture", "Machinery and Equipment",
  "Energy and Power", "Consumer Goods", "Chemical and Material",
  "Healthcare", "Food and Beverages", "Semiconductor and Electronic", "ICT",
];

const ARTICLE_TAGS = [
  "market-research", "consumer-behavior", "survey-design", "competitive-analysis",
  "brand-strategy", "UX-research", "data-analytics", "focus-groups",
  "market-segmentation", "pricing-research", "product-research", "customer-experience",
  "ethnographic-research", "conjoint-analysis", "trend-analysis", "AI-in-research",
  "research-technology", "panel-management", "qualitative-methods", "quantitative-methods",
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function main() {
  console.log("Starting auto-news generation...");

  // Get seeded researchers
  const researchers = await sql`
    SELECT id, name, expertise FROM users
    WHERE email LIKE '%@researchhub.dev'
    AND role = 'RESEARCHER'
    AND "deletedAt" IS NULL
  `;

  if (researchers.length < 3) {
    console.error("Not enough seeded researchers. Run seed-researchers first.");
    process.exit(1);
  }

  const articleCount = 3 + Math.floor(Math.random() * 2); // 3 or 4
  const pickedIndustries = INDUSTRIES.sort(() => Math.random() - 0.5).slice(0, articleCount);

  const prompt = `Generate ${articleCount} unique, high-quality market research articles for a professional research community. Each article MUST focus on a specific industry.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
[
  {
    "title": "Engaging, specific article title",
    "body": "Full article body in HTML format (800+ words)",
    "category": "news|how_to|opinion|interview",
    "tags": ["tag1", "tag2", "tag3"],
    "authorIndex": 0
  }
]

IMPORTANT — Each article MUST be about one of these industries (one per article):
${pickedIndustries.map((ind, i) => `Article ${i + 1}: ${ind}`).join("\n")}

Categories to distribute across:
- "news": Industry developments, market size updates, new technologies, research findings in the assigned industry
- "how_to": Step-by-step guides on research methodologies specific to the assigned industry
- "opinion": Expert takes on industry trends, market shifts, and future outlook
- "interview": Q&A format with a fictional industry expert

HTML formatting requirements:
- Use <h2> and <h3> for section headings (never <h1>)
- Use <p> for paragraphs
- Use <ul>/<li> for lists where appropriate
- Use <blockquote> for notable quotes or key takeaways
- Use <strong> and <em> for emphasis
- Include at least 4-5 sections per article
- Minimum 800 words per article

EEAT quality signals to include:
- Reference specific market data, CAGR projections, or market size figures for the industry
- Cite realistic statistics or industry benchmarks
- Include practical examples and case study references from real companies in the industry
- Mention specific tools, platforms, or frameworks used in that industry's research
- Provide actionable recommendations for market researchers working in that industry
- Reference regulatory bodies, industry associations, or standards where relevant

Tags: pick 3-5 from: ${ARTICLE_TAGS.join(", ")}
authorIndex: number from 0 to ${researchers.length - 1} (distribute evenly)`;

  console.log("Calling Claude API...");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || !textBlock.text) {
    console.error("Failed to generate articles");
    process.exit(1);
  }

  let articles;
  try {
    const raw = textBlock.text.replace(/```json\n?|```\n?/g, "").trim();
    articles = JSON.parse(raw);
  } catch {
    console.error("Failed to parse article JSON:", textBlock.text.slice(0, 200));
    process.exit(1);
  }

  const createdArticles = [];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const authorIdx = article.authorIndex != null
      ? article.authorIndex % researchers.length
      : i % researchers.length;
    const author = researchers[authorIdx];

    const wordCount = article.body.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const category = ARTICLE_CATEGORIES.includes(article.category) ? article.category : "news";
    const slug = generateSlug(article.title);
    const id = `cron_news_${Date.now()}_${i}`;

    await sql`
      INSERT INTO articles (id, title, body, slug, "authorId", category, tags, "readTime", "isFeatured", "isAIGenerated", status, "publishedAt", "createdAt", "updatedAt")
      VALUES (${id}, ${article.title}, ${article.body}, ${slug}, ${author.id}, ${category}, ${article.tags}, ${readTime}, ${i === 0}, true, 'PUBLISHED', NOW(), NOW(), NOW())
    `;

    createdArticles.push({ id, title: article.title, slug, author: author.name, readTime, tags: article.tags });
    console.log(`  Created: "${article.title}" by ${author.name}`);
  }

  // Fetch and append Semantic Scholar papers to each article
  console.log("Adding academic references...");
  for (let idx = 0; idx < createdArticles.length; idx++) {
    const article = createdArticles[idx];
    if (idx > 0) await new Promise(r => setTimeout(r, 1500)); // Rate limit: 1 req/sec
    try {
      const searchQuery = encodeURIComponent(article.title.slice(0, 100));
      const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${searchQuery}&limit=3&fields=title,authors,year,citationCount,url`,
        { headers: { "User-Agent": "TheIntellectualExchange/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const papers = (data.data || []).filter(p => p.title && p.url);

      if (papers.length > 0) {
        const papersHtml = papers.map(p => {
          const authors = (p.authors || []).slice(0, 3).map(a => a.name).join(", ");
          const citation = p.citationCount ? ` · ${p.citationCount} citations` : "";
          return `<li><a href="${p.url}" target="_blank" rel="noopener">${p.title}</a><br><span style="color:#6b7280;font-size:13px;">${authors}${p.year ? ` (${p.year})` : ""}${citation}</span></li>`;
        }).join("");

        const currentArticle = await sql`SELECT body FROM articles WHERE id = ${article.id}`;
        const currentBody = currentArticle[0].body;
        const updatedBody = currentBody + `
    <h3>Academic References</h3>
    <p style="color:#6b7280;font-size:13px;">Related research papers via <a href="https://www.semanticscholar.org" target="_blank" rel="noopener">Semantic Scholar</a></p>
    <ul>${papersHtml}</ul>
  `;
        await sql`UPDATE articles SET body = ${updatedBody} WHERE id = ${article.id}`;
        console.log(`  Added ${papers.length} papers to "${article.title}"`);
      }
    } catch (err) {
      console.error(`  Failed to fetch papers for "${article.title}":`, err.message);
    }
  }

  // Add SEO internal links to each created article
  console.log("Adding internal links to articles...");
  for (const article of createdArticles) {
    const { id, slug, tags } = article;

    const related = await sql`
      SELECT title, slug, 'article' as type FROM articles
      WHERE id != ${id}
      AND tags && ${tags}
      AND status = 'PUBLISHED'
      AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC LIMIT 2
    `;
    const relatedQuestions = await sql`
      SELECT title, slug, 'question' as type FROM questions
      WHERE tags && ${tags}
      AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC LIMIT 1
    `;

    const allRelated = [...related, ...relatedQuestions];
    if (allRelated.length > 0) {
      const linksHtml = allRelated.map(r => {
        const url = r.type === 'article' ? `/news/${r.slug}` : `/forum/${r.slug}`;
        return `<li><a href="${url}">${r.title}</a></li>`;
      }).join('');

      const currentArticle = await sql`SELECT body FROM articles WHERE id = ${id}`;
      const currentBody = currentArticle[0].body;
      const updatedBody = currentBody + `
    <hr>
    <h3>Related on The Intellectual Exchange</h3>
    <ul>${linksHtml}</ul>
  `;

      await sql`UPDATE articles SET body = ${updatedBody} WHERE id = ${id}`;
      console.log(`  Linked ${allRelated.length} related items to "${article.title}"`);
    }
  }

  // Send admin email via Resend
  if (process.env.RESEND_API_KEY) {
    const articlesList = createdArticles.map(a =>
      `<li><a href="${BASE_URL}/news/${a.slug}">${a.title}</a> — by ${a.author} (${a.readTime} min read)</li>`
    ).join("");

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Intellectual Exchange <noreply@theintellectualexchange.com>",
        to: ADMIN_EMAIL,
        subject: `News update: ${createdArticles.length} new articles published`,
        html: `
          <h2>Daily News Update</h2>
          <h3>New Articles (${createdArticles.length})</h3>
          <ul>${articlesList}</ul>
          <p style="color:#888;font-size:12px;">— The Intellectual Exchange Auto-Content System</p>
        `,
      }),
    });
  }

  console.log(`Done! Created ${createdArticles.length} articles.`);
}

main().catch((err) => {
  console.error("Auto news generation failed:", err);
  process.exit(1);
});
