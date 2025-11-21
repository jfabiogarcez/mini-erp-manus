import { useState, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const Calendar = withDragAndDrop(BigCalendar);
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, MapPin, User, Car, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'missao' | 'multa';
    data: any;
  };
}

export default function CalendarioInterativo() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showMissoes, setShowMissoes] = useState(true);
  const [showMultas, setShowMultas] = useState(true);
  
  const utils = trpc.useUtils();
  const updateMissao = trpc.missoes.update.useMutation({
    onSuccess: () => {
      utils.missoes.list.invalidate();
      toast.success('✅ Missão reagendada com sucesso!');
    },
    onError: (error) => {
      toast.error('❌ Erro ao reagendar missão: ' + error.message);
    },
  });

  // Buscar missões e multas
  const { data: missoes } = trpc.missoes.list.useQuery();
  const { data: multas } = trpc.multas.listAll.useQuery();

  // Converter dados para eventos do calendário
  const events = useMemo(() => {
    const eventList: CalendarEvent[] = [];

    // Adicionar missões
    if (showMissoes && missoes) {
      missoes.forEach((missao: any) => {
        if (missao.data) {
          const dataEvento = new Date(missao.data);
          eventList.push({
            id: missao.id,
            title: `${missao.cliente || 'Cliente'} - ${missao.servico || 'Serviço'}`,
            start: dataEvento,
            end: dataEvento,
            resource: {
              type: 'missao',
              data: missao,
            },
          });
        }
      });
    }

    // Adicionar multas
    if (showMultas && multas) {
      multas.forEach((multa: any) => {
        if (multa.dataVencimento) {
          const dataVencimento = new Date(multa.dataVencimento);
          eventList.push({
            id: multa.id + 100000, // Offset para evitar conflito de IDs
            title: `Multa: ${multa.veiculoPlaca || 'Veículo'} - R$ ${((multa.valor || 0) / 100).toFixed(2)}`,
            start: dataVencimento,
            end: dataVencimento,
            resource: {
              type: 'multa',
              data: multa,
            },
          });
        }
      });
    }

    return eventList;
  }, [missoes, multas, showMissoes, showMultas]);

  // Estilo dos eventos
  const eventStyleGetter = (event: any) => {
    const isMissao = event.resource.type === 'missao';
    
    return {
      style: {
        backgroundColor: isMissao ? '#3b82f6' : '#ef4444',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
      },
    };
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const handleEventDrop = ({ event, start, end }: any) => {
    // Apenas permitir arrastar missões, não multas
    if (event.resource.type !== 'missao') {
      toast.error('⚠️ Apenas missões podem ser reagendadas');
      return;
    }

    // Atualizar a data da missão
    updateMissao.mutate({
      id: event.id,
      data: start,
    });
  };

  const formatarMoeda = (centavos: number) => {
    return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatarData = (data: Date | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (data: Date | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Filtros */}
      <div className="mb-4 flex items-center gap-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Missões e Multas
        </h2>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-missoes"
              checked={showMissoes}
              onCheckedChange={(checked) => setShowMissoes(checked as boolean)}
            />
            <Label htmlFor="show-missoes" className="flex items-center gap-2 cursor-pointer">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              Missões
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-multas"
              checked={showMultas}
              onCheckedChange={(checked) => setShowMultas(checked as boolean)}
            />
            <Label htmlFor="show-multas" className="flex items-center gap-2 cursor-pointer">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              Multas
            </Label>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor={(event: any) => event.start}
          endAccessor={(event: any) => event.end}
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          draggableAccessor={() => true}
          onEventDrop={handleEventDrop}
          resizable={false}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'Não há eventos neste período.',
            showMore: (total: number) => `+ ${total} mais`,
          }}
          culture="pt-BR"
        />
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.resource.type === 'missao' ? (
                <>
                  <Car className="h-5 w-5 text-blue-600" />
                  Detalhes da Missão
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Detalhes da Multa
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEvent?.resource.type === 'missao' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Cliente</Label>
                  <p className="font-medium">{selectedEvent.resource.data.cliente || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Serviço</Label>
                  <p className="font-medium">{selectedEvent.resource.data.servico || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Data</Label>
                  <p className="font-medium">{formatarData(selectedEvent.resource.data.data)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Horário</Label>
                  <p className="font-medium">{selectedEvent.resource.data.horario || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Motorista</Label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedEvent.resource.data.motorista || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Veículo</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    {selectedEvent.resource.data.veiculo || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Origem</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.resource.data.origem || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Destino</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.resource.data.destino || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Valor</Label>
                  <p className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatarMoeda(selectedEvent.resource.data.valor || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    variant={
                      selectedEvent.resource.data.status === 'Concluída'
                        ? 'default'
                        : selectedEvent.resource.data.status === 'Em Andamento'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {selectedEvent.resource.data.status}
                  </Badge>
                </div>
              </div>
              {selectedEvent.resource.data.observacoes && (
                <div>
                  <Label className="text-gray-600">Observações</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedEvent.resource.data.observacoes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Número do Auto</Label>
                  <p className="font-medium">{selectedEvent?.resource.data.numeroAuto || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Veículo</Label>
                  <p className="font-medium">{selectedEvent?.resource.data.veiculoPlaca || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Data da Infração</Label>
                  <p className="font-medium">{formatarData(selectedEvent?.resource.data.dataInfracao)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Data de Vencimento</Label>
                  <p className="font-medium">{formatarData(selectedEvent?.resource.data.dataVencimento)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Valor</Label>
                  <p className="font-medium text-red-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {formatarMoeda(selectedEvent?.resource.data.valor || 0)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Pontos</Label>
                  <p className="font-medium">{selectedEvent?.resource.data.pontos || 0} pontos</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Local da Infração</Label>
                  <p className="font-medium">{selectedEvent?.resource.data.localInfracao || '-'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Descrição</Label>
                  <p className="text-sm text-gray-700">
                    {selectedEvent?.resource.data.descricaoInfracao || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge
                    variant={
                      selectedEvent?.resource.data.status === 'Pago'
                        ? 'default'
                        : selectedEvent?.resource.data.status === 'Pendente'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {selectedEvent?.resource.data.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
