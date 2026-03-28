import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl.replace(/:[^@]+@/, ":***@");

  try {
    const count = await db.user.count();
    return NextResponse.json({
      status: "ok",
      userCount: count,
      dbUrl: masked,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error?.message?.slice(0, 200),
      dbUrl: masked,
    }, { status: 500 });
  }
}
