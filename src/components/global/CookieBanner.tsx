'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si le choix a déjà été enregistré
    const consent = localStorage.getItem('ksm-cookie-consent');
    if (!consent) {
      // Afficher la bannière après un court délai pour l'effet d'animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ksm-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('ksm-cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-6 rounded-3xl shadow-2xl z-50 animate-in slide-in-from-bottom-8 duration-500 flex flex-col gap-4 font-sans text-zinc-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shrink-0 text-blue-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-tight text-white text-sm">Gestion des Cookies</h4>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed mt-1">
              Nous utilisons des cookies pour optimiser votre expérience, analyser le trafic et personnaliser le contenu. Vous pouvez consulter notre politique complète sur la page des{' '}
              <Link href="/cookies" className="text-blue-400 hover:underline">
                Cookies & Publicité
              </Link>.
            </p>
          </div>
        </div>
        <button 
          onClick={handleDecline} 
          className="text-zinc-500 hover:text-white transition-colors p-1"
          title="Fermer et refuser"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button 
          variant="ghost" 
          onClick={handleDecline}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-wider rounded-xl py-2 px-4 h-auto"
        >
          Refuser
        </Button>
        <Button 
          onClick={handleAccept}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl py-2 px-4 shadow-lg shadow-blue-600/20 h-auto"
        >
          Accepter tout
        </Button>
      </div>
    </div>
  );
}
