import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminLesson, useUpdateLessonStatus, useExportLessons } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminLessonsTableProps {
  lessons: AdminLesson[] | undefined;
  isLoading: boolean;
  filters: {
    status: string;
    instructorId: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: AdminLessonsTableProps['filters']) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
  confirmed: { label: 'Confirmado', variant: 'default', icon: CheckCircle },
  completed: { label: 'Concluído', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
};

export const AdminLessonsTable = ({ lessons, isLoading, filters, onFilterChange }: AdminLessonsTableProps) => {
  const updateStatus = useUpdateLessonStatus();
  const exportLessons = useExportLessons();

  const handleStatusChange = (lessonId: string, status: string) => {
    updateStatus.mutate({ lessonId, status });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Gestão de Agendamentos
        </CardTitle>
        <Button 
          variant="outline" 
          onClick={() => exportLessons.mutate()}
          disabled={exportLessons.isPending}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">De:</span>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
              className="w-[160px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Até:</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
              className="w-[160px]"
            />
          </div>

          <Button 
            variant="ghost" 
            onClick={() => onFilterChange({ status: 'all', instructorId: '', dateFrom: '', dateTo: '' })}
          >
            Limpar Filtros
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum agendamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons?.map((lesson) => {
                    const config = statusConfig[lesson.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    
                    return (
                      <TableRow key={lesson.id}>
                        <TableCell className="font-medium">
                          {format(new Date(lesson.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{lesson.scheduled_time}</TableCell>
                        <TableCell>{lesson.duration_minutes} min</TableCell>
                        <TableCell className="text-foreground">{lesson.instructor_name}</TableCell>
                        <TableCell className="text-foreground">{lesson.student_name}</TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(lesson.id, 'confirmed')}
                                disabled={lesson.status === 'confirmed'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(lesson.id, 'completed')}
                                disabled={lesson.status === 'completed'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar Concluído
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(lesson.id, 'cancelled')}
                                disabled={lesson.status === 'cancelled'}
                                className="text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
