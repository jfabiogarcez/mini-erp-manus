import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Type, Layout } from "lucide-react";
import { toast } from "sonner";

interface CustomizadorVisualProps {
  rotaPagina: string;
}

const fontesDisponiveis = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
];

const tamanhosBase = [12, 14, 16, 18, 20, 22, 24];

export default function CustomizadorVisual({ rotaPagina }: CustomizadorVisualProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customizacao, setCustomizacao] = useState({
    corPrimaria: "#3b82f6",
    corSecundaria: "#10b981",
    corFundo: "#f9fafb",
    fonteFamilia: "Inter",
    fonteTamanho: 16,
  });

  // Carregar customização salva do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`customizacao-${rotaPagina}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomizacao(parsed);
      aplicarCustomizacao(parsed);
    }
  }, [rotaPagina]);

  const aplicarCustomizacao = (config: typeof customizacao) => {
    const root = document.documentElement;
    root.style.setProperty("--cor-primaria", config.corPrimaria);
    root.style.setProperty("--cor-secundaria", config.corSecundaria);
    root.style.setProperty("--cor-fundo", config.corFundo);
    root.style.setProperty("--fonte-familia", config.fonteFamilia);
    root.style.setProperty("--fonte-tamanho", `${config.fonteTamanho}px`);
  };

  const handleSalvar = () => {
    // Salvar no localStorage
    localStorage.setItem(`customizacao-${rotaPagina}`, JSON.stringify(customizacao));
    
    // Aplicar customização
    aplicarCustomizacao(customizacao);
    
    toast.success("Customização salva com sucesso!");
    setIsOpen(false);
  };

  const handleResetar = () => {
    const padrao = {
      corPrimaria: "#3b82f6",
      corSecundaria: "#10b981",
      corFundo: "#f9fafb",
      fonteFamilia: "Inter",
      fonteTamanho: 16,
    };
    
    setCustomizacao(padrao);
    localStorage.removeItem(`customizacao-${rotaPagina}`);
    aplicarCustomizacao(padrao);
    
    toast.success("Customização resetada!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 shadow-lg z-50"
        >
          <Palette className="h-4 w-4 mr-2" />
          Customizar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customização Visual</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cores */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Cores</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="corPrimaria"
                    type="color"
                    value={customizacao.corPrimaria}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corPrimaria: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customizacao.corPrimaria}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corPrimaria: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="corSecundaria"
                    type="color"
                    value={customizacao.corSecundaria}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corSecundaria: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customizacao.corSecundaria}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corSecundaria: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="corFundo">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="corFundo"
                    type="color"
                    value={customizacao.corFundo}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corFundo: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customizacao.corFundo}
                    onChange={(e) =>
                      setCustomizacao({ ...customizacao, corFundo: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tipografia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Tipografia</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fonteFamilia">Fonte</Label>
                <Select
                  value={customizacao.fonteFamilia}
                  onValueChange={(value) =>
                    setCustomizacao({ ...customizacao, fonteFamilia: value })
                  }
                >
                  <SelectTrigger id="fonteFamilia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontesDisponiveis.map((fonte) => (
                      <SelectItem key={fonte} value={fonte}>
                        <span style={{ fontFamily: fonte }}>{fonte}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fonteTamanho">Tamanho Base (px)</Label>
                <Select
                  value={customizacao.fonteTamanho.toString()}
                  onValueChange={(value) =>
                    setCustomizacao({ ...customizacao, fonteTamanho: parseInt(value) })
                  }
                >
                  <SelectTrigger id="fonteTamanho">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tamanhosBase.map((tamanho) => (
                      <SelectItem key={tamanho} value={tamanho.toString()}>
                        {tamanho}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Pré-visualização</h3>
            </div>

            <div
              className="p-6 rounded-lg border-2"
              style={{
                backgroundColor: customizacao.corFundo,
                fontFamily: customizacao.fonteFamilia,
                fontSize: `${customizacao.fonteTamanho}px`,
              }}
            >
              <h4
                className="text-2xl font-bold mb-2"
                style={{ color: customizacao.corPrimaria }}
              >
                Título de Exemplo
              </h4>
              <p className="mb-4">
                Este é um texto de exemplo para visualizar as configurações de tipografia.
              </p>
              <Button
                style={{
                  backgroundColor: customizacao.corPrimaria,
                  color: "white",
                }}
              >
                Botão Primário
              </Button>
              <Button
                variant="outline"
                className="ml-2"
                style={{
                  borderColor: customizacao.corSecundaria,
                  color: customizacao.corSecundaria,
                }}
              >
                Botão Secundário
              </Button>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleResetar}>
              Resetar Padrão
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar}>Salvar Customização</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
