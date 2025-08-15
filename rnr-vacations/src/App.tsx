import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';

export default function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function login() {
    const provider = prompt('Sign in with: email | google | apple', 'email');
    if (provider === 'google' || provider === 'apple') {
      await supabase.auth.signInWithOAuth({ provider: provider as any, options: { redirectTo: window.location.href } });
    } else {
      const email = prompt('Enter your email');
      if (email) await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    }
  }
  async function logout() { await supabase.auth.signOut(); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header session={session} onLogin={login} onLogout={logout} onGo={(p)=>navigate(p)} />
      <main className="px-4"><Outlet context={{ session }} /></main>
      <footer className="max-w-7xl mx-auto px-4 py-12 text-xs opacity-70">© {new Date().getFullYear()} RNR Vacations</footer>
    </div>
  );
}