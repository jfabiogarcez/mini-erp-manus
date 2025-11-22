import { StatusBadge, SendingProgress } from "@/components/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";

export interface MensagemComStatus {
  id: number;
  conversaId: number;
  remetente: "Cliente" | "Sistema";
  mensagem: string;
  statusEnvio: "Pendente" | "Processando" | "Enviado" | "Falhou";
  dataEnvio: Date;
  lida: number;
}

interface MensagensComStatusProps {
  mensagens: MensagemComStatus[];
  loading?: boolean;
  conversaId?: number;
}

export function MensagensComStatus({
  mensagens,
  loading = false,
  conversaId,
}: MensagensComStatusProps) {
  const mensagensFiltered = conversaId
    ? mensagens.filter((m) => m.conversaId === conversaId)
    : mensagens;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mensagensFiltered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhuma mensagem</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mensagensFiltered.map((msg) => (
        <Card key={msg.id} className="overflow-hidden">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      msg.remetente === "Cliente"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {msg.remetente}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.dataEnvio).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-foreground break-words">{msg.mensagem}</p>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={msg.statusEnvio} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Componente para exibir resumo de status de múltiplas mensagens
 */
export function ResumoStatusMensagens({
  mensagens,
}: {
  mensagens: MensagemComStatus[];
}) {
  const statusCounts = {
    Pendente: mensagens.filter((m) => m.statusEnvio === "Pendente").length,
    Processando: mensagens.filter((m) => m.statusEnvio === "Processando").length,
    Enviado: mensagens.filter((m) => m.statusEnvio === "Enviado").length,
    Falhou: mensagens.filter((m) => m.statusEnvio === "Falhou").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(statusCounts).map(([status, count]) => (
        <Card key={status} className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{count}</div>
            <div className="text-xs text-muted-foreground mt-1">{status}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Componente para exibir progresso de envio de uma mensagem
 */
export function ProgressoMensagem({
  msg,
  showDetails = true,
}: {
  msg: MensagemComStatus;
  showDetails?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{msg.mensagem.substring(0, 50)}...</span>
        <StatusBadge status={msg.statusEnvio} size="sm" />
      </div>
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {msg.statusEnvio === "Processando" && "Enviando..."}
          {msg.statusEnvio === "Enviado" && "Entregue com sucesso"}
          {msg.statusEnvio === "Falhou" && "Erro ao enviar - será retentado"}
          {msg.statusEnvio === "Pendente" && "Aguardando processamento"}
        </div>
      )}
    </div>
  );
}
