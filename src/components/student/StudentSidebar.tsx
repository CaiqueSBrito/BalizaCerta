import { Calendar, Users, TrendingUp, Settings, LogOut, GraduationCap } from 'lucide-react';
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

type ActiveModule = 'agenda' | 'instrutores' | 'evolucao' | 'configuracoes';

interface StudentSidebarProps {
  activeModule: ActiveModule;
  onModuleChange: (module: ActiveModule) => void;
  studentName: string;
  avatarUrl: string | null;
  onSignOut: () => void;
}

const menuItems = [
  { id: 'agenda' as const, title: 'Minha Agenda', icon: Calendar },
  { id: 'instrutores' as const, title: 'Meus Instrutores', icon: Users },
  { id: 'evolucao' as const, title: 'Evolução Fácil', icon: TrendingUp },
  { id: 'configuracoes' as const, title: 'Configurações', icon: Settings },
];

export function StudentSidebar({ 
  activeModule, 
  onModuleChange, 
  studentName,
  avatarUrl,
  onSignOut 
}: StudentSidebarProps) {
  return (
    <Sidebar 
      collapsible="icon"
      className="border-r h-full shrink-0 flex flex-col"
    >
      <SidebarHeader className="p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm">Painel do Aluno</span>
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
            <AvatarImage src={avatarUrl || undefined} alt={studentName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {studentName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-medium text-sm truncate">{studentName}</span>
            <span className="text-xs text-muted-foreground">Aluno</span>
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
