import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({ status: "ok", session: session ? "exists" : "null" });
  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error?.message?.slice(0, 300) }, { status: 500 });
  }
}
