import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type } = await params;

  let csv = "";

  if (type === "users") {
    const users = await db.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        points: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,email,name,username,role,points,createdAt\n";
    csv += users
      .map(
        (u) =>
          `${u.id},${u.email},${u.name ?? ""},${u.username ?? ""},${u.role},${u.points},${u.createdAt.toISOString()}`
      )
      .join("\n");
  } else if (type === "questions") {
    const questions = await db.question.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        upvoteCount: true,
        answerCount: true,
        viewCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,title,slug,category,upvotes,answers,views,createdAt\n";
    csv += questions
      .map(
        (q) =>
          `${q.id},"${q.title.replace(/"/g, '""')}",${q.slug},${q.category},${q.upvoteCount},${q.answerCount},${q.viewCount},${q.createdAt.toISOString()}`
      )
      .join("\n");
  } else if (type === "articles") {
    const articles = await db.article.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        upvoteCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,title,slug,status,category,upvotes,createdAt\n";
    csv += articles
      .map(
        (a) =>
          `${a.id},"${a.title.replace(/"/g, '""')}",${a.slug},${a.status},${a.category},${a.upvoteCount},${a.createdAt.toISOString()}`
      )
      .join("\n");
  } else {
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
