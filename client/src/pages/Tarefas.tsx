import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";

interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
  data: string;
}

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [titulo, setTitulo] = useState("");

  const adicionarTarefa = () => {
    if (titulo.trim()) {
      const novaTarefa: Tarefa = {
        id: Date.now(),
        titulo,
        concluida: false,
        data: new Date().toLocaleDateString("pt-BR"),
      };
      setTarefas([novaTarefa, ...tarefas]);
      setTitulo("");
    }
  };

  const toggleTarefa = (id: number) => {
    setTarefas(
      tarefas.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  };

  const deletarTarefa = (id: number) => {
    setTarefas(tarefas.filter((t) => t.id !== id));
  };

  const tarefasAtivas = tarefas.filter((t) => !t.concluida);
  const tarefasConcluidas = tarefas.filter((t) => t.concluida);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tarefas</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Nova Tarefa</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Descrição da tarefa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && adicionarTarefa()}
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <Button onClick={adicionarTarefa}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {tarefasAtivas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Ativas ({tarefasAtivas.length})
            </h3>
            <div className="space-y-2">
              {tarefasAtivas.map((tarefa) => (
                <Card key={tarefa.id} className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleTarefa(tarefa.id)}
                    className="flex-shrink-0"
                  >
                    <Circle className="w-6 h-6 text-gray-400" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium">{tarefa.titulo}</p>
                    <p className="text-sm text-gray-500">{tarefa.data}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletarTarefa(tarefa.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tarefasConcluidas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Concluídas ({tarefasConcluidas.length})
            </h3>
            <div className="space-y-2">
              {tarefasConcluidas.map((tarefa) => (
                <Card key={tarefa.id} className="p-4 flex items-center gap-3 bg-gray-50">
                  <button
                    onClick={() => toggleTarefa(tarefa.id)}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium line-through text-gray-500">
                      {tarefa.titulo}
                    </p>
                    <p className="text-sm text-gray-500">{tarefa.data}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletarTarefa(tarefa.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tarefas.length === 0 && (
          <p className="text-gray-600 text-center py-8">
            Nenhuma tarefa adicionada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
