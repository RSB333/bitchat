import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ListingForm from '@/components/ListingForm';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

export default function Dashboard(){
  const { session } = useOutletContext();
  const [tab, setTab] = useState('properties');
  const [propsList, setPropsList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [resv, setResv] = useState([]);
  const [booked, setBooked] = useState([]);
  const [pay, setPay] = useState(null); const [payLoading, setPayLoading] = useState(false);

  async function load(){ if(!session) return; const { data } = await supabase.from('listings').select('*').eq('owner_id', session.user.id).order('created_at',{ascending:false}); setPropsList(data||[]); const { data: r } = await supabase.from('bookings').select('*, listings!inner(name)').in('listing_id', (data||[]).map(d=>d.id)); setResv(r||[]); }
  useEffect(()=>{ load(); },[session]);

  useEffect(()=>{ // load calendar for selected listing
    (async ()=>{
      if(!editing?.id) { setBooked([]); return; }
      const { data } = await supabase.from('bookings').select('start_date,end_date,status').eq('listing_id', editing.id).in('status',['pending','paid']);
      const dates=[]; for (const b of (data||[])) { const s=new Date(b.start_date); const e=new Date(b.end_date); for(let d=new Date(s); d<e; d.setDate(d.getDate()+1)) dates.push(d.toISOString().slice(0,10)); }
      setBooked(dates);
    })();
  },[editing?.id]);

  async function add(){ setEditing({ owner_id: session.user.id, type:'timeshare', name:'', city:'', country:'', price_per_night:100, amenities:[] }); }
  async function onSaved(item){ setEditing(null); await load(); }

  async function onboarding(){ const { data } = await supabase.functions.invoke('create-onboarding-link', { body: { userId: session.user.id, refresh_url: window.location.href, return_url: window.location.href } }); if (data?.url) window.location.href = data.url; }

  async function loadPayouts(){ setPayLoading(true); const { data } = await supabase.functions.invoke('connect-summary', { body: { userId: session.user.id } }); setPay(data||null); setPayLoading(false); }
  useEffect(()=>{ if (tab==='payouts' && session) loadPayouts(); },[tab, session]);

  const usdAvail = useMemo(()=> (pay?.balance?.available?.find?.(b=>b.currency==='usd')?.amount||0)/100, [pay]);
  const usdPend  = useMemo(()=> (pay?.balance?.pending?.find?.(b=>b.currency==='usd')?.amount||0)/100, [pay]);

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex gap-2">
        <Button variant={tab==='properties'?'default':'outline'} className="rounded-2xl" onClick={()=>setTab('properties')}>Properties</Button>
        <Button variant={tab==='reservations'?'default':'outline'} className="rounded-2xl" onClick={()=>setTab('reservations')}>Reservations</Button>
        <Button variant={tab==='calendar'?'default':'outline'} className="rounded-2xl" onClick={()=>setTab('calendar')}>Calendar</Button>
        <Button variant={tab==='payouts'?'default':'outline'} className="rounded-2xl" onClick={()=>setTab('payouts')}>Payouts</Button>
      </div>

      {tab==='properties' && (
        <div className="mt-4 grid lg:grid-cols-[360px_1fr] gap-4">
          <Card className="rounded-2xl"><CardHeader><CardTitle>Your listings</CardTitle></CardHeader><CardContent>
            <div className="space-y-2">
              {propsList.map(p=> (
                <div key={p.id} className="p-2 border rounded cursor-pointer hover:bg-slate-50" onClick={()=>setEditing(p)}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs opacity-70">{p.city}, {p.country}</div>
                </div>
              ))}
              <Button className="w-full rounded-2xl" onClick={add}>Add new</Button>
            </div>
          </CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle>{editing? 'Edit listing' : 'Create listing'}</CardTitle></CardHeader><CardContent>
            {editing ? <ListingForm initial={editing} onSaved={onSaved} /> : <div className="text-sm opacity-70">Select a listing to edit, or click Add new.</div>}
          </CardContent></Card>
        </div>
      )}

      {tab==='reservations' && (
        <div className="mt-4">
          <Card className="rounded-2xl"><CardHeader><CardTitle>Recent reservations</CardTitle></CardHeader><CardContent>
            <div className="space-y-2 text-sm">
              {resv.length===0 && <div className="opacity-70">No reservations yet</div>}
              {resv.map(r => (
                <div key={r.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2 border rounded">
                  <div className="font-medium sm:col-span-2">{r.listings?.name||'Listing'}</div>
                  <div>{r.start_date} → {r.end_date}</div>
                  <div>{r.status}</div>
                  <div className="text-right">{(r.total_amount||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </div>
      )}

      {tab==='calendar' && (
        <div className="mt-4 grid lg:grid-cols-[360px_1fr] gap-4">
          <Card className="rounded-2xl"><CardHeader><CardTitle>Select listing</CardTitle></CardHeader><CardContent>
            <div className="space-y-2">
              {propsList.map(p=> (
                <div key={p.id} className={`p-2 border rounded cursor-pointer ${editing?.id===p.id?'bg-slate-50':''}`} onClick={()=>setEditing(p)}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs opacity-70">{p.city}, {p.country}</div>
                </div>
              ))}
            </div>
          </CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle>Blocked dates</CardTitle></CardHeader><CardContent>
            {editing? <AvailabilityCalendar bookedDates={booked}/> : <div className="text-sm opacity-70">Choose a listing to view its calendar.</div>}
          </CardContent></Card>
        </div>
      )}

      {tab==='payouts' && (
        <div className="mt-4 grid lg:grid-cols-[360px_1fr] gap-4">
          <Card className="rounded-2xl"><CardHeader><CardTitle>Stripe Connect</CardTitle></CardHeader><CardContent>
            <div className="space-y-2 text-sm">
              <div>Account: {pay?.account||'—'}</div>
              <div>Available: {(usdAvail||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</div>
              <div>Pending: {(usdPend||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</div>
              <div className="flex gap-2 mt-2">
                <Button className="rounded-2xl" onClick={onboarding}>Onboard / Update</Button>
                <Button variant="outline" className="rounded-2xl" onClick={loadPayouts} disabled={payLoading}>{payLoading?'Refreshing…':'Refresh'}</Button>
              </div>
            </div>
          </CardContent></Card>
          <Card className="rounded-2xl"><CardHeader><CardTitle>Recent payouts & transfers</CardTitle></CardHeader><CardContent>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium mb-1">Payouts</div>
                <div className="space-y-1">
                  {(pay?.payouts||[]).map(p => (
                    <div key={p.id} className="p-2 border rounded">{p.arrival_date? new Date(p.arrival_date*1000).toLocaleDateString():''} — {(p.amount/100).toLocaleString(undefined,{style:'currency',currency:p.currency.toUpperCase()})} — {p.status}</div>
                  ))}
                  {!pay?.payouts?.length && <div className="opacity-70">None</div>}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Transfers</div>
                <div className="space-y-1">
                  {(pay?.transfers||[]).map(t => (
                    <div key={t.id} className="p-2 border rounded">{new Date(t.created*1000).toLocaleString()} — {(t.amount/100).toLocaleString(undefined,{style:'currency',currency:t.currency.toUpperCase()})}</div>
                  ))}
                  {!pay?.transfers?.length && <div className="opacity-70">None</div>}
                </div>
              </div>
            </div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}