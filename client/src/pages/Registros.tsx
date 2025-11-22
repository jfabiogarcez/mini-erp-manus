import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface Registro {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
}

export default function Registros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const adicionarRegistro = () => {
    if (titulo.trim()) {
      const novoRegistro: Registro = {
        id: Date.now(),
        titulo,
        descricao,
        data: new Date().toLocaleDateString("pt-BR"),
      };
      setRegistros([novoRegistro, ...registros]);
      setTitulo("");
      setDescricao("");
    }
  };

  const deletarRegistro = (id: number) => {
    setRegistros(registros.filter((r) => r.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Registros</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Novo Registro</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
          <Button onClick={adicionarRegistro} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Registro
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {registros.length === 0 ? (
          <p className="text-gray-600">Nenhum registro adicionado ainda.</p>
        ) : (
          registros.map((registro) => (
            <Card key={registro.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{registro.titulo}</h3>
                  <p className="text-gray-600 text-sm">{registro.descricao}</p>
                  <p className="text-gray-400 text-xs mt-2">{registro.data}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletarRegistro(registro.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
