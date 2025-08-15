import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ListingCard from '@/components/ListingCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Market(){
  const [items, setItems] = useState([]); const [q,setQ] = useState('');
  useEffect(()=>{ supabase.from('listings').select('*').order('created_at',{ascending:false}).then(({data})=> setItems(data||[])); },[]);
  const list = useMemo(()=> items.filter(i => !q || [i.name,i.city,i.country,i.area].some(s=> s?.toLowerCase?.().includes(q.toLowerCase()))), [items,q]);
  return (
    <div className="max-w-7xl mx-auto mt-6">
      <Card><CardContent className="p-3"><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by city, country, area"/></CardContent></Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">{list.map(item=> <ListingCard key={item.id} item={item}/>) }</div>
    </div>
  );
}