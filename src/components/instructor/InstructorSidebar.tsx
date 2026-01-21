import { Calendar, Users, TrendingUp, Settings, LogOut, Car } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ActiveModule = 'agenda' | 'alunos' | 'evolucao' | 'configuracoes';

interface InstructorSidebarProps {
  activeModule: ActiveModule;
  onModuleChange: (module: ActiveModule) => void;
  instructorName: string;
  avatarUrl: string | null;
  plan: 'free' | 'pro';
  isVerified: boolean;
  onSignOut: () => void;
}

const menuItems = [
  { id: 'agenda' as const, title: 'Minha Agenda', icon: Calendar },
  { id: 'alunos' as const, title: 'Meus Alunos', icon: Users },
  { id: 'evolucao' as const, title: 'Evolução Fácil', icon: TrendingUp },
  { id: 'configuracoes' as const, title: 'Configurações', icon: Settings },
];

export function InstructorSidebar({ 
  activeModule, 
  onModuleChange, 
  instructorName,
  avatarUrl,
  plan,
  isVerified,
  onSignOut 
}: InstructorSidebarProps) {
  return (
    <Sidebar 
      collapsible="icon"
      className="border-r h-full shrink-0 flex flex-col"
    >
      <SidebarHeader className="p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Painel do Instrutor</span>
            <span className="text-xs text-muted-foreground">BalizaCerta</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Scrollable menu content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onModuleChange(item.id)}
                    isActive={activeModule === item.id}
                    tooltip={item.title}
                    className={`transition-colors ${
                      activeModule === item.id 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t shrink-0 mt-auto">
        <div className="flex items-center gap-3 mb-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
            <AvatarImage src={avatarUrl || undefined} alt={instructorName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {instructorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-medium text-sm truncate">{instructorName}</span>
            <div className="flex items-center gap-1">
              <Badge 
                variant={plan === 'pro' ? 'default' : 'secondary'} 
                className={`text-[10px] px-1.5 py-0 ${
                  plan === 'pro' 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0' 
                    : ''
                }`}
              >
                {plan === 'pro' ? 'PRO' : 'FREE'}
              </Badge>
              {isVerified && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-500/50">
                  ✓
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
