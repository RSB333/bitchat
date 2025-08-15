import React, { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DnDUploader({ bucket='images', onUploaded }){
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(async (ev)=>{
    ev.preventDefault(); const fls = [...ev.dataTransfer.files].filter(f=> f.type.startsWith('image/')); if(!fls.length) return;
    setBusy(true);
    const urls = [];
    for (const file of fls) {
      const path = crypto.randomUUID() + '-' + file.name;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (!error) { const { data } = supabase.storage.from(bucket).getPublicUrl(path); urls.push(data.publicUrl); }
    }
    onUploaded?.(urls);
    setFiles([]); setBusy(false);
  },[]);

  return (
    <div onDragOver={(e)=>e.preventDefault()} onDrop={onDrop} className={`rounded-xl border-2 border-dashed p-6 text-center ${busy?'opacity-60':''}`}>
      <div className="font-medium">Drag & drop images here</div>
      <div className="text-xs opacity-70">PNG/JPG/WebP</div>
    </div>
  );
}