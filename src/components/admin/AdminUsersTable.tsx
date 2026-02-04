import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Ban, CheckCircle, Crown, User } from 'lucide-react';
import { AdminUser, useUpdateUserStatus, useUpdateInstructorPlan } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminUsersTableProps {
  users: AdminUser[] | undefined;
  isLoading: boolean;
  filters: {
    userType: 'student' | 'instructor' | 'all';
    subscriptionStatus: 'free' | 'pro' | 'all';
    city: string;
  };
  onFilterChange: (filters: AdminUsersTableProps['filters']) => void;
}

export const AdminUsersTable = ({ users, isLoading, filters, onFilterChange }: AdminUsersTableProps) => {
  const updateStatus = useUpdateUserStatus();
  const updatePlan = useUpdateInstructorPlan();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users?.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (user: AdminUser) => {
    if (user.instructor_id) {
      updateStatus.mutate({ 
        instructorId: user.instructor_id, 
        isActive: !user.is_active 
      });
    }
  };

  const handleTogglePlan = (user: AdminUser) => {
    if (user.instructor_id) {
      updatePlan.mutate({
        instructorId: user.instructor_id,
        plan: user.plan === 'pro' ? 'free' : 'pro',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Gestão de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.userType}
            onValueChange={(value) => onFilterChange({ ...filters, userType: value as typeof filters.userType })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="instructor">Instrutores</SelectItem>
              <SelectItem value="student">Alunos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.subscriptionStatus}
            onValueChange={(value) => onFilterChange({ ...filters, subscriptionStatus: value as typeof filters.subscriptionStatus })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filtrar por cidade..."
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            className="w-[180px]"
          />
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {user.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.user_type === 'instructor' ? 'default' : 'secondary'}>
                          {user.user_type === 'instructor' ? 'Instrutor' : 'Aluno'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.user_type === 'instructor' && (
                          <Badge variant={user.plan === 'pro' ? 'default' : 'outline'} className={user.plan === 'pro' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                            {user.plan === 'pro' ? 'Pro' : 'Free'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.city && user.state ? `${user.city}, ${user.state}` : '-'}
                      </TableCell>
                      <TableCell>
                        {user.user_type === 'instructor' && (
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Ativo' : 'Banido'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.user_type === 'instructor' && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant={user.plan === 'pro' ? 'outline' : 'default'}
                                    className={user.plan !== 'pro' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                  >
                                    <Crown className="w-4 h-4 mr-1" />
                                    {user.plan === 'pro' ? 'Remover Pro' : 'Tornar Pro'}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.plan === 'pro' ? 'Remover Pro' : 'Conceder Pro'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.plan === 'pro' 
                                        ? `Tem certeza que deseja remover o status Pro de ${user.full_name}?`
                                        : `Tem certeza que deseja conceder o status Pro para ${user.full_name}?`
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleTogglePlan(user)}>
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant={user.is_active ? 'destructive' : 'outline'}
                                  >
                                    {user.is_active ? (
                                      <>
                                        <Ban className="w-4 h-4 mr-1" />
                                        Banir
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Ativar
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.is_active ? 'Banir Usuário' : 'Ativar Usuário'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.is_active 
                                        ? `Tem certeza que deseja banir ${user.full_name}? O usuário não poderá mais acessar a plataforma.`
                                        : `Tem certeza que deseja reativar ${user.full_name}?`
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleToggleStatus(user)}>
                                      Confirmar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
