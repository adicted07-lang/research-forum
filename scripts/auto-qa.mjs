import Anthropic from "@anthropic-ai/sdk";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ADMIN_EMAIL = "adicted07@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

const QUESTION_TAGS = [
  "market-research", "consumer-behavior", "survey-design", "competitive-analysis",
  "brand-strategy", "UX-research", "data-analytics", "focus-groups",
  "market-segmentation", "pricing-research", "product-research", "customer-experience",
  "ethnographic-research", "conjoint-analysis", "trend-analysis",
];

const CATEGORIES = [
  "Research Methodologies", "General Discussion", "Data Analysis", "Industry Trends",
];

const INDUSTRIES = [
  "Transport and Logistics", "Aerospace and Defence", "Packaging",
  "Automotive", "Agriculture", "Machinery and Equipment",
  "Energy and Power", "Consumer Goods", "Chemical and Material",
  "Healthcare", "Food and Beverages", "Semiconductor and Electronic", "ICT",
];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function main() {
  console.log("Starting auto Q&A generation...");

  // Get all seeded researchers
  const allResearchers = await sql`
    SELECT id, name, expertise FROM users
    WHERE email LIKE '%@researchhub.dev'
    AND role = 'RESEARCHER'
    AND "deletedAt" IS NULL
  `;

  if (allResearchers.length < 5) {
    console.error("Not enough seeded researchers. Run seed-researchers first.");
    process.exit(1);
  }

  // Shuffle and pick question authors (2-3)
  const shuffled = allResearchers.sort(() => Math.random() - 0.5);
  const questionCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
  const questionAuthors = shuffled.slice(0, questionCount);
  const remainingForAnswers = shuffled.slice(questionCount);

  const pickedIndustries = INDUSTRIES.sort(() => Math.random() - 0.5).slice(0, questionCount);

  // --- Generate Questions ---
  const questionPrompt = `Generate ${questionCount} short, natural market research questions for a Q&A forum. These should sound like a real person typing a quick question — NOT an academic paper.

Return ONLY valid JSON (no markdown, no code fences):
[
  {
    "title": "Short question in sentence case (like a real person would ask)",
    "body": "1-2 sentences of context. Keep it casual and brief.",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "Category Name",
    "researchDomain": "specific domain",
    "industry": "relevant industry"
  }
]

Industries (one per question):
${pickedIndustries.map((ind, i) => `Question ${i + 1}: ${ind}`).join("\n")}

CRITICAL RULES:
- Title: sentence case (only first word capitalized), max 15 words, sounds like a real person asking a colleague. Examples: "What's the best way to size the EV battery market?", "Anyone done conjoint analysis for food packaging recently?"
- Body: 1-2 short sentences max. Just enough context. Like a Slack message, not an essay.
- NO title case (don't capitalize every word)
- NO academic language. Write like a human, not a textbook.
- Tags from: ${QUESTION_TAGS.join(", ")}
- Category from: ${CATEGORIES.join(", ")}`;

  console.log("Generating questions...");
  const questionResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: questionPrompt }],
  });

  const questionText = questionResponse.content.find((b) => b.type === "text");
  if (!questionText || !questionText.text) {
    console.error("Failed to generate questions");
    process.exit(1);
  }

  let questions;
  try {
    const raw = questionText.text.replace(/```json\n?|```\n?/g, "").trim();
    questions = JSON.parse(raw);
  } catch {
    console.error("Failed to parse question JSON:", questionText.text.slice(0, 200));
    process.exit(1);
  }

  // Create questions in DB
  const createdQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const author = questionAuthors[i % questionAuthors.length];
    const slug = generateSlug(q.title);
    const id = `cron_q_${Date.now()}_${i}`;

    await sql`
      INSERT INTO questions (id, title, body, slug, tags, category, "researchDomain", industry, "authorId", "answerCount", "upvoteCount", status, "createdAt", "updatedAt")
      VALUES (${id}, ${q.title}, ${q.body}, ${slug}, ${q.tags}, ${q.category || "General Discussion"}, ${q.researchDomain || null}, ${q.industry || null}, ${author.id}, 0, 0, 'OPEN', NOW(), NOW())
    `;

    createdQuestions.push({ id, title: q.title, slug, body: q.body, tags: q.tags });
    console.log(`  Question: "${q.title}" by ${author.name}`);
  }

  // Fetch and append Semantic Scholar papers to each question
  console.log("Adding academic references to questions...");
  for (let idx = 0; idx < createdQuestions.length; idx++) {
    const q = createdQuestions[idx];
    if (idx > 0) await new Promise(r => setTimeout(r, 1500)); // Rate limit: 1 req/sec
    try {
      const searchQuery = encodeURIComponent(q.title.slice(0, 100));
      const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${searchQuery}&limit=2&fields=title,authors,year,citationCount,url`,
        { headers: { "User-Agent": "TheIntellectualExchange/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const papers = (data.data || []).filter(p => p.title && p.url);

      if (papers.length > 0) {
        const papersHtml = papers.map(p => {
          const authors = (p.authors || []).slice(0, 2).map(a => a.name).join(", ");
          return `<li><a href="${p.url}" target="_blank" rel="noopener">${p.title}</a> — ${authors}${p.year ? ` (${p.year})` : ""}</li>`;
        }).join("");

        const currentQ = await sql`SELECT body FROM questions WHERE id = ${q.id}`;
        const currentBody = currentQ[0].body;
        const updatedBody = currentBody + `\n\n<p><strong>Related papers:</strong></p><ul>${papersHtml}</ul>`;
        await sql`UPDATE questions SET body = ${updatedBody} WHERE id = ${q.id}`;
        console.log(`  Added ${papers.length} papers to "${q.title}"`);
      }
    } catch (err) {
      console.error(`  Failed to fetch papers for "${q.title}":`, err.message);
    }
  }

  // Add SEO internal links to each created question
  console.log("Adding internal links to questions...");
  for (const q of createdQuestions) {
    const relatedArticles = await sql`
      SELECT title, slug FROM articles
      WHERE tags && ${q.tags}
      AND status = 'PUBLISHED'
      AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC LIMIT 2
    `;
    if (relatedArticles.length > 0) {
      const linksHtml = relatedArticles.map(a =>
        `<li><a href="/news/${a.slug}">${a.title}</a></li>`
      ).join('');
      const updatedBody = q.body + `\n\n<p><strong>Related reading:</strong></p><ul>${linksHtml}</ul>`;
      await sql`UPDATE questions SET body = ${updatedBody} WHERE id = ${q.id}`;
      console.log(`  Linked ${relatedArticles.length} articles to "${q.title}"`);
    }
  }

  // --- Generate Answers for Unanswered Questions ---
  const unansweredQuestions = await sql`
    SELECT id, title, body, tags FROM questions
    WHERE "answerCount" = 0
    AND status = 'OPEN'
    AND "deletedAt" IS NULL
    ORDER BY "createdAt" DESC
    LIMIT 5
  `;

  let answersCreated = 0;

  if (unansweredQuestions.length > 0 && remainingForAnswers.length > 0) {
    const answerCount = Math.min(
      3 + Math.floor(Math.random() * 2),
      remainingForAnswers.length
    );
    const answerers = remainingForAnswers.slice(0, answerCount);

    for (const question of unansweredQuestions.slice(0, answerCount)) {
      const answerer = answerers[answersCreated % answerers.length];

      const cleanBody = question.body.replace(/<[^>]*>/g, "").replace(/Related reading:.*$/s, "").replace(/Related papers:.*$/s, "").trim();
      const answerPrompt = `You are ${answerer.name}, a market researcher. Give a short, helpful reply to this forum question.

Question: ${question.title}
Context: ${cleanBody}

Return ONLY valid JSON (no markdown, no code fences):
{
  "body": "Your short answer here"
}

CRITICAL RULES:
- Keep it to 2-3 sentences MAX. Like a quick helpful reply on a forum.
- Sound like a real human having a conversation, not writing an essay.
- Be specific and practical — mention a tool, method, or number if relevant.
- NO long paragraphs. NO academic tone. Think Reddit/StackOverflow style.
- Example good answer: "We used MaxDiff for this last year in the packaging space. Worked well with 15 attributes and ~400 respondents. Happy to share the design if you want."`;

      try {
        console.log(`  Generating answer for: "${question.title}"...`);
        const answerResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          messages: [{ role: "user", content: answerPrompt }],
        });

        const answerText = answerResponse.content.find((b) => b.type === "text");
        if (!answerText || !answerText.text) continue;

        let answerData;
        try {
          const raw = answerText.text.replace(/```json\n?|```\n?/g, "").trim();
          answerData = JSON.parse(raw);
        } catch {
          continue;
        }

        const answerId = `cron_a_${Date.now()}_${answersCreated}`;

        await sql`
          INSERT INTO answers (id, body, "authorId", "questionId", "upvoteCount", "createdAt", "updatedAt")
          VALUES (${answerId}, ${answerData.body}, ${answerer.id}, ${question.id}, 0, NOW(), NOW())
        `;

        await sql`
          UPDATE questions SET "answerCount" = "answerCount" + 1, "updatedAt" = NOW()
          WHERE id = ${question.id}
        `;

        answersCreated++;
        console.log(`  Answer by ${answerer.name}`);
      } catch (err) {
        console.error(`  Failed to generate answer for question ${question.id}:`, err.message);
      }
    }
  }

  // Send admin email via Resend
  if (process.env.RESEND_API_KEY) {
    const questionsList = createdQuestions.map(q =>
      `<li><a href="${BASE_URL}/forum/${q.slug}">${q.title}</a></li>`
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
        subject: `Forum update: ${createdQuestions.length} new questions, ${answersCreated} new answers`,
        html: `
          <h2>Daily Forum Update</h2>
          <h3>New Questions (${createdQuestions.length})</h3>
          <ul>${questionsList}</ul>
          <h3>New Answers</h3>
          <p>${answersCreated} expert answers posted on existing questions.</p>
          <p style="color:#888;font-size:12px;">— The Intellectual Exchange Auto-Content System</p>
        `,
      }),
    });
  }

  console.log(`Done! Created ${createdQuestions.length} questions and ${answersCreated} answers.`);
}

main().catch((err) => {
  console.error("Auto Q&A generation failed:", err);
  process.exit(1);
});
