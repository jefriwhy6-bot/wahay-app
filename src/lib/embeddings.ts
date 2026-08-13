import { prisma } from "@/lib/prisma";

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const aiConfig = await prisma.aiConfig.findFirst();
  if (!aiConfig || !aiConfig.apiKey) return null;

  try {
    const res = await fetch(`${aiConfig.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    });

    if (!res.ok) {
      console.error("Embedding API error:", res.status);
      return null;
    }

    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Embedding generation error:", err);
    return null;
  }
}

export async function generateAndStoreEmbedding(chunkId: string, content: string) {
  const embedding = await generateEmbedding(content);
  if (!embedding) return;

  const vectorStr = `[${embedding.join(",")}]`;
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "KnowledgeChunk" SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      chunkId
    );
  } catch (err) {
    console.error("Store embedding error:", err);
  }
}

export async function semanticSearch(query: string, limit: number = 5): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return [];

  const vectorStr = `[${queryEmbedding.join(",")}]`;

  try {
    const results = await prisma.$queryRawUnsafe<{ content: string }[]>(
      `SELECT content FROM "KnowledgeChunk"
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      vectorStr,
      limit
    );

    return results.map((r) => r.content);
  } catch {
    return [];
  }
}
