import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define the type for the user object we expect to receive
interface User {
  id: string;
  email: string;
  raw_user_meta_data?: {
    full_name?: string;
    role?: 'artist' | 'buyer';
    pix_key?: string;
  };
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user }: { user: User } = await req.json();

    if (!user) {
        throw new Error("User data is missing from the request body.");
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract metadata
    const metadata = user.raw_user_meta_data || {};
    const role = metadata.role || 'buyer';
    const fullName = metadata.full_name || 'Usuário';
    const pixKey = metadata.pix_key;

    // Insert the new profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: fullName,
        role: role,
        pix_key: pixKey,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting profile:', error);
      throw error;
    }

    return new Response(JSON.stringify({ profile: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
