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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Layers, 
  Link as LinkIcon,
  ChevronRight,
  Settings
} from "lucide-react";
import { toast } from "sonner";

// Ícones disponíveis para seleção
const iconesDisponiveis = [
  { nome: "Layers", label: "Camadas" },
  { nome: "FileText", label: "Documento" },
  { nome: "DollarSign", label: "Dinheiro" },
  { nome: "Users", label: "Usuários" },
  { nome: "Calendar", label: "Calendário" },
  { nome: "Mail", label: "Email" },
  { nome: "MessageCircle", label: "Chat" },
  { nome: "ShoppingCart", label: "Carrinho" },
  { nome: "Package", label: "Pacote" },
  { nome: "Truck", label: "Caminhão" },
];

// Tipos de campos disponíveis
const tiposCampo = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Número" },
  { value: "data", label: "Data" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "select", label: "Seleção" },
  { value: "checkbox", label: "Checkbox" },
  { value: "textarea", label: "Área de Texto" },
  { value: "arquivo", label: "Arquivo" },
  { value: "moeda", label: "Moeda" },
];

export default function GerenciadorAbas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAba, setEditingAba] = useState<any>(null);
  const [abas, setAbas] = useState<any[]>([]);
  const [campos, setCampos] = useState<any[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<any[]>([]);

  // Estado para criar nova aba
  const [novaAba, setNovaAba] = useState({
    nome: "",
    icone: "Layers",
    rota: "",
    abaPaiId: null,
  });

  // Estado para adicionar campos
  const [novoCampo, setNovoCampo] = useState({
    nome: "",
    tipo: "texto",
    obrigatorio: false,
    opcoes: "",
  });

  const handleCriarAba = () => {
    if (!novaAba.nome || !novaAba.rota) {
      toast.error("Preencha nome e rota da aba");
      return;
    }

    const aba = {
      id: Date.now(),
      ...novaAba,
      ordem: abas.length,
      ativo: true,
      campos: [],
    };

    setAbas([...abas, aba]);
    toast.success("Aba criada com sucesso!");
    setNovaAba({ nome: "", icone: "Layers", rota: "", abaPaiId: null });
    setIsDialogOpen(false);
  };

  const handleExcluirAba = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta aba?")) {
      setAbas(abas.filter(aba => aba.id !== id));
      toast.success("Aba excluída com sucesso!");
    }
  };

  const handleAdicionarCampo = (abaId: number) => {
    if (!novoCampo.nome) {
      toast.error("Preencha o nome do campo");
      return;
    }

    const campo = {
      id: Date.now(),
      abaId,
      ...novoCampo,
      ordem: campos.filter(c => c.abaId === abaId).length,
    };

    setCampos([...campos, campo]);
    
    // Atualizar aba com novo campo
    setAbas(abas.map(aba => 
      aba.id === abaId 
        ? { ...aba, campos: [...(aba.campos || []), campo] }
        : aba
    ));

    toast.success("Campo adicionado com sucesso!");
    setNovoCampo({ nome: "", tipo: "texto", obrigatorio: false, opcoes: "" });
  };

  const handleCriarRelacionamento = (abaOrigemId: number, abaDestinoId: number) => {
    const relacionamento = {
      id: Date.now(),
      abaOrigemId,
      abaDestinoId,
      tipoRelacionamento: "um-para-muitos",
      ativo: true,
    };

    setRelacionamentos([...relacionamentos, relacionamento]);
    toast.success("Relacionamento criado com sucesso!");
  };

  const abasPrincipais = abas.filter(aba => !aba.abaPaiId);
  const getSubAbas = (abaPaiId: number) => abas.filter(aba => aba.abaPaiId === abaPaiId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Abas</h1>
              </div>
              <p className="text-gray-600">Crie e gerencie abas personalizadas do sistema</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAba(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Aba
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Aba</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="campos">Campos</TabsTrigger>
                    <TabsTrigger value="relacionamentos">Relacionamentos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome da Aba *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Contratos, Vendas..."
                        value={novaAba.nome}
                        onChange={(e) => setNovaAba({ ...novaAba, nome: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="rota">Rota (URL) *</Label>
                      <Input
                        id="rota"
                        placeholder="Ex: /contratos, /vendas..."
                        value={novaAba.rota}
                        onChange={(e) => setNovaAba({ ...novaAba, rota: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="icone">Ícone</Label>
                      <Select
                        value={novaAba.icone}
                        onValueChange={(value) => setNovaAba({ ...novaAba, icone: value })}
                      >
                        <SelectTrigger id="icone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconesDisponiveis.map((icone) => (
                            <SelectItem key={icone.nome} value={icone.nome}>
                              {icone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="abaPai">Aba Pai (para criar sub-aba)</Label>
                      <Select
                        value={novaAba.abaPaiId?.toString() || "nenhuma"}
                        onValueChange={(value) => 
                          setNovaAba({ 
                            ...novaAba, 
                            abaPaiId: value === "nenhuma" ? null : parseInt(value) 
                          })
                        }
                      >
                        <SelectTrigger id="abaPai">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhuma">Nenhuma (Aba Principal)</SelectItem>
                          {abasPrincipais.map((aba) => (
                            <SelectItem key={aba.id} value={aba.id.toString()}>
                              {aba.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCriarAba}>
                        Criar Aba
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="campos" className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Defina os campos que esta aba terá. Primeiro crie a aba, depois adicione campos.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Campos serão configurados após criar a aba
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="relacionamentos" className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Configure relacionamentos com outras abas para criar um sistema integrado.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Relacionamentos serão configurados após criar a aba
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Abas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {abas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma aba criada. Clique em "Nova Aba" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                abasPrincipais.map((aba) => (
                  <>
                    <TableRow key={aba.id}>
                      <TableCell className="font-medium">{aba.nome}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {aba.rota}
                        </code>
                      </TableCell>
                      <TableCell>{aba.icone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {aba.campos?.length || 0} campos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>Principal</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={aba.ativo ? "default" : "secondary"}>
                          {aba.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAba(aba);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirAba(aba.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Sub-abas */}
                    {getSubAbas(aba.id).map((subAba) => (
                      <TableRow key={subAba.id} className="bg-gray-50">
                        <TableCell className="pl-12">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            {subAba.nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {subAba.rota}
                          </code>
                        </TableCell>
                        <TableCell>{subAba.icone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subAba.campos?.length || 0} campos
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Sub-aba</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subAba.ativo ? "default" : "secondary"}>
                            {subAba.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExcluirAba(subAba.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Estatísticas */}
        {abas.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total de Abas</p>
              <p className="text-3xl font-bold text-blue-600">{abas.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Campos Criados</p>
              <p className="text-3xl font-bold text-green-600">{campos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Relacionamentos</p>
              <p className="text-3xl font-bold text-purple-600">{relacionamentos.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
