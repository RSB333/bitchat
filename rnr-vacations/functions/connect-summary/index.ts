import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async (req) => {
  try {
    const { userId } = await req.json();
    const { data: profile, error } = await supabase.from('profiles').select('stripe_account_id').eq('id', userId).single();
    if (error) throw error;
    const account = profile?.stripe_account_id;
    if (!account) return new Response(JSON.stringify({ account: null }), { headers: { 'Content-Type': 'application/json' } });
    const balance = await stripe.balance.retrieve({ stripeAccount: account });
    const payouts = await stripe.payouts.list({ limit: 10 }, { stripeAccount: account });
    const transfers = await stripe.transfers.list({ limit: 10 }, { stripeAccount: account });
    const transactions = await stripe.balanceTransactions.list({ limit: 10 }, { stripeAccount: account });
    return new Response(JSON.stringify({ account, balance, payouts: payouts.data, transfers: transfers.data, transactions: transactions.data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});