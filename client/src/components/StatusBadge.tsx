import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export type StatusEnvio = "Pendente" | "Processando" | "Enviado" | "Falhou";

interface StatusBadgeProps {
  status: StatusEnvio;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  showLabel = true,
}: StatusBadgeProps) {
  const statusConfig = {
    Pendente: {
      variant: "outline" as const,
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
      label: "Pendente",
      description: "Aguardando processamento",
    },
    Processando: {
      variant: "outline" as const,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Loader2,
      label: "Processando",
      description: "Enviando mensagem...",
    },
    Enviado: {
      variant: "outline" as const,
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
      label: "Enviado",
      description: "Mensagem entregue",
    },
    Falhou: {
      variant: "outline" as const,
      color: "bg-red-50 text-red-700 border-red-200",
      icon: AlertCircle,
      label: "Falhou",
      description: "Erro ao enviar",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const iconSizeClass = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  const paddingClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${config.color} ${paddingClass} rounded-full flex items-center gap-1.5 font-medium border transition-all duration-200 hover:shadow-sm`}
        title={config.description}
      >
        {showIcon && (
          <Icon
            className={`${iconSizeClass} ${
              status === "Processando" ? "animate-spin" : ""
            }`}
          />
        )}
        {showLabel && <span>{config.label}</span>}
      </div>
    </div>
  );
}

/**
 * Componente para exibir status em tabela
 */
export function StatusTableCell({ status }: { status: StatusEnvio }) {
  return <StatusBadge status={status} size="sm" showLabel={true} />;
}

/**
 * Componente para exibir status com tooltip
 */
export function StatusWithTooltip({
  status,
  timestamp,
}: {
  status: StatusEnvio;
  timestamp?: Date;
}) {
  const statusConfig = {
    Pendente: "Aguardando processamento",
    Processando: "Enviando mensagem...",
    Enviado: "Mensagem entregue com sucesso",
    Falhou: "Erro ao enviar - será retentado",
  };

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} size="md" />
      {timestamp && (
        <span className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString("pt-BR")}
        </span>
      )}
    </div>
  );
}

/**
 * Componente para indicador de progresso de envio
 */
export function SendingProgress({ status }: { status: StatusEnvio }) {
  const progressMap = {
    Pendente: 25,
    Processando: 50,
    Enviado: 100,
    Falhou: 0,
  };

  const colorMap = {
    Pendente: "bg-yellow-500",
    Processando: "bg-blue-500",
    Enviado: "bg-green-500",
    Falhou: "bg-red-500",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <StatusBadge status={status} size="sm" />
        <span className="text-xs text-muted-foreground">
          {progressMap[status]}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorMap[status]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progressMap[status]}%` }}
        />
      </div>
    </div>
  );
}
