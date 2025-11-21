import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Página de Login do Microsoft
 * Gerencia autenticação OAuth com Microsoft para acessar OneDrive
 */
export default function MicrosoftLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    // Verificar se é callback de autorização
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setError(`Erro de autenticação: ${errorParam}`);
      return;
    }

    if (code) {
      handleAuthorizationCallback(code);
    }
  }, []);

  const handleAuthorizationCallback = async (code: string) => {
    setIsProcessingCallback(true);
    try {
      // Enviar código para backend para trocar por token
      const response = await fetch("/api/auth/microsoft/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar autenticação");
      }

      const data = await response.json();

      // Armazenar token
      localStorage.setItem("microsoftAccessToken", data.access_token);
      localStorage.setItem("microsoftRefreshToken", data.refresh_token || "");
      localStorage.setItem(
        "microsoftTokenExpiry",
        (Date.now() + data.expires_in * 1000).toString()
      );

      // Redirecionar para dashboard
      setLocation("/sync-dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar autenticação"
      );
      setIsProcessingCallback(false);
    }
  };

  const handleLoginClick = async () => {
    setIsLoading(true);
    try {
      // Obter URL de autorização do backend
      const response = await fetch("/api/auth/microsoft/authorize");
      const data = await response.json();

      // Redirecionar para Microsoft
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao iniciar autenticação"
      );
      setIsLoading(false);
    }
  };

  if (isProcessingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processando Autenticação
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto conectamos sua conta do Microsoft...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conectar OneDrive
          </h1>
          <p className="text-gray-600">
            Sincronize seus arquivos com o Mini-ERP
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Erro</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Benefícios */}
        <div className="mb-8 space-y-3">
          <div className="flex gap-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sincronização Automática</p>
              <p className="text-sm text-gray-600">
                Seus arquivos sincronizam automaticamente
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Armazenamento em Nuvem</p>
              <p className="text-sm text-gray-600">
                Acesse seus arquivos de qualquer lugar
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Segurança</p>
              <p className="text-sm text-gray-600">
                Seus dados são protegidos pela Microsoft
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Login */}
        <Button
          onClick={handleLoginClick}
          disabled={isLoading}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              Conectar com Microsoft
            </>
          )}
        </Button>

        {/* Link Alternativo */}
        <p className="text-center text-sm text-gray-600">
          Já conectado?{" "}
          <button
            onClick={() => setLocation("/sync-dashboard")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Ir para Dashboard
          </button>
        </p>

        {/* Aviso de Privacidade */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Ao conectar, você autoriza o Mini-ERP a acessar seus arquivos no
            OneDrive. Sua privacidade é importante para nós.
          </p>
        </div>
      </Card>
    </div>
  );
}
