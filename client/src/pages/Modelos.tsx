import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, FileText, Download, Trash2, Send, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIAS = ["Orçamento", "Contrato", "Proposta", "Relatório", "Carta", "Outros"];

export default function Modelos() {
  const { data: modelos, isLoading, refetch } = trpc.modelos.listAll.useQuery();
  const { data: documentos } = trpc.documentos.listAll.useQuery();
  const createMutation = trpc.modelos.create.useMutation();
  const deleteMutation = trpc.modelos.delete.useMutation();
  const gerarDocumentoMutation = trpc.modelos.gerarDocumento.useMutation();
  const enviarDocumentoMutation = trpc.documentos.enviar.useMutation();

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isGerarDialogOpen, setIsGerarDialogOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    nome: "",
    descricao: "",
    categoria: "Outros" as any,
  });

  const [gerarForm, setGerarForm] = useState({
    destinatarioNome: "",
    destinatarioEmail: "",
    destinatarioTelefone: "",
    dadosAdicionais: {} as Record<string, any>,
  });

  const [documentoGerado, setDocumentoGerado] = useState<{ id: number; conteudo: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      // Upload para S3
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao fazer upload");

      const { url } = await response.json();

      // Criar modelo no banco
      await createMutation.mutateAsync({
        nome: uploadForm.nome || file.name,
        descricao: uploadForm.descricao,
        categoria: uploadForm.categoria,
        arquivoUrl: url,
        arquivoNome: file.name,
        tipoArquivo: file.type,
        ativo: 1,
      });

      toast.success("Modelo cadastrado com sucesso!");
      setIsUploadDialogOpen(false);
      setUploadForm({ nome: "", descricao: "", categoria: "Outros" });
      refetch();
    } catch (error) {
      toast.error("Erro ao fazer upload do modelo");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleGerarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModelo) return;

    try {
      const result = await gerarDocumentoMutation.mutateAsync({
        modeloId: selectedModelo.id,
        destinatarioNome: gerarForm.destinatarioNome,
        destinatarioEmail: gerarForm.destinatarioEmail,
        destinatarioTelefone: gerarForm.destinatarioTelefone,
        dadosAdicionais: gerarForm.dadosAdicionais,
      });

      setDocumentoGerado({
        id: result.documentoId,
        conteudo: result.conteudo,
      });

      toast.success("Documento gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar documento");
    }
  };

  const handleEnviarDocumento = async (documentoId: number, metodo: "email" | "whatsapp" | "ambos") => {
    try {
      await enviarDocumentoMutation.mutateAsync({
        id: documentoId,
        metodo,
      });

      toast.success(`Documento enviado por ${metodo === "ambos" ? "e-mail e WhatsApp" : metodo}!`);
      setIsGerarDialogOpen(false);
      setDocumentoGerado(null);
      setGerarForm({
        destinatarioNome: "",
        destinatarioEmail: "",
        destinatarioTelefone: "",
        dadosAdicionais: {},
      });
    } catch (error) {
      toast.error("Erro ao enviar documento");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este modelo?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Modelo excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir modelo");
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      "Orçamento": "bg-green-100 text-green-800",
      "Contrato": "bg-blue-100 text-blue-800",
      "Proposta": "bg-purple-100 text-purple-800",
      "Relatório": "bg-yellow-100 text-yellow-800",
      "Carta": "bg-pink-100 text-pink-800",
      "Outros": "bg-gray-100 text-gray-800",
    };
    return colors[categoria] || colors["Outros"];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Modelos de Documentos
            </h1>
            <p className="text-gray-500 mt-1">
              Biblioteca de modelos com preenchimento automático via IA
            </p>
          </div>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Modelo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Modelo *</Label>
                  <Input
                    id="nome"
                    value={uploadForm.nome}
                    onChange={(e) => setUploadForm({ ...uploadForm, nome: e.target.value })}
                    placeholder="Ex: Orçamento Padrão"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm({ ...uploadForm, descricao: e.target.value })}
                    placeholder="Descreva para que serve este modelo..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={uploadForm.categoria}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, categoria: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="arquivo">Arquivo *</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".docx,.pdf,.doc"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceitos: DOCX, PDF, DOC
                  </p>
                </div>

                {uploadingFile && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fazendo upload...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="modelos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="modelos">Modelos</TabsTrigger>
            <TabsTrigger value="documentos">Documentos Gerados</TabsTrigger>
          </TabsList>

          <TabsContent value="modelos" className="space-y-4">
            {!modelos || modelos.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum modelo cadastrado ainda</p>
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Modelo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modelos.map((modelo) => (
                  <Card key={modelo.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <Badge className={getCategoriaColor(modelo.categoria)}>
                          {modelo.categoria}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{modelo.nome}</CardTitle>
                      {modelo.descricao && (
                        <CardDescription className="line-clamp-2">
                          {modelo.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Usado {modelo.vezesUsado || 0}x</span>
                          <span>{modelo.tipoArquivo?.toUpperCase()}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedModelo(modelo);
                              setIsGerarDialogOpen(true);
                              setDocumentoGerado(null);
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Gerar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(modelo.arquivoUrl, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(modelo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Gerados</CardTitle>
                <CardDescription>Histórico de documentos criados a partir dos modelos</CardDescription>
              </CardHeader>
              <CardContent>
                {!documentos || documentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum documento gerado ainda
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentos.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{doc.nomeDocumento}</h3>
                            <p className="text-sm text-gray-500">
                              Para: {doc.destinatarioNome} • {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge variant="outline">{doc.statusEnvio}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Geração de Documento */}
        <Dialog open={isGerarDialogOpen} onOpenChange={setIsGerarDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Gerar Documento com IA
              </DialogTitle>
            </DialogHeader>

            {!documentoGerado ? (
              <form onSubmit={handleGerarDocumento} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Modelo:</strong> {selectedModelo?.nome}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    A IA irá preencher automaticamente o documento com base nos dados fornecidos
                  </p>
                </div>

                <div>
                  <Label htmlFor="destNome">Nome do Destinatário *</Label>
                  <Input
                    id="destNome"
                    value={gerarForm.destinatarioNome}
                    onChange={(e) => setGerarForm({ ...gerarForm, destinatarioNome: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destEmail">E-mail</Label>
                    <Input
                      id="destEmail"
                      type="email"
                      value={gerarForm.destinatarioEmail}
                      onChange={(e) => setGerarForm({ ...gerarForm, destinatarioEmail: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destTelefone">Telefone/WhatsApp</Label>
                    <Input
                      id="destTelefone"
                      value={gerarForm.destinatarioTelefone}
                      onChange={(e) => setGerarForm({ ...gerarForm, destinatarioTelefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsGerarDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={gerarDocumentoMutation.isPending}>
                    {gerarDocumentoMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando com IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Documento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✅ Documento gerado com sucesso!</p>
                </div>

                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{documentoGerado.conteudo}</pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEnviarDocumento(documentoGerado.id, "email")}
                    disabled={!gerarForm.destinatarioEmail}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar por E-mail
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEnviarDocumento(documentoGerado.id, "whatsapp")}
                    disabled={!gerarForm.destinatarioTelefone}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar por WhatsApp
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setIsGerarDialogOpen(false);
                    setDocumentoGerado(null);
                    setGerarForm({
                      destinatarioNome: "",
                      destinatarioEmail: "",
                      destinatarioTelefone: "",
                      dadosAdicionais: {},
                    });
                  }}
                >
                  Fechar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
