import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, TrendingUp, Target, Award, Zap } from 'lucide-react';

interface ProgressItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  category: 'básico' | 'intermediário' | 'avançado';
}

// Mock data visual - será integrado com backend posteriormente
const progressItems: ProgressItem[] = [
  {
    id: '1',
    title: 'Domínio de Embreagem',
    description: 'Controle suave ao sair e parar',
    progress: 85,
    isCompleted: false,
    category: 'básico',
  },
  {
    id: '2',
    title: 'Uso de Retrovisores',
    description: 'Verificação constante antes de manobras',
    progress: 100,
    isCompleted: true,
    category: 'básico',
  },
  {
    id: '3',
    title: 'Baliza 3 Pontos',
    description: 'Estacionamento em vaga paralela',
    progress: 60,
    isCompleted: false,
    category: 'intermediário',
  },
  {
    id: '4',
    title: 'Controle de Ladeira',
    description: 'Partida em subida sem retroceder',
    progress: 45,
    isCompleted: false,
    category: 'intermediário',
  },
  {
    id: '5',
    title: 'Curvas em Alta Velocidade',
    description: 'Controle de direção em curvas',
    progress: 30,
    isCompleted: false,
    category: 'avançado',
  },
  {
    id: '6',
    title: 'Direção Defensiva',
    description: 'Antecipação de riscos no trânsito',
    progress: 20,
    isCompleted: false,
    category: 'avançado',
  },
];

const categoryColors = {
  'básico': 'bg-green-500/10 text-green-600 border-green-500/20',
  'intermediário': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'avançado': 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function StudentProgress() {
  const completedCount = progressItems.filter(item => item.isCompleted).length;
  const totalProgress = Math.round(
    progressItems.reduce((acc, item) => acc + item.progress, 0) / progressItems.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Evolução Fácil</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe seu progresso nas habilidades de direção
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalProgress}%</p>
              <p className="text-sm text-muted-foreground">Progresso Geral</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Habilidades Dominadas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{progressItems.length - completedCount}</p>
              <p className="text-sm text-muted-foreground">Em Desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Checklist de Habilidades
          </CardTitle>
          <CardDescription>
            Suas habilidades de direção organizadas por nível de dificuldade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all ${
                item.isCompleted 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-card hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className={`font-medium ${item.isCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
                      {item.title}
                    </h4>
                    <Badge variant="outline" className={categoryColors[item.category]}>
                      {item.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <Progress 
                      value={item.progress} 
                      className="flex-1 h-2"
                    />
                    <span className={`text-sm font-medium min-w-[3rem] text-right ${
                      item.isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievement Preview */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Conquistas em Breve!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Complete habilidades para desbloquear conquistas e certificados de progresso.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
