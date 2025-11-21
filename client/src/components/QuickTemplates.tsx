import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { toast } from "sonner";

export interface Template {
  id: number;
  titulo: string;
  conteudo: string;
  variaveis?: string[];
  categoria?: string;
  vezesUsado?: number;
}

interface QuickTemplatesProps {
  templates: Template[];
  onSelectTemplate?: (template: Template) => void;
  onCreateTemplate?: (template: Omit<Template, "id">) => Promise<void>;
  onDeleteTemplate?: (id: number) => Promise<void>;
  onEditTemplate?: (id: number, template: Omit<Template, "id">) => Promise<void>;
}

export function QuickTemplates({
  templates,
  onSelectTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  onEditTemplate,
}: QuickTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "Geral",
  });

  const filteredTemplates = templates.filter(
    (t) =>
      t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.conteudo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      if (editingId) {
        await onEditTemplate?.(editingId, {
          ...formData,
          variaveis: [],
          vezesUsado: 0,
        });
        toast.success("Template atualizado!");
        setEditingId(null);
      } else {
        await onCreateTemplate?.({
          ...formData,
          variaveis: [],
          vezesUsado: 0,
        });
        toast.success("Template criado!");
      }

      setFormData({ titulo: "", conteudo: "", categoria: "Geral" });
      setShowForm(false);
    } catch (error) {
      toast.error("Erro ao salvar template");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este template?")) {
      try {
        await onDeleteTemplate?.(id);
        toast.success("Template deletado!");
      } catch (error) {
        toast.error("Erro ao deletar template");
      }
    }
  };

  const handleEdit = (template: Template) => {
    setFormData({
      titulo: template.titulo,
      conteudo: template.conteudo,
      categoria: template.categoria || "Geral",
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Templates Rápidos</h3>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ titulo: "", conteudo: "", categoria: "Geral" });
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Título
              </label>
              <Input
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Ex: Saudação"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Conteúdo
              </label>
              <textarea
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                placeholder="Ex: Olá! Como posso ajudar?"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
              >
                <option>Geral</option>
                <option>Saudação</option>
                <option>Despedida</option>
                <option>Informação</option>
                <option>Suporte</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Templates */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum template encontrado
            </p>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {template.titulo}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {template.conteudo}
                    </p>
                    {template.categoria && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {template.categoria}
                      </span>
                    )}
                    {template.vezesUsado ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Usado {template.vezesUsado}x
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectTemplate?.(template)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Usar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(template)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(template.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
