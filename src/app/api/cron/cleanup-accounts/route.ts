import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredUsers = await db.user.findMany({
      where: {
        deletedAt: { not: null, lt: thirtyDaysAgo },
      },
      select: { id: true },
    });

    let deleted = 0;
    for (const user of expiredUsers) {
      await db.user.delete({ where: { id: user.id } });
      deleted++;
    }

    return NextResponse.json({ success: true, deletedCount: deleted });
  } catch (error) {
    console.error("Account cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
