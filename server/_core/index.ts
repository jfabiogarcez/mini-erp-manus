import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Iniciar processador de fila de mensagens
  const { iniciarProcessadorFila } = await import("../queueMemory");
  try {
    await iniciarProcessadorFila();
  } catch (error) {
    console.warn("[Queue] Aviso: Não foi possível iniciar fila", error);
  }

  const app = express();
  const server = createServer(app);

  // Inicializar WebSocket
  const { initializeWebSocket } = await import("../websocket");
  initializeWebSocket(server);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Webhook para integração com Manus
  const webhookRouter = await import("../webhook");
  app.use("/api/webhook", webhookRouter.default);
  // Webhook para Twilio WhatsApp
  app.post("/api/whatsapp/webhook", express.urlencoded({ extended: false }), async (req, res) => {
    try {
      const { processarWebhookTwilio } = await import("../whatsappTwilio");
      const resposta = await processarWebhookTwilio(req.body);
      res.type("text/xml");
      res.send(resposta);
    } catch (error) {
      console.error("Erro no webhook Twilio:", error);
      res.type("text/xml");
      res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Erro ao processar mensagem</Message></Response>`);
    }
  });
  // Upload de arquivos
  const uploadRouter = await import("../upload");
  app.use("/api", uploadRouter.default);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`[Twilio] Webhook disponível em: http://localhost:${port}/api/whatsapp/webhook`);
    console.log(`[WebSocket] Disponível em: ws://localhost:${port}`);
  });
}

startServer().catch(console.error);

// Exportar funções para uso em outros módulos
export { emitMensagemStatusUpdate, emitMensagemCriada, emitConversaUpdate } from "../websocket";

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM recebido, encerrando...");
  const { pararProcessadorFila } = await import("../queueMemory");
  try {
    await pararProcessadorFila();
  } catch (error) {
    console.error("[Queue] Erro ao parar fila:", error);
  }
  const { getIO } = await import("../websocket");
  const io = getIO();
  if (io) {
    io.close();
    console.log("[WebSocket] Fechado");
  }
  process.exit(0);
});
