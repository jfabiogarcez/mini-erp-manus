import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle,
  Upload,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Download,
  Send,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Whatsapp() {
  const [activeTab, setActiveTab] = useState("conversas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [templateForm, setTemplateForm] = useState({
    titulo: "",
    conteudo: "",
    categoria: "geral",
  });

  // Mock data - será substituído por chamadas tRPC
  const conversas = [
    {
      id: 1,
      cliente: "João Silva",
      telefone: "+55 11 97263-2473",
      ultimaMensagem: "Qual o valor do transporte?",
      horario: "14:30",
      status: "ativo",
      mensagensNao: 2,
    },
    {
      id: 2,
      cliente: "Maria Santos",
      telefone: "+55 11 98765-4321",
      ultimaMensagem: "Obrigado pelo serviço!",
      horario: "10:15",
      status: "encerrado",
      mensagensNao: 0,
    },
    {
      id: 3,
      cliente: "Carlos Oliveira",
      telefone: "+55 11 99876-5432",
      ultimaMensagem: "Preciso de um orçamento urgente",
      horario: "09:45",
      status: "ativo",
      mensagensNao: 1,
    },
  ];

  const templates = [
    {
      id: 1,
      titulo: "Saudação Inicial",
      categoria: "geral",
      conteudo: "Olá! 👋 Bem-vindo à Transblindados! Como posso ajudá-lo?",
    },
    {
      id: 2,
      titulo: "Informações de Serviços",
      categoria: "servicos",
      conteudo: "Nossos principais serviços:\n1️⃣ Transporte Executivo\n2️⃣ Segurança Pessoal\n3️⃣ Receptivo de Aeroporto",
    },
    {
      id: 3,
      titulo: "Solicitação de Orçamento",
      categoria: "orcamento",
      conteudo: "Para gerar seu orçamento, preciso de:\n- Serviço desejado\n- Data e horário\n- Origem e destino",
    },
    {
      id: 4,
      titulo: "Confirmação de Agendamento",
      categoria: "agendamento",
      conteudo: "✅ Sua missão foi agendada com sucesso!\n\nCódigo: {{codigo}}\nData: {{data}}\nHorário: {{horario}}\n\nSeu motorista entrará em contato em breve!",
    },
  ];

  const documentos = [
    {
      id: 1,
      nome: "Tabela de Preços - Transblindados.pdf",
      tipo: "PDF",
      tamanho: "245 KB",
      dataUpload: "20/11/2025",
      categoria: "precos",
    },
    {
      id: 2,
      nome: "Modelo de Contrato.docx",
      tipo: "DOCX",
      tamanho: "156 KB",
      dataUpload: "19/11/2025",
      categoria: "contratos",
    },
    {
      id: 3,
      nome: "Políticas de Cancelamento.pdf",
      tipo: "PDF",
      tamanho: "89 KB",
      dataUpload: "18/11/2025",
      categoria: "politicas",
    },
    {
      id: 4,
      nome: "FAQ - Perguntas Frequentes.txt",
      tipo: "TXT",
      tamanho: "34 KB",
      dataUpload: "17/11/2025",
      categoria: "faq",
    },
  ];

  const handleTemplateSubmit = () => {
    if (!templateForm.titulo || !templateForm.conteudo) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (editingTemplate) {
      toast.success("Template atualizado com sucesso!");
    } else {
      toast.success("Template criado com sucesso!");
    }

    setTemplateForm({ titulo: "", conteudo: "", categoria: "geral" });
    setEditingTemplate(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-green-600" />
              WhatsApp - Atendimento ao Cliente
            </h1>
            <p className="text-gray-500 mt-2">Gerencie conversas, templates e documentos de consulta</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status da Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-green-600">Conectado</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Número: +55 11 97263-2473</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-blue-600">2</span>
              <p className="text-xs text-gray-500 mt-2">Aguardando resposta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mensagens Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-purple-600">24</span>
              <p className="text-xs text-gray-500 mt-2">Enviadas e recebidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taxa de Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-orange-600">94%</span>
              <p className="text-xs text-gray-500 mt-2">Média em 2 minutos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conversas">Conversas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          {/* TAB 1: CONVERSAS */}
          <TabsContent value="conversas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conversas</CardTitle>
                <CardDescription>Todas as conversas com clientes via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filtros */}
                  <div className="flex gap-2">
                    <Input placeholder="Buscar por cliente ou telefone..." className="flex-1" />
                    <Button variant="outline">Filtrar</Button>
                  </div>

                  {/* Tabela de Conversas */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Cliente</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Última Mensagem</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversas.map((conversa) => (
                          <TableRow key={conversa.id}>
                            <TableCell className="font-medium">{conversa.cliente}</TableCell>
                            <TableCell>{conversa.telefone}</TableCell>
                            <TableCell className="max-w-xs truncate">{conversa.ultimaMensagem}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {conversa.horario}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={conversa.status === "ativo" ? "default" : "secondary"}
                                className={
                                  conversa.status === "ativo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {conversa.status === "ativo" ? "🟢 Ativo" : "⚪ Encerrado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  Ver
                                </Button>
                                <Button size="sm" variant="ghost" className="gap-1">
                                  <Phone className="h-4 w-4" />
                                  Ligar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TEMPLATES */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Templates de Resposta</CardTitle>
                    <CardDescription>Respostas pré-ajustadas para agilizar o atendimento</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? "Editar Template" : "Criar Novo Template"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Título do Template</Label>
                          <Input
                            placeholder="Ex: Saudação Inicial"
                            value={templateForm.titulo}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, titulo: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <select
                            className="w-full border rounded-md p-2"
                            value={templateForm.categoria}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, categoria: e.target.value })
                            }
                          >
                            <option value="geral">Geral</option>
                            <option value="servicos">Serviços</option>
                            <option value="orcamento">Orçamento</option>
                            <option value="agendamento">Agendamento</option>
                            <option value="pagamento">Pagamento</option>
                            <option value="suporte">Suporte</option>
                          </select>
                        </div>
                        <div>
                          <Label>Conteúdo da Mensagem</Label>
                          <textarea
                            className="w-full border rounded-md p-2 font-mono text-sm"
                            rows={6}
                            placeholder="Digite a mensagem. Use {{variavel}} para campos dinâmicos"
                            value={templateForm.conteudo}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, conteudo: e.target.value })
                            }
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Variáveis disponíveis: cliente, data, horario, valor
                          </p>                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setEditingTemplate(null);
                              setTemplateForm({ titulo: "", conteudo: "", categoria: "geral" });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleTemplateSubmit}>
                            {editingTemplate ? "Atualizar" : "Criar"} Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.titulo}</h4>
                          <Badge variant="outline" className="mt-1">
                            {template.categoria}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTemplate(template.id);
                              setTemplateForm({
                                titulo: template.titulo,
                                conteudo: template.conteudo,
                                categoria: template.categoria,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{template.conteudo}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Send className="h-3 w-3" />
                          Usar Template
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Copy className="h-3 w-3" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: DOCUMENTOS */}
          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Documentos de Consulta</CardTitle>
                    <CardDescription>
                      Arquivos para o bot consultar ao responder clientes
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload de Arquivo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-8 w-8 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{doc.nome}</h4>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              <span>📄 {doc.tipo}</span>
                              <span>💾 {doc.tamanho}</span>
                              <span>📅 {doc.dataUpload}</span>
                            </div>
                            <Badge variant="outline" className="mt-2">
                              {doc.categoria}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Download className="h-4 w-4" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Área de Upload */}
                <div className="mt-6 border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Suportados: PDF, DOCX, TXT, XLS (máx. 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: ESTATÍSTICAS */}
          <TabsContent value="estatisticas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Mensagens por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de mensagens por hora</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Orçamentos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-blue-600"></div>
                        </div>
                        <span className="text-sm font-semibold">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Agendamentos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-2/5 bg-green-600"></div>
                        </div>
                        <span className="text-sm font-semibold">40%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Suporte</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-1/4 bg-orange-600"></div>
                        </div>
                        <span className="text-sm font-semibold">25%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Tempo Médio de Resposta</p>
                    <p className="text-2xl font-bold text-blue-600">2m 15s</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Taxa de Satisfação</p>
                    <p className="text-2xl font-bold text-green-600">4.8/5 ⭐</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Conversas Resolvidas</p>
                    <p className="text-2xl font-bold text-purple-600">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component para Copy icon
function Copy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  );
}
