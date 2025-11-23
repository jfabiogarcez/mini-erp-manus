import { useState } from "react";
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
import { DollarSign, Plus, Pencil, Trash2, Search, Upload, Download } from "lucide-react";
import { toast } from "sonner";

export default function Caixa() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lancamentos, setLancamentos] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      id: editingItem?.id || Date.now(),
      data: formData.get("data") as string,
      valorSolicitado: Number(formData.get("valorSolicitado")),
      valorCobrado: Number(formData.get("valorCobrado")),
      solicitante: formData.get("solicitante") as string,
      realizado: formData.get("realizado") as string,
      cr: formData.get("cr") as string,
      missao: formData.get("missao") as string,
      cobradoEm: formData.get("cobradoEm") as string,
    };

    if (editingItem) {
      setLancamentos(lancamentos.map(item => item.id === editingItem.id ? data : item));
      toast.success("Lançamento atualizado com sucesso!");
    } else {
      setLancamentos([...lancamentos, data]);
      toast.success("Lançamento criado com sucesso!");
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      setLancamentos(lancamentos.filter(item => item.id !== id));
      toast.success("Lançamento excluído com sucesso!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast.info("Importando dados do arquivo...");
    // TODO: Implementar importação de Excel
    e.target.value = '';
  };

  const handleDownload = () => {
    toast.info("Gerando arquivo para download...");
    // TODO: Implementar exportação para Excel
  };

  const filteredLancamentos = lancamentos.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.solicitante?.toLowerCase().includes(searchLower) ||
      item.cr?.toLowerCase().includes(searchLower) ||
      item.missao?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Caixa</h1>
          </div>
          <p className="text-gray-600">Controle financeiro de solicitações e cobranças</p>
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
                  placeholder="Buscar por solicitante, CR, missão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Label htmlFor="file-upload-caixa" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload-caixa')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Excel
                </Button>
              </Label>
              <input
                id="file-upload-caixa"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Editar Lançamento" : "Novo Lançamento"}
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
                          defaultValue={editingItem?.data || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="solicitante">Solicitante *</Label>
                        <Input
                          id="solicitante"
                          name="solicitante"
                          required
                          defaultValue={editingItem?.solicitante || ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valorSolicitado">Valor Solicitado (R$) *</Label>
                        <Input
                          id="valorSolicitado"
                          name="valorSolicitado"
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          defaultValue={editingItem?.valorSolicitado || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="valorCobrado">Valor Cobrado (R$) *</Label>
                        <Input
                          id="valorCobrado"
                          name="valorCobrado"
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          defaultValue={editingItem?.valorCobrado || ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cr">CR (Centro de Resultado)</Label>
                        <Input
                          id="cr"
                          name="cr"
                          placeholder="Ex: 55180, 1346, 647..."
                          defaultValue={editingItem?.cr || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="missao">Missão</Label>
                        <Input
                          id="missao"
                          name="missao"
                          placeholder="Ex: EDGE, AMAZON, BASF..."
                          defaultValue={editingItem?.missao || ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="realizado">Realizado</Label>
                        <Input
                          id="realizado"
                          name="realizado"
                          type="date"
                          defaultValue={editingItem?.realizado || ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cobradoEm">Cobrado Em</Label>
                        <Input
                          id="cobradoEm"
                          name="cobradoEm"
                          type="date"
                          defaultValue={editingItem?.cobradoEm || ""}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingItem(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingItem ? "Atualizar" : "Criar"}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Solicitado</TableHead>
                <TableHead>Valor Cobrado</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>Missão</TableHead>
                <TableHead>Cobrado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhum lançamento encontrado. Clique em "Novo Lançamento" para adicionar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLancamentos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.data)}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {formatCurrency(item.valorSolicitado)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(item.valorCobrado)}
                    </TableCell>
                    <TableCell>{item.solicitante}</TableCell>
                    <TableCell>{formatDate(item.realizado)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                        {item.cr || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{item.missao || "-"}</TableCell>
                    <TableCell>{formatDate(item.cobradoEm)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {lancamentos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Solicitado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(lancamentos.reduce((acc, item) => acc + item.valorSolicitado, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Cobrado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(lancamentos.reduce((acc, item) => acc + item.valorCobrado, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Diferença</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    lancamentos.reduce((acc, item) => acc + item.valorCobrado, 0) -
                    lancamentos.reduce((acc, item) => acc + item.valorSolicitado, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
