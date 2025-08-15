import React from 'react';
import { Building2, Home, LayoutDashboard, Mail, LogIn, LogOut } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

export default function Header({ session, onLogin, onLogout, onGo }) {
  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={()=>onGo('/') }>
          <Building2 className="h-6 w-6" />
          <span className="font-bold text-lg">RNR Vacations</span>
          <Badge variant="secondary" className="hidden sm:inline">Hotels & Timeshares</Badge>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={()=>onGo('/market')}><Home className="h-4 w-4 mr-1"/>Explore</Button>
          <Button variant="ghost" size="sm" onClick={()=>onGo('/dashboard')}><LayoutDashboard className="h-4 w-4 mr-1"/>Host</Button>
          <Button variant="ghost" size="sm" onClick={()=>onGo('/inbox')}><Mail className="h-4 w-4 mr-1"/>Inbox</Button>
          {session ? (
            <Button size="sm" variant="outline" onClick={onLogout} className="rounded-2xl"><LogOut className="h-4 w-4 mr-1"/>Sign out</Button>
          ) : (
            <Button size="sm" onClick={onLogin} className="rounded-2xl"><LogIn className="h-4 w-4 mr-1"/>Sign in</Button>
          )}
        </div>
      </div>
    </div>
  );
}