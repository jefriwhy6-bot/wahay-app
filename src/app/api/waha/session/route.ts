import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, startSession, stopSession, getQR } from "@/lib/waha";

export async function GET() {
  try {
    const config = await prisma.wahaConfig.findFirst();
    if (!config || !config.baseUrl) {
      return NextResponse.json({ connected: false, error: "WAHA belum dikonfigurasi" });
    }

    const sessionRes = await getSession(config);

    if (!sessionRes.success) {
      await prisma.wahaConfig.update({
        where: { id: config.id },
        data: { status: "disconnected" },
      });
      return NextResponse.json({ connected: false, status: "STOPPED", error: sessionRes.error });
    }

    const status = sessionRes.data?.status || "UNKNOWN";
    const isConnected = status === "WORKING";

    if (status === "SCAN_QR_CODE") {
      const qrRes = await getQR(config);
      const qrCode = qrRes.success ? (qrRes.data as string) : null;
      await prisma.wahaConfig.update({
        where: { id: config.id },
        data: { status: "scan_qr" },
      });
      return NextResponse.json({ connected: false, status, qrCode });
    }

    await prisma.wahaConfig.update({
      where: { id: config.id },
      data: { status: isConnected ? "connected" : "disconnected" },
    });

    return NextResponse.json({
      connected: isConnected,
      status,
      me: sessionRes.data?.me,
    });
  } catch {
    return NextResponse.json({ connected: false, error: "Gagal cek status" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const config = await prisma.wahaConfig.findFirst();
    if (!config || !config.baseUrl) {
      return NextResponse.json({ error: "WAHA belum dikonfigurasi" }, { status: 400 });
    }

    const res = await startSession(config);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: res.data?.status });
  } catch {
    return NextResponse.json({ error: "Gagal start session" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const config = await prisma.wahaConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 400 });
    }

    await stopSession(config);
    await prisma.wahaConfig.update({
      where: { id: config.id },
      data: { status: "disconnected" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal stop session" }, { status: 500 });
  }
}
