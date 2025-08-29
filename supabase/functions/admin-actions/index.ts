import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RequestBody {
  action: 'approve' | 'reject';
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create client with user token for verification
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Verify the user is authenticated and get their profile
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is an admin using our security definer function
    const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin', { 
      user_uuid: user.id 
    });

    if (adminError) {
      console.error('Admin check failed:', adminError);
      return new Response(JSON.stringify({ error: 'Admin verification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isAdminResult) {
      console.warn('Non-admin user attempted admin action:', user.id);
      return new Response(JSON.stringify({ error: 'Access denied: Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { action, userId } = body;

    console.log(`Admin ${user.id} performing ${action} on user ${userId}`);

    let result;
    let error;

    if (action === 'approve') {
      // Approve the artist
      ({ data: result, error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .select());
    } else if (action === 'reject') {
      // Delete the profile (and cascade delete the auth user)
      ({ data: result, error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)
        .select());
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (error) {
      console.error(`Error performing ${action}:`, error);
      return new Response(JSON.stringify({ error: `Failed to ${action} user` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully ${action}ed user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      userId,
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin action error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});