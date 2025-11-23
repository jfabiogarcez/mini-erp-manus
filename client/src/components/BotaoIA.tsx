import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface BotaoIAProps {
  abaId?: number;
  rotaPagina: string;
  dadosContexto?: any; // Dados da aba atual para contexto
}

interface InstrucaoIA {
  id: number;
  nome: string;
  instrucao: string;
  parametros: string;
  ativo: boolean;
}

export default function BotaoIA({ abaId, rotaPagina, dadosContexto }: BotaoIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instrucoes, setInstrucoes] = useState<InstrucaoIA[]>([]);
  const [instrucaoSelecionada, setInstrucaoSelecionada] = useState<InstrucaoIA | null>(null);
  const [executando, setExecutando] = useState(false);

  // Estado para criar nova instrução
  const [novaInstrucao, setNovaInstrucao] = useState({
    nome: "",
    instrucao: "",
    parametros: "",
  });

  // Carregar instruções salvas
  useEffect(() => {
    const saved = localStorage.getItem(`instrucoes-ia-${rotaPagina}`);
    if (saved) {
      setInstrucoes(JSON.parse(saved));
    } else {
      // Instruções padrão
      setInstrucoes([
        {
          id: 1,
          nome: "Criar Orçamento",
          instrucao: "Crie um orçamento detalhado com base nos dados fornecidos e envie para {destinatario}",
          parametros: '{"destinatario": "email ou telefone"}',
          ativo: true,
        },
        {
          id: 2,
          nome: "Gerar Relatório",
          instrucao: "Gere um relatório completo dos dados desta aba e envie para {destinatario}",
          parametros: '{"destinatario": "email ou telefone"}',
          ativo: true,
        },
        {
          id: 3,
          nome: "Análise de Dados",
          instrucao: "Analise os dados e forneça insights e recomendações",
          parametros: "{}",
          ativo: true,
        },
      ]);
    }
  }, [rotaPagina]);

  // Salvar instruções
  const salvarInstrucoes = () => {
    localStorage.setItem(`instrucoes-ia-${rotaPagina}`, JSON.stringify(instrucoes));
    toast.success("Instruções salvas!");
  };

  const handleAdicionarInstrucao = () => {
    if (!novaInstrucao.nome || !novaInstrucao.instrucao) {
      toast.error("Preencha nome e instrução");
      return;
    }

    const instrucao: InstrucaoIA = {
      id: Date.now(),
      ...novaInstrucao,
      ativo: true,
    };

    setInstrucoes([...instrucoes, instrucao]);
    setNovaInstrucao({ nome: "", instrucao: "", parametros: "" });
    toast.success("Instrução adicionada!");
  };

  const handleRemoverInstrucao = (id: number) => {
    setInstrucoes(instrucoes.filter((i) => i.id !== id));
    toast.success("Instrução removida!");
  };

  const handleExecutarInstrucao = async (instrucao: InstrucaoIA) => {
    setExecutando(true);
    toast.info(`Executando: ${instrucao.nome}...`);

    try {
      // Parse dos parâmetros
      let parametros = {};
      try {
        parametros = JSON.parse(instrucao.parametros || "{}");
      } catch (e) {
        console.error("Erro ao parsear parâmetros:", e);
      }

      // TODO: Implementar chamada real para API da IA
      // Simulação
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular resposta
      const respostaSimulada = `Instrução "${instrucao.nome}" executada com sucesso!\n\nContexto da aba: ${rotaPagina}\nDados processados: ${JSON.stringify(dadosContexto || {}).substring(0, 100)}...`;

      toast.success("Instrução executada com sucesso!");
      
      // Se tiver destinatário, simular envio
      if (parametros && (parametros as any).destinatario) {
        setTimeout(() => {
          toast.success(`Resultado enviado para ${(parametros as any).destinatario}`);
        }, 1000);
      }

      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao executar instrução");
      console.error(error);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Automação com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de Instruções */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Instruções Disponíveis</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={salvarInstrucoes}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>

            <div className="space-y-2">
              {instrucoes.map((instrucao) => (
                <div
                  key={instrucao.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{instrucao.nome}</h4>
                        {instrucao.ativo && (
                          <Badge variant="default" className="text-xs">
                            Ativa
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{instrucao.instrucao}</p>
                      {instrucao.parametros && instrucao.parametros !== "{}" && (
                        <p className="text-xs text-gray-500">
                          Parâmetros: {instrucao.parametros}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleExecutarInstrucao(instrucao)}
                        disabled={executando}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverInstrucao(instrucao.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Nova Instrução */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Instrução
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="nomeInstrucao">Nome da Instrução *</Label>
                <Input
                  id="nomeInstrucao"
                  placeholder="Ex: Enviar Orçamento Automático"
                  value={novaInstrucao.nome}
                  onChange={(e) =>
                    setNovaInstrucao({ ...novaInstrucao, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="instrucaoTexto">Instrução para IA *</Label>
                <Textarea
                  id="instrucaoTexto"
                  placeholder="Ex: Faça um orçamento detalhado com base nos dados da aba e envie para {destinatario}"
                  value={novaInstrucao.instrucao}
                  onChange={(e) =>
                    setNovaInstrucao({ ...novaInstrucao, instrucao: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {"{variavel}"} para parâmetros dinâmicos
                </p>
              </div>

              <div>
                <Label htmlFor="parametros">Parâmetros (JSON)</Label>
                <Textarea
                  id="parametros"
                  placeholder='{"destinatario": "email ou telefone", "formato": "pdf"}'
                  value={novaInstrucao.parametros}
                  onChange={(e) =>
                    setNovaInstrucao({ ...novaInstrucao, parametros: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <Button onClick={handleAdicionarInstrucao} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Instrução
              </Button>
            </div>
          </div>

          {/* Exemplos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Exemplos de Instruções:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• "Faça um orçamento e envie para {"{email}"}"</li>
              <li>• "Analise os dados e gere um relatório em PDF"</li>
              <li>• "Envie lembrete de pagamento para {"{telefone}"} via WhatsApp"</li>
              <li>• "Categorize automaticamente os registros por tipo"</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
