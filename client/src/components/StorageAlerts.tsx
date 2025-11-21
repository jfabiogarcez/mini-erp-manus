import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface StorageAlert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
}

interface StorageAlertsProps {
  usedStorage: number;
  totalStorage: number;
  onAlertDismiss?: (alertId: string) => void;
}

/**
 * Componente de Alertas de Armazenamento
 * Monitora uso de armazenamento e exibe alertas automáticos
 */
export function StorageAlerts({
  usedStorage,
  totalStorage,
  onAlertDismiss,
}: StorageAlertsProps) {
  const [alerts, setAlerts] = useState<StorageAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const newAlerts: StorageAlert[] = [];
    const percentage = (usedStorage / totalStorage) * 100;

    // Alerta crítico (>90%)
    if (percentage > 90) {
      newAlerts.push({
        id: "critical-storage",
        type: "critical",
        title: "Armazenamento Crítico",
        message: `Você está usando ${Math.round(percentage)}% do seu armazenamento. Libere espaço em breve.`,
        action: {
          label: "Gerenciar Arquivos",
          onClick: () => console.log("Abrir gerenciador de arquivos"),
        },
        dismissible: true,
      });
    }
    // Alerta de aviso (>75%)
    else if (percentage > 75) {
      newAlerts.push({
        id: "warning-storage",
        type: "warning",
        title: "Armazenamento Quase Cheio",
        message: `Você está usando ${Math.round(percentage)}% do seu armazenamento. Considere liberar espaço.`,
        action: {
          label: "Ver Detalhes",
          onClick: () => console.log("Ver detalhes de armazenamento"),
        },
        dismissible: true,
      });
    }
    // Info quando está abaixo de 50%
    else if (percentage < 50) {
      newAlerts.push({
        id: "info-storage",
        type: "info",
        title: "Armazenamento Disponível",
        message: `Você tem ${Math.round(100 - percentage)}% de espaço disponível.`,
        dismissible: false,
      });
    }

    setAlerts(newAlerts);
  }, [usedStorage, totalStorage]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    onAlertDismiss?.(alertId);
  };

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  );

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => (
        <Card
          key={alert.id}
          className={`p-4 border-l-4 ${
            alert.type === "critical"
              ? "border-l-red-600 bg-red-50"
              : alert.type === "warning"
              ? "border-l-yellow-600 bg-yellow-50"
              : "border-l-blue-600 bg-blue-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === "critical" ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : alert.type === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold ${
                  alert.type === "critical"
                    ? "text-red-900"
                    : alert.type === "warning"
                    ? "text-yellow-900"
                    : "text-blue-900"
                }`}
              >
                {alert.title}
              </h3>
              <p
                className={`text-sm mt-1 ${
                  alert.type === "critical"
                    ? "text-red-700"
                    : alert.type === "warning"
                    ? "text-yellow-700"
                    : "text-blue-700"
                }`}
              >
                {alert.message}
              </p>

              {/* Barra de Progresso */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span
                    className={
                      alert.type === "critical"
                        ? "text-red-700"
                        : alert.type === "warning"
                        ? "text-yellow-700"
                        : "text-blue-700"
                    }
                  >
                    Espaço Usado
                  </span>
                  <span
                    className={
                      alert.type === "critical"
                        ? "text-red-700"
                        : alert.type === "warning"
                        ? "text-yellow-700"
                        : "text-blue-700"
                    }
                  >
                    {Math.round((usedStorage / totalStorage) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      alert.type === "critical"
                        ? "bg-red-600"
                        : alert.type === "warning"
                        ? "bg-yellow-600"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min((usedStorage / totalStorage) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-3">
                {alert.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={alert.action.onClick}
                    className={
                      alert.type === "critical"
                        ? "border-red-600 text-red-600 hover:bg-red-50"
                        : alert.type === "warning"
                        ? "border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                        : "border-blue-600 text-blue-600 hover:bg-blue-50"
                    }
                  >
                    {alert.action.label}
                  </Button>
                )}

                {alert.dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(alert.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Descartar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
