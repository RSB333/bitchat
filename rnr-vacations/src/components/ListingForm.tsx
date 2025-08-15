import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import UploadButton from './UploadButton';
import DnDUploader from './DnDUploader';
import { Button } from '@/components/ui/button';

export default function ListingForm({ initial, onSaved }){
  const [form, setForm] = useState(initial || { type:'timeshare', name:'', description:'', city:'', country:'', area:'', price_per_night:100, amenities:[], hero_image_url:'', images:[] });
  function set(k,v){ setForm((f)=> ({ ...f, [k]: v })); }
  async function save(){
    if (!form.name || !form.city || !form.country) return alert('Name, city, country required');
    if (initial?.id) {
      const { error } = await supabase.from('listings').update(form).eq('id', initial.id);
      if (error) return alert(error.message);
      onSaved?.({ ...initial, ...form });
    } else {
      const { data, error } = await supabase.from('listings').insert(form).select().single();
      if (error) return alert(error.message);
      onSaved?.(data);
    }
  }
  function onDragStart(e, from){ e.dataTransfer.setData('text/plain', String(from)); }
  function onDrop(e, to){ e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isNaN(from) || from===to) return; const next=[...(form.images||[])]; const [moved]=next.splice(from,1); next.splice(to,0,moved); set('images', next); }
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={(e)=>set('name', e.target.value)} />
        <select className="border rounded px-2 py-1" value={form.type} onChange={(e)=>set('type', e.target.value)}><option value="hotel">Hotel</option><option value="timeshare">Timeshare</option></select>
        <input className="border rounded px-2 py-1" placeholder="City" value={form.city} onChange={(e)=>set('city', e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Country" value={form.country} onChange={(e)=>set('country', e.target.value)} />
        <input className="border rounded px-2 py-1 sm:col-span-2" placeholder="Area" value={form.area||''} onChange={(e)=>set('area', e.target.value)} />
        <textarea className="border rounded px-2 py-1 sm:col-span-2" placeholder="Description" value={form.description||''} onChange={(e)=>set('description', e.target.value)} />
        <input type="number" className="border rounded px-2 py-1" placeholder="Price per night" value={form.price_per_night} onChange={(e)=>set('price_per_night', Number(e.target.value))} />
        <input className="border rounded px-2 py-1" placeholder="Amenities (comma-separated)" value={(form.amenities||[]).join(',')} onChange={(e)=>set('amenities', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Hero image</div>
        <UploadButton onUploaded={(url)=>set('hero_image_url', url)} />
        {form.hero_image_url && <img src={form.hero_image_url} className="h-32 mt-2 rounded"/>}
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Gallery</div>
        <DnDUploader onUploaded={(urls)=>set('images', [...(form.images||[]), ...urls])} />
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(form.images||[]).map((u,i)=> (
            <div key={i} className="relative group" draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDrop(e,i)}>
              <img src={u} className="h-24 w-full object-cover rounded border"/>
              <div className="absolute inset-0 hidden group-hover:flex items-start justify-end p-1 gap-1">
                <button title="Remove" className="bg-white/90 rounded px-1" onClick={()=> set('images', form.images.filter((_,j)=>j!==i))}>×</button>
              </div>
              <div className="absolute bottom-1 left-1 text-[10px] bg-white/80 rounded px-1">Drag to reorder</div>
            </div>
          ))}
        </div>
      </div>

      <Button className="rounded-2xl" onClick={save}>{initial?.id? 'Save changes' : 'Create listing'}</Button>
    </div>
  );
}