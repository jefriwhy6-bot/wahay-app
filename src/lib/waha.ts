interface WahaConfig {
  baseUrl: string;
  apiKey: string;
  sessionName: string;
}

interface WahaResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function wahaFetch<T>(
  config: WahaConfig,
  path: string,
  options?: RequestInit
): Promise<WahaResponse<T>> {
  try {
    const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": config.apiKey,
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return { success: false, error: `${res.status}: ${text}` };
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await res.json();
      return { success: true, data: data as T };
    }

    if (contentType?.includes("image/")) {
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = contentType.split(";")[0];
      return { success: true, data: `data:${mimeType};base64,${base64}` as T };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

export interface SessionStatus {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

export async function getSession(config: WahaConfig): Promise<WahaResponse<SessionStatus>> {
  return wahaFetch<SessionStatus>(config, `/api/sessions/${config.sessionName}`);
}

export async function startSession(config: WahaConfig): Promise<WahaResponse<SessionStatus>> {
  return wahaFetch<SessionStatus>(config, `/api/sessions/start`, {
    method: "POST",
    body: JSON.stringify({
      name: config.sessionName,
      config: {
        webhooks: [
          {
            url: "",
            events: ["message"],
          },
        ],
      },
    }),
  });
}

export async function stopSession(config: WahaConfig): Promise<WahaResponse<void>> {
  return wahaFetch(config, `/api/sessions/stop`, {
    method: "POST",
    body: JSON.stringify({ name: config.sessionName }),
  });
}

export async function getQR(config: WahaConfig): Promise<WahaResponse<string>> {
  return wahaFetch<string>(config, `/api/${config.sessionName}/auth/qr`, {
    headers: { Accept: "image/png" },
  });
}

export async function sendText(
  config: WahaConfig,
  chatId: string,
  text: string
): Promise<WahaResponse<{ id: string }>> {
  return wahaFetch(config, `/api/sendText`, {
    method: "POST",
    body: JSON.stringify({
      session: config.sessionName,
      chatId,
      text,
    }),
  });
}

export async function sendImage(
  config: WahaConfig,
  chatId: string,
  imageUrl: string,
  caption?: string
): Promise<WahaResponse<{ id: string }>> {
  return wahaFetch(config, `/api/sendImage`, {
    method: "POST",
    body: JSON.stringify({
      session: config.sessionName,
      chatId,
      file: { url: imageUrl },
      caption,
    }),
  });
}

export async function sendFile(
  config: WahaConfig,
  chatId: string,
  fileUrl: string,
  filename: string
): Promise<WahaResponse<{ id: string }>> {
  return wahaFetch(config, `/api/sendFile`, {
    method: "POST",
    body: JSON.stringify({
      session: config.sessionName,
      chatId,
      file: { url: fileUrl, filename },
    }),
  });
}

// ═══════════════════════════════════════
// WHATSAPP CATALOG
// ═══════════════════════════════════════

export interface WaCatalogProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  url?: string;
  isHidden?: boolean;
}

export async function getCatalogProducts(
  config: WahaConfig
): Promise<WahaResponse<WaCatalogProduct[]>> {
  return wahaFetch<WaCatalogProduct[]>(
    config,
    `/api/${config.sessionName}/business/catalog`
  );
}

export async function addCatalogProduct(
  config: WahaConfig,
  product: WaCatalogProduct
): Promise<WahaResponse<WaCatalogProduct>> {
  return wahaFetch<WaCatalogProduct>(
    config,
    `/api/${config.sessionName}/business/catalog`,
    {
      method: "POST",
      body: JSON.stringify(product),
    }
  );
}

export async function deleteCatalogProduct(
  config: WahaConfig,
  productId: string
): Promise<WahaResponse<void>> {
  return wahaFetch<void>(
    config,
    `/api/${config.sessionName}/business/catalog/${productId}`,
    { method: "DELETE" }
  );
}

export async function sendCatalogMessage(
  config: WahaConfig,
  chatId: string,
  productIds: string[],
  body?: string
): Promise<WahaResponse<{ id: string }>> {
  return wahaFetch(config, `/api/sendMessage`, {
    method: "POST",
    body: JSON.stringify({
      session: config.sessionName,
      chatId,
      type: "product",
      productMessage: {
        productIds,
        body: body || "",
      },
    }),
  });
}
