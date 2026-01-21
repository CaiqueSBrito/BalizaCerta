import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MessageCircle, Loader2, LogIn } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { format, isBefore, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BookingFormProps {
  instructorId: string;
  instructorName: string;
  instructorWhatsApp?: string | null;
  pricePerHour: number;
  isPro?: boolean;
}

// Available time slots
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export function BookingForm({ 
  instructorId, 
  instructorName, 
  pricePerHour,
  isPro = false 
}: BookingFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);

  // Fetch student name when user is available
  useMemo(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    
    if (data) {
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Aluno';
      setStudentName(fullName);
    }
  }, [user]);

  // Disable past dates
  const disabledDays = useMemo(() => {
    return { before: startOfDay(new Date()) };
  }, []);

  // Check if booking can be made
  const canBook = selectedDate && selectedTime && user;

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setIsBooking(true);

    try {
      // Format date for database (YYYY-MM-DD)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // 1. Create the lesson record
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          instructor_id: instructorId,
          student_id: user.id,
          scheduled_date: formattedDate,
          scheduled_time: selectedTime,
          duration_minutes: 60,
          status: 'pending',
          notes: `Agendado via BalizaCerta`
        });

      if (lessonError) {
        console.error('Error creating lesson:', lessonError);
        toast.error('Erro ao criar agendamento. Tente novamente.');
        return;
      }

      // 2. Get instructor's WhatsApp using the contact_instructor RPC
      const { data: whatsapp, error: contactError } = await supabase.rpc('contact_instructor', {
        p_instructor_id: instructorId
      });

      if (contactError) {
        console.error('Error contacting instructor:', contactError);
        // Still show success for the booking, but inform about WhatsApp issue
        toast.success('Aula agendada com sucesso!');
        toast.info('Não foi possível abrir o WhatsApp. Entre em contato diretamente.');
        resetForm();
        return;
      }

      // 3. Open WhatsApp with pre-filled message
      if (whatsapp) {
        const phone = whatsapp.replace(/\D/g, '');
        const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
        
        const formattedDateDisplay = format(selectedDate, "dd 'de' MMMM", { locale: ptBR });
        const message = encodeURIComponent(
          `Olá ${instructorName}, sou o aluno ${studentName || 'Aluno'} do BalizaCerta! ` +
          `Gostaria de agendar uma aula para o dia ${formattedDateDisplay} às ${selectedTime}. ` +
          `Podemos confirmar?`
        );
        
        window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
      }

      toast.success('🎉 Aula agendada com sucesso! Aguarde a confirmação do instrutor.');
      resetForm();
      
    } catch (error) {
      console.error('Unexpected error during booking:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsBooking(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Card className={`border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <CardHeader className="text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle>Agende sua aula</CardTitle>
          <CardDescription>
            Faça login para agendar uma aula com este instrutor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full gap-2"
            variant={isPro ? 'default' : 'default'}
          >
            <LogIn className="w-4 h-4" />
            Fazer Login para Agendar
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Não tem conta? <button onClick={() => navigate('/cadastro')} className="text-primary hover:underline">Cadastre-se grátis</button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${isPro ? 'border-accent/30' : 'border-border'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Agende sua Aula
        </CardTitle>
        <CardDescription>
          Selecione uma data e horário disponível
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ptBR}
            disabled={disabledDays}
            className="rounded-md border pointer-events-auto"
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className={`${
                    selectedTime === time 
                      ? isPro 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-primary text-primary-foreground'
                      : ''
                  }`}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Resumo do Agendamento</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-bold text-primary">R$ {pricePerHour}/hora</span>
            </div>
            <Badge variant="outline" className="mt-2 text-yellow-600 border-yellow-500/50">
              Status: Pendente confirmação
            </Badge>
          </div>
        )}

        {/* Booking Button */}
        <Button
          onClick={handleBooking}
          disabled={!canBook || isBooking}
          className={`w-full h-12 text-base font-semibold gap-2 ${
            isPro 
              ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
              : 'bg-verified text-verified-foreground hover:bg-verified/90'
          }`}
        >
          {isBooking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Agendando...
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              {canBook ? 'Agendar e Contatar via WhatsApp' : 'Selecione data e horário'}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Ao agendar, você será redirecionado para o WhatsApp do instrutor para confirmar a aula.
        </p>
      </CardContent>
    </Card>
  );
}
