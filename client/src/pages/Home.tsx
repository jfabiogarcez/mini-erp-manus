import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BarChart3, Users, Package, DollarSign, TrendingUp, Settings } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Gerencie seu Negócio com Inteligência
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sistema completo de gestão empresarial com automação inteligente,
              sincronização em nuvem e relatórios em tempo real.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <a href={getLoginUrl()}>Começar Agora</a>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Relatórios Inteligentes</h3>
              <p className="text-gray-600">
                Dashboards em tempo real com métricas de vendas, estoque e finanças
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Clientes</h3>
              <p className="text-gray-600">
                Controle completo de clientes, pedidos e histórico de compras
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Package className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Controle de Estoque</h3>
              <p className="text-gray-600">
                Gerencie produtos, estoque e alertas de reposição automaticamente
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para usuários autenticados
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.name}</span>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Vendas Hoje</p>
                <p className="text-3xl font-bold text-gray-900">R$ 12.450</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12% vs ontem
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Novos Clientes</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +8% vs semana passada
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Produtos</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <Package className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-gray-600 text-sm">12 precisam reposição</p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Pedidos Hoje</p>
                <p className="text-3xl font-bold text-gray-900">47</p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +15% vs ontem
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Atividades Recentes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <div>
                  <p className="font-medium">Venda #1234</p>
                  <p className="text-sm text-gray-600">Cliente: João Silva</p>
                </div>
                <span className="text-green-600 font-semibold">R$ 450</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <div>
                  <p className="font-medium">Produto Adicionado</p>
                  <p className="text-sm text-gray-600">Notebook Dell</p>
                </div>
                <span className="text-gray-600 text-sm">Há 2h</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Novo Cliente</p>
                  <p className="text-sm text-gray-600">Maria Santos</p>
                </div>
                <span className="text-gray-600 text-sm">Há 3h</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
