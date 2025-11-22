import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Relatorios() {
  const currentDate = new Date();
  const [tipoRelatorio, setTipoRelatorio] = useState<"Missões" | "Multas" | "Consolidado">("Consolidado");
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [ano, setAno] = useState<number>(currentDate.getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: relatorios, isLoading, refetch } = trpc.relatorios.list.useQuery();

  const gerarMutation = trpc.relatorios.gerar.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem || "Relatório gerado com sucesso!");
      refetch();
      setIsGenerating(false);
      
      // Abrir PDF em nova aba
      if (data.arquivoUrl) {
        window.open(data.arquivoUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
      setIsGenerating(false);
    },
  });

  const handleGerarRelatorio = () => {
    setIsGenerating(true);
    gerarMutation.mutate({
      tipo: tipoRelatorio,
      mes,
      ano,
    });
  };

  const formatarMoeda = (centavos: number | null) => {
    if (!centavos) return "R$ 0,00";
    return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const anos = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">Gere relatórios mensais em PDF de missões, multas e consolidado</p>
        </div>

        {/* Gerador de Relatórios */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Novo Relatório
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="tipo">Tipo de Relatório</Label>
              <Select
                value={tipoRelatorio}
                onValueChange={(value: any) => setTipoRelatorio(value)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Missões">Missões</SelectItem>
                  <SelectItem value="Multas">Multas</SelectItem>
                  <SelectItem value="Consolidado">Consolidado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mes">Mês</Label>
              <Select
                value={mes.toString()}
                onValueChange={(value) => setMes(parseInt(value))}
              >
                <SelectTrigger id="mes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano">Ano</Label>
              <Select
                value={ano.toString()}
                onValueChange={(value) => setAno(parseInt(value))}
              >
                <SelectTrigger id="ano">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((a) => (
                    <SelectItem key={a} value={a.toString()}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGerarRelatorio}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> O relatório será gerado em PDF e aberto automaticamente em uma nova aba. 
              Você também pode acessá-lo no histórico abaixo.
            </p>
          </div>
        </div>

        {/* Histórico de Relatórios */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Histórico de Relatórios
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Carregando relatórios...
            </div>
          ) : !relatorios || relatorios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum relatório gerado ainda. Gere seu primeiro relatório acima!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Missões</TableHead>
                  <TableHead>Multas</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Despesas</TableHead>
                  <TableHead>Gerado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.map((relatorio) => {
                  const mesNome = meses.find(m => m.value === relatorio.mes)?.label || relatorio.mes;
                  
                  return (
                    <TableRow key={relatorio.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          relatorio.tipo === "Missões" 
                            ? "bg-blue-100 text-blue-800"
                            : relatorio.tipo === "Multas"
                            ? "bg-red-100 text-red-800"
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {relatorio.tipo}
                        </span>
                      </TableCell>
                      <TableCell>{mesNome}/{relatorio.ano}</TableCell>
                      <TableCell>{relatorio.totalMissoes || '-'}</TableCell>
                      <TableCell>{relatorio.totalMultas || '-'}</TableCell>
                      <TableCell>{formatarMoeda(relatorio.receitaMissoes)}</TableCell>
                      <TableCell>{formatarMoeda(relatorio.valorMultas)}</TableCell>
                      <TableCell>{formatarData(relatorio.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(relatorio.arquivoUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
