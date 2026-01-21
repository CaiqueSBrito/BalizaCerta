import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User, Search, CalendarX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ptBR } from 'date-fns/locale';

interface ScheduledClass {
  id: string;
  instructorName: string;
  instructorAvatar?: string;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending';
}

// Mock data - será substituído por dados reais do Supabase
const mockClasses: ScheduledClass[] = [];

export function StudentAgenda() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [classes] = useState<ScheduledClass[]>(mockClasses);

  const upcomingClasses = classes
    .filter(c => c.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minha Agenda</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas aulas e horários
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Próximas Aulas
            </CardTitle>
            <CardDescription>
              Suas aulas agendadas com instrutores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{classItem.instructorName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {classItem.date.toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{classItem.time}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={classItem.status === 'confirmed' ? 'default' : 'secondary'}
                      className={classItem.status === 'confirmed' 
                        ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                      }
                    >
                      {classItem.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhuma aula marcada</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Você ainda não tem aulas agendadas. Encontre um instrutor e comece sua jornada!
                </p>
                <Button 
                  onClick={() => navigate('/instrutores')}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar Instrutores
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
