import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Upload, FileText, AlertCircle, Calendar, DollarSign, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Multas() {
  const { data: multas, isLoading, refetch } = trpc.multas.listAll.useQuery();
  const createMulta = trpc.multas.create.useMutation();
  const updateMulta = trpc.multas.update.useMutation();
  const deleteMulta = trpc.multas.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    numeroAuto: "",
    dataInfracao: "",
    horaInfracao: "",
    localInfracao: "",
    codigoInfracao: "",
    descricaoInfracao: "",
    valor: 0,
    pontos: 0,
    veiculoPlaca: "",
    dataVencimento: "",
    status: "Pendente" as "Pendente" | "Pago" | "Recorrido" | "Cancelado",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        dataInfracao: formData.dataInfracao ? new Date(formData.dataInfracao) : undefined,
        dataVencimento: formData.dataVencimento ? new Date(formData.dataVencimento) : undefined,
      };

      if (editingId) {
        await updateMulta.mutateAsync({ id: editingId, ...data });
        toast.success("Multa atualizada com sucesso!");
      } else {
        await createMulta.mutateAsync(data);
        toast.success("Multa cadastrada com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar multa");
    }
  };

  const handleEdit = (multa: any) => {
    setEditingId(multa.id);
    setFormData({
      numeroAuto: multa.numeroAuto || "",
      dataInfracao: multa.dataInfracao ? new Date(multa.dataInfracao).toISOString().split('T')[0] : "",
      horaInfracao: multa.horaInfracao || "",
      localInfracao: multa.localInfracao || "",
      codigoInfracao: multa.codigoInfracao || "",
      descricaoInfracao: multa.descricaoInfracao || "",
      valor: multa.valor || 0,
      pontos: multa.pontos || 0,
      veiculoPlaca: multa.veiculoPlaca || "",
      dataVencimento: multa.dataVencimento ? new Date(multa.dataVencimento).toISOString().split('T')[0] : "",
      status: multa.status || "Pendente",
      observacoes: multa.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta multa?")) {
      try {
        await deleteMulta.mutateAsync({ id });
        toast.success("Multa deletada com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar multa");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      numeroAuto: "",
      dataInfracao: "",
      horaInfracao: "",
      localInfracao: "",
      codigoInfracao: "",
      descricaoInfracao: "",
      valor: 0,
      pontos: 0,
      veiculoPlaca: "",
      dataVencimento: "",
      status: "Pendente",
      observacoes: "",
    });
  };

  const [uploadingPdfs, setUploadingPdfs] = useState(false);
  const extractPdf = trpc.multas.extractFromPDF.useMutation();

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPdfs(true);
    const totalFiles = files.length;
    let successCount = 0;
    let errorCount = 0;

    try {
      toast.info(`Processando ${totalFiles} arquivo(s)...`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        try {
          // Upload do PDF para S3
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Falha no upload do PDF');
          }

          const { url: pdfUrl } = await uploadResponse.json();

          // Extrair dados do PDF usando IA
          toast.info(`Extraindo dados do arquivo ${i + 1}/${totalFiles}...`);
          const extractedData = await extractPdf.mutateAsync({ pdfUrl });

          // Criar multa automaticamente com os dados extraídos
          await createMulta.mutateAsync({
            numeroAuto: extractedData.numeroAuto,
            dataInfracao: extractedData.dataInfracao ? new Date(extractedData.dataInfracao) : undefined,
            horaInfracao: extractedData.horaInfracao,
            localInfracao: extractedData.localInfracao,
            codigoInfracao: extractedData.codigoInfracao,
            descricaoInfracao: extractedData.descricaoInfracao,
            valor: extractedData.valor / 100, // Converter de centavos para reais
            pontos: extractedData.pontos,
            veiculoPlaca: extractedData.veiculoPlaca,
            dataVencimento: extractedData.dataVencimento ? new Date(extractedData.dataVencimento) : undefined,
            pdfUrl,
            status: "Pendente",
          });

          successCount++;
        } catch (error) {
          console.error(`Erro ao processar ${file.name}:`, error);
          errorCount++;
        }
      }

      // Atualizar lista de multas
      await refetch();

      if (successCount > 0) {
        toast.success(`${successCount} multa(s) cadastrada(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} arquivo(s) falharam no processamento`);
      }
    } catch (error) {
      toast.error("Erro ao processar PDFs");
    } finally {
      setUploadingPdfs(false);
      // Resetar o input para permitir upload do mesmo arquivo novamente
      e.target.value = '';
    }
  };

  const multasFiltradas = multas?.filter(m => filterStatus === "all" || m.status === filterStatus) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "bg-yellow-100 text-yellow-800";
      case "Pago": return "bg-green-100 text-green-800";
      case "Recorrido": return "bg-blue-100 text-blue-800";
      case "Cancelado": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Multas</h1>
          <p className="text-gray-500">Gerencie multas de trânsito e infrações</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="pdf-upload">
            <Button variant="outline" className="gap-2" asChild disabled={uploadingPdfs}>
              <span>
                {uploadingPdfs ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload PDFs
                  </>
                )}
              </span>
            </Button>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handlePdfUpload}
              disabled={uploadingPdfs}
            />
          </label>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Multa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Multa" : "Nova Multa"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroAuto">Número do Auto</Label>
                    <Input
                      id="numeroAuto"
                      value={formData.numeroAuto}
                      onChange={(e) => setFormData({ ...formData, numeroAuto: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="veiculoPlaca">Placa do Veículo</Label>
                    <Input
                      id="veiculoPlaca"
                      value={formData.veiculoPlaca}
                      onChange={(e) => setFormData({ ...formData, veiculoPlaca: e.target.value })}
                      placeholder="ABC-1234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataInfracao">Data da Infração</Label>
                    <Input
                      id="dataInfracao"
                      type="date"
                      value={formData.dataInfracao}
                      onChange={(e) => setFormData({ ...formData, dataInfracao: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaInfracao">Hora da Infração</Label>
                    <Input
                      id="horaInfracao"
                      type="time"
                      value={formData.horaInfracao}
                      onChange={(e) => setFormData({ ...formData, horaInfracao: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="localInfracao">Local da Infração</Label>
                    <Input
                      id="localInfracao"
                      value={formData.localInfracao}
                      onChange={(e) => setFormData({ ...formData, localInfracao: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigoInfracao">Código da Infração</Label>
                    <Input
                      id="codigoInfracao"
                      value={formData.codigoInfracao}
                      onChange={(e) => setFormData({ ...formData, codigoInfracao: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricaoInfracao">Descrição</Label>
                    <Input
                      id="descricaoInfracao"
                      value={formData.descricaoInfracao}
                      onChange={(e) => setFormData({ ...formData, descricaoInfracao: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pontos">Pontos na CNH</Label>
                    <Input
                      id="pontos"
                      type="number"
                      value={formData.pontos}
                      onChange={(e) => setFormData({ ...formData, pontos: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                    <Input
                      id="dataVencimento"
                      type="date"
                      value={formData.dataVencimento}
                      onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Recorrido">Recorrido</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilterStatus}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="Pago">Pagas</TabsTrigger>
          <TabsTrigger value="Recorrido">Recorridas</TabsTrigger>
          <TabsTrigger value="Cancelado">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multasFiltradas.map((multa) => (
              <Card key={multa.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{multa.numeroAuto || "Sem número"}</CardTitle>
                        <CardDescription>{multa.veiculoPlaca || "Sem placa"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(multa)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(multa.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(multa.status)}`}>
                    {multa.status}
                  </div>
                  {multa.descricaoInfracao && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      {multa.descricaoInfracao}
                    </div>
                  )}
                  {multa.valor !== null && multa.valor > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      R$ {multa.valor.toFixed(2)}
                    </div>
                  )}
                  {multa.dataVencimento && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Vence em: {new Date(multa.dataVencimento).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {multa.pontos !== null && multa.pontos > 0 && (
                    <div className="text-gray-600">
                      {multa.pontos} pontos na CNH
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {multasFiltradas.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Nenhuma multa cadastrada
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
