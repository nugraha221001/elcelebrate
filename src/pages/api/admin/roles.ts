import type { APIRoute } from 'astro';
import { createSupabaseAdminClient } from '../../../lib/supabase';
import { ROOT_OWNER_EMAIL, isSuperAdmin, type UserRole } from '../../../lib/types';

export const prerender = false;

// GET: List all users and their roles (Super Admin only)
export const GET: APIRoute = async ({ locals }): Promise<Response> => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is super admin
    const { data: callerProfile } = await locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', locals.user.id)
      .single();

    const callerIsSuperAdmin = isSuperAdmin(callerProfile?.role, locals.user.email);
    if (!callerIsSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Akses ditolak. Fitur ini hanya untuk Super Admin.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: rawUsers, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const callerIsRoot = locals.user.email?.trim().toLowerCase() === ROOT_OWNER_EMAIL.toLowerCase();

    const users = (rawUsers || []).map((u) => {
      const isRoot = u.email?.trim().toLowerCase() === ROOT_OWNER_EMAIL.toLowerCase();
      const effectiveRole: UserRole = isRoot ? 'super_admin' : (u.role as UserRole) || 'user';
      let roleLabel = 'Pengguna';
      if (isRoot) {
        roleLabel = '👑 Pemilik Utama (Terkunci)';
      } else if (effectiveRole === 'super_admin') {
        roleLabel = 'Super Admin';
      } else if (effectiveRole === 'admin') {
        roleLabel = 'Admin Mitra';
      }

      return {
        ...u,
        role: effectiveRole,
        isRootOwner: isRoot,
        roleLabel,
      };
    });

    return new Response(JSON.stringify({ users, callerIsRoot }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Promote or demote user (Super Admin only)
export const POST: APIRoute = async ({ locals, request }): Promise<Response> => {
  try {
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify caller is super admin
    const { data: callerProfile } = await locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', locals.user.id)
      .single();

    const callerIsSuperAdmin = isSuperAdmin(callerProfile?.role, locals.user.email);
    if (!callerIsSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Akses ditolak. Fitur ini hanya untuk Super Admin.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: { email?: string; role?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid or malformed JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, role } = body || {};

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email pengguna wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (role !== 'admin' && role !== 'user' && role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Role harus "super_admin", "admin", atau "user"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Root owner cannot be modified
    if (cleanEmail === ROOT_OWNER_EMAIL.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Role Pemilik Utama (lesynugraha@gmail.com) terkunci permanen dan tidak dapat diubah.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Safety: Prevent self-demotion
    if (locals.user.email?.trim().toLowerCase() === cleanEmail && role !== 'super_admin') {
      return new Response(
        JSON.stringify({
          error: 'Anda tidak dapat mencabut hak akses Super Admin dari akun Anda sendiri demi keamanan.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // Find target profile
    const { data: targetProfile, error: findError } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .eq('email', cleanEmail)
      .single();

    if (findError || !targetProfile) {
      return new Response(JSON.stringify({ error: `Pengguna dengan email ${cleanEmail} tidak ditemukan` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const callerIsRoot = locals.user.email?.trim().toLowerCase() === ROOT_OWNER_EMAIL.toLowerCase();

    // Only the root owner can assign or remove super_admin role
    if ((targetProfile.role === 'super_admin' || role === 'super_admin') && !callerIsRoot) {
      return new Response(
        JSON.stringify({
          error: 'Hanya Pemilik Utama (lesynugraha@gmail.com) yang memiliki wewenang mengelola level Super Admin.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update role in DB
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role })
      .eq('id', targetProfile.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const roleLabels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin Mitra',
      user: 'Pengguna Biasa',
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: `Hak akses untuk ${cleanEmail} berhasil diubah menjadi ${roleLabels[role] || role}`,
        user: {
          id: targetProfile.id,
          email: cleanEmail,
          role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH: Alias to POST for updating user role
export const PATCH: APIRoute = POST;
