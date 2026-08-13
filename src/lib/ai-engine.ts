import { prisma } from "@/lib/prisma";
import { semanticSearch } from "@/lib/embeddings";

interface AiResponse {
  reply: string;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export async function generateAiReply(
  customerMessage: string,
  _contactPhone: string
): Promise<AiResponse | null> {
  try {
    const aiConfig = await prisma.aiConfig.findFirst();
    if (!aiConfig || !aiConfig.apiKey) return null;

    const brandProfile = await prisma.brandProfile.findFirst();

    let relevantChunks = await semanticSearch(customerMessage, 5);
    if (relevantChunks.length === 0) {
      relevantChunks = await searchKnowledge(customerMessage);
    }

    const productInfo = await searchProducts(customerMessage);

    const systemPrompt = buildSystemPrompt(
      aiConfig.systemPrompt,
      brandProfile,
      relevantChunks,
      productInfo
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

async function searchProducts(query: string): Promise<string> {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 5);

  if (keywords.length === 0) return "";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: keywords.map((kw) => ({
        OR: [
          { name: { contains: kw, mode: "insensitive" as const } },
          { description: { contains: kw, mode: "insensitive" as const } },
        ],
      })),
    },
    take: 5,
    select: { name: true, description: true, price: true, stock: true, imageUrl: true },
  });

  if (products.length === 0) return "";

  let info = "\n\n--- KATALOG PRODUK ---\n";
  info += "Berikut produk yang relevan:\n\n";
  for (const p of products) {
    info += `• ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`;
    if (p.stock > 0) info += ` (stok: ${p.stock})`;
    else info += ` (HABIS)`;
    if (p.description) info += `\n  ${p.description}`;
    if (p.imageUrl) info += `\n  Foto: ${p.imageUrl}`;
    info += "\n\n";
  }
  info += "--- END KATALOG ---";
  info += "\n\nJika customer bertanya tentang produk, berikan info lengkap termasuk harga dan stok. Jika ada foto produk (URL), sertakan dalam jawaban dengan format: [Lihat foto: URL]";

  return info;
}

function buildSystemPrompt(
  customPrompt: string | null,
  brand: { businessName: string; description: string | null; tone: string; signature: string | null } | null,
  knowledgeChunks: string[],
  productInfo: string
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

  if (productInfo) {
    prompt += productInfo;
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
