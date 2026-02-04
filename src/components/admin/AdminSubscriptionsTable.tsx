import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Crown, ExternalLink } from 'lucide-react';
import { AdminUser, useUpdateInstructorPlan } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminSubscriptionsTableProps {
  users: AdminUser[] | undefined;
  isLoading: boolean;
}

export const AdminSubscriptionsTable = ({ users, isLoading }: AdminSubscriptionsTableProps) => {
  const updatePlan = useUpdateInstructorPlan();

  // Filter only instructors
  const instructors = users?.filter(u => u.user_type === 'instructor');

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
          <CreditCard className="w-5 h-5" />
          Gestão de Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status da Assinatura</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead>Stripe Customer ID</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum instrutor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  instructors?.map((user) => (
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
                        <Badge 
                          variant={user.plan === 'pro' ? 'default' : 'outline'} 
                          className={user.plan === 'pro' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {user.plan === 'pro' ? 'Pro' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                          {user.subscription_status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.subscription_end_date 
                          ? format(new Date(user.subscription_end_date), "dd/MM/yyyy", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {user.stripe_customer_id ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {user.stripe_customer_id.substring(0, 18)}...
                            </code>
                            <a 
                              href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={user.plan === 'pro' ? 'outline' : 'default'}
                              className={user.plan !== 'pro' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                            >
                              <Crown className="w-4 h-4 mr-1" />
                              {user.plan === 'pro' ? 'Revogar Pro' : 'Conceder Pro'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.plan === 'pro' ? 'Revogar Pro' : 'Conceder Pro'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.plan === 'pro' 
                                  ? `Tem certeza que deseja revogar o status Pro de ${user.full_name}? Esta ação não afeta a assinatura no Stripe.`
                                  : `Tem certeza que deseja conceder o status Pro para ${user.full_name}? O acesso será válido por 1 ano (cortesia).`
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
