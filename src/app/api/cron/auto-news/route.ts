import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/claude";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ARTICLE_CATEGORIES = ["news", "how_to", "opinion", "interview"];

const INDUSTRIES = [
  "Transport and Logistics",
  "Aerospace and Defence",
  "Packaging",
  "Automotive",
  "Agriculture",
  "Machinery and Equipment",
  "Energy and Power",
  "Consumer Goods",
  "Chemical and Material",
  "Healthcare",
  "Food and Beverages",
  "Semiconductor and Electronic",
  "ICT",
];

const ARTICLE_TAGS = [
  "market-research",
  "consumer-behavior",
  "survey-design",
  "competitive-analysis",
  "brand-strategy",
  "UX-research",
  "data-analytics",
  "focus-groups",
  "market-segmentation",
  "pricing-research",
  "product-research",
  "customer-experience",
  "ethnographic-research",
  "conjoint-analysis",
  "trend-analysis",
  "AI-in-research",
  "research-technology",
  "panel-management",
  "qualitative-methods",
  "quantitative-methods",
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get seeded researchers to use as authors
    const researchers = await db.user.findMany({
      where: {
        email: { endsWith: "@researchhub.dev" },
        role: "RESEARCHER",
        deletedAt: null,
      },
      select: { id: true, name: true, expertise: true },
    });

    if (researchers.length < 3) {
      return NextResponse.json(
        { error: "Not enough seeded researchers. Run seed-researchers first." },
        { status: 400 }
      );
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b: any) => b.type === "text");
    if (!textBlock || !("text" in textBlock)) {
      return NextResponse.json(
        { error: "Failed to generate articles" },
        { status: 500 }
      );
    }

    let articles: Array<{
      title: string;
      body: string;
      category: string;
      tags: string[];
      authorIndex?: number;
    }>;

    try {
      const raw = textBlock.text.replace(/```json\n?|```\n?/g, "").trim();
      articles = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse article JSON", raw: textBlock.text },
        { status: 500 }
      );
    }

    const createdArticles = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const authorIdx =
        article.authorIndex != null
          ? article.authorIndex % researchers.length
          : i % researchers.length;
      const author = researchers[authorIdx];

      // Calculate read time from word count
      const wordCount = article.body.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Validate category
      const category = ARTICLE_CATEGORIES.includes(article.category)
        ? article.category
        : "news";

      const slug = generateSlug(article.title);

      const created = await db.article.create({
        data: {
          title: article.title,
          body: article.body,
          slug,
          authorId: author.id,
          category,
          tags: article.tags,
          readTime,
          isFeatured: i === 0, // Feature the first article
          isAIGenerated: true,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      createdArticles.push({
        id: created.id,
        title: created.title,
        slug: created.slug,
        author: author.name,
        category,
        readTime,
      });
    }

    return NextResponse.json({
      success: true,
      articlesCreated: createdArticles.length,
      articles: createdArticles,
    });
  } catch (error) {
    console.error("Auto news generation error:", error);
    return NextResponse.json(
      { error: "Auto news generation failed" },
      { status: 500 }
    );
  }
}
