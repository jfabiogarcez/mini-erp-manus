import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit, Trash2, Save, X, Brain, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Aprendizados() {
  const { data: aprendizados, isLoading, refetch } = trpc.aprendizados.listAll.useQuery();
  const { data: iaConfig } = trpc.ia.getConfig.useQuery();
  const createMutation = trpc.aprendizados.create.useMutation();
  const updateMutation = trpc.aprendizados.update.useMutation();
  const deleteMutation = trpc.aprendizados.delete.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    confianca: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Aprendizado atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          ativo: 1,
          aprendidoAutomaticamente: 0,
        });
        toast.success("Aprendizado criado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ titulo: "", descricao: "", categoria: "", confianca: 100 });
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar aprendizado");
    }
  };

  const handleEdit = (aprendizado: any) => {
    setEditingId(aprendizado.id);
    setFormData({
      titulo: aprendizado.titulo,
      descricao: aprendizado.descricao,
      categoria: aprendizado.categoria || "",
      confianca: aprendizado.confianca || 100,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este aprendizado?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Aprendizado excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir aprendizado");
    }
  };

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 80) return "text-green-600 bg-green-50";
    if (confianca >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
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
              <Brain className="h-8 w-8 text-purple-600" />
              Aprendizados da IA
            </h1>
            <p className="text-gray-500 mt-1">
              Conhecimentos que a IA usa para tomar decisões automáticas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingId(null);
                setFormData({ titulo: "", descricao: "", categoria: "", confianca: 100 });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aprendizado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Aprendizado" : "Novo Aprendizado"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Categorizar transportes automaticamente"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o que a IA deve fazer..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      placeholder="Ex: Multas, Tarefas, Registros"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confianca">Confiança (%)</Label>
                    <Input
                      id="confianca"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.confianca}
                      onChange={(e) => setFormData({ ...formData, confianca: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status da IA */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {iaConfig?.iaLigada === 1 ? "🟢 IA Ativada" : "🔴 IA Desativada"}
                </h3>
                <p className="text-purple-100">
                  {iaConfig?.iaLigada === 1
                    ? "A IA está executando ações automaticamente com base nos aprendizados"
                    : "A IA está em modo de aprendizado, registrando suas ações"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{aprendizados?.length || 0}</p>
                <p className="text-purple-100">Aprendizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Aprendizados */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Aprendizados</CardTitle>
            <CardDescription>
              Conhecimentos que a IA aplica quando está ativada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aprendizados || aprendizados.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum aprendizado cadastrado ainda</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Aprendizado
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {aprendizados.map((aprendizado, index) => (
                  <div
                    key={aprendizado.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {aprendizado.titulo}
                              {aprendizado.aprendidoAutomaticamente === 1 && (
                                <Badge variant="outline" className="text-xs">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </h3>
                            {aprendizado.categoria && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {aprendizado.categoria}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${getConfiancaColor(aprendizado.confianca || 0)}`}>
                              {aprendizado.confianca}% confiança
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(aprendizado)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(aprendizado.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{aprendizado.descricao}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {aprendizado.vezesAplicado !== null && aprendizado.vezesAplicado > 0 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Aplicado {aprendizado.vezesAplicado}x
                            </span>
                          )}
                          {aprendizado.ultimaAplicacao && (
                            <span>
                              Última vez: {new Date(aprendizado.ultimaAplicacao).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          {aprendizado.ativo === 1 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Como funciona?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>IA Desativada:</strong> Registra suas ações e aprende padrões automaticamente</li>
              <li>• <strong>IA Ativada:</strong> Executa ações automaticamente baseadas nos aprendizados</li>
              <li>• <strong>Confiança:</strong> Quanto maior, mais a IA confia nesse aprendizado (mínimo 80% para executar)</li>
              <li>• <strong>Edite livremente:</strong> Você pode corrigir ou ajustar qualquer aprendizado a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
