import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: registros, isLoading, refetch } = trpc.registros.list.useQuery();
  const createMutation = trpc.registros.create.useMutation();
  const updateMutation = trpc.registros.update.useMutation();
  const deleteMutation = trpc.registros.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    assunto: "",
    categoria: "",
    clienteFornecedor: "",
    nDocumentoPedido: "",
    valorTotal: 0,
    status: "Pendente",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Registro atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Registro criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar registro");
    }
  };

  const handleEdit = (registro: any) => {
    setEditingId(registro.id);
    setFormData({
      assunto: registro.assunto || "",
      categoria: registro.categoria || "",
      clienteFornecedor: registro.clienteFornecedor || "",
      nDocumentoPedido: registro.nDocumentoPedido || "",
      valorTotal: registro.valorTotal || 0,
      status: registro.status || "Pendente",
      observacoes: registro.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este registro?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Registro deletado com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar registro");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      assunto: "",
      categoria: "",
      clienteFornecedor: "",
      nDocumentoPedido: "",
      valorTotal: 0,
      status: "Pendente",
      observacoes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pendente: "outline",
      Pago: "default",
      Realizado: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mini-ERP</h1>
            <p className="text-muted-foreground">Gestão de Registros Consolidados</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Registro" : "Novo Registro"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assunto">Assunto *</Label>
                    <Input
                      id="assunto"
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Missão/Viagem">Missão/Viagem</SelectItem>
                        <SelectItem value="Contas a Pagar">Contas a Pagar</SelectItem>
                        <SelectItem value="Controle de Caixa/Aporte">Controle de Caixa/Aporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clienteFornecedor">Cliente/Fornecedor</Label>
                    <Input
                      id="clienteFornecedor"
                      value={formData.clienteFornecedor}
                      onChange={(e) => setFormData({ ...formData, clienteFornecedor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nDocumentoPedido">Nº Documento/Pedido</Label>
                    <Input
                      id="nDocumentoPedido"
                      value={formData.nDocumentoPedido}
                      onChange={(e) => setFormData({ ...formData, nDocumentoPedido: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                    <Input
                      id="valorTotal"
                      type="number"
                      step="0.01"
                      value={formData.valorTotal / 100}
                      onChange={(e) => setFormData({ ...formData, valorTotal: Math.round(parseFloat(e.target.value) * 100) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Realizado">Realizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assunto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cliente/Fornecedor</TableHead>
                <TableHead>Nº Documento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros && registros.length > 0 ? (
                registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium">{registro.assunto}</TableCell>
                    <TableCell>{registro.categoria}</TableCell>
                    <TableCell>{registro.clienteFornecedor || "-"}</TableCell>
                    <TableCell>{registro.nDocumentoPedido || "-"}</TableCell>
                    <TableCell>{formatCurrency(registro.valorTotal || 0)}</TableCell>
                    <TableCell>{getStatusBadge(registro.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(registro)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(registro.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum registro encontrado. Clique em "Novo Registro" para adicionar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
