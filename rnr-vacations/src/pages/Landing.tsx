import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function Landing(){
  const navigate = useNavigate();
  return (
    <div>
      <section className="relative h-[68vh] flex items-center justify-center text-center">
        <img src="https://images.unsplash.com/photo-1506315548515-4f7b4fabd76f?q=80&w=1600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/40"/>
        <div className="relative z-10 max-w-3xl px-4 text-white">
          <h1 className="text-5xl font-bold">RNR Vacations</h1>
          <p className="mt-2 text-lg opacity-90">Book hotels. Trade timeshares.</p>
          <p className="opacity-80">Compare side-by-side with real availability and instant checkout.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-2xl" onClick={()=>navigate('/market')}><Search className="h-5 w-5 mr-2"/>Start exploring</Button>
            <Button size="lg" variant="secondary" className="rounded-2xl" onClick={()=>navigate('/dashboard')}><Home className="h-5 w-5 mr-2"/>Become a host</Button>
          </div>
        </div>
      </section>
    </div>
  );
}