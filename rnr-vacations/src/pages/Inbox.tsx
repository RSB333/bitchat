import React, { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Inbox(){
  const { session } = useOutletContext();
  const [params] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{
    if (!session) return;
    (async ()=>{
      const { data } = await supabase.from('threads').select('*').or(`host_id.eq.${session.user.id},guest_id.eq.${session.user.id}`).order('created_at',{ascending:false});
      setThreads(data||[]);
      const initial = params.get('thread');
      if (initial) setActive(initial);
    })();
  },[session]);

  useEffect(()=>{
    if (!active) return setMsgs([]);
    supabase.from('messages').select('*').eq('thread_id', active).order('created_at').then(({data})=> setMsgs(data||[]));
  },[active]);

  async function send(){ if(!text.trim()) return; const m = { thread_id: active, sender_id: session.user.id, body: text }; const { data, error } = await supabase.from('messages').insert(m).select().single(); if (!error) { setMsgs(v=>[...v, data]); setText(''); await supabase.functions.invoke('notify-message', { body: { threadId: active, senderId: session.user.id, body: text } }); } }

  return (
    <div className="max-w-6xl mx-auto py-6 grid lg:grid-cols-[280px_1fr] gap-4">
      <Card className="rounded-2xl"><CardHeader><CardTitle>Threads</CardTitle></CardHeader><CardContent>
        <div className="space-y-2 text-sm">
          {threads.map(t => (
            <div key={t.id} className={`p-2 border rounded cursor-pointer ${active===t.id?'bg-slate-50':''}`} onClick={()=>setActive(t.id)}>
              <div className="font-medium">Thread</div>
              <div className="text-xs opacity-70">{t.created_at}</div>
            </div>
          ))}
          {!threads.length && <div className="opacity-70 text-sm">No threads yet</div>}
        </div>
      </CardContent></Card>
      <Card className="rounded-2xl"><CardHeader><CardTitle>Messages</CardTitle></CardHeader><CardContent>
        <div className="space-y-2 text-sm">
          {msgs.map(m => (
            <div key={m.id} className={`p-2 rounded ${m.sender_id===session?.user?.id?'bg-blue-50':'bg-slate-50'}`}>{m.body}</div>
          ))}
        </div>
        {active && (
          <div className="mt-3 flex gap-2">
            <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="Type a message"/>
            <Button className="rounded-2xl" onClick={send}>Send</Button>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}