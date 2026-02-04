import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminCheck, 
  useAdminUsers, 
  useAdminLessons, 
  useAdminMetrics 
} from '@/hooks/useAdmin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMetricsCards } from '@/components/admin/AdminMetricsCards';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminSubscriptionsTable } from '@/components/admin/AdminSubscriptionsTable';
import { AdminLessonsTable } from '@/components/admin/AdminLessonsTable';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminPanel = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  
  const [activeTab, setActiveTab] = useState('users');
  
  const [userFilters, setUserFilters] = useState<{
    userType: 'student' | 'instructor' | 'all';
    subscriptionStatus: 'free' | 'pro' | 'all';
    city: string;
  }>({
    userType: 'all',
    subscriptionStatus: 'all',
    city: '',
  });
  
  const [lessonFilters, setLessonFilters] = useState({
    status: 'all',
    instructorId: '',
    dateFrom: '',
    dateTo: '',
  });

  const { data: users, isLoading: usersLoading } = useAdminUsers(userFilters);
  const { data: lessons, isLoading: lessonsLoading } = useAdminLessons(lessonFilters);
  const { data: metrics, isLoading: metricsLoading } = useAdminMetrics();

  // Loading state
  if (authLoading || adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar o painel administrativo.
            Esta área é restrita a administradores.
          </p>
          <a href="/" className="text-primary hover:underline inline-block mt-4">
            Voltar para Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie usuários, assinaturas e agendamentos da plataforma
            </p>
          </div>

          {/* Metrics Cards - Always visible */}
          <AdminMetricsCards metrics={metrics} isLoading={metricsLoading} />

          {/* Tab Content */}
          {activeTab === 'users' && (
            <AdminUsersTable
              users={users}
              isLoading={usersLoading}
              filters={userFilters}
              onFilterChange={setUserFilters}
            />
          )}

          {activeTab === 'subscriptions' && (
            <AdminSubscriptionsTable
              users={users}
              isLoading={usersLoading}
            />
          )}

          {activeTab === 'lessons' && (
            <AdminLessonsTable
              lessons={lessons}
              isLoading={lessonsLoading}
              filters={lessonFilters}
              onFilterChange={setLessonFilters}
            />
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <AdminMetricsCards metrics={metrics} isLoading={metricsLoading} />
              <AdminLessonsTable
                lessons={lessons}
                isLoading={lessonsLoading}
                filters={lessonFilters}
                onFilterChange={setLessonFilters}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
