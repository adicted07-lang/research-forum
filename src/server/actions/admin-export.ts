"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getExportCounts() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const [users, questions, articles] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.question.count({ where: { deletedAt: null } }),
    db.article.count({ where: { deletedAt: null } }),
  ]);
  return { users, questions, articles };
}
