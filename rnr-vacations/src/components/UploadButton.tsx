import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
export default function UploadButton({ bucket='images', onUploaded }){
  const ref = useRef(null); const [busy,setBusy] = useState(false);
  async function onChange(e){ const file = e.target.files?.[0]; if(!file) return; setBusy(true); const path = crypto.randomUUID() + '-' + file.name; const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false }); if (error) alert(error.message); const { data } = supabase.storage.from(bucket).getPublicUrl(path); onUploaded?.(data.publicUrl); setBusy(false); }
  return (<><input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} /><Button disabled={busy} onClick={()=>ref.current?.click?.()}>{busy? 'Uploading…' : 'Upload image'}</Button></>);
}