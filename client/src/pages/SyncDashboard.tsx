import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Database,
  FileUp,
  RefreshCw,
  BarChart3,
  HardDrive,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SyncMetrics {
  totalFiles: number;
  totalSize: number;
  lastSync: string;
  filesAdded: number;
  filesUpdated: number;
  filesDeleted: number;
  syncStatus: "idle" | "syncing" | "error";
  errorMessage?: string;
}

interface StorageInfo {
  used: number;
  total: number;
  available: number;
}

/**
 * Dashboard de Métricas de Sincronização
 * Exibe estatísticas de sincronização com OneDrive, banco de dados e métricas gerais
 */
export default function SyncDashboard() {
  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalFiles: 0,
    totalSize: 0,
    lastSync: new Date().toISOString(),
    filesAdded: 0,
    filesUpdated: 0,
    filesDeleted: 0,
    syncStatus: "idle",
  });

  const [storage, setStorage] = useState<StorageInfo>({
    used: 0,
    total: 0,
    available: 0,
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Simular carregamento de métricas
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Simular dados de métricas
      const mockMetrics: SyncMetrics = {
        totalFiles: 1247,
        totalSize: 5368709120, // 5GB
        lastSync: new Date().toISOString(),
        filesAdded: 45,
        filesUpdated: 12,
        filesDeleted: 3,
        syncStatus: "idle",
      };

      setMetrics(mockMetrics);

      // Simular dados de armazenamento
      const mockStorage: StorageInfo = {
        used: 5368709120,
        total: 1099511627776, // 1TB
        available: 1094142918656,
      };

      setStorage(mockStorage);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simular sincronização
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMetrics((prev) => ({
        ...prev,
        syncStatus: "idle",
        lastSync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      setMetrics((prev) => ({
        ...prev,
        syncStatus: "error",
        errorMessage: "Erro ao sincronizar com OneDrive",
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const storagePercentage = (storage.used / storage.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard de Sincronização
          </h1>
          <p className="text-gray-600">
            Monitore o status de sincronização com OneDrive e banco de dados
          </p>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status de Sincronização */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Status de Sincronização
              </h3>
              {metrics.syncStatus === "idle" ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : metrics.syncStatus === "syncing" ? (
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.syncStatus === "idle"
                ? "Sincronizado"
                : metrics.syncStatus === "syncing"
                ? "Sincronizando..."
                : "Erro"}
            </p>
            <p className="text-sm text-gray-600">
              Última sincronização:{" "}
              {new Date(metrics.lastSync).toLocaleString("pt-BR")}
            </p>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-4 w-full"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Agora
                </>
              )}
            </Button>
          </Card>

          {/* Arquivos */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Arquivos</h3>
              <FileUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {metrics.totalFiles.toLocaleString()}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Adicionados:</span>
                <span className="font-semibold text-green-600">
                  +{metrics.filesAdded}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atualizados:</span>
                <span className="font-semibold text-blue-600">
                  {metrics.filesUpdated}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deletados:</span>
                <span className="font-semibold text-red-600">
                  -{metrics.filesDeleted}
                </span>
              </div>
            </div>
          </Card>

          {/* Tamanho Total */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tamanho Total
              </h3>
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatBytes(metrics.totalSize)}
            </p>
            <p className="text-sm text-gray-600">
              Armazenado em OneDrive
            </p>
          </Card>
        </div>

        {/* Armazenamento */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Armazenamento OneDrive
          </h3>
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Espaço Usado
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(storagePercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Usado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBytes(storage.used)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponível</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBytes(storage.available)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBytes(storage.total)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações de Sincronização */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações de Sincronização
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Banco de Dados</p>
              <p className="text-2xl font-bold text-blue-600">MySQL</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Armazenamento</p>
              <p className="text-2xl font-bold text-green-600">OneDrive</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Modo</p>
              <p className="text-2xl font-bold text-purple-600">Automático</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Frequência</p>
              <p className="text-2xl font-bold text-indigo-600">30s</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
