import { prisma } from "@/lib/prisma";
import { semanticSearch } from "@/lib/embeddings";

interface AiResponse {
  reply: string;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export async function generateAiReply(
  customerMessage: string,
  contactPhone: string
): Promise<AiResponse | null> {
  try {
    const aiConfig = await prisma.aiConfig.findFirst();
    if (!aiConfig || !aiConfig.apiKey) return null;

    const brandProfile = await prisma.brandProfile.findFirst();

    let relevantChunks = await semanticSearch(customerMessage, 5);
    if (relevantChunks.length === 0) {
      relevantChunks = await searchKnowledge(customerMessage);
    }

    const systemPrompt = buildSystemPrompt(
      aiConfig.systemPrompt,
      brandProfile,
      relevantChunks
    );

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: customerMessage },
    ];

    const res = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.modelName,
        messages,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
      }),
    });

    if (!res.ok) {
      console.error("AI API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) return null;

    const sentiment = detectSentiment(customerMessage);

    return { reply, sentiment };
  } catch (err) {
    console.error("AI Engine error:", err);
    return null;
  }
}

async function searchKnowledge(query: string): Promise<string[]> {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  if (keywords.length === 0) return [];

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      OR: keywords.map((kw) => ({
        content: { contains: kw, mode: "insensitive" as const },
      })),
    },
    take: 5,
    select: { content: true },
  });

  return chunks.map((c) => c.content);
}

function buildSystemPrompt(
  customPrompt: string | null,
  brand: { businessName: string; description: string | null; tone: string; signature: string | null } | null,
  knowledgeChunks: string[]
): string {
  let prompt = customPrompt || "Kamu adalah asisten customer service yang membantu.";

  if (brand) {
    prompt += `\n\nKamu mewakili bisnis "${brand.businessName}".`;
    if (brand.description) prompt += ` ${brand.description}`;
    prompt += `\nGunakan nada bicara: ${brand.tone}.`;
    if (brand.signature) prompt += `\nAkhiri pesan dengan: ${brand.signature}`;
  }

  if (knowledgeChunks.length > 0) {
    prompt += "\n\n--- KNOWLEDGE BASE ---\n";
    prompt += "Gunakan informasi berikut untuk menjawab pertanyaan pelanggan:\n\n";
    prompt += knowledgeChunks.join("\n\n");
    prompt += "\n--- END KNOWLEDGE BASE ---";
    prompt += "\n\nJika pertanyaan tidak bisa dijawab dari knowledge base, jawab dengan jujur bahwa kamu tidak memiliki informasi tersebut.";
  }

  prompt += "\n\nJawab dalam Bahasa Indonesia, singkat dan jelas. Jangan melebihi 300 kata.";

  return prompt;
}

function detectSentiment(text: string): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
  const negativeWords = [
    "marah", "kecewa", "bodoh", "lambat", "buruk", "jelek", "parah",
    "kapok", "tipu", "bohong", "rugi", "komplain", "refund", "batal",
    "ga bisa", "gak bisa", "tidak bisa", "gagal", "payah",
  ];
  const positiveWords = [
    "bagus", "mantap", "terima kasih", "makasih", "puas", "senang",
    "baik", "cepat", "recommended", "top", "keren", "hebat", "suka",
  ];

  const lower = text.toLowerCase();
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;

  if (negCount > posCount) return "NEGATIVE";
  if (posCount > negCount) return "POSITIVE";
  return "NEUTRAL";
}

export { detectSentiment, searchKnowledge };
