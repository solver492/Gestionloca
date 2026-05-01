import { useListNotifications, getListNotificationsQueryKey, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCircle2, Banknote, AlertTriangle, FileText, Wrench, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useListNotifications(
    {},
    { query: { queryKey: getListNotificationsQueryKey() } }
  );

  const markRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ unreadOnly: true }) });
      }
    }
  });

  const markAllRead = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => {
        toast.success("Toutes les notifications ont été marquées comme lues");
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ unreadOnly: true }) });
      }
    }
  });

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'payment_due':
      case 'payment_received': return <Banknote className="h-5 w-5" />;
      case 'contract_expiring': return <FileText className="h-5 w-5" />;
      case 'maintenance_update': return <Wrench className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'reminder': return <AlertTriangle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">Historique de vos alertes et activités récentes.</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="border-primary/20 text-primary hover:bg-primary/10"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur border-card-border shadow-sm">
        <CardHeader className="border-b border-card-border pb-4">
          <CardTitle className="font-serif text-lg">Boîte de réception</CardTitle>
          <CardDescription>
            {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-card-border">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y divide-card-border">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex gap-4 transition-colors hover:bg-sidebar-accent/30 ${!notification.isRead ? 'bg-sidebar-accent/10' : ''}`}
                >
                  <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <div className="mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={markRead.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" /> Marquer comme lu
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Vous êtes à jour !</h3>
              <p className="text-muted-foreground mt-1">Vous n'avez aucune notification pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
