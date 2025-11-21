import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export interface StatusUpdate {
  id: number;
  conversaId: number;
  statusEnvio: "Pendente" | "Processando" | "Enviado" | "Falhou";
  timestamp: Date;
}

export interface ConversaUpdate {
  id: number;
  statusConversa: "Ativa" | "Arquivada" | "Bloqueada";
  ultimaMensagem?: string;
  dataUltimaMsg?: Date;
}

/**
 * Inicializar Socket.io com o servidor HTTP
 */
export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Juntar cliente a sala de WhatsApp
    socket.join("whatsapp");

    // Escutar desconexão
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
    });

    // Escutar evento de teste
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  console.log("[WebSocket] Socket.io inicializado");
  return io;
}

/**
 * Emitir atualização de status de mensagem para todos os clientes
 */
export function emitMensagemStatusUpdate(update: StatusUpdate) {
  if (!io) {
    console.warn("[WebSocket] Socket.io não inicializado");
    return;
  }

  io.to("whatsapp").emit("mensagem:statusAtualizado", {
    id: update.id,
    conversaId: update.conversaId,
    statusEnvio: update.statusEnvio,
    timestamp: update.timestamp,
  });

  console.log(
    `[WebSocket] Status atualizado: mensagem ${update.id} -> ${update.statusEnvio}`
  );
}

/**
 * Emitir nova mensagem para todos os clientes
 */
export function emitMensagemCriada(mensagem: any) {
  if (!io) {
    console.warn("[WebSocket] Socket.io não inicializado");
    return;
  }

  io.to("whatsapp").emit("mensagem:criada", mensagem);
  console.log(`[WebSocket] Nova mensagem: ${mensagem.id}`);
}

/**
 * Emitir atualização de conversa
 */
export function emitConversaUpdate(update: ConversaUpdate) {
  if (!io) {
    console.warn("[WebSocket] Socket.io não inicializado");
    return;
  }

  io.to("whatsapp").emit("conversa:atualizada", {
    id: update.id,
    statusConversa: update.statusConversa,
    ultimaMensagem: update.ultimaMensagem,
    dataUltimaMsg: update.dataUltimaMsg,
  });

  console.log(
    `[WebSocket] Conversa atualizada: ${update.id} -> ${update.statusConversa}`
  );
}

/**
 * Obter instância do Socket.io
 */
export function getIO() {
  return io;
}

/**
 * Verificar se WebSocket está conectado
 */
export function isWebSocketReady() {
  return io !== null;
}

/**
 * Obter número de clientes conectados
 */
export function getConnectedClientsCount() {
  if (!io) return 0;
  return io.engine.clientsCount;
}
