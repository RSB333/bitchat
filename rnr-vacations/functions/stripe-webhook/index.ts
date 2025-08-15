import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const payload = await req.text();
  try {
    const event = stripe.webhooks.constructEvent(payload, sig!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);
    if (event.type === 'checkout.session.completed') {
      const cs = event.data.object as Stripe.Checkout.Session;
      const bookingId = cs.metadata?.bookingId;
      if (bookingId) await supabase.from('bookings').update({ status: 'paid' }).eq('id', bookingId);
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 400 }); }
});