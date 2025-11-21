import { useSyncStatus } from "@/hooks/useSyncStatus";
import { Cloud, CloudOff, Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Componente que exibe o status de sincronização
 * Mostra se está online/offline e o status da última sincronização
 */
export function SyncIndicator() {
  const { isOnline, isSyncing, lastSync } = useSyncStatus();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <>
      {/* Indicador no canto inferior direito */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
            isOnline
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Sincronizando...</span>
            </>
          ) : isOnline ? (
            <>
              <Cloud className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
              {lastSync && (
                <span className="text-xs opacity-75">
                  Última sync: {lastSync.toLocaleTimeString("pt-BR")}
                </span>
              )}
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4" />
              <span className="text-sm font-medium">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Toast de aviso quando fica offline */}
      {showToast && !isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top">
          <p className="font-medium">Você está offline</p>
          <p className="text-sm opacity-90">
            Suas mudanças serão sincronizadas quando reconectar
          </p>
        </div>
      )}

      {/* Toast de sucesso quando sincroniza */}
      {lastSync && !isSyncing && isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <p className="font-medium">Sincronizado com sucesso</p>
          </div>
        </div>
      )}
    </>
  );
}
