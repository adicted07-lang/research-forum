"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { answerSchema } from "@/lib/validations/forum";
import { sendEmail } from "@/lib/email";
import { newAnswerEmail } from "@/lib/email-templates";
import { awardPoints } from "@/server/actions/points";
import { POINTS } from "@/lib/points-config";

export async function createAnswer(questionId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = { body: formData.get("body") };
  const parsed = answerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const [answer, question] = await db.$transaction(async (tx) => {
      const created = await tx.answer.create({
        data: {
          body: parsed.data.body,
          authorId: session.user.id,
          questionId,
        },
      });
      const q = await tx.question.update({
        where: { id: questionId },
        data: { answerCount: { increment: 1 } },
        select: { title: true, authorId: true },
      });
      return [created, q];
    });

    awardPoints(session.user.id, POINTS.POST_ANSWER);

    // Fire-and-forget email to question author
    if (question.authorId !== session.user.id) {
      try {
        const questionAuthor = await db.user.findUnique({
          where: { id: question.authorId },
          select: { email: true },
        });
        if (questionAuthor?.email) {
          sendEmail({
            to: questionAuthor.email,
            subject: `New answer on your question: ${question.title}`,
            html: newAnswerEmail(question.title),
          });
        }
      } catch {
        // Email lookup failed — continue
      }
    }

    return { answer };
  } catch {
    return { error: "Failed to create answer" };
  }
}

export async function acceptAnswer(answerId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const answer = await db.answer.findUnique({
      where: { id: answerId },
      include: { question: { select: { id: true, authorId: true } } },
    });

    if (!answer) return { error: "Answer not found" };
    if (answer.question.authorId !== session.user.id) {
      return { error: "Only the question author can accept an answer" };
    }

    await db.$transaction(async (tx) => {
      // Unaccept previously accepted answer if any
      await tx.answer.updateMany({
        where: { questionId: answer.questionId, isAccepted: true },
        data: { isAccepted: false },
      });

      // Accept this answer
      await tx.answer.update({
        where: { id: answerId },
        data: { isAccepted: true },
      });

      // Set question status to ANSWERED
      await tx.question.update({
        where: { id: answer.question.id },
        data: { status: "ANSWERED" },
      });
    });

    awardPoints(answer.authorId, POINTS.ANSWER_ACCEPTED);

    return { success: true };
  } catch {
    return { error: "Failed to accept answer" };
  }
}
