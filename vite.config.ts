import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { createChatResponse } from "./src/server/chat";
import { nodeRequestToWebRequest, sendWebResponse } from "./src/server/http";

function localChatApi(): Plugin {
  return {
    name: "local-chat-api",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const request = await nodeRequestToWebRequest(req);
          const response = await createChatResponse(request);
          await sendWebResponse(res, response);
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "AI 선생님을 불러오지 못했어요." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    root: process.cwd(),
    plugins: [react(), localChatApi()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
    },
  };
});
