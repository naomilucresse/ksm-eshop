'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

const coordinates = [
  { icon: Mail, label: 'E-mail', value: 'info@yowyob.com' },
  { icon: Phone, label: 'Téléphone', value: '+237 6 75 51 88 80' },
  { icon: MapPin, label: 'Adresse', value: 'Yaoundé, Cameroun' },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      form.reset();
      setTimeout(() => setSent(false), 5000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group border-2 border-zinc-800 p-1 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 transition-colors">
            <span className="text-sm font-black tracking-tighter text-zinc-100 uppercase italic">KSM eShop</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 border-b border-zinc-900 bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Support & Assistance
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Contactez KSM eShop
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Une question, besoin d'aide avec votre boutique ou d'un support de paiement ? Notre équipe vous répond rapidement.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coordinates Cards */}
          <div className="space-y-6">
            {coordinates.map((item) => (
              <div key={item.label} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 flex items-start gap-4 shadow-xl backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shrink-0 text-blue-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-white break-all">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm space-y-6">
              {sent && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm font-bold text-center">
                  Merci ! Votre message a bien été envoyé. Notre support revient vers vous sous peu.
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-2xl border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-2xl border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Sujet
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full rounded-2xl border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-600 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-2xl border-2 border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-600 transition-colors resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs px-6 py-4 rounded-2xl shadow-lg shadow-blue-600/20 w-full sm:w-auto h-auto flex items-center justify-center gap-2"
              >
                {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
