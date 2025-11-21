import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChatWindow } from "@/components/ChatWindow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStatusUpdates } from "@/hooks/useWebSocket";

export default function WhatsappChat() {
  const [, setLocation] = useLocation();
  const [selectedConversaId, setSelectedConversaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar conversas
  const { data: conversas = [], isLoading: loadingConversas, refetch: refetchConversas } =
    trpc.whatsapp.conversas.list.useQuery();

  // Buscar mensagens
  const { data: allMensagens = [], refetch: refetchMensagens } =
    trpc.whatsapp.mensagens.list.useQuery();

  // Mutation para enviar mensagem
  const sendMessageMutation = trpc.whatsapp.mensagens.create.useMutation({
    onSuccess: () => {
      refetchMensagens();
      refetchConversas();
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    },
  });

  // WebSocket listeners
  useStatusUpdates((update) => {
    console.log("[WhatsappChat] Status atualizado:", update);
    refetchMensagens();
  });

  // Auto-refresh de conversas a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetchConversas();
      refetchMensagens();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchConversas, refetchMensagens]);

  const selectedConversa = conversas.find((c) => c.id === selectedConversaId);
  const selectedMensagens = selectedConversaId
    ? allMensagens.filter((m) => m.conversaId === selectedConversaId).sort((a, b) =>
        new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime()
      )
    : [];

  const filteredConversas = conversas.filter((c) =>
    (c.nomeCliente?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    c.numeroCliente.includes(searchTerm)
  );

  const handleSendMessage = async (mensagem: string) => {
    if (!selectedConversaId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversaId: selectedConversaId,
        remetente: "Sistema",
        mensagem,
        tipo: "Texto",
        dataEnvio: new Date(),
      });
      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <Button size="icon" variant="ghost">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Procurar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversas List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversas ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversas.map((conversa) => (
              <button
                key={conversa.id}
                onClick={() => setSelectedConversaId(conversa.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversaId === conversa.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversa.nomeCliente}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conversa.numeroCliente}
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversa.ultimaMensagem}
                    </p>
                  </div>
                  <div className="ml-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        conversa.statusConversa === "Ativa"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversa ? (
          <ChatWindow
            conversa={selectedConversa}
            mensagens={selectedMensagens}
            isLoading={loadingConversas}
            onSendMessage={handleSendMessage}
            onClose={() => setSelectedConversaId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <Card className="text-center">
              <CardHeader>
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <CardTitle>Selecione uma conversa</CardTitle>
                <CardDescription>
                  Clique em uma conversa na lista para começar a chatear
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
