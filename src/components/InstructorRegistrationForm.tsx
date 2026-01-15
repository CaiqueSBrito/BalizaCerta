import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  instructorRegistrationSchema, 
  type InstructorRegistrationData,
  formatCPF,
  formatWhatsApp 
} from '@/lib/validators';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const CNH_CATEGORIES = ['A', 'B', 'AB', 'C', 'D', 'E'] as const;

const SPECIALTIES_OPTIONS = [
  'Medo de Dirigir',
  'Primeira Habilitação',
  'Reciclagem',
  'Baliza',
  'Direção Defensiva',
  'Aulas para Idosos',
  'Aulas para PCD',
];

interface InstructorRegistrationFormProps {
  onSuccess?: () => void;
}

const InstructorRegistrationForm = ({ onSuccess }: InstructorRegistrationFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<InstructorRegistrationData>({
    resolver: zodResolver(instructorRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      whatsapp: '',
      age: 18,
      cpf: '',
      detranCertificate: '',
      password: '',
      confirmPassword: '',
      bio: '',
      pricePerHour: 0,
      cnhCategory: [],
      cnhYears: 0,
      hasVehicle: false,
      city: '',
      state: '',
      specialties: [],
    },
  });

  const onSubmit = async (data: InstructorRegistrationData) => {
    setIsLoading(true);
    
    try {
      // Verificar se o cliente Supabase está inicializado
      console.log('[InstructorRegistration] Verificando cliente Supabase...');
      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado');
      }
      console.log('[InstructorRegistration] Cliente Supabase OK');

      // Limpar formatação do CPF e WhatsApp antes de enviar
      const cleanCPF = data.cpf.replace(/[^\d]/g, '');
      const cleanWhatsApp = data.whatsapp.replace(/[^\d]/g, '');

      console.log('[InstructorRegistration] Iniciando cadastro para:', data.email);

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: 'instructor',
            whatsapp: cleanWhatsApp,
            age: data.age,
          },
        },
      });

      if (authError) {
        console.error('[InstructorRegistration] Auth error:', authError);
        
        // Tratar erros específicos de autenticação
        if (authError.message.includes('User already registered') || 
            authError.message.includes('already been registered')) {
          toast.error('Este e-mail já está cadastrado', {
            description: 'Tente fazer login ou use outro e-mail.',
          });
          return;
        }
        
        if (authError.message.includes('Password') || 
            authError.message.includes('password')) {
          toast.error('Senha inválida', {
            description: 'A senha deve ter no mínimo 6 caracteres.',
          });
          return;
        }
        
        if (authError.message.includes('email')) {
          toast.error('E-mail inválida', {
            description: 'Por favor, verifique o formato do e-mail.',
          });
          return;
        }
        
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      const userId = authData.user.id;
      console.log('[InstructorRegistration] Usuário criado com ID:', userId);

      // Verificar se temos uma sessão ativa (pode não existir se email confirmation estiver habilitado)
      let session = authData.session;
      
      if (!session) {
        console.log('[InstructorRegistration] Sem sessão imediata. Aguardando sessão...');
        
        // Aguardar a sessão estar ativa
        let attempts = 0;
        const maxAttempts = 15;
        
        while (!session && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id === userId) {
            session = sessionData.session;
            console.log('[InstructorRegistration] Sessão ativa confirmada após espera');
          } else {
            attempts++;
            console.log(`[InstructorRegistration] Aguardando sessão... tentativa ${attempts}/${maxAttempts}`);
          }
        }
      } else {
        console.log('[InstructorRegistration] Sessão ativa imediatamente');
      }

      // Se não temos sessão, pode ser que a confirmação de email esteja habilitada
      if (!session) {
        console.log('[InstructorRegistration] Sem sessão - email confirmation pode estar habilitado');
        toast.info('Confirme seu e-mail', {
          description: 'Enviamos um link de confirmação para seu e-mail. Por favor, confirme para completar o cadastro.',
          duration: 10000,
        });
        form.reset();
        return;
      }

      // Atualizar perfil com CPF (campo sensível)
      console.log('[InstructorRegistration] Atualizando perfil...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          cpf: cleanCPF,
          whatsapp: cleanWhatsApp,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('[InstructorRegistration] Profile update error:', profileError);
        // Não lançar erro aqui pois o perfil foi criado pelo trigger
      } else {
        console.log('[InstructorRegistration] Perfil atualizado com CPF e WhatsApp');
      }

      // Preparar dados do instrutor para inserção
      const instructorData = {
        profile_id: userId,
        bio: data.bio || null,
        price_per_hour: data.pricePerHour || 0,
        cnh_category: data.cnhCategory as ("A" | "B" | "C" | "D" | "E")[],
        cnh_years: data.cnhYears,
        has_vehicle: data.hasVehicle,
        city: data.city || null,
        state: data.state ? data.state.toUpperCase() : null,
        specialties: data.specialties || [],
        detran_certificate: data.detranCertificate || null,
        plan: 'free' as const,
        is_active: true,
        is_verified: false,
      };

      console.log('[InstructorRegistration] Inserindo dados do instrutor:', instructorData);

      // Criar registro do instrutor com retry para erros de rede
      let insertedInstructor = null;
      let instructorError = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase
            .from('instructors')
            .insert(instructorData)
            .select()
            .single();
          
          if (result.error) {
            instructorError = result.error;
            console.error(`[InstructorRegistration] Tentativa ${retryCount + 1} falhou:`, result.error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            insertedInstructor = result.data;
            instructorError = null;
            break;
          }
        } catch (fetchError) {
          console.error(`[InstructorRegistration] Network error tentativa ${retryCount + 1}:`, fetchError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            instructorError = { message: 'Erro de conexão. Por favor, verifique sua internet e tente novamente.' };
          }
        }
      }

      if (instructorError) {
        console.error('[InstructorRegistration] Instructor insert error:', instructorError);
        console.error('[InstructorRegistration] Error details:', {
          message: instructorError.message,
          details: instructorError.details,
          hint: instructorError.hint,
          code: instructorError.code,
        });
        throw new Error(`Erro ao salvar dados do instrutor: ${instructorError.message}`);
      }

      console.log('[InstructorRegistration] Instrutor criado com sucesso:', insertedInstructor);

      toast.success('Cadastro realizado com sucesso!', {
        description: 'Você foi logado automaticamente. Redirecionando...',
      });
      
      form.reset();
      
      // Redirecionar após cadastro bem-sucedido
      // O usuário já está logado automaticamente pelo signUp
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirecionar para a home ou painel do instrutor
        navigate('/');
      }
    } catch (error) {
      console.error('[InstructorRegistration] Erro no cadastro:', error);
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Dados Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="João" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(11) 99999-9999" 
                      {...field}
                      onChange={(e) => field.onChange(formatWhatsApp(e.target.value))}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormDescription>Formato: (00) 00000-0000</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={18} 
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field}
                      onChange={(e) => field.onChange(formatCPF(e.target.value))}
                      maxLength={14}
                    />
                  </FormControl>
                  <FormDescription>Formato: 000.000.000-00</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="detranCertificate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado/Credencial DETRAN *</FormLabel>
                <FormControl>
                  <Input placeholder="Número do certificado de instrutor" {...field} />
                </FormControl>
                <FormDescription>
                  Número da sua credencial de instrutor junto ao DETRAN
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Senha */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Segurança
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Mínimo 8 caracteres, com maiúscula, minúscula e número
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações Profissionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Informações Profissionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cnhCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias de CNH *</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CNH_CATEGORIES.map((category) => (
                      <Label
                        key={category}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                          field.value.includes(category)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary'
                        }`}
                      >
                        <Checkbox
                          checked={field.value.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, category]);
                            } else {
                              field.onChange(field.value.filter((v) => v !== category));
                            }
                          }}
                          className="sr-only"
                        />
                        {category}
                      </Label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnhYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anos de CNH *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={50}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por Hora (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={1000}
                      step={5}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasVehicle"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 pt-8">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    Possuo veículo próprio para aulas
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biografia</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Conte um pouco sobre sua experiência e método de ensino..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Máximo 500 caracteres</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidades</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_OPTIONS.map((specialty) => (
                    <Label
                      key={specialty}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                        field.value?.includes(specialty)
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : 'bg-background border-border hover:border-secondary'
                      }`}
                    >
                      <Checkbox
                        checked={field.value?.includes(specialty)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), specialty]);
                          } else {
                            field.onChange(field.value?.filter((v) => v !== specialty) || []);
                          }
                        }}
                        className="sr-only"
                      />
                      {specialty}
                    </Label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Localização
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Cadastrar como Instrutor
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          Seus dados pessoais (CPF e email) são protegidos e não serão exibidos publicamente.
        </p>
      </form>
    </Form>
  );
};

export default InstructorRegistrationForm;
