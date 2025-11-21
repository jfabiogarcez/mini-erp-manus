import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { ChatWindow } from "@/components/ChatWindow";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageCircle, Search, Plus, MoreVertical, Phone, Video } from "lucide-react";
import { toast } from "sonner";
import { useStatusUpdates } from "@/hooks/useWebSocket";

export default function WhatsappChat() {
  const [selectedConversaId, setSelectedConversaId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("Tudo");

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

  // WebSocket listener
  useStatusUpdates((update) => {
    refetchMensagens();
  });

  // Auto-refresh
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

  // Filtrar conversas
  let filteredConversas = conversas.filter((c) =>
    (c.nomeCliente?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    c.numeroCliente.includes(searchTerm)
  );

  if (filterTab === "Não lidas") {
    filteredConversas = filteredConversas.filter((c) => c.statusConversa === "Ativa");
  } else if (filterTab === "Favoritos") {
    // TODO: Implementar favoritos
    filteredConversas = [];
  } else if (filterTab === "Grupos") {
    // TODO: Implementar grupos
    filteredConversas = [];
  }

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
    <div className="flex h-screen bg-white">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Plus className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar ou começar uma nova conversa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-full"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 pt-3 pb-2">
          <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
              <TabsTrigger
                value="Tudo"
                className="rounded-full bg-gray-200 text-gray-700 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-900"
              >
                Tudo
              </TabsTrigger>
              <TabsTrigger
                value="Não lidas"
                className="rounded-full bg-gray-200 text-gray-700 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-900"
              >
                Não lidas
              </TabsTrigger>
              <TabsTrigger
                value="Favoritos"
                className="rounded-full bg-gray-200 text-gray-700 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-900"
              >
                Favoritos
              </TabsTrigger>
              <TabsTrigger
                value="Grupos"
                className="rounded-full bg-gray-200 text-gray-700 data-[state=active]:bg-gray-300 data-[state=active]:text-gray-900"
              >
                Grupos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notificação */}
        {filterTab === "Não lidas" && (
          <div className="mx-4 mt-3 p-3 bg-gray-100 rounded-lg flex items-start gap-2">
            <MessageCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                As notificações de mensagens estão desativadas.
              </p>
              <button className="text-sm text-green-500 font-semibold">Ativar</button>
            </div>
          </div>
        )}

        {/* Conversas List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversas ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredConversas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversas.map((conversa) => (
              <button
                key={conversa.id}
                onClick={() => setSelectedConversaId(conversa.id)}
                className={`w-full p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 ${
                  selectedConversaId === conversa.id ? "bg-gray-100" : ""
                }`}
              >
                <Avatar nome={conversa.nomeCliente} numero={conversa.numeroCliente} tamanho="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversa.nomeCliente || conversa.numeroCliente}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {conversa.dataUltimaMsg
                        ? new Date(conversa.dataUltimaMsg).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversa.ultimaMensagem || "Sem mensagens"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversa ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar nome={selectedConversa.nomeCliente} numero={selectedConversa.numeroCliente} tamanho="lg" />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversa.nomeCliente || selectedConversa.numeroCliente}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversa.statusConversa === "Ativa" ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Video className="w-5 h-5 text-gray-600" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {selectedMensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                </div>
              ) : (
                selectedMensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remetente === "Cliente" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.remetente === "Cliente"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.mensagem}</p>
                      <p className={`text-xs mt-1 ${msg.remetente === "Cliente" ? "text-blue-100" : "text-gray-500"}`}>
                        {new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex items-center gap-2">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Plus className="w-5 h-5 text-gray-600" />
              </Button>
              <Input
                placeholder="Digite uma mensagem..."
                className="flex-1 rounded-full border-gray-300"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button size="icon" variant="ghost" className="rounded-full">
                <span className="text-gray-600">😊</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">Selecione uma conversa</p>
              <p className="text-gray-400 text-sm">Clique em uma conversa na lista para começar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
