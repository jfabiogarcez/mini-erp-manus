import { useEffect, useState } from "react";
import { Bell, X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

/**
 * Componente de notificações em tempo real
 * Exibe notificações de sincronização, alterações de dados e eventos do sistema
 */
export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simular WebSocket para notificações em tempo real
    const handleNotification = (event: CustomEvent<Notification>) => {
      const newNotification = {
        ...event.detail,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      // Auto-remover após 5 segundos se for info
      if (newNotification.type === "info") {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 5000);
      }
    };

    window.addEventListener(
      "notification",
      handleNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "notification",
        handleNotification as EventListener
      );
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <>
      {/* Bell Icon com Badge */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Painel de Notificações */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-50 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Lista de Notificações */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getBackgroundColor(notification.type)} ${
                    !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
              >
                Limpar Tudo
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Helper para enviar notificações
 */
export function sendNotification(
  type: "success" | "error" | "info" | "warning",
  title: string,
  message: string
) {
  const event = new CustomEvent("notification", {
    detail: { type, title, message },
  });
  window.dispatchEvent(event);
}
