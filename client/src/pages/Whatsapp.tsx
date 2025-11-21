import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Settings, FileText, MessageSquare, BarChart3, Upload } from "lucide-react";
import { toast } from "sonner";

export default function Whatsapp() {
  const [activeTab, setActiveTab] = useState("configuracao");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [templates, setTemplates] = useState<Array<{ id: number; titulo: string; conteudo: string }>>([
    { id: 1, titulo: "Boas-vindas", conteudo: "Olá! Bem-vindo à Transblindados. Como posso ajudá-lo?" },
    { id: 2, titulo: "Horário de funcionamento", conteudo: "Funcionamos de segunda a domingo, das 6h às 22h." },
    { id: 3, titulo: "Serviços disponíveis", conteudo: "Oferecemos: Transporte Executivo, Segurança Pessoal, Receptivo de Aeroporto, Escolta Armada, Transporte para Eventos e Consultoria de Segurança." },
  ]);

  const handleEnviarMensagem = async () => {
    if (!telefone || !mensagem) {
      toast.error("Preencha telefone e mensagem");
      return;
    }
    toast.success("Mensagem enviada com sucesso!");
    setTelefone("");
    setMensagem("");
  };

  const handleUploadDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentos([...documentos, ...Array.from(e.target.files)]);
      toast.success(`${e.target.files.length} arquivo(s) adicionado(s)`);
    }
  };

  const handleAdicionarTemplate = () => {
    const novoTemplate = {
      id: Math.max(...templates.map(t => t.id), 0) + 1,
      titulo: "Novo Template",
      conteudo: "",
    };
    setTemplates([...templates, novoTemplate]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">WhatsApp Inteligente</h1>
          </div>
          <p className="text-gray-500">Gerencie conversas com clientes e motoristas via WhatsApp com IA</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="configuracao" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuração</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="conversas" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Conversas</span>
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Configuração */}
          <TabsContent value="configuracao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Twilio</CardTitle>
                <CardDescription>Credenciais e configurações da integração WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Account SID</label>
                    <Input placeholder="AC..." disabled value="●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auth Token</label>
                    <Input placeholder="Token" disabled value="●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Número WhatsApp</label>
                    <Input placeholder="+55 11 97263-2473" disabled value="+55 11 97263-2473" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status da Conexão</label>
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Conectado</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Teste de Conexão</h3>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Número para teste (+55 11 ...)" 
                      className="flex-1"
                    />
                    <Button>Enviar Teste</Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Webhook URL:</strong> https://seu-dominio.com/api/trpc/whatsapp.webhook
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Configure esta URL no painel do Twilio para receber mensagens
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enviar Mensagem Manual */}
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem Manual</CardTitle>
                <CardDescription>Envie mensagens diretas para clientes ou motoristas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Telefone (+55 11 ...)" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
                <Textarea 
                  placeholder="Mensagem..." 
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
                <Button onClick={handleEnviarMensagem} className="w-full">
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Documentos */}
          <TabsContent value="documentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos de Consulta</CardTitle>
                <CardDescription>
                  Faça upload de documentos que a IA usará como referência ao responder clientes.
                  Inclua: políticas da empresa, tabelas de preços, modelos de contrato, FAQ, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                  <p className="text-xs text-gray-500">PDF, Word, Excel, Imagem (máx. 10MB)</p>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleUploadDocumento}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label htmlFor="doc-upload" className="mt-2 inline-block">
                    <Button variant="outline" asChild>
                      <span>Selecionar Arquivos</span>
                    </Button>
                  </label>
                </div>

                {documentos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Arquivos Carregados:</h3>
                    {documentos.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">Remover</Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
                  <strong>Dica:</strong> Inclua documentos como:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Tabela de preços dos serviços</li>
                    <li>Políticas de cancelamento e reembolso</li>
                    <li>Horários de funcionamento e áreas de cobertura</li>
                    <li>Perguntas frequentes (FAQ)</li>
                    <li>Modelos de contrato e termos de serviço</li>
                    <li>Procedimentos de segurança e protocolos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Resposta</CardTitle>
                <CardDescription>
                  Crie respostas pré-ajustadas para perguntas comuns.
                  A IA usará esses templates como base para respostas personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{template.titulo}</h4>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </div>
                    <p className="text-sm text-gray-600">{template.conteudo}</p>
                  </div>
                ))}

                <Button onClick={handleAdicionarTemplate} className="w-full">
                  + Adicionar Novo Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Conversas */}
          <TabsContent value="conversas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conversas</CardTitle>
                <CardDescription>Visualize todas as conversas com clientes e motoristas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nome: "João Silva", telefone: "+55 11 98765-4321", ultima: "Qual o valor do transporte?", data: "Hoje 14:30" },
                    { nome: "Maria Santos", telefone: "+55 11 99876-5432", ultima: "Preciso de segurança para evento", data: "Ontem 10:15" },
                    { nome: "Carlos Oliveira", telefone: "+55 11 97654-3210", ultima: "Obrigado pelo serviço!", data: "2 dias atrás" },
                  ].map((conversa, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium">{conversa.nome}</p>
                        <p className="text-sm text-gray-600">{conversa.ultima}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{conversa.data}</p>
                        <p className="text-xs text-gray-400">{conversa.telefone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-gray-500">+3 vs ontem</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-gray-500">Aguardando resposta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-gray-500">Média de resposta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">4.8★</p>
                  <p className="text-xs text-gray-500">Baseado em 50 avaliações</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-500">
                  Gráfico de atividade (implementar com Recharts)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
