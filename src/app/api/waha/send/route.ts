import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendText, sendImage, sendFile } from "@/lib/waha";

export async function POST(req: NextRequest) {
  try {
    const { to, type, content, caption } = await req.json();

    if (!to || !content) {
      return NextResponse.json({ error: "to dan content wajib diisi" }, { status: 400 });
    }

    const config = await prisma.wahaConfig.findFirst();
    if (!config || config.status !== "connected") {
      return NextResponse.json({ error: "WAHA belum terhubung" }, { status: 400 });
    }

    const chatId = to.includes("@") ? to : `${to}@c.us`;
    let result;

    switch (type) {
      case "image":
        result = await sendImage(config, chatId, content, caption);
        break;
      case "file":
        result = await sendFile(config, chatId, content, caption || "file");
        break;
      default:
        result = await sendText(config, chatId, content);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.data?.id });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
