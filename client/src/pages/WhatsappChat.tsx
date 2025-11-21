import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { QuickTemplates, type Template } from "@/components/QuickTemplates";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Search } from "lucide-react";
import { toast } from "sonner";

// Mock data - em produção virá do backend
const mockConversas = [
  {
    id: 1,
    numeroCliente: "+5511987654321",
    nomeCliente: "João Silva",
    ultimaMensagem: "Qual é o valor do frete?",
    dataUltimaMsg: new Date(),
    statusConversa: "Ativa" as const,
  },
  {
    id: 2,
    numeroCliente: "+5511912345678",
    nomeCliente: "Maria Santos",
    ultimaMensagem: "Obrigada pela ajuda!",
    dataUltimaMsg: new Date(Date.now() - 3600000),
    statusConversa: "Ativa" as const,
  },
];

const mockMensagens = [
  {
    id: 1,
    conversaId: 1,
    remetente: "Cliente" as const,
    mensagem: "Olá, gostaria de um orçamento",
    tipo: "Texto" as const,
    dataEnvio: new Date(Date.now() - 7200000),
    lida: 1,
    statusEnvio: "Enviado" as const,
  },
  {
    id: 2,
    conversaId: 1,
    remetente: "Sistema" as const,
    mensagem: "Claro! Qual é o seu CEP?",
    tipo: "Texto" as const,
    dataEnvio: new Date(Date.now() - 6900000),
    lida: 1,
    statusEnvio: "Enviado" as const,
  },
  {
    id: 3,
    conversaId: 1,
    remetente: "Cliente" as const,
    mensagem: "Qual é o valor do frete?",
    tipo: "Texto" as const,
    dataEnvio: new Date(Date.now() - 600000),
    lida: 1,
    statusEnvio: "Enviado" as const,
  },
];

const mockTemplates: Template[] = [
  {
    id: 1,
    titulo: "Saudação",
    conteudo: "Olá! Bem-vindo! Como posso ajudar?",
    categoria: "Saudação",
    vezesUsado: 45,
  },
  {
    id: 2,
    titulo: "Despedida",
    conteudo: "Obrigado por entrar em contato! Até logo!",
    categoria: "Despedida",
    vezesUsado: 32,
  },
  {
    id: 3,
    titulo: "Informação de Frete",
    conteudo: "Qual é o seu CEP para calcular o frete?",
    categoria: "Informação",
    vezesUsado: 28,
  },
  {
    id: 4,
    titulo: "Suporte Técnico",
    conteudo: "Estou aqui para ajudar com qualquer dúvida técnica!",
    categoria: "Suporte",
    vezesUsado: 15,
  },
];

export default function WhatsappChat() {
  const [selectedConversaId, setSelectedConversaId] = useState(1);
  const [mensagens, setMensagens] = useState(mockMensagens);
  const [templates, setTemplates] = useState(mockTemplates);

  const selectedConversa = mockConversas.find((c) => c.id === selectedConversaId);
  const selectedMensagens = mensagens.filter(
    (m) => m.conversaId === selectedConversaId
  );

  const handleSendMessage = async (
    mensagem: string,
    arquivo?: File
  ) => {
    // Simular envio
    const newMessage = {
      id: mensagens.length + 1,
      conversaId: selectedConversaId,
      remetente: "Sistema" as const,
      mensagem: arquivo ? `[Arquivo: ${arquivo.name}]` : mensagem,
      tipo: arquivo
        ? arquivo.type.startsWith("image/")
          ? ("Imagem" as const)
          : ("Documento" as const)
        : ("Texto" as const),
      dataEnvio: new Date(),
      lida: 1,
      statusEnvio: "Enviado" as const,
    };

    setMensagens([...mensagens, newMessage]);
  };

  const handleSelectTemplate = (template: Template) => {
    // Inserir template no input
    const event = new CustomEvent("insertTemplate", { detail: template.conteudo });
    window.dispatchEvent(event);
    toast.success(`Template "${template.titulo}" inserido!`);
  };

  const handleCreateTemplate = async (template: Omit<Template, "id">) => {
    const newTemplate = {
      ...template,
      id: templates.length + 1,
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDeleteTemplate = async (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleEditTemplate = async (
    id: number,
    template: Omit<Template, "id">
  ) => {
    setTemplates(
      templates.map((t) => (t.id === id ? { ...t, ...template } : t))
    );
  };

  const handleSearch = (termo: string) => {
    console.log("Buscando:", termo);
    // Em produção, filtrar mensagens no backend
  };

  return (
    <div className="flex h-screen bg-white gap-4 p-4">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Conversas */}
        <div className="flex-1 overflow-y-auto">
          {mockConversas.map((conversa) => (
            <button
              key={conversa.id}
              onClick={() => setSelectedConversaId(conversa.id)}
              className={`w-full p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                selectedConversaId === conversa.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  {conversa.nomeCliente.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {conversa.nomeCliente}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {conversa.ultimaMensagem}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col gap-4">
        {selectedConversa ? (
          <>
            {/* Chat */}
            <div className="flex-1 min-h-0">
              <ChatWindow
                mensagens={selectedMensagens}
                onSendMessage={handleSendMessage}
                onSearch={handleSearch}
              />
            </div>

            {/* Templates */}
            <div className="h-80">
              <QuickTemplates
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
                onCreateTemplate={handleCreateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onEditTemplate={handleEditTemplate}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
