import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Listing(){
  const { id } = useParams(); const nav = useNavigate();
  const { session } = useOutletContext();
  const [item, setItem] = useState(null); const [reviews, setReviews] = useState([]);
  const [range, setRange] = useState(null); const [booked, setBooked] = useState([]);
  useEffect(()=>{ 
    supabase.from('listings').select('*').eq('id', id).single().then(({data})=> setItem(data));
    supabase.from('reviews').select('*').eq('listing_id', id).order('created_at',{ascending:false}).then(({data})=> setReviews(data||[]));
    (async ()=>{
      const { data } = await supabase.from('bookings').select('start_date,end_date,status').eq('listing_id', id).in('status',['pending','paid']);
      const dates = [];
      for (const b of (data||[])){
        const s = new Date(b.start_date); const e = new Date(b.end_date);
        for (let d=new Date(s); d<e; d.setDate(d.getDate()+1)) { dates.push(d.toISOString().slice(0,10)); }
      }
      setBooked(dates);
    })();
  },[id]);
  const nights = useMemo(()=>{ if(!range) return 0; const ms=(new Date(range.end)-new Date(range.start)); return Math.max(1, Math.round(ms/(1000*60*60*24))+1)-1; },[range]);
  const total = useMemo(()=> (item?.price_per_night||0) * nights, [item, nights]);
  async function book(){ if (!session) return alert('Sign in first'); const { data: inserted, error } = await supabase.from('bookings').insert({ id: crypto.randomUUID(), listing_id: id, guest_id: session.user.id, start_date: range.start.toISOString().slice(0,10), end_date: range.end.toISOString().slice(0,10), guests: 2, status: 'pending', total_amount: total }).select().single(); if (error) return alert(error.message); const { data: fn } = await supabase.functions.invoke('create-checkout-session', { body: { bookingId: inserted.id, amount: Math.round(total*100), currency:'usd', success_url: window.location.origin + '/listing/'+id+'?paid=1', cancel_url: window.location.href }}); if (fn?.url) window.location.href = fn.url; }
  async function startThread(){ if(!session) return alert('Sign in'); const { data: th } = await supabase.from('threads').upsert({ listing_id: id, host_id: item.owner_id, guest_id: session.user.id }).select().single(); nav('/inbox?thread='+th.id); }
  async function addReview(e){ e.preventDefault(); const form=new FormData(e.target); const rating=Number(form.get('rating')); const comment=String(form.get('comment')||''); await supabase.from('reviews').insert({ listing_id: id, author_id: session?.user?.id, rating, comment }); const { data } = await supabase.from('reviews').select('*').eq('listing_id', id).order('created_at',{ascending:false}); setReviews(data||[]); }
  if(!item) return <div className="max-w-5xl mx-auto py-8">Loading…</div>;
  return (
    <div className="max-w-5xl mx-auto py-6 grid lg:grid-cols-[1fr_360px] gap-6">
      <div>
        <img src={item.hero_image_url} className="w-full h-72 object-cover rounded-2xl"/>
        <h1 className="mt-4 text-2xl font-bold">{item.name}</h1>
        <p className="opacity-80">{item.city}, {item.country}</p>
        <Card className="mt-6 rounded-2xl"><CardHeader><CardTitle>Reviews</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{reviews.map(r=> (<div key={r.id} className="text-sm"><span className="font-medium">{r.rating}★</span> — {r.comment}</div>))}
            <form onSubmit={addReview} className="text-sm mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input name="rating" type="number" min={1} max={5} placeholder="Rating 1-5" className="border rounded px-2 py-1"/>
              <input name="comment" placeholder="Comment" className="border rounded px-2 py-1 sm:col-span-2"/>
              <Button type="submit" className="sm:col-span-3 rounded-2xl">Add review</Button>
            </form>
          </div>
        </CardContent></Card>
        <div className="mt-4"><Button variant="outline" className="rounded-2xl" onClick={startThread}>Message host</Button></div>
      </div>
      <aside>
        <Card className="rounded-2xl"><CardHeader><CardTitle>Availability</CardTitle></CardHeader><CardContent>
          <AvailabilityCalendar bookedDates={booked} onSelectRange={setRange}/>
          <div className="mt-3 text-sm">Total: <span className="font-semibold">{(total||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</span></div>
          <Button className="w-full mt-3 rounded-2xl" disabled={!range} onClick={book}>Book & pay</Button>
        </CardContent></Card>
      </aside>
    </div>
  );
}