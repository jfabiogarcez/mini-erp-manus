import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

export interface WebSocketCallbacks {
  onMensagemStatusAtualizado?: (update: StatusUpdate) => void;
  onMensagemCriada?: (mensagem: any) => void;
  onConversaAtualizada?: (update: ConversaUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para gerenciar conexão WebSocket com o servidor
 */
export function useWebSocket(callbacks?: WebSocketCallbacks) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Conectar ao servidor WebSocket
  useEffect(() => {
    if (socketRef.current) return; // Já conectado

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socketUrl = `${protocol}//${window.location.host}`;

      const socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ["websocket", "polling"],
      });

      // Evento de conexão
      socket.on("connect", () => {
        console.log("[WebSocket] Conectado ao servidor");
        callbacks?.onConnect?.();
      });

      // Evento de desconexão
      socket.on("disconnect", () => {
        console.log("[WebSocket] Desconectado do servidor");
        callbacks?.onDisconnect?.();
      });

      // Evento de erro
      socket.on("connect_error", (error) => {
        console.error("[WebSocket] Erro de conexão:", error);
        callbacks?.onError?.(error as Error);
      });

      // Evento de atualização de status de mensagem
      socket.on("mensagem:statusAtualizado", (update: StatusUpdate) => {
        console.log("[WebSocket] Status atualizado:", update);
        callbacks?.onMensagemStatusAtualizado?.(update);
      });

      // Evento de nova mensagem
      socket.on("mensagem:criada", (mensagem: any) => {
        console.log("[WebSocket] Nova mensagem:", mensagem);
        callbacks?.onMensagemCriada?.(mensagem);
      });

      // Evento de atualização de conversa
      socket.on("conversa:atualizada", (update: ConversaUpdate) => {
        console.log("[WebSocket] Conversa atualizada:", update);
        callbacks?.onConversaAtualizada?.(update);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error("[WebSocket] Erro ao conectar:", error);
      callbacks?.onError?.(error as Error);
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [callbacks]);

  // Função para enviar ping
  const ping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("ping");
    }
  }, []);

  // Função para verificar se está conectado
  const isConnected = useCallback(() => {
    return socketRef.current?.connected ?? false;
  }, []);

  // Função para obter ID do socket
  const getSocketId = useCallback(() => {
    return socketRef.current?.id ?? null;
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    ping,
    getSocketId,
  };
}

/**
 * Hook para escutar atualizações de status de mensagens
 */
export function useStatusUpdates(
  onStatusUpdate: (update: StatusUpdate) => void
) {
  useWebSocket({
    onMensagemStatusAtualizado: onStatusUpdate,
  });
}

/**
 * Hook para escutar novas mensagens
 */
export function useMensagensListener(onMensagem: (mensagem: any) => void) {
  useWebSocket({
    onMensagemCriada: onMensagem,
  });
}

/**
 * Hook para escutar atualizações de conversas
 */
export function useConversasListener(
  onConversaUpdate: (update: ConversaUpdate) => void
) {
  useWebSocket({
    onConversaAtualizada: onConversaUpdate,
  });
}
