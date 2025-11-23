import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import missoesDados from "@/data/missoes.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Pencil, Trash2, Search, Upload, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import CustomizadorVisual from "@/components/CustomizadorVisual";
import ConfiguracaoExportacao from "@/components/ConfiguracaoExportacao";
import BotaoIA from "@/components/BotaoIA";

export default function Missoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMissao, setEditingMissao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  const { data: missoes, isLoading, refetch } = trpc.missoes.list.useQuery();
  const createMutation = trpc.missoes.create.useMutation({
    onSuccess: () => {
      toast.success("Missão criada com sucesso!");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar missão: ${error.message}`);
    },
  });

  const updateMutation = trpc.missoes.update.useMutation({
    onSuccess: () => {
      toast.success("Missão atualizada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setEditingMissao(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar missão: ${error.message}`);
    },
  });

  const deleteMutation = trpc.missoes.delete.useMutation({
    onSuccess: () => {
      toast.success("Missão excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir missão: ${error.message}`);
    },
  });

  const importMutation = trpc.missoes.importFromFile.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.imported} missões importadas com sucesso!`);
      refetch();
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(`Erro ao importar missões: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'excel';
    const maxSize = 16 * 1024 * 1024; // 16MB

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 16MB');
      return;
    }

    setIsUploading(true);
    toast.info('Fazendo upload do arquivo...');

    try {
      // Upload para o servidor
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const { url } = await response.json();

      // Processar arquivo
      toast.info('Processando arquivo e extraindo dados...');
      await importMutation.mutateAsync({ fileUrl: url, fileType });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao processar arquivo');
      setIsUploading(false);
    }

    // Limpar input
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      data: new Date(formData.get("data") as string),
      cliente: formData.get("cliente") as string,
      servico: formData.get("servico") as string,
      origem: formData.get("origem") as string,
      destino: formData.get("destino") as string,
      motorista: formData.get("motorista") as string,
      veiculo: formData.get("veiculo") as string,
      veiculoPlaca: formData.get("veiculoPlaca") as string,
      valor: Number(formData.get("valor")) * 100, // Converter para centavos
      cr: formData.get("cr") as string,
      status: formData.get("status") as any,
      horaInicio: formData.get("horaInicio") as string,
      horaFim: formData.get("horaFim") as string,
      observacoes: formData.get("observacoes") as string,
    };

    if (editingMissao) {
      updateMutation.mutate({ id: editingMissao.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (missao: any) => {
    setEditingMissao(missao);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta missão?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredMissoes = missoes?.filter((missao) => {
    const matchesSearch =
      missao.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missao.servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missao.motorista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missao.veiculo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || missao.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendada":
        return "bg-blue-100 text-blue-800";
      case "Em Andamento":
        return "bg-yellow-100 text-yellow-800";
      case "Concluída":
        return "bg-green-100 text-green-800";
      case "Cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Missões</h1>
          </div>
          <p className="text-gray-600">Gerencie todos os trabalhos e serviços realizados</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por cliente, serviço, motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Agendada">Agendada</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <ConfiguracaoExportacao rotaPagina="/missoes" />
              
              <BotaoIA rotaPagina="/missoes" dadosContexto={missoes} />
              
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Arquivo
                    </>
                  )}
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingMissao(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Missão
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMissao ? "Editar Missão" : "Nova Missão"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data">Data *</Label>
                      <Input
                        id="data"
                        name="data"
                        type="date"
                        required
                        defaultValue={
                          editingMissao
                            ? new Date(editingMissao.data).toISOString().split("T")[0]
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        name="status"
                        defaultValue={editingMissao?.status || "Agendada"}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Agendada">Agendada</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Concluída">Concluída</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Input
                      id="cliente"
                      name="cliente"
                      defaultValue={editingMissao?.cliente || ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="servico">Serviço</Label>
                    <Input
                      id="servico"
                      name="servico"
                      placeholder="Ex: Transporte Executivo, Escolta..."
                      defaultValue={editingMissao?.servico || ""}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="origem">Origem</Label>
                      <Input
                        id="origem"
                        name="origem"
                        placeholder="Local de partida"
                        defaultValue={editingMissao?.origem || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="destino">Destino</Label>
                      <Input
                        id="destino"
                        name="destino"
                        placeholder="Local de chegada"
                        defaultValue={editingMissao?.destino || ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="motorista">Motorista</Label>
                      <Input
                        id="motorista"
                        name="motorista"
                        defaultValue={editingMissao?.motorista || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="veiculo">Veículo</Label>
                      <Input
                        id="veiculo"
                        name="veiculo"
                        placeholder="Ex: BMW X5"
                        defaultValue={editingMissao?.veiculo || ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="veiculoPlaca">Placa</Label>
                      <Input
                        id="veiculoPlaca"
                        name="veiculoPlaca"
                        placeholder="ABC-1234"
                        defaultValue={editingMissao?.veiculoPlaca || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input
                        id="valor"
                        name="valor"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        defaultValue={
                          editingMissao ? (editingMissao.valor / 100).toFixed(2) : ""
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cr">CR (Centro de Resultado)</Label>
                    <Input
                      id="cr"
                      name="cr"
                      placeholder="Ex: CR-001, CR-SP-2025..."
                      defaultValue={editingMissao?.cr || ""}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horaInicio">Hora Início</Label>
                      <Input
                        id="horaInicio"
                        name="horaInicio"
                        type="time"
                        defaultValue={editingMissao?.horaInicio || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaFim">Hora Fim</Label>
                      <Input
                        id="horaFim"
                        name="horaFim"
                        type="time"
                        defaultValue={editingMissao?.horaFim || ""}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                      defaultValue={editingMissao?.observacoes || ""}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingMissao(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingMissao ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Carregando missões...</div>
          ) : filteredMissoes && filteredMissoes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Origem → Destino</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissoes.map((missao) => (
                    <TableRow key={missao.id}>
                      <TableCell className="font-medium">
                        {new Date(missao.data).toLocaleDateString("pt-BR")}
                        {missao.horaInicio && (
                          <div className="text-xs text-gray-500">{missao.horaInicio}</div>
                        )}
                      </TableCell>
                      <TableCell>{missao.cliente || "-"}</TableCell>
                      <TableCell>{missao.servico || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {missao.origem && missao.destino ? (
                          <div>
                            <div className="text-gray-600">{missao.origem}</div>
                            <div className="text-gray-400">↓</div>
                            <div className="text-gray-600">{missao.destino}</div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{missao.motorista || "-"}</TableCell>
                      <TableCell>
                        {missao.veiculo || "-"}
                        {missao.veiculoPlaca && (
                          <div className="text-xs text-gray-500">{missao.veiculoPlaca}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {missao.valor
                          ? `R$ ${(missao.valor / 100).toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            missao.status
                          )}`}
                        >
                          {missao.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(missao)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(missao.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Nenhuma missão encontrada
            </div>
          )}
        </div>
      </div>
      
      {/* Botão flutuante de customização */}
      <CustomizadorVisual rotaPagina="/missoes" />
    </div>
  );
}
