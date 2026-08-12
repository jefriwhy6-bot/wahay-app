import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    console.log("Push subscription received:", JSON.stringify(subscription).slice(0, 100));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
