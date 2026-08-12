import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { chunks: true } } },
    });
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

function chunkText(text: string, maxChunkSize = 500): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxChunkSize && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File wajib diupload" }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan .txt, .md, atau .csv" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const doc = await prisma.knowledgeDocument.create({
      data: {
        filename: file.name,
        fileUrl: "",
        status: "processing",
      },
    });

    const chunks = chunkText(text);

    await prisma.knowledgeChunk.createMany({
      data: chunks.map((content) => ({
        documentId: doc.id,
        content,
      })),
    });

    await prisma.knowledgeDocument.update({
      where: { id: doc.id },
      data: { status: "ready", chunkCount: chunks.length },
    });

    return NextResponse.json({
      id: doc.id,
      filename: file.name,
      chunkCount: chunks.length,
    }, { status: 201 });
  } catch (err) {
    console.error("Knowledge upload error:", err);
    return NextResponse.json({ error: "Gagal upload dokumen" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.knowledgeChunk.deleteMany({ where: { documentId: id } });
    await prisma.knowledgeDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
