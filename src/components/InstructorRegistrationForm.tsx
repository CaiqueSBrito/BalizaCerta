import { useState } from 'react';
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
      // Limpar formatação do CPF e WhatsApp antes de enviar
      const cleanCPF = data.cpf.replace(/[^\d]/g, '');
      const cleanWhatsApp = data.whatsapp.replace(/[^\d]/g, '');

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
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
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Atualizar perfil com CPF (campo sensível)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          cpf: cleanCPF,
          whatsapp: cleanWhatsApp,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Criar registro do instrutor
      const { error: instructorError } = await supabase
        .from('instructors')
        .insert({
          profile_id: authData.user.id,
          bio: data.bio || null,
          price_per_hour: data.pricePerHour || 0,
          cnh_category: data.cnhCategory,
          cnh_years: data.cnhYears,
          has_vehicle: data.hasVehicle,
          city: data.city,
          state: data.state.toUpperCase(),
          specialties: data.specialties || [],
          detran_certificate: data.detranCertificate,
          plan: 'free',
          is_active: true,
          is_verified: false,
        });

      if (instructorError) {
        throw new Error(instructorError.message);
      }

      toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
      form.reset();
      onSuccess?.();
    } catch (error) {
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
