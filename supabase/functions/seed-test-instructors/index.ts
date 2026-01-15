import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const testInstructors = [
      {
        email: 'carlos.silva@test.com',
        password: 'Test123456!',
        full_name: 'Carlos Silva',
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
        },
      },
      {
        email: 'ana.oliveira@test.com',
        password: 'Test123456!',
        full_name: 'Ana Oliveira',
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
        },
      },
      {
        email: 'roberto.santos@test.com',
        password: 'Test123456!',
        full_name: 'Roberto Santos',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
        instructor: {
          bio: 'Novo na plataforma, mas com 5 anos de experiência como instrutor. Preços acessíveis!',
          price_per_hour: 60,
          cnh_category: ['B'],
          cnh_years: 5,
          has_vehicle: true,
          plan: 'free',
          city: 'Belo Horizonte',
          state: 'MG',
          rating: 4.6,
          review_count: 23,
          specialties: ['CNH B', 'Reciclagem'],
          is_verified: false,
        },
      },
    ];

    const results = [];

    for (const testUser of testInstructors) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', testUser.email)
        .maybeSingle();

      if (existingUsers) {
        results.push({ email: testUser.email, status: 'already exists' });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUser.full_name,
          user_type: 'instructor',
        },
      });

      if (authError) {
        results.push({ email: testUser.email, status: 'auth error', error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Update profile with avatar
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: testUser.avatar_url })
        .eq('id', userId);

      if (profileError) {
        results.push({ email: testUser.email, status: 'profile error', error: profileError.message });
        continue;
      }

      // Create instructor record
      const { error: instructorError } = await supabaseAdmin
        .from('instructors')
        .insert({
          profile_id: userId,
          ...testUser.instructor,
        });

      if (instructorError) {
        results.push({ email: testUser.email, status: 'instructor error', error: instructorError.message });
        continue;
      }

      results.push({ email: testUser.email, status: 'created successfully' });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
