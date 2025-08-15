import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async (req) => {
  const { userId, refresh_url, return_url } = await req.json();
  const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('id', userId).single();
  let accountId = profile?.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' });
    accountId = account.id;
    await supabase.from('profiles').upsert({ id: userId, stripe_account_id: accountId });
  }
  const link = await stripe.accountLinks.create({ account: accountId, refresh_url, return_url, type: 'account_onboarding' });
  return new Response(JSON.stringify({ url: link.url }), { headers: { 'Content-Type': 'application/json' } });
});