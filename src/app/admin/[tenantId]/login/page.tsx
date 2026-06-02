'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLoginPage() {
  const { tenantId } = useParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation d'authentification sécurisée KSM
    setTimeout(() => {
      login('Jean Dupont');
      router.push(`/admin/${tenantId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour au portail
        </Link>
        
        <Card className="border-4 border-zinc-700 bg-zinc-800 shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-zinc-700 p-8 text-center border-b border-zinc-600">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">Accès Administrateur</CardTitle>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">KSM Core Security Layer</p>
          </CardHeader>
          <CardContent className="p-8 bg-zinc-800">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Identifiant Entreprise</label>
                <input 
                  disabled 
                  value={tenantId} 
                  className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl p-4 text-white font-bold opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mot de passe</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-xl p-4 text-white font-bold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-lg font-black uppercase italic tracking-tighter shadow-xl shadow-blue-900/20"
                disabled={loading}
              >
                {loading ? 'Vérification...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <div className="p-4 bg-zinc-900/50 text-center border-t border-zinc-700">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Isolation des données active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
