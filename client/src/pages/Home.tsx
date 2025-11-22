import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          {!isAuthenticated && (
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          )}
          {isAuthenticated && (
            <span className="text-gray-700">Olá, {user?.name}</span>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Mini-ERP com Automação Manus
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sistema completo de gestão empresarial com automação inteligente
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg">
              <a href={getLoginUrl()}>Começar Agora</a>
            </Button>
          )}
          {isAuthenticated && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <h3 className="text-2xl font-bold mb-4">Dashboard</h3>
              <p className="text-gray-600">Bem-vindo ao seu Mini-ERP!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
