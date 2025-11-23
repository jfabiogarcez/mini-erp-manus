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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  LayoutDashboard,
  ClipboardList,
  Bell,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MessageCircle,
  Mail,
  Users,
  ChevronDown
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarioInterativo from "@/components/CalendarioInterativo";

export default function Dashboard() {
  const { data: registros, isLoading: loadingRegistros, refetch: refetchRegistros } = trpc.registros.list.useQuery();
  const { data: tarefas, isLoading: loadingTarefas, refetch: refetchTarefas } = trpc.tarefas.list.useQuery();
  const { data: iaConfig } = trpc.ia.getConfig.useQuery();
  const { data: iaStats } = trpc.ia.getEstatisticas.useQuery();
  const utils = trpc.useUtils();
  const toggleIA = trpc.ia.toggle.useMutation({
    onSuccess: async () => {
      await utils.ia.getConfig.invalidate();
      await utils.ia.getEstatisticas.invalidate();
      toast.success("Modo da IA alterado com sucesso!");
    },
  });
  const createRegistroMutation = trpc.registros.create.useMutation();
  const updateRegistroMutation = trpc.registros.update.useMutation();
  const deleteRegistroMutation = trpc.registros.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    assunto: "",
    categoria: "",
    clienteFornecedor: "",
    nDocumentoPedido: "",
    valorTotal: 0,
    status: "Pendente",
    observacoes: "",
  });

  // Calcular métricas
  const metricas = useMemo(() => {
    if (!registros || !tarefas) return null;
    
    const totalRegistros = registros.length;
    const valorTotal = registros.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
    const tarefasPendentes = tarefas.filter(t => t.status === "Pendente").length;
    
    // Tarefas próximas do vencimento (3 dias)
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 3);
    
    const tarefasProximas = tarefas.filter(t => {
      if (t.status !== "Pendente") return false;
      const venc = new Date(t.dataVencimento);
      return venc >= hoje && venc <= dataLimite;
    }).length;

    return {
      totalRegistros,
      valorTotal,
      tarefasPendentes,
      tarefasProximas,
    };
  }, [registros, tarefas]);

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    if (!registros) return [];
    
    return registros.filter(r => {
      const matchSearch = searchTerm === "" || 
        r.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.clienteFornecedor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.nDocumentoPedido || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = filterCategoria === "all" || r.categoria === filterCategoria;
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      
      return matchSearch && matchCategoria && matchStatus;
    });
  }, [registros, searchTerm, filterCategoria, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRegistroMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Registro atualizado com sucesso!");
      } else {
        await createRegistroMutation.mutateAsync(formData);
        toast.success("Registro criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
      refetchRegistros();
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
        await deleteRegistroMutation.mutateAsync({ id });
        toast.success("Registro deletado com sucesso!");
        refetchRegistros();
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
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      Pendente: { variant: "outline", className: "border-yellow-500 text-yellow-700" },
      Pago: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
      Realizado: { variant: "secondary", className: "bg-blue-500 hover:bg-blue-600 text-white" },
    };
    const config = variants[status] || variants.Pendente;
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const getTarefaUrgencia = (dataVencimento: Date) => {
    const hoje = new Date();
    const venc = new Date(dataVencimento);
    const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { icon: AlertCircle, color: "text-red-500", label: "Atrasada" };
    if (diff <= 3) return { icon: Clock, color: "text-yellow-500", label: "Urgente" };
    return { icon: CheckCircle2, color: "text-green-500", label: "No prazo" };
  };

  if (loadingRegistros || loadingTarefas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mini-ERP</h1>
          <p className="text-sm text-gray-500">Automação Manus</p>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium">
            <LayoutDashboard className="h-5 w-5" />
            Visão Geral
          </Link>
          <a href="#registros" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <ClipboardList className="h-5 w-5" />
            Registros
          </a>
          <a href="#tarefas" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            Tarefas
          </a>

          <a href="#email" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <Mail className="h-5 w-5" />
            E-mail
          </a>
          <Link href="/multas" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <AlertCircle className="h-5 w-5" />
            Multas
          </Link>
          <Link href="/cobranca" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <DollarSign className="h-5 w-5" />
            Cobrança por Link
          </Link>
          <Link href="/caixa" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <DollarSign className="h-5 w-5" />
            Caixa
          </Link>
          <Link href="/aprendizados" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Aprendizados da IA
          </Link>
          <Link href="/modelos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Modelos de Documentos
          </Link>
          <Link href="/relatorios" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Relatórios
          </Link>
          <Link href="/metricas" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métricas e KPIs
          </Link>
          <Link href="/whatsapp-chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Link>
          <div className="space-y-1">
            <Link href="/equipe" className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                Equipe
              </div>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Visão Geral</h2>
              <p className="text-gray-500">Gerencie seus registros e tarefas em um único lugar</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
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

          {/* Botão de Toggle da IA */}
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">IA Adaptativa 🤖</h3>
                <p className="text-purple-100 text-sm">
                  {iaConfig?.iaLigada === 1 
                    ? "🟫 Modo Automático - Executando ações aprendidas" 
                    : "🧠 Modo Aprendizado - Registrando suas ações"}
                </p>
              </div>
              <button
                onClick={() => toggleIA.mutate()}
                disabled={toggleIA.isPending}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                  iaConfig?.iaLigada === 1 ? "bg-green-500" : "bg-gray-600"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                    iaConfig?.iaLigada === 1 ? "translate-x-12" : "translate-x-1"
                  }`}
                >
                  <span className="flex h-full w-full items-center justify-center text-2xl">
                    {iaConfig?.iaLigada === 1 ? "🟫" : "🔴"}
                  </span>
                </span>
              </button>
            </div>
            {iaStats && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs text-purple-100">Ações Registradas</p>
                  <p className="text-2xl font-bold text-white">{iaStats.totalAcoesRegistradas}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs text-purple-100">Padrões Aprendidos</p>
                  <p className="text-2xl font-bold text-white">{iaStats.totalPadroesAprendidos}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs text-purple-100">Alta Confiança</p>
                  <p className="text-2xl font-bold text-white">{iaStats.padroesAltaConfianca}</p>
                </div>
              </div>
            )}
          </div>

          {/* Calendário Interativo */}
          <CalendarioInterativo />

          {/* Metrics Cards */}
          {metricas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Registros</CardTitle>
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{metricas.totalRegistros}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(metricas.valorTotal)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tarefas Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{metricas.tarefasPendentes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tarefas Urgentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{metricas.tarefasProximas}</div>
                  <p className="text-xs text-gray-500 mt-1">Próximas 72h</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="registros" className="space-y-6">
            <TabsList>
              <TabsTrigger value="registros">Registros</TabsTrigger>
              <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
            </TabsList>

            {/* Registros Tab */}
            <TabsContent value="registros" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por assunto, cliente ou documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas Categorias</SelectItem>
                        <SelectItem value="Missão/Viagem">Missão/Viagem</SelectItem>
                        <SelectItem value="Contas a Pagar">Contas a Pagar</SelectItem>
                        <SelectItem value="Controle de Caixa/Aporte">Controle de Caixa/Aporte</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Realizado">Realizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
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
                    {registrosFiltrados && registrosFiltrados.length > 0 ? (
                      registrosFiltrados.map((registro) => (
                        <TableRow key={registro.id} className="hover:bg-gray-50">
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
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhum registro encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Tarefas Tab */}
            <TabsContent value="tarefas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tarefas Pendentes</CardTitle>
                  <CardDescription>Gerencie suas tarefas e prazos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tarefas && tarefas.filter(t => t.status === "Pendente").length > 0 ? (
                      tarefas.filter(t => t.status === "Pendente").map((tarefa) => {
                        const urgencia = getTarefaUrgencia(tarefa.dataVencimento);
                        const Icon = urgencia.icon;
                        return (
                          <div key={tarefa.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                            <Icon className={`h-5 w-5 mt-0.5 ${urgencia.color}`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{tarefa.titulo}</h4>
                              <p className="text-sm text-gray-500 mt-1">{tarefa.descricao}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  Vencimento: {new Date(tarefa.dataVencimento).toLocaleDateString("pt-BR")}
                                </span>
                                <Badge variant="outline" className={urgencia.color}>
                                  {urgencia.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-gray-500 py-8">Nenhuma tarefa pendente.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
