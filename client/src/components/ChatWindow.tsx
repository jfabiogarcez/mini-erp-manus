import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Phone, Info } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Mensagem {
  id: number;
  conversaId: number;
  remetente: "Cliente" | "Sistema" | "Agente" | string;
  mensagem: string;
  tipo: string;
  dataEnvio: Date | string;
  lida: number;
  statusEnvio?: "Pendente" | "Processando" | "Enviado" | "Falhou";
}

export interface Conversa {
  id: number;
  numeroCliente: string;
  nomeCliente: string | null;
  ultimaMensagem: string | null;
  dataUltimaMsg: Date | null;
  statusConversa: "Ativa" | "Arquivada" | "Bloqueada";
}

interface ChatWindowProps {
  conversa: Conversa;
  mensagens: Mensagem[];
  isLoading?: boolean;
  onSendMessage?: (mensagem: string) => Promise<void>;
  onClose?: () => void;
}

export function ChatWindow({
  conversa,
  mensagens,
  isLoading = false,
  onSendMessage,
  onClose,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage?.(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Enviado":
        return "text-blue-500";
      case "Processando":
        return "text-yellow-500";
      case "Falhou":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getMessageAlignment = (remetente: string) => {
    return remetente === "Cliente" ? "justify-end" : "justify-start";
  };

  const getMessageBubbleColor = (remetente: string) => {
    switch (remetente) {
      case "Cliente":
        return "bg-blue-500 text-white rounded-lg rounded-br-none";
      case "Sistema":
        return "bg-green-500 text-white rounded-lg rounded-bl-none";
      case "Agente":
        return "bg-purple-500 text-white rounded-lg rounded-bl-none";
      default:
        return "bg-gray-200 text-gray-900 rounded-lg";
    }
  };

  const formatarHora = (data: Date | string | null) => {
    try {
      if (!data) return "agora";
      return formatDistanceToNow(new Date(data), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "agora";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="font-bold text-lg">{conversa.nomeCliente || "Cliente"}</h2>
          <p className="text-sm text-green-100">{conversa.numeroCliente}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
          >
            <Info className="w-5 h-5" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-green-700"
              onClick={onClose}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            {conversa.statusConversa === "Ativa" ? "Conversa Ativa" : conversa.statusConversa}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Última mensagem: {conversa.dataUltimaMsg ? formatarHora(conversa.dataUltimaMsg) : "nunca"}
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          <>
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${getMessageAlignment(msg.remetente)} gap-2`}
              >
                <div className="max-w-xs">
                  {/* Nome do remetente (apenas para Sistema/Agente) */}
                  {msg.remetente !== "Cliente" && (
                    <p className="text-xs text-gray-500 px-3 mb-1">
                      {msg.remetente}
                    </p>
                  )}

                  {/* Bubble de mensagem */}
                  <div
                    className={`${getMessageBubbleColor(msg.remetente)} px-4 py-2 break-words`}
                  >
                    <p className="text-sm">{msg.mensagem}</p>
                  </div>

                  {/* Timestamp e Status */}
                  <div className="flex items-center gap-1 px-3 mt-1 text-xs text-gray-500">
                    <span>{formatarHora(msg.dataEnvio)}</span>
                    {msg.statusEnvio && (
                      <StatusBadge status={msg.statusEnvio} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite uma mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
