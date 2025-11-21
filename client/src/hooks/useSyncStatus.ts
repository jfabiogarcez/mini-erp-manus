import { useEffect, useState } from "react";

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
}

/**
 * Hook para monitorar status de sincronização e conectividade
 * Detecta quando o usuário está offline e gerencia sincronização automática
 */
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
  });

  useEffect(() => {
    // Monitorar mudanças de conectividade
    const handleOnline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        isOnline: true,
        isSyncing: true,
      }));

      // Iniciar sincronização automática
      syncData();
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncData = async () => {
    try {
      // Sincronizar dados com o servidor
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
          pendingChanges: 0,
        }));
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
      }));
    }
  };

  return {
    ...syncStatus,
    syncData,
  };
}
