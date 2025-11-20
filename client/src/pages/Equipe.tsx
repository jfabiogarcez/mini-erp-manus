import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Upload, User, Mail, Phone, CreditCard, FileText, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Equipe() {
  const { data: membros, isLoading, refetch } = trpc.equipe.listAll.useQuery();
  const createMembro = trpc.equipe.create.useMutation();
  const updateMembro = trpc.equipe.update.useMutation();
  const deleteMembro = trpc.equipe.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    whatsapp: "",
    cpf: "",
    tipo: "Motorista" as "Motorista" | "Segurança" | "Receptivo",
    chavePix: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMembro.mutateAsync({ id: editingId, ...formData });
        toast.success("Membro atualizado com sucesso!");
      } else {
        await createMembro.mutateAsync(formData);
        toast.success("Membro cadastrado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar membro");
    }
  };

  const handleEdit = (membro: any) => {
    setEditingId(membro.id);
    setFormData({
      nome: membro.nome || "",
      email: membro.email || "",
      telefone: membro.telefone || "",
      whatsapp: membro.whatsapp || "",
      cpf: membro.cpf || "",
      tipo: membro.tipo || "Motorista",
      chavePix: membro.chavePix || "",
      observacoes: membro.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este membro?")) {
      try {
        await deleteMembro.mutateAsync({ id });
        toast.success("Membro deletado com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar membro");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      whatsapp: "",
      cpf: "",
      tipo: "Motorista",
      chavePix: "",
      observacoes: "",
    });
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // TODO: Implementar leitura do Excel e cadastro em massa
      toast.info("Funcionalidade de upload em massa será implementada em breve");
    } catch (error) {
      toast.error("Erro ao processar arquivo Excel");
    }
  };

  const membrosFiltrados = membros?.filter(m => filterTipo === "all" || m.tipo === filterTipo) || [];

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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipe</h1>
          <p className="text-gray-500">Gerencie motoristas, segurança e receptivo</p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="excel-upload">
            <Button variant="outline" className="gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Importar Excel
              </span>
            </Button>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </label>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Membro" : "Novo Membro"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Motorista">Motorista</SelectItem>
                        <SelectItem value="Segurança">Segurança</SelectItem>
                        <SelectItem value="Receptivo">Receptivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chavePix">Chave PIX</Label>
                    <Input
                      id="chavePix"
                      value={formData.chavePix}
                      onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                      placeholder="CPF, e-mail ou telefone"
                    />
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

      <Tabs defaultValue="all" onValueChange={setFilterTipo}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="Motorista">Motoristas</TabsTrigger>
          <TabsTrigger value="Segurança">Segurança</TabsTrigger>
          <TabsTrigger value="Receptivo">Receptivo</TabsTrigger>
        </TabsList>

        <TabsContent value={filterTipo} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membrosFiltrados.map((membro) => (
              <Card key={membro.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{membro.nome}</CardTitle>
                        <CardDescription>{membro.tipo}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(membro)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(membro.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {membro.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {membro.email}
                    </div>
                  )}
                  {membro.whatsapp && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {membro.whatsapp}
                    </div>
                  )}
                  {membro.chavePix && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      PIX: {membro.chavePix}
                    </div>
                  )}
                  {membro.cpf && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      CPF: {membro.cpf}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {membrosFiltrados.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Nenhum membro cadastrado
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
