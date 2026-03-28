import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await db.user.count();
    return NextResponse.json({ status: "alive", timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: "error", timestamp: new Date().toISOString() }, { status: 500 });
  }
}
