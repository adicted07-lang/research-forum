"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { questionSchema } from "@/lib/validations/forum";
import { awardPoints, deductPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

const authorSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  companyName: true,
  companyLogo: true,
  role: true,
};

export async function createQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title"),
    body: formData.get("body"),
    tags: formData.getAll("tags"),
    category: formData.get("category") ?? "General Discussion",
    researchDomain: formData.get("researchDomain") as string | null,
    bounty: Number(formData.get("bounty") ?? 0),
  };

  const parsed = questionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const slug = generateSlug(parsed.data.title);
    const question = await db.question.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        slug,
        tags: parsed.data.tags,
        category: parsed.data.category,
        researchDomain: raw.researchDomain || null,
        bounty: parsed.data.bounty,
        authorId: session.user.id,
      },
    });
    awardPoints(session.user.id, POINTS.POST_QUESTION);
    if (parsed.data.bounty > 0) {
      deductPoints(session.user.id, parsed.data.bounty);
    }
    return { slug: question.slug };
  } catch (e) {
    return { error: "Failed to create question" };
  }
}

export async function getQuestions(opts: {
  category?: string;
  tag?: string;
  tags?: string[];
  researchDomain?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (opts.category) where.category = opts.category;
  if (opts.tag) where.tags = { has: opts.tag };
  if (opts.tags && opts.tags.length > 0) {
    where.tags = { hasSome: opts.tags };
  }
  if (opts.researchDomain) where.researchDomain = opts.researchDomain;
  if (opts.sort === "unanswered") where.answerCount = 0;

  let orderBy: Record<string, string> | Array<Record<string, string>>;
  switch (opts.sort) {
    case "trending":
      orderBy = { upvoteCount: "desc" };
      break;
    case "most_upvoted":
      orderBy = { upvoteCount: "desc" };
      break;
    case "unanswered":
      orderBy = { createdAt: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [questions, total] = await Promise.all([
      db.question.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { author: { select: authorSelect } },
      }),
      db.question.count({ where }),
    ]);

    return {
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { questions: [], totalPages: 1, currentPage: page };
  }
}

export async function getQuestionBySlug(slug: string) {
  try {
    const question = await db.question.findFirst({
      where: { slug, deletedAt: null },
      include: {
        author: { select: authorSelect },
        answers: {
          where: { deletedAt: null },
          orderBy: [{ isAccepted: "desc" }, { upvoteCount: "desc" }],
          include: { author: { select: authorSelect } },
        },
      },
    });
    return question;
  } catch {
    return null;
  }
}

export async function incrementViewCount(questionId: string) {
  try {
    await db.question.update({
      where: { id: questionId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Database not available
  }
}
