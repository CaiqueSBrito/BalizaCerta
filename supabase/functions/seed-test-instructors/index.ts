import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Require admin authentication for this development-only function
const validateAdminAccess = async (req: Request, supabaseAdmin: SupabaseClient) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Não autorizado: token de acesso ausente', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Não autorizado: token inválido', status: 401 };
  }

  // Check if user has admin role using raw query since RPC typing is strict
  const { data: roleData } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  
  if (!roleData) {
    console.warn(`[SECURITY] Non-admin user ${user.id} attempted to access seed function`);
    return { error: 'Acesso negado: apenas administradores podem executar esta função', status: 403 };
  }

  console.log(`[SECURITY] Admin access granted for user ${user.id}`);
  return { user };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // SECURITY: Validate admin access before proceeding
  const authResult = await validateAdminAccess(req, supabaseAdmin);
  if ('error' in authResult) {
    return new Response(JSON.stringify({ success: false, error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('Starting seed-test-instructors (admin authenticated)...');

    const testInstructors = [
      {
        email: 'carlos.silva@test.com',
        password: 'Test123456!',
        first_name: 'Carlos',
        last_name: 'Silva',
        whatsapp: '11987654321',
        age: 35,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor experiente com mais de 10 anos de experiência. Especialista em ajudar alunos com medo de dirigir.',
          price_per_hour: 85,
          cnh_category: ['B'],
          cnh_years: 12,
          has_vehicle: true,
          plan: 'pro',
          city: 'São Paulo',
          state: 'SP',
          rating: 4.9,
          review_count: 127,
          specialties: ['CNH B', 'Medo de Dirigir', 'Baliza'],
          is_verified: true,
          detran_certificate: 'SP-2024-001234',
        },
      },
      {
        email: 'ana.oliveira@test.com',
        password: 'Test123456!',
        first_name: 'Ana',
        last_name: 'Oliveira',
        whatsapp: '21987654321',
        age: 32,
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutora dedicada, especializada em motos e carros. Paciência e didática são minhas marcas.',
          price_per_hour: 75,
          cnh_category: ['A', 'B'],
          cnh_years: 8,
          has_vehicle: true,
          plan: 'pro',
          city: 'Rio de Janeiro',
          state: 'RJ',
          rating: 4.8,
          review_count: 89,
          specialties: ['CNH A', 'CNH B', 'Primeira Habilitação'],
          is_verified: true,
          detran_certificate: 'RJ-2024-005678',
        },
      },
      {
        email: 'roberto.santos@test.com',
        password: 'Test123456!',
        first_name: 'Roberto',
        last_name: 'Santos',
        whatsapp: '31987654321',
        age: 40,
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor com 15 anos de experiência. Especialista em reciclagem e direção defensiva.',
          price_per_hour: 90,
          cnh_category: ['B', 'C'],
          cnh_years: 15,
          has_vehicle: true,
          plan: 'pro',
          city: 'Belo Horizonte',
          state: 'MG',
          rating: 5.0,
          review_count: 156,
          specialties: ['CNH B', 'Reciclagem', 'Direção Defensiva'],
          is_verified: true,
          detran_certificate: 'MG-2024-009012',
        },
      },
      {
        email: 'maria.costa@test.com',
        password: 'Test123456!',
        first_name: 'Maria',
        last_name: 'Costa',
        whatsapp: '41987654321',
        age: 28,
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Jovem instrutora apaixonada por ensinar. Ambiente acolhedor e sem pressão.',
          price_per_hour: 65,
          cnh_category: ['B'],
          cnh_years: 5,
          has_vehicle: true,
          plan: 'free',
          city: 'Curitiba',
          state: 'PR',
          rating: 4.7,
          review_count: 45,
          specialties: ['CNH B', 'Primeira Habilitação'],
          is_verified: false,
          detran_certificate: 'PR-2024-003456',
        },
      },
      {
        email: 'joao.ferreira@test.com',
        password: 'Test123456!',
        first_name: 'João',
        last_name: 'Ferreira',
        whatsapp: '51987654321',
        age: 45,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor veterano com experiência em veículos pesados. Caminhões e ônibus são minha especialidade.',
          price_per_hour: 120,
          cnh_category: ['B', 'C', 'D', 'E'],
          cnh_years: 20,
          has_vehicle: true,
          plan: 'pro',
          city: 'Porto Alegre',
          state: 'RS',
          rating: 4.9,
          review_count: 203,
          specialties: ['CNH C', 'CNH D', 'CNH E', 'Veículos Pesados'],
          is_verified: true,
          detran_certificate: 'RS-2024-007890',
        },
      },
      {
        email: 'patricia.lima@test.com',
        password: 'Test123456!',
        first_name: 'Patrícia',
        last_name: 'Lima',
        whatsapp: '71987654321',
        age: 38,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Especialista em medo de dirigir. Trabalho com técnicas de relaxamento e confiança.',
          price_per_hour: 95,
          cnh_category: ['B'],
          cnh_years: 10,
          has_vehicle: true,
          plan: 'pro',
          city: 'Salvador',
          state: 'BA',
          rating: 4.8,
          review_count: 112,
          specialties: ['Medo de Dirigir', 'Terapia ao Dirigir', 'CNH B'],
          is_verified: true,
          detran_certificate: 'BA-2024-002345',
        },
      },
      {
        email: 'marcos.almeida@test.com',
        password: 'Test123456!',
        first_name: 'Marcos',
        last_name: 'Almeida',
        whatsapp: '81987654321',
        age: 33,
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor focado em resultados. Alta taxa de aprovação na primeira tentativa!',
          price_per_hour: 70,
          cnh_category: ['A', 'B'],
          cnh_years: 7,
          has_vehicle: true,
          plan: 'free',
          city: 'Recife',
          state: 'PE',
          rating: 4.6,
          review_count: 67,
          specialties: ['CNH A', 'CNH B', 'Prova Prática'],
          is_verified: false,
          detran_certificate: 'PE-2024-004567',
        },
      },
      {
        email: 'fernanda.rodrigues@test.com',
        password: 'Test123456!',
        first_name: 'Fernanda',
        last_name: 'Rodrigues',
        whatsapp: '61987654321',
        age: 30,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutora credenciada pelo DETRAN-DF. Atendimento personalizado para cada aluno.',
          price_per_hour: 80,
          cnh_category: ['B'],
          cnh_years: 6,
          has_vehicle: true,
          plan: 'pro',
          city: 'Brasília',
          state: 'DF',
          rating: 4.7,
          review_count: 78,
          specialties: ['CNH B', 'Baliza', 'Direção Noturna'],
          is_verified: true,
          detran_certificate: 'DF-2024-006789',
        },
      },
      {
        email: 'pedro.nascimento@test.com',
        password: 'Test123456!',
        first_name: 'Pedro',
        last_name: 'Nascimento',
        whatsapp: '85987654321',
        age: 42,
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Ex-piloto profissional. Ensino técnicas avançadas de direção segura.',
          price_per_hour: 110,
          cnh_category: ['A', 'B', 'C'],
          cnh_years: 18,
          has_vehicle: true,
          plan: 'pro',
          city: 'Fortaleza',
          state: 'CE',
          rating: 4.9,
          review_count: 145,
          specialties: ['Direção Esportiva', 'CNH C', 'Performance'],
          is_verified: true,
          detran_certificate: 'CE-2024-008901',
        },
      },
      {
        email: 'julia.martins@test.com',
        password: 'Test123456!',
        first_name: 'Júlia',
        last_name: 'Martins',
        whatsapp: '62987654321',
        age: 26,
        avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Nova na plataforma! Preços promocionais para os primeiros alunos.',
          price_per_hour: 55,
          cnh_category: ['B'],
          cnh_years: 3,
          has_vehicle: true,
          plan: 'free',
          city: 'Goiânia',
          state: 'GO',
          rating: 4.5,
          review_count: 18,
          specialties: ['CNH B', 'Primeira Habilitação'],
          is_verified: false,
          detran_certificate: 'GO-2024-001012',
        },
      },
      {
        email: 'lucas.pereira@test.com',
        password: 'Test123456!',
        first_name: 'Lucas',
        last_name: 'Pereira',
        whatsapp: '92987654321',
        age: 36,
        avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor com foco em direção em áreas urbanas densas. Trânsito intenso é minha especialidade.',
          price_per_hour: 75,
          cnh_category: ['B'],
          cnh_years: 9,
          has_vehicle: true,
          plan: 'pro',
          city: 'Manaus',
          state: 'AM',
          rating: 4.6,
          review_count: 56,
          specialties: ['CNH B', 'Trânsito Pesado', 'Direção Urbana'],
          is_verified: true,
          detran_certificate: 'AM-2024-003234',
        },
      },
      {
        email: 'camila.souza@test.com',
        password: 'Test123456!',
        first_name: 'Camila',
        last_name: 'Souza',
        whatsapp: '27987654321',
        age: 31,
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Especialista em mulheres que estão aprendendo a dirigir. Ambiente 100% feminino.',
          price_per_hour: 80,
          cnh_category: ['B'],
          cnh_years: 7,
          has_vehicle: true,
          plan: 'pro',
          city: 'Vitória',
          state: 'ES',
          rating: 4.8,
          review_count: 94,
          specialties: ['CNH B', 'Aulas para Mulheres', 'Medo de Dirigir'],
          is_verified: true,
          detran_certificate: 'ES-2024-005456',
        },
      },
      {
        email: 'rafael.gomes@test.com',
        password: 'Test123456!',
        first_name: 'Rafael',
        last_name: 'Gomes',
        whatsapp: '91987654321',
        age: 29,
        avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor de motos com paixão por duas rodas. Segurança em primeiro lugar!',
          price_per_hour: 70,
          cnh_category: ['A'],
          cnh_years: 6,
          has_vehicle: true,
          plan: 'free',
          city: 'Belém',
          state: 'PA',
          rating: 4.7,
          review_count: 41,
          specialties: ['CNH A', 'Motos', 'Pilotagem Segura'],
          is_verified: false,
          detran_certificate: 'PA-2024-007678',
        },
      },
      {
        email: 'leticia.barbosa@test.com',
        password: 'Test123456!',
        first_name: 'Letícia',
        last_name: 'Barbosa',
        whatsapp: '84987654321',
        age: 34,
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutora bilíngue (português/inglês). Atendo estrangeiros e turistas.',
          price_per_hour: 100,
          cnh_category: ['B'],
          cnh_years: 8,
          has_vehicle: true,
          plan: 'pro',
          city: 'Natal',
          state: 'RN',
          rating: 4.9,
          review_count: 87,
          specialties: ['CNH B', 'Aulas em Inglês', 'Estrangeiros'],
          is_verified: true,
          detran_certificate: 'RN-2024-009890',
        },
      },
      {
        email: 'thiago.carvalho@test.com',
        password: 'Test123456!',
        first_name: 'Thiago',
        last_name: 'Carvalho',
        whatsapp: '47987654321',
        age: 37,
        avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Instrutor com experiência em veículos automáticos e manuais. Flexibilidade total!',
          price_per_hour: 85,
          cnh_category: ['B', 'C'],
          cnh_years: 11,
          has_vehicle: true,
          plan: 'pro',
          city: 'Florianópolis',
          state: 'SC',
          rating: 4.8,
          review_count: 102,
          specialties: ['Câmbio Automático', 'Câmbio Manual', 'CNH C'],
          is_verified: true,
          detran_certificate: 'SC-2024-002123',
        },
      },
    ];

    console.log(`Processing ${testInstructors.length} test instructors...`);
    const results = [];

    for (const testUser of testInstructors) {
      console.log(`Processing: ${testUser.email}`);
      
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', testUser.email)
        .maybeSingle();

      if (existingUser) {
        console.log(`User ${testUser.email} already exists, skipping...`);
        results.push({ email: testUser.email, status: 'already exists' });
        continue;
      }

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          user_type: 'instructor',
          whatsapp: testUser.whatsapp,
          age: testUser.age,
        },
      });

      if (authError) {
        console.error(`Auth error for ${testUser.email}:`, authError.message);
        results.push({ email: testUser.email, status: 'auth error', error: authError.message });
        continue;
      }

      const userId = authData.user.id;
      console.log(`Created auth user: ${userId}`);

      // Update profile with avatar
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          avatar_url: testUser.avatar_url,
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`Profile error for ${testUser.email}:`, profileError.message);
        results.push({ email: testUser.email, status: 'profile error', error: profileError.message });
        continue;
      }

      // Create instructor record
      const { error: instructorError } = await supabaseAdmin
        .from('instructors')
        .insert({
          profile_id: userId,
          ...testUser.instructor,
          is_active: true,
        });

      if (instructorError) {
        console.error(`Instructor error for ${testUser.email}:`, instructorError.message);
        results.push({ email: testUser.email, status: 'instructor error', error: instructorError.message });
        continue;
      }

      console.log(`Successfully created instructor: ${testUser.email}`);
      results.push({ email: testUser.email, status: 'created successfully' });
    }

    const successCount = results.filter(r => r.status === 'created successfully').length;
    const existingCount = results.filter(r => r.status === 'already exists').length;
    const errorCount = results.filter(r => r.status.includes('error')).length;

    console.log(`Completed: ${successCount} created, ${existingCount} existing, ${errorCount} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      summary: { created: successCount, existing: existingCount, errors: errorCount },
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed function error:', message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
