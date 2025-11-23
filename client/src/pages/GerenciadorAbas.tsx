import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

const TIPOS_CAMPO = [
  "Texto",
  "Número",
  "Data",
  "Email",
  "Telefone",
  "Select",
  "Checkbox",
  "Textarea",
  "Arquivo",
  "Moeda",
];

export default function GerenciadorAbas() {
  const [abas, setAbas] = useState<any[]>([]);
  const [novaAba, setNovaAba] = useState({ nome: "", descricao: "", icone: "📋" });
  const [novoCampo, setNovoCampo] = useState({ nome: "", tipo: "Texto", obrigatorio: false });

  const criarAba = () => {
    if (!novaAba.nome.trim()) {
      toast.error("Nome da aba é obrigatório");
      return;
    }
    const aba = {
      id: Date.now(),
      ...novaAba,
      campos: [],
      criadoEm: new Date().toLocaleDateString("pt-BR"),
    };
    setAbas([...abas, aba]);
    setNovaAba({ nome: "", descricao: "", icone: "📋" });
    toast.success("Aba criada com sucesso!");
  };

  const excluirAba = (id: number) => {
    setAbas(abas.filter((a) => a.id !== id));
    toast.success("Aba excluída com sucesso!");
  };

  const adicionarCampo = (abaId: number) => {
    if (!novoCampo.nome.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }
    const aba = abas.find((a) => a.id === abaId);
    if (aba) {
      aba.campos.push({
        id: Date.now(),
        ...novoCampo,
      });
      setAbas([...abas]);
      setNovoCampo({ nome: "", tipo: "Texto", obrigatorio: false });
      toast.success("Campo adicionado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Abas</h1>
          </div>
          <p className="text-gray-600">Crie e customize abas personalizadas para seu negócio</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-8 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Aba
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Aba</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Aba *</Label>
                <Input
                  value={novaAba.nome}
                  onChange={(e) => setNovaAba({ ...novaAba, nome: e.target.value })}
                  placeholder="Ex: Clientes, Produtos, etc"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={novaAba.descricao}
                  onChange={(e) => setNovaAba({ ...novaAba, descricao: e.target.value })}
                  placeholder="Descrição da aba"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Input
                  value={novaAba.icone}
                  onChange={(e) => setNovaAba({ ...novaAba, icone: e.target.value })}
                  placeholder="📋"
                  maxLength={2}
                />
              </div>
              <Button onClick={criarAba} className="w-full bg-purple-600">
                Criar Aba
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {abas.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-gray-500">
                Nenhuma aba criada ainda. Clique em "Nova Aba" para começar!
              </CardContent>
            </Card>
          ) : (
            abas.map((aba) => (
              <Card key={aba.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{aba.icone}</span>
                      <div>
                        <CardTitle>{aba.nome}</CardTitle>
                        <CardDescription>{aba.descricao || "Sem descrição"}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => excluirAba(aba.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{aba.campos.length}</strong> campo(s)
                    </p>
                    {aba.campos.length > 0 && (
                      <div className="space-y-1">
                        {aba.campos.map((campo: any) => (
                          <div key={campo.id} className="text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{campo.nome}</span>
                            <span className="text-gray-600 ml-2">({campo.tipo})</span>
                            {campo.obrigatorio && <span className="text-red-600 ml-2">*</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-3 w-3 mr-2" />
                        Adicionar Campo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Campo à Aba "{aba.nome}"</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome do Campo *</Label>
                          <Input
                            value={novoCampo.nome}
                            onChange={(e) => setNovoCampo({ ...novoCampo, nome: e.target.value })}
                            placeholder="Ex: Email, Telefone, etc"
                          />
                        </div>
                        <div>
                          <Label>Tipo de Campo</Label>
                          <Select value={novoCampo.tipo} onValueChange={(tipo) => setNovoCampo({ ...novoCampo, tipo })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPOS_CAMPO.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                  {tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="obrigatorio"
                            checked={novoCampo.obrigatorio}
                            onChange={(e) => setNovoCampo({ ...novoCampo, obrigatorio: e.target.checked })}
                          />
                          <Label htmlFor="obrigatorio" className="cursor-pointer">
                            Campo obrigatório
                          </Label>
                        </div>
                        <Button
                          onClick={() => adicionarCampo(aba.id)}
                          className="w-full bg-purple-600"
                        >
                          Adicionar Campo
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <p className="text-xs text-gray-500">Criada em {aba.criadoEm}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
