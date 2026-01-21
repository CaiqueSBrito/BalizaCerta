import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Car, FileText, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentProfile {
  first_name: string;
  last_name: string;
  whatsapp: string;
  avatar_url: string | null;
  tem_veiculo: boolean;
  dificuldades: string;
}

export function StudentSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>({
    first_name: '',
    last_name: '',
    whatsapp: '',
    avatar_url: null,
    tem_veiculo: false,
    dificuldades: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, whatsapp, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          return;
        }

        // Fetch student-specific data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('tem_veiculo, dificuldades, whatsapp')
          .eq('id', user.id)
          .single();

        if (studentError && studentError.code !== 'PGRST116') {
          console.error('Erro ao buscar dados do aluno:', studentError);
        }

        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          whatsapp: studentData?.whatsapp || profileData.whatsapp || '',
          avatar_url: profileData.avatar_url,
          tem_veiculo: studentData?.tem_veiculo || false,
          dificuldades: studentData?.dificuldades || '',
        });
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          whatsapp: profile.whatsapp,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast.error('Erro ao salvar perfil');
        return;
      }

      // Update/upsert student data
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          id: user.id,
          whatsapp: profile.whatsapp,
          tem_veiculo: profile.tem_veiculo,
          dificuldades: profile.dificuldades,
        });

      if (studentError) {
        console.error('Erro ao atualizar dados do aluno:', studentError);
        toast.error('Erro ao salvar configurações do aluno');
        return;
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Informações básicas do seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {profile.first_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nome</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              value={profile.whatsapp}
              onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Specific */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Informações de Aprendizado
          </CardTitle>
          <CardDescription>
            Dados específicos para personalizar seu aprendizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Has Vehicle */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="tem_veiculo" className="font-medium">
                Possui veículo próprio?
              </Label>
              <p className="text-sm text-muted-foreground">
                Marque se você tem um carro para praticar
              </p>
            </div>
            <Switch
              id="tem_veiculo"
              checked={profile.tem_veiculo}
              onCheckedChange={(checked) => setProfile({ ...profile, tem_veiculo: checked })}
            />
          </div>

          {/* Difficulties */}
          <div className="space-y-2">
            <Label htmlFor="dificuldades" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Dificuldades
            </Label>
            <Textarea
              id="dificuldades"
              value={profile.dificuldades}
              onChange={(e) => setProfile({ ...profile, dificuldades: e.target.value })}
              placeholder="Descreva suas principais dificuldades na direção (ex: baliza, ladeira, embreagem...)"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Isso ajuda os instrutores a personalizar suas aulas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
