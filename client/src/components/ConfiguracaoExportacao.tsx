import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Mail, MessageCircle, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface ConfiguracaoExportacaoProps {
  abaId?: number;
  rotaPagina: string;
}

export default function ConfiguracaoExportacao({ abaId, rotaPagina }: ConfiguracaoExportacaoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    pastaDestino: "",
    modeloDocumento: "padrao",
    canalExportacao: "email" as "email" | "whatsapp" | "ambos",
    destinatarioEmail: "",
    destinatarioWhatsApp: "",
    nomeArquivo: "",
    formatoExportacao: "excel" as "excel" | "pdf" | "word",
  });

  // Carregar configuração salva
  useEffect(() => {
    const saved = localStorage.getItem(`exportacao-${rotaPagina}`);
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, [rotaPagina]);

  const handleSalvar = () => {
    localStorage.setItem(`exportacao-${rotaPagina}`, JSON.stringify(config));
    toast.success("Configuração de exportação salva!");
    setIsOpen(false);
  };

  const handleExportar = () => {
    // Validações
    if (!config.pastaDestino && !config.destinatarioEmail && !config.destinatarioWhatsApp) {
      toast.error("Configure ao menos um destino de exportação");
      return;
    }

    toast.info("Exportando dados...");
    
    // TODO: Implementar lógica real de exportação
    setTimeout(() => {
      if (config.canalExportacao === "email" || config.canalExportacao === "ambos") {
        toast.success(`Arquivo enviado para ${config.destinatarioEmail}`);
      }
      if (config.canalExportacao === "whatsapp" || config.canalExportacao === "ambos") {
        toast.success(`Arquivo enviado para WhatsApp ${config.destinatarioWhatsApp}`);
      }
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Configurar Exportação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração de Exportação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pasta de Destino */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <Label htmlFor="pastaDestino">Pasta de Destino / Link</Label>
            </div>
            <Input
              id="pastaDestino"
              placeholder="Ex: /documentos/exportacoes ou https://drive.google.com/..."
              value={config.pastaDestino}
              onChange={(e) => setConfig({ ...config, pastaDestino: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Caminho local ou URL onde os arquivos serão salvos
            </p>
          </div>

          {/* Formato de Exportação */}
          <div className="space-y-2">
            <Label htmlFor="formatoExportacao">Formato do Arquivo</Label>
            <Select
              value={config.formatoExportacao}
              onValueChange={(value: any) =>
                setConfig({ ...config, formatoExportacao: value })
              }
            >
              <SelectTrigger id="formatoExportacao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                <SelectItem value="word">Word (.docx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Arquivo */}
          <div className="space-y-2">
            <Label htmlFor="nomeArquivo">Nome do Arquivo (opcional)</Label>
            <Input
              id="nomeArquivo"
              placeholder="Ex: relatorio_{data}"
              value={config.nomeArquivo}
              onChange={(e) => setConfig({ ...config, nomeArquivo: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Use {"{data}"} para incluir a data atual
            </p>
          </div>

          {/* Modelo de Documento */}
          <div className="space-y-2">
            <Label htmlFor="modeloDocumento">Modelo de Documento</Label>
            <Select
              value={config.modeloDocumento}
              onValueChange={(value) =>
                setConfig({ ...config, modeloDocumento: value })
              }
            >
              <SelectTrigger id="modeloDocumento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">Padrão do Sistema</SelectItem>
                <SelectItem value="orcamento">Modelo de Orçamento</SelectItem>
                <SelectItem value="relatorio">Modelo de Relatório</SelectItem>
                <SelectItem value="contrato">Modelo de Contrato</SelectItem>
                <SelectItem value="nota_fiscal">Modelo de Nota Fiscal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Canal de Exportação */}
          <div className="space-y-4">
            <Label>Canal de Envio</Label>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="canal-email"
                  checked={config.canalExportacao === "email" || config.canalExportacao === "ambos"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig({
                        ...config,
                        canalExportacao:
                          config.canalExportacao === "whatsapp" ? "ambos" : "email",
                      });
                    } else {
                      setConfig({
                        ...config,
                        canalExportacao:
                          config.canalExportacao === "ambos" ? "whatsapp" : "email",
                      });
                    }
                  }}
                />
                <Mail className="h-5 w-5 text-blue-600" />
                <Label htmlFor="canal-email" className="cursor-pointer">
                  Email
                </Label>
              </div>

              {(config.canalExportacao === "email" || config.canalExportacao === "ambos") && (
                <Input
                  placeholder="email@exemplo.com"
                  value={config.destinatarioEmail}
                  onChange={(e) =>
                    setConfig({ ...config, destinatarioEmail: e.target.value })
                  }
                  className="ml-8"
                />
              )}

              <div className="flex items-center gap-3">
                <Checkbox
                  id="canal-whatsapp"
                  checked={
                    config.canalExportacao === "whatsapp" || config.canalExportacao === "ambos"
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig({
                        ...config,
                        canalExportacao:
                          config.canalExportacao === "email" ? "ambos" : "whatsapp",
                      });
                    } else {
                      setConfig({
                        ...config,
                        canalExportacao:
                          config.canalExportacao === "ambos" ? "email" : "whatsapp",
                      });
                    }
                  }}
                />
                <MessageCircle className="h-5 w-5 text-green-600" />
                <Label htmlFor="canal-whatsapp" className="cursor-pointer">
                  WhatsApp
                </Label>
              </div>

              {(config.canalExportacao === "whatsapp" || config.canalExportacao === "ambos") && (
                <Input
                  placeholder="+55 11 99999-9999"
                  value={config.destinatarioWhatsApp}
                  onChange={(e) =>
                    setConfig({ ...config, destinatarioWhatsApp: e.target.value })
                  }
                  className="ml-8"
                />
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleExportar}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Agora
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar}>Salvar Configuração</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
