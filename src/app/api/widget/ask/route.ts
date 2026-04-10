import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, body } = await request.json();
  if (!title || typeof title !== "string" || title.trim().length < 5) {
    return NextResponse.json({ error: "Title must be at least 5 characters" }, { status: 400 });
  }

  const slug = generateSlug(title) + "-" + Math.random().toString(36).slice(2, 8);

  const question = await db.question.create({
    data: {
      title: title.trim(),
      body: (body || "").trim(),
      slug,
      authorId: session.user.id,
      category: "General Discussion",
      tags: [],
    },
  });

  return NextResponse.json({ success: true, slug: question.slug }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
