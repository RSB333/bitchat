import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async (req) => {
  try {
    const { bookingId, amount, currency, success_url, cancel_url } = await req.json();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency, unit_amount: amount, product_data: { name: 'RNR Vacations booking ' + bookingId } }, quantity: 1 }],
      success_url, cancel_url, metadata: { bookingId }
    });
    return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 400 }); }
});