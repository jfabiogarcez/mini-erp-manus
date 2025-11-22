import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Metricas() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(anoAtual);

  // Buscar dados de missões
  const { data: dadosMissoes, isLoading: loadingMissoes } = trpc.relatorios.agregarMissoes.useQuery({
    mes,
    ano,
  });

  // Buscar dados de multas
  const { data: dadosMultas, isLoading: loadingMultas } = trpc.relatorios.agregarMultas.useQuery({
    mes,
    ano,
  });

  const loading = loadingMissoes || loadingMultas;

  // Preparar dados para gráfico de missões por status
  const dadosMissoesPorStatus = dadosMissoes
    ? [
        { name: "Agendadas", value: dadosMissoes.porStatus.Agendada, fill: "#0088FE" },
        { name: "Em Andamento", value: dadosMissoes.porStatus["Em Andamento"], fill: "#00C49F" },
        { name: "Concluídas", value: dadosMissoes.porStatus.Concluída, fill: "#FFBB28" },
        { name: "Canceladas", value: dadosMissoes.porStatus.Cancelada, fill: "#FF8042" },
      ]
    : [];

  // Preparar dados para gráfico de multas por status
  const dadosMultasPorStatus = dadosMultas
    ? [
        { name: "Pendentes", value: dadosMultas.porStatus.Pendente, fill: "#FF8042" },
        { name: "Pagas", value: dadosMultas.porStatus.Pago, fill: "#00C49F" },
        { name: "Recorridas", value: dadosMultas.porStatus.Recorrido, fill: "#FFBB28" },
        { name: "Canceladas", value: dadosMultas.porStatus.Cancelado, fill: "#8884d8" },
      ]
    : [];

  // Usar ranking de motoristas dos dados agregados
  const rankingMotoristas = dadosMissoes?.rankingMotoristas || [];

  // Formatação de moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor / 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Métricas</h1>
          <p className="text-muted-foreground">Análise de desempenho e KPIs</p>
        </div>

        <div className="flex gap-4">
          <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Missões</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMissoes?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dadosMissoes?.porStatus.Concluída || 0} concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatarMoeda(dadosMissoes?.receitaTotal || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média: {formatarMoeda(dadosMissoes?.receitaMedia || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Multas Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dadosMultas?.porStatus.Pendente || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatarMoeda(dadosMultas?.valorPendente || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dadosMissoes?.total
                    ? Math.round((dadosMissoes.porStatus.Concluída / dadosMissoes.total) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {dadosMissoes?.porStatus.Concluída || 0} de {dadosMissoes?.total || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Missões por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Missões por Status</CardTitle>
                <CardDescription>Distribuição de missões no período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosMissoesPorStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosMissoesPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Multas por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Multas por Status</CardTitle>
                <CardDescription>Situação das multas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosMultasPorStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {dadosMultasPorStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ranking de Motoristas */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Motoristas</CardTitle>
              <CardDescription>Top 5 motoristas mais ativos do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankingMotoristas.length > 0 ? (
                  rankingMotoristas.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.motorista}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.total} missões
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
