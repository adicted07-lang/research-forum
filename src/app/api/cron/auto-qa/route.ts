import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/claude";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAIL = "adicted07@gmail.com";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const QUESTION_TAGS = [
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
];

const CATEGORIES = [
  "Research Methodologies",
  "General Discussion",
  "Data Analysis",
  "Industry Trends",
];

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

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all seeded researchers (those with @researchhub.dev emails)
    const allResearchers = await db.user.findMany({
      where: {
        email: { endsWith: "@researchhub.dev" },
        role: "RESEARCHER",
        deletedAt: null,
      },
      select: { id: true, name: true, expertise: true },
    });

    if (allResearchers.length < 5) {
      return NextResponse.json(
        { error: "Not enough seeded researchers. Run seed-researchers first." },
        { status: 400 }
      );
    }

    // Shuffle and pick question authors (2-3)
    const shuffled = allResearchers.sort(() => Math.random() - 0.5);
    const questionCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const questionAuthors = shuffled.slice(0, questionCount);
    const remainingForAnswers = shuffled.slice(questionCount);

    // --- Generate Questions ---
    const pickedIndustries = INDUSTRIES.sort(() => Math.random() - 0.5).slice(0, questionCount);

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

    const questionResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: questionPrompt }],
    });

    const questionText =
      questionResponse.content.find((b: any) => b.type === "text");
    if (!questionText || !("text" in questionText)) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    let questions: Array<{
      title: string;
      body: string;
      tags: string[];
      category: string;
      researchDomain?: string;
      industry?: string;
    }>;

    try {
      const raw = questionText.text.replace(/```json\n?|```\n?/g, "").trim();
      questions = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse question JSON", raw: questionText.text },
        { status: 500 }
      );
    }

    // Create questions in the database
    const createdQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const author = questionAuthors[i % questionAuthors.length];
      const slug = generateSlug(q.title);

      const created = await db.question.create({
        data: {
          title: q.title,
          body: q.body,
          slug,
          tags: q.tags,
          category: q.category || "General Discussion",
          researchDomain: q.researchDomain || null,
          industry: q.industry || null,
          authorId: author.id,
        },
      });
      createdQuestions.push(created);
    }

    // --- Generate Answers for Unanswered Questions ---
    const unansweredQuestions = await db.question.findMany({
      where: {
        answerCount: 0,
        status: "OPEN",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, body: true, tags: true },
    });

    let answersCreated = 0;

    if (unansweredQuestions.length > 0 && remainingForAnswers.length > 0) {
      // Pick 3-4 answerers
      const answerCount = Math.min(
        3 + Math.floor(Math.random() * 2),
        remainingForAnswers.length
      );
      const answerers = remainingForAnswers.slice(0, answerCount);

      // For each unanswered question, generate an answer from a random researcher
      for (const question of unansweredQuestions.slice(0, answerCount)) {
        const answerer = answerers[answersCreated % answerers.length];

        const answerPrompt = `You are ${answerer.name}, a market researcher. Give a short, helpful reply to this forum question.

Question: ${question.title}
Context: ${question.body}

Return ONLY valid JSON (no markdown, no code fences):
{
  "body": "Your short answer here"
}

CRITICAL RULES:
- Keep it to 2-3 sentences MAX. Like a quick helpful reply on a forum.
- Sound like a real human having a conversation, not writing an essay.
- Be specific and practical — mention a tool, method, or number if relevant.
- NO long paragraphs. NO academic tone. Think Reddit/StackOverflow style.
- Example good answer: "We used MaxDiff for this last year in the packaging space. Worked well with 15 attributes and ~400 respondents. Happy to share the design if you want."
- Example bad answer: "In my extensive experience spanning multiple industries, I have found that the optimal approach involves carefully considering several methodological frameworks..."`;


        try {
          const answerResponse = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            messages: [{ role: "user", content: answerPrompt }],
          });

          const answerText = answerResponse.content.find(
            (b: any) => b.type === "text"
          );
          if (!answerText || !("text" in answerText)) continue;

          let answerData: { body: string };
          try {
            const raw = answerText.text
              .replace(/```json\n?|```\n?/g, "")
              .trim();
            answerData = JSON.parse(raw);
          } catch {
            continue;
          }

          await db.answer.create({
            data: {
              body: answerData.body,
              authorId: answerer.id,
              questionId: question.id,
            },
          });

          await db.question.update({
            where: { id: question.id },
            data: { answerCount: { increment: 1 } },
          });

          answersCreated++;
        } catch (err) {
          console.error(
            `Failed to generate answer for question ${question.id}:`,
            err
          );
        }
      }
    }

    // Send admin digest email
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";
    const questionsList = createdQuestions.map((q: any) =>
      `<li><a href="${baseUrl}/forum/${q.slug}">${q.title}</a></li>`
    ).join("");

    sendEmail({
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
    });

    return NextResponse.json({
      success: true,
      questionsCreated: createdQuestions.length,
      answersCreated,
    });
  } catch (error) {
    console.error("Auto Q&A generation error:", error);
    return NextResponse.json(
      { error: "Auto Q&A generation failed" },
      { status: 500 }
    );
  }
}
