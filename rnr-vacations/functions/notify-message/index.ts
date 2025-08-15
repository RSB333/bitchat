import { createClient } from '@supabase/supabase-js';
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
async function sendEmail(to: string, subject: string, text: string) {
  if (!RESEND_API_KEY) return; // no-op if not configured
  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'RNR Vacations <noreply@rnr.vacations>', to, subject, text })});
}
Deno.serve(async (req) => {
  const { threadId, senderId, body } = await req.json();
  const { data: thread } = await supabase.from('threads').select('host_id, guest_id, listing_id').eq('id', threadId).single();
  const recipientId = senderId === thread.host_id ? thread.guest_id : thread.host_id;
  const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', recipientId).single();
  if (profile?.email) await sendEmail(profile.email, 'New message on RNR Vacations', body);
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});