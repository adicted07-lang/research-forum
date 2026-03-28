import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL || "");
    const result = await sql`SELECT 1 as ping`;
    return NextResponse.json({ status: "alive", timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error?.message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
