import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Mail, Phone, Lock, Car, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { studentRegistrationSchema, formatWhatsApp, type StudentRegistrationData } from '@/lib/validators';
import { sanitizeName, sanitizeEmail, sanitizeWhatsApp, sanitizeText, mapErrorToUserMessage } from '@/lib/sanitize';
import { supabase } from '@/integrations/supabase/client';

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<StudentRegistrationData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      whatsapp: '',
      password: '',
      confirmPassword: '',
      hasVehicle: false,
      difficulties: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: StudentRegistrationData) => {
    setIsLoading(true);

    try {
      // Sanitize all inputs
      const sanitizedFirstName = sanitizeName(data.firstName);
      const sanitizedLastName = sanitizeName(data.lastName);
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedWhatsApp = sanitizeWhatsApp(data.whatsapp);
      const sanitizedDifficulties = data.difficulties ? sanitizeText(data.difficulties) : null;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            user_type: 'student',
            whatsapp: sanitizedWhatsApp,
          },
        },
      });

      if (authError) {
        console.error('[StudentRegistration] Auth error:', authError);
        toast.error(mapErrorToUserMessage(authError));
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta. Tente novamente.');
        return;
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation required
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
        setIsSuccess(true);
        return;
      }

      // If we have a session (email confirmation disabled), update profile with additional data
      if (authData.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            has_vehicle: data.hasVehicle || false,
            difficulties: sanitizedDifficulties,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('[StudentRegistration] Profile update error:', profileError);
          // Don't fail the entire registration, just log the error
        }

        setIsSuccess(true);
        toast.success('Bem-vindo ao BalizaCerta! Agora já pode escolher o seu instrutor ideal.');
        
        // Redirect to home after a brief delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('[StudentRegistration] Unexpected error:', error);
      toast.error(mapErrorToUserMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Cadastro Realizado com Sucesso!
        </h2>
        <p className="text-muted-foreground mb-6">
          Bem-vindo ao BalizaCerta! Agora já pode escolher o seu instrutor ideal.
        </p>
        <Button onClick={() => navigate('/')} size="lg">
          Ir para a Página Inicial
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Data Section */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados Pessoais
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Seu nome"
                      maxLength={50}
                      disabled={isLoading}
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
                      {...field}
                      placeholder="Seu sobrenome"
                      maxLength={50}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    disabled={isLoading}
                    onChange={(e) => {
                      const formatted = formatWhatsApp(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    maxLength={255}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Segurança
          </h3>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      maxLength={128}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  A senha deve ter letra maiúscula, minúscula e número
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
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      maxLength={128}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Section */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Informações Opcionais
          </h3>

          <FormField
            control={form.control}
            name="hasVehicle"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tem veículo próprio?</FormLabel>
                  <FormDescription>
                    Informe se você tem um carro para praticar
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulties"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Dificuldades (opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descreva suas principais dificuldades... Ex: 'Medo de ladeiras', 'Dificuldade na baliza', 'Nervosismo no trânsito'"
                    maxLength={500}
                    rows={4}
                    disabled={isLoading}
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/500 caracteres - Isso ajuda os instrutores a entender suas necessidades
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar Conta de Aluno'
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          Ao criar sua conta, você concorda com nossos{' '}
          <a href="/termos" className="text-primary hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </Form>
  );
};

export default StudentRegistrationForm;
