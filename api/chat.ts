import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createChatResponse } from "../src/server/chat";
import { nodeRequestToWebRequest, sendWebResponse } from "../src/server/http";

export const config = {
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const request = await nodeRequestToWebRequest(req, req.body);
    const response = await createChatResponse(request);
    await sendWebResponse(res, response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 선생님을 불러오지 못했어요." });
  }
}
