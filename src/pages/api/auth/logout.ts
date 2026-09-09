import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  await locals.supabase.auth.signOut();
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  return redirect('/', 302);
};
