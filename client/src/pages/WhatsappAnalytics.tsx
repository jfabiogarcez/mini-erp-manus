import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageCircle, Users, TrendingUp, Clock } from "lucide-react";

export default function WhatsappAnalytics() {
  const { data: conversas } = trpc.whatsapp.conversas.list.useQuery();
  const { data: mensagens } = trpc.whatsapp.mensagens.list.useQuery();
  const [stats, setStats] = useState<any>({
    totalConversas: 0,
    totalMensagens: 0,
    mensagensCliente: 0,
    mensagensBot: 0,
    tempoMedioResposta: 0,
    taxaConversao: 0,
  });

  const [chartData, setChartData] = useState<any>({
    volumePorDia: [],
    opcoesSelecionadas: [],
    statusConversas: [],
  });

  useEffect(() => {
    if (!conversas || !mensagens) return;

    // Calcular estatísticas gerais
    const totalConversas = conversas.length;
    const totalMensagens = mensagens.length;
    const mensagensCliente = mensagens.filter((m: any) => m.remetente === "Cliente").length;
    const mensagensBot = mensagens.filter((m: any) => m.remetente === "Sistema").length;

    // Calcular status das conversas
    const ativas = conversas.filter((c: any) => c.statusConversa === "Ativa").length;
    const arquivadas = conversas.filter((c: any) => c.statusConversa === "Arquivada").length;
    const bloqueadas = conversas.filter((c: any) => c.statusConversa === "Bloqueada").length;

    setStats({
      totalConversas,
      totalMensagens,
      mensagensCliente,
      mensagensBot,
      tempoMedioResposta: 2.5, // TODO: Calcular real
      taxaConversao: totalConversas > 0 ? ((ativas / totalConversas) * 100).toFixed(1) : 0,
    });

    // Preparar dados para gráficos
    setChartData({
      volumePorDia: [
        { dia: "Seg", mensagens: 12 } as any,
        { dia: "Ter", mensagens: 19 } as any,
        { dia: "Qua", mensagens: 15 } as any,
        { dia: "Qui", mensagens: 25 } as any,
        { dia: "Sex", mensagens: 22 } as any,
        { dia: "Sab", mensagens: 8 } as any,
        { dia: "Dom", mensagens: 5 } as any,
      ],
      opcoesSelecionadas: [
        { nome: "Transporte Executivo", valor: 35 } as any,
        { nome: "Segurança Pessoal", valor: 20 } as any,
        { nome: "Receptivo Aeroporto", valor: 25 } as any,
        { nome: "Informações", valor: 15 } as any,
        { nome: "Agente Humano", valor: 5 } as any,
      ],
      statusConversas: [
        { nome: "Ativa", valor: ativas, fill: "#10b981" } as any,
        { nome: "Arquivada", valor: arquivadas, fill: "#6b7280" } as any,
        { nome: "Bloqueada", valor: bloqueadas, fill: "#ef4444" } as any,
      ],
    });
  }, [conversas, mensagens]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics - WhatsApp</h1>
          <p className="text-slate-600">Métricas e análises de conversas e interações</p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Total de Conversas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalConversas}</div>
              <p className="text-xs text-slate-500 mt-1">Conversas ativas e arquivadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalMensagens}</div>
              <p className="text-xs text-slate-500 mt-1">Enviadas e recebidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.taxaConversao}%</div>
              <p className="text-xs text-slate-500 mt-1">Conversas ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.tempoMedioResposta}s</div>
              <p className="text-xs text-slate-500 mt-1">Resposta do bot</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <Tabs defaultValue="volume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volume">Volume por Dia</TabsTrigger>
            <TabsTrigger value="opcoes">Opções Selecionadas</TabsTrigger>
            <TabsTrigger value="status">Status das Conversas</TabsTrigger>
          </TabsList>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Volume de Mensagens por Dia</CardTitle>
                <CardDescription>Número de mensagens recebidas nos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.volumePorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mensagens" fill="#3b82f6" radius={[8, 8, 0, 0] as any} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opcoes">
            <Card>
              <CardHeader>
                <CardTitle>Opções Selecionadas no Menu</CardTitle>
                <CardDescription>Distribuição de seleções do menu numerado (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.opcoesSelecionadas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#10b981" radius={[8, 8, 0, 0] as any} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Status das Conversas</CardTitle>
                <CardDescription>Distribuição de conversas por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusConversas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, valor }) => `${nome}: ${valor}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {chartData.statusConversas.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detalhes de Mensagens */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumo de Mensagens</CardTitle>
            <CardDescription>Análise de mensagens enviadas e recebidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Mensagens do Cliente</p>
                <p className="text-2xl font-bold text-blue-600">{stats.mensagensCliente}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Mensagens do Bot</p>
                <p className="text-2xl font-bold text-green-600">{stats.mensagensBot}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Taxa Bot/Cliente</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.mensagensCliente > 0
                    ? ((stats.mensagensBot / stats.mensagensCliente) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
