import { Users, Calendar, CreditCard, BarChart3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
  { id: 'lessons', label: 'Agendamentos', icon: Calendar },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
