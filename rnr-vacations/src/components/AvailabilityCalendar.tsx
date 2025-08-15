import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
export default function AvailabilityCalendar({ bookedDates = [], onSelectRange }) {
  const [cursor, setCursor] = useState(new Date());
  const [start, setStart] = useState(null); const [end, setEnd] = useState(null);
  const days = useMemo(() => { const y=cursor.getFullYear(), m=cursor.getMonth(); const first=new Date(y,m,1), last=new Date(y,m+1,0), pad=first.getDay(); const arr=[]; for(let i=0;i<pad;i++) arr.push(null); for(let d=1; d<=last.getDate(); d++) arr.push(new Date(y,m,d)); return arr; }, [cursor]);
  const disabled = new Set(bookedDates); const fmt = (d)=> d.toISOString().slice(0,10); const inRange = (d)=> start && end && d>=start && d<=end;
  function clickDay(d){ if(!d||disabled.has(fmt(d)))return; if(!start||end){setStart(d); setEnd(null);} else if (d<start){setStart(d);} else { setEnd(d); onSelectRange?.({ start, end:d }); } }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Button size="icon" variant="outline" className="rounded-full" onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}>‹</Button>
        <div className="font-medium">{cursor.toLocaleString(undefined,{month:'long',year:'numeric'})}</div>
        <Button size="icon" variant="outline" className="rounded-full" onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}>›</Button>
      </div>
      <div className="grid grid-cols-7 text-xs opacity-60 mb-1">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="text-center">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d,i)=>{ const dis = d && disabled.has(fmt(d)); const sel = d && ((start && fmt(d)===fmt(start)) || (end && fmt(d)===fmt(end))); const mid = d && inRange(d);
          return <button key={i} disabled={!d||dis} onClick={()=>clickDay(d)} className={`h-9 rounded-md text-sm ${!d?'opacity-0': dis?'opacity-40 line-through': sel?'bg-black text-white': mid?'bg-black/10':'hover:bg-black/10'}`}>{d?d.getDate():''}</button>; })}
      </div>
    </div>
  );
}