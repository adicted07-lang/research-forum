import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/claude";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
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

    const questionPrompt = `Generate ${questionCount} unique market research questions for a professional Q&A forum. Each question should reflect a real challenge that market researchers face in their work, focused on specific industries.

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
[
  {
    "title": "Specific, detailed question title",
    "body": "Detailed question body (200-400 words) with context, specific challenges, and what kind of answers would be helpful. Use paragraphs separated by newlines.",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "Category Name",
    "researchDomain": "specific domain",
    "industry": "relevant industry"
  }
]

IMPORTANT — Each question MUST be about one of these industries (one per question):
${pickedIndustries.map((ind, i) => `Question ${i + 1}: ${ind}`).join("\n")}

Rules:
- Titles should be specific and practical, not generic (e.g., "How do you handle sample size calculation for conjoint studies in the automotive sector with 20+ attributes?" not "How to do surveys?")
- Body should demonstrate expertise: mention specific methodologies, tools, frameworks, or real scenarios relevant to the assigned industry
- Pick 3-5 tags from: ${QUESTION_TAGS.join(", ")}
- Pick category from: ${CATEGORIES.join(", ")}
- Each question should cover a different topic area within its assigned industry
- Write as if you are an experienced market researcher seeking peer advice
- Include specific numbers, tools, or scenarios to make it authentic
- The "industry" field must match the assigned industry exactly`;

    const questionResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
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

        const answerPrompt = `You are ${answerer.name}, an experienced market researcher with expertise in ${(answerer.expertise || []).join(", ")}. Write a detailed, expert answer (300-500 words) to this question on a professional market research Q&A forum.

Question Title: ${question.title}
Question Body: ${question.body}
Tags: ${question.tags.join(", ")}

Return ONLY valid JSON (no markdown, no code fences):
{
  "body": "Your detailed expert answer here. Use paragraphs separated by newlines. Demonstrate expertise by referencing specific methodologies, frameworks, tools, or real-world examples. Be genuinely helpful and practical."
}

Rules:
- Write in ${answerer.name}'s voice as an expert with ${answerer.expertise?.join(", ")} background
- Include specific methodologies, frameworks, or tools
- Provide actionable advice, not generic platitudes
- Reference real research concepts and best practices
- Structure the answer with clear paragraphs
- Be conversational but professional`;

        try {
          const answerResponse = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250514",
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
