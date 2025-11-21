import { useState } from "react";
import { Link } from "wouter";
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
  X,
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
  const [editingDocumento, setEditingDocumento] = useState<number | null>(null);
  const [templateForm, setTemplateForm] = useState({
    titulo: "",
    conteudo: "",
    variaveis: "",
    categoria: "geral",
  });
  const [documentoForm, setDocumentoForm] = useState({
    nome: "",
    descricao: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  // ========== CONVERSAS ==========
  const { data: conversas = [], isLoading: loadingConversas, refetch: refetchConversas } = 
    trpc.whatsapp.conversas.list.useQuery();

  const deleteConversaMutation = trpc.whatsapp.conversas.delete.useMutation({
    onSuccess: () => {
      toast.success("Conversa deletada com sucesso!");
      refetchConversas();
    },
    onError: () => {
      toast.error("Erro ao deletar conversa");
    },
  });

  // ========== MENSAGENS ==========
  const { data: allMensagens = [], refetch: refetchMensagens } = 
    trpc.whatsapp.mensagens.list.useQuery();

  // ========== TEMPLATES ==========
  const { data: templates = [], isLoading: loadingTemplates, refetch: refetchTemplates } = 
    trpc.whatsapp.templates.list.useQuery();

  const createTemplateMutation = trpc.whatsapp.templates.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      setTemplateForm({ titulo: "", conteudo: "", variaveis: "", categoria: "geral" });
      setIsDialogOpen(false);
      refetchTemplates();
    },
    onError: () => {
      toast.error("Erro ao criar template");
    },
  });

  const updateTemplateMutation = trpc.whatsapp.templates.update.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado com sucesso!");
      setTemplateForm({ titulo: "", conteudo: "", variaveis: "", categoria: "geral" });
      setEditingTemplate(null);
      setIsDialogOpen(false);
      refetchTemplates();
    },
    onError: () => {
      toast.error("Erro ao atualizar template");
    },
  });

  const deleteTemplateMutation = trpc.whatsapp.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deletado com sucesso!");
      refetchTemplates();
    },
    onError: () => {
      toast.error("Erro ao deletar template");
    },
  });

  // ========== DOCUMENTOS ==========
  const { data: documentos = [], isLoading: loadingDocumentos, refetch: refetchDocumentos } = 
    trpc.whatsapp.documentos.list.useQuery();

  const createDocumentoMutation = trpc.whatsapp.documentos.create.useMutation({
    onSuccess: () => {
      toast.success("Documento criado com sucesso!");
      setDocumentoForm({ nome: "", descricao: "" });
      setIsDialogOpen(false);
      refetchDocumentos();
    },
    onError: () => {
      toast.error("Erro ao criar documento");
    },
  });

  const deleteDocumentoMutation = trpc.whatsapp.documentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento deletado com sucesso!");
      refetchDocumentos();
    },
    onError: () => {
      toast.error("Erro ao deletar documento");
    },
  });

  // ========== HANDLERS ==========
  const handleTemplateSubmit = async () => {
    if (!templateForm.titulo || !templateForm.conteudo) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    if (editingTemplate) {
      await updateTemplateMutation.mutateAsync({
        id: editingTemplate,
        titulo: templateForm.titulo,
        conteudo: templateForm.conteudo,
        variaveis: templateForm.variaveis || undefined,
        categoria: templateForm.categoria,
      });
    } else {
      await createTemplateMutation.mutateAsync({
        titulo: templateForm.titulo,
        conteudo: templateForm.conteudo,
        variaveis: templateForm.variaveis || undefined,
        categoria: templateForm.categoria,
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template.id);
    setTemplateForm({
      titulo: template.titulo,
      conteudo: template.conteudo,
      variaveis: template.variaveis || "",
      categoria: template.categoria || "geral",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este template?")) {
      deleteTemplateMutation.mutate({ id });
    }
  };

  const handleDeleteDocumento = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este documento?")) {
      deleteDocumentoMutation.mutate({ id });
    }
  };

  const handleDeleteConversa = (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta conversa?")) {
      deleteConversaMutation.mutate({ id });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      // Simular upload - em produção, usar storagePut
      const mockUrl = URL.createObjectURL(file);
      
      await createDocumentoMutation.mutateAsync({
        nome: file.name,
        urlArquivo: mockUrl,
        tipoArquivo: file.type,
        tamanhoBytes: file.size,
        descricao: documentoForm.descricao || undefined,
      });

      setDocumentoForm({ nome: "", descricao: "" });
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setUploadingFile(false);
    }
  };

  const openNewTemplateDialog = () => {
    setEditingTemplate(null);
    setTemplateForm({ titulo: "", conteudo: "", variaveis: "", categoria: "geral" });
    setIsDialogOpen(true);
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciar conversas, templates e documentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/whatsapp-analytics'}>
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Conectado
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversas.filter((c: any) => c.statusConversa === "Ativa").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de conversas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMensagens.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Mensagens recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Respostas pré-configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Arquivos de consulta</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversas" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* TAB: CONVERSAS */}
        <TabsContent value="conversas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conversas</CardTitle>
              <CardDescription>Todas as conversas com clientes via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConversas ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Última Mensagem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversas.map((conversa: any) => (
                        <TableRow key={conversa.id}>
                          <TableCell className="font-medium">{conversa.nomeCliente || "Cliente"}</TableCell>
                          <TableCell className="font-mono text-sm">{conversa.numeroCliente}</TableCell>
                          <TableCell className="max-w-xs truncate">{conversa.ultimaMensagem || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={conversa.statusConversa === "Ativa" ? "default" : "secondary"}>
                              {conversa.statusConversa}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {conversa.dataUltimaMsg ? new Date(conversa.dataUltimaMsg).toLocaleString("pt-BR") : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConversa(conversa.id)}
                              disabled={deleteConversaMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TEMPLATES */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Respostas Pré-configuradas</h2>
              <p className="text-sm text-muted-foreground">Templates de mensagens rápidas com variáveis dinâmicas</p>
            </div>
            <Dialog open={isDialogOpen && activeTab === "templates"} onOpenChange={(open) => {
              if (!open) {
                setEditingTemplate(null);
                setTemplateForm({ titulo: "", conteudo: "", variaveis: "", categoria: "geral" });
              }
              setIsDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={openNewTemplateDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "Editar Template" : "Novo Template"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Ex: Saudação Inicial"
                      value={templateForm.titulo}
                      onChange={(e) => setTemplateForm({ ...templateForm, titulo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      placeholder="Ex: geral, serviços, orçamento"
                      value={templateForm.categoria}
                      onChange={(e) => setTemplateForm({ ...templateForm, categoria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conteudo">Conteúdo</Label>
                    <textarea
                      id="conteudo"
                      placeholder="Digite o conteúdo da mensagem..."
                      value={templateForm.conteudo}
                      onChange={(e) => setTemplateForm({ ...templateForm, conteudo: e.target.value })}
                      className="w-full min-h-32 p-2 border rounded-md bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variaveis">Variáveis (JSON)</Label>
                    <Input
                      id="variaveis"
                      placeholder='["{{nome}}", "{{email}}", "{{telefone}}"]'
                      value={templateForm.variaveis}
                      onChange={(e) => setTemplateForm({ ...templateForm, variaveis: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use {'{{'} variável {'}}'} para campos dinâmicos</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingTemplate(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleTemplateSubmit}
                      disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending || updateTemplateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Template"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingTemplates ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum template criado ainda</p>
              </div>
            ) : (
              templates.map((template: any) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.titulo}</CardTitle>
                        {template.categoria && (
                          <Badge variant="secondary" className="mt-2">
                            {template.categoria}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-4">{template.conteudo}</p>
                  </CardContent>
                  <div className="px-6 py-3 border-t flex gap-2 justify-between">
                    <div className="text-xs text-muted-foreground">
                      Usado {template.vezesUsado || 0}x
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deleteTemplateMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB: DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Documentos de Consulta</h2>
              <p className="text-sm text-muted-foreground">Arquivos para contexto da IA nas respostas</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload de Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Selecione o arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      accept=".pdf,.docx,.txt,.doc"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Formatos: PDF, DOCX, TXT</p>
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição (opcional)</Label>
                    <Input
                      id="descricao"
                      placeholder="Descrição do documento..."
                      value={documentoForm.descricao}
                      onChange={(e) => setDocumentoForm({ ...documentoForm, descricao: e.target.value })}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingDocumentos ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum documento enviado
                    </TableCell>
                  </TableRow>
                ) : (
                  documentos.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.tipoArquivo || "Arquivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.tamanhoBytes ? `${(doc.tamanhoBytes / 1024).toFixed(1)} KB` : "-"}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {doc.descricao || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.urlArquivo)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocumento(doc.id)}
                            disabled={deleteDocumentoMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB: ESTATÍSTICAS */}
        <TabsContent value="estatisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensagens por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Não Lidas</span>
                    <span className="font-semibold">{allMensagens.filter((m: any) => !m.lida).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lidas</span>
                    <span className="font-semibold">{allMensagens.filter((m: any) => m.lida).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <span className="font-semibold">{allMensagens.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ativas</span>
                    <span className="font-semibold">{conversas.filter((c: any) => c.statusConversa === "Ativa").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Arquivadas</span>
                    <span className="font-semibold">{conversas.filter((c: any) => c.statusConversa === "Arquivada").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <span className="font-semibold">{conversas.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
