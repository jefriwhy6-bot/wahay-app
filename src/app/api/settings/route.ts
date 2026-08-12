import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [brand, ai, waha] = await Promise.all([
      prisma.brandProfile.findFirst(),
      prisma.aiConfig.findFirst(),
      prisma.wahaConfig.findFirst(),
    ]);

    return NextResponse.json({ brand, ai, waha });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (type === "brand") {
      const brand = await prisma.brandProfile.upsert({
        where: { id: data.id || "default-brand" },
        update: {
          businessName: data.businessName,
          description: data.description,
          tone: data.tone,
          languageDefault: data.languageDefault,
          operatingHours: data.operatingHours,
          signature: data.signature,
        },
        create: {
          id: "default-brand",
          businessName: data.businessName || "My Business",
          description: data.description,
          tone: data.tone || "friendly",
          languageDefault: data.languageDefault || "id",
          operatingHours: data.operatingHours,
          signature: data.signature,
        },
      });
      return NextResponse.json(brand);
    }

    if (type === "ai") {
      const ai = await prisma.aiConfig.upsert({
        where: { id: data.id || "default-ai" },
        update: {
          baseUrl: data.baseUrl,
          apiKey: data.apiKey,
          modelName: data.modelName,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          systemPrompt: data.systemPrompt,
        },
        create: {
          id: "default-ai",
          baseUrl: data.baseUrl || "https://api.openai.com/v1",
          apiKey: data.apiKey || "",
          modelName: data.modelName || "gpt-4o-mini",
          temperature: data.temperature || 0.7,
          maxTokens: data.maxTokens || 1024,
          systemPrompt: data.systemPrompt,
        },
      });
      return NextResponse.json(ai);
    }

    if (type === "waha") {
      const waha = await prisma.wahaConfig.upsert({
        where: { id: data.id || "default-waha" },
        update: {
          baseUrl: data.baseUrl,
          apiKey: data.apiKey,
          sessionName: data.sessionName,
        },
        create: {
          id: "default-waha",
          baseUrl: data.baseUrl || "http://localhost:3001",
          apiKey: data.apiKey || "",
          sessionName: data.sessionName || "default",
        },
      });
      return NextResponse.json(waha);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan settings" },
      { status: 500 }
    );
  }
}
