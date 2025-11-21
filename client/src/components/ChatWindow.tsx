import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Upload, Search, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface Mensagem {
  id: number;
  conversaId: number;
  remetente: "Cliente" | "Sistema" | "Agente" | string;
  mensagem: string;
  tipo: "Texto" | "Imagem" | "Documento";
  dataEnvio: Date | string;
  lida: number;
  statusEnvio?: "Pendente" | "Processando" | "Enviado" | "Falhou";
  urlArquivo?: string;
}

interface ChatWindowProps {
  mensagens: Mensagem[];
  onSendMessage?: (mensagem: string, arquivo?: File) => Promise<void>;
  onSearch?: (termo: string) => void;
}

export function ChatWindow({
  mensagens,
  onSendMessage,
  onSearch,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máximo 10MB)");
      return;
    }

    setSelectedFile(file);

    // Preview para imagens
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    setIsSending(true);
    try {
      await onSendMessage?.(inputValue, selectedFile || undefined);
      setInputValue("");
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleSearch = (termo: string) => {
    setSearchValue(termo);
    onSearch?.(termo);
  };

  const filteredMensagens = searchValue
    ? mensagens.filter((msg) =>
        msg.mensagem.toLowerCase().includes(searchValue.toLowerCase())
      )
    : mensagens;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header com Busca */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Chat WhatsApp</h2>
        <div className="flex-1 mx-4 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
          <Input
            placeholder="Buscar mensagens..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      {/* Contador de Resultados */}
      {searchValue && (
        <div className="px-4 py-2 bg-gray-100 text-sm text-gray-600">
          {filteredMensagens.length} resultado(s) encontrado(s)
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {filteredMensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>
              {searchValue
                ? "Nenhuma mensagem encontrada"
                : "Nenhuma mensagem ainda"}
            </p>
          </div>
        ) : (
          <>
            {filteredMensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.remetente === "Cliente" ? "justify-end" : "justify-start"
                } gap-2`}
              >
                <div className="max-w-xs">
                  {/* Conteúdo da Mensagem */}
                  {msg.tipo === "Texto" ? (
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.remetente === "Cliente"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.mensagem}</p>
                    </div>
                  ) : msg.tipo === "Imagem" ? (
                    <div className="max-w-xs rounded-lg overflow-hidden">
                      <img
                        src={msg.urlArquivo}
                        alt="Imagem"
                        className="max-w-xs rounded-lg"
                      />
                      {msg.mensagem && (
                        <p className="text-sm text-gray-600 mt-1">
                          {msg.mensagem}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                        msg.remetente === "Cliente"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-semibold">Documento</p>
                        <p className="text-xs">{msg.mensagem}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-gray-500 mt-1 px-3">
                    {new Date(msg.dataEnvio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Preview de Arquivo */}
      {previewUrl && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-16 w-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile?.size || 0) / 1024 < 1024
                  ? `${((selectedFile?.size || 0) / 1024).toFixed(1)} KB`
                  : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB`}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-2">
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isSending || (!inputValue.trim() && !selectedFile)}
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
