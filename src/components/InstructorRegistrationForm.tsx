import { useState, useEffect } from 'react';
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
import { 
  sanitizeText, 
  sanitizeName, 
  sanitizeCity,
  mapErrorToUserMessage 
} from '@/lib/sanitize';
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
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);
  const [existingUserId, setExistingUserId] = useState<string | null>(null);

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

  // Verificar se o usuário já está logado e precisa apenas completar o cadastro
  useEffect(() => {
    const checkExistingSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isComplete = urlParams.get('complete') === 'true';
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && isComplete) {
        console.log('[InstructorForm] Usuário já logado, modo completar cadastro');
        setIsCompletingRegistration(true);
        setExistingUserId(session.user.id);
        
        // Preencher dados do formulário com metadados do usuário
        const metadata = session.user.user_metadata;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profile || metadata) {
          form.setValue('firstName', profile?.first_name || metadata?.first_name || '');
          form.setValue('lastName', profile?.last_name || metadata?.last_name || '');
          form.setValue('email', session.user.email || '');
          form.setValue('whatsapp', profile?.whatsapp || metadata?.whatsapp || '');
          form.setValue('age', profile?.age || metadata?.age || 18);
        }
      }
    };
    
    checkExistingSession();
  }, [form]);

  const onSubmit = async (data: InstructorRegistrationData) => {
    setIsLoading(true);

    try {
      // Se NÃO está completando cadastro, senha é obrigatória
      if (!isCompletingRegistration) {
        if (!data.password || data.password.length < 8) {
          toast.error('Senha é obrigatória', {
            description: 'A senha deve ter pelo menos 8 caracteres.',
          });
          setIsLoading(false);
          return;
        }
      }

      // Sanitizar e limpar todos os dados antes de enviar
      const cleanCPF = data.cpf.replace(/[^\d]/g, '').slice(0, 11);
      const cleanWhatsApp = data.whatsapp.replace(/[^\d]/g, '').slice(0, 11);
      const sanitizedFirstName = sanitizeName(data.firstName);
      const sanitizedLastName = sanitizeName(data.lastName);
      const sanitizedBio = sanitizeText(data.bio || '').slice(0, 500);
      const sanitizedCity = sanitizeCity(data.city);
      const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim() || data.email.trim();

      const ensureInstructorProfile = async (userId: string) => {
        // Se o usuário já tiver perfil como aluno, não “promover” silenciosamente.
        const { data: existingProfile, error: existingProfileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfileError) {
          throw new Error(`Erro ao verificar perfil: ${existingProfileError.message}`);
        }

        if (existingProfile?.user_type === 'student') {
          toast.error('Esta área é exclusiva para instrutores', {
            description: 'Alunos podem acessar seus recursos na Home.',
          });
          await supabase.auth.signOut();
          return false;
        }

        const { error: upsertProfileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: data.email.trim().toLowerCase().slice(0, 255),
              full_name: fullName.slice(0, 100),
              first_name: sanitizedFirstName.slice(0, 50),
              last_name: sanitizedLastName.slice(0, 50),
              user_type: 'instructor',
              whatsapp: cleanWhatsApp,
              age: Math.max(18, Math.min(data.age, 100)),
              cpf: cleanCPF,
            },
            { onConflict: 'id' }
          );

        if (upsertProfileError) {
          throw new Error(`Erro ao salvar perfil: ${upsertProfileError.message}`);
        }

        return true;
      };

      const saveInstructorData = async (userId: string) => {
        // Sanitizar todos os campos de texto livre
        const instructorData = {
          profile_id: userId,
          bio: sanitizedBio || null,
          price_per_hour: Math.max(0, Math.min(data.pricePerHour || 0, 1000)),
          cnh_category: data.cnhCategory as ("A" | "B" | "AB" | "C" | "D" | "E")[],
          cnh_years: Math.max(0, Math.min(data.cnhYears, 50)),
          has_vehicle: Boolean(data.hasVehicle),
          city: sanitizedCity || null,
          state: data.state ? data.state.toUpperCase().slice(0, 2) : null,
          specialties: (data.specialties || []).map(s => sanitizeText(s).slice(0, 50)),
          detran_certificate: sanitizeText(data.detranCertificate || '').slice(0, 50) || null,
          plan: 'free' as const,
          is_active: true,
          is_verified: false,
        };

        // Criar/atualizar registro do instrutor com retry para erros de rede
        let insertedInstructor: any = null;
        let instructorError: any = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const insertResult = await supabase
              .from('instructors')
              .insert(instructorData)
              .select()
              .single();

            if (!insertResult.error) {
              insertedInstructor = insertResult.data;
              instructorError = null;
              break;
            }

            // Se já existir (ex: usuário está completando cadastro), tentar UPDATE
            if (insertResult.error.code === '23505') {
              const updateResult = await supabase
                .from('instructors')
                .update(instructorData)
                .eq('profile_id', userId)
                .select()
                .single();

              if (updateResult.error) {
                instructorError = updateResult.error;
                retryCount++;
                if (retryCount < maxRetries) await new Promise((r) => setTimeout(r, 1000));
              } else {
                insertedInstructor = updateResult.data;
                instructorError = null;
                break;
              }
            } else {
              instructorError = insertResult.error;
              retryCount++;
              if (retryCount < maxRetries) await new Promise((r) => setTimeout(r, 1000));
            }
          } catch (fetchError) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise((r) => setTimeout(r, 1000));
            } else {
              instructorError = { message: 'Erro de conexão. Por favor, verifique sua internet e tente novamente.' };
            }
          }
        }

        if (instructorError) {
          throw new Error(`Erro ao salvar dados do instrutor: ${instructorError.message}`);
        }

        return insertedInstructor;
      };

      // Se está completando cadastro (usuário já logado via callback de email)
      if (isCompletingRegistration && existingUserId) {
        console.log('[InstructorForm] Modo completar cadastro para userId:', existingUserId);
        
        const canContinue = await ensureInstructorProfile(existingUserId);
        if (!canContinue) return;

        await saveInstructorData(existingUserId);

        toast.success('Cadastro completado com sucesso!', {
          description: 'Seu perfil de instrutor foi salvo. Redirecionando...',
        });

        form.reset();

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
        return;
      }

      // Se o usuário já está autenticado (ex: voltou do /auth/callback), só completa as tabelas.
      const { data: sessionData } = await supabase.auth.getSession();
      let session = sessionData.session;

      // Caso não esteja logado, tentar cadastro
      if (!session) {
        // Use production URL for email redirect to avoid Lovable preview URLs
        const productionUrl = 'https://balizacerta.lovable.app';
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${productionUrl}/auth/callback`,
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
          if (
            authError.message.includes('User already registered') ||
            authError.message.includes('already been registered')
          ) {
            toast.error('Este e-mail já está cadastrado', {
              description: 'Faça login para continuar (ou use "Esqueci minha senha").',
            });
            navigate('/login');
            return;
          }

          if (authError.message.toLowerCase().includes('password')) {
            toast.error('Senha inválida', {
              description: 'A senha deve seguir os requisitos de segurança.',
            });
            return;
          }

          toast.error('Erro ao criar conta', { description: authError.message });
          return;
        }

        // Caso clássico do Supabase: signup "ok" mas usuário já existe/confirmado (não reenvia email)
        const identities = authData.user?.identities;
        const isRepeatedSignup = Array.isArray(identities) && identities.length === 0;

        if (isRepeatedSignup) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (signInError || !signInData.session) {
            toast.error('Este e-mail já possui conta', {
              description: 'A senha informada não confere. Use "Esqueci minha senha" para recuperar o acesso.',
            });
            navigate('/login');
            return;
          }

          session = signInData.session;
        } else {
          session = authData.session;
        }

        // Se não temos sessão, provavelmente o Supabase está exigindo confirmação de e-mail
        if (!session) {
          toast.info('Confirme seu e-mail', {
            description:
              'Se este for seu primeiro cadastro, enviamos um link de confirmação para seu e-mail. Se você já tem conta, faça login para continuar.',
            duration: 10000,
          });
          // Redireciona para página de sucesso informando para checar o email
          navigate('/cadastro-sucesso');
          return;
        }
      }

      const userId = session.user.id;

      const canContinue = await ensureInstructorProfile(userId);
      if (!canContinue) return;

      await saveInstructorData(userId);

      toast.success('Cadastro realizado com sucesso!', {
        description: 'Seu perfil de instrutor foi salvo. Redirecionando...',
      });

      form.reset();

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error) {
      // NUNCA expor mensagens de erro técnicas ao usuário
      console.error('[InstructorForm] Erro no cadastro:', error);
      toast.error(mapErrorToUserMessage(error));
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
                    <Input 
                      placeholder="João" 
                      maxLength={50}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.slice(0, 50))}
                    />
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
                    <Input 
                      placeholder="Silva" 
                      maxLength={50}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.slice(0, 50))}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="joao@exemplo.com" 
                      maxLength={255}
                      disabled={isCompletingRegistration}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toLowerCase().slice(0, 255))}
                    />
                  </FormControl>
                  {isCompletingRegistration && (
                    <FormDescription className="text-green-600">
                      ✓ Email já confirmado
                    </FormDescription>
                  )}
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
                  <Input 
                    placeholder="Número do certificado de instrutor" 
                    maxLength={50}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.slice(0, 50))}
                  />
                </FormControl>
                <FormDescription>
                  Número da sua credencial de instrutor junto ao DETRAN
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Senha - Ocultar se completando cadastro */}
        {!isCompletingRegistration && (
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
        )}

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
                    maxLength={500}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.slice(0, 500))}
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
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background border-border hover:border-accent/50'
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
                    <Input 
                      placeholder="São Paulo" 
                      maxLength={100}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.slice(0, 100))}
                    />
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
