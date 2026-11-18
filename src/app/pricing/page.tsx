'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, Zap, Sparkles, User, ShieldAlert, ShoppingBag, ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

const adminPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Pour démarrer et tester la plateforme.',
    price: 'Gratuit',
    period: 'à vie',
    features: [
      'Jusqu\'à 100 produits',
      'Gestion des commandes de base',
      'Support communautaire',
      'Boutique avec sous-domaine KSM'
    ],
    icon: ShieldCheck,
    highlighted: false,
    cta: 'Commencer gratuitement',
  },
  {
    id: 'monthly',
    name: 'Plan Mensuel',
    description: 'Pour les boutiques en croissance.',
    price: '15 000',
    period: 'FCFA / mois',
    features: [
      'Produits illimités',
      'Gestion avancée des stocks',
      'Support prioritaire',
      'Nom de domaine personnalisé',
      'Outils d\'analyse'
    ],
    icon: Zap,
    highlighted: true,
    cta: 'Essayer le Plan Mensuel',
  },
  {
    id: 'annual',
    name: 'Plan Annuel',
    description: 'La meilleure offre pour les pros (Économisez 20%).',
    price: '144 000',
    period: 'FCFA / an',
    features: [
      'Toutes les fonctionnalités du plan mensuel',
      'API d\'intégration',
      'Plusieurs comptes administrateurs',
      'Support dédié 24/7',
      'Accès aux fonctionnalités bêta'
    ],
    icon: Sparkles,
    highlighted: false,
    cta: 'Choisir le Plan Annuel',
  },
];

const customerPricingTypes = [
  {
    name: 'Vente au Détail',
    badge: 'Standard',
    description: 'Pour les achats individuels et quotidiens sans minimum de commande.',
    features: [
      'Prix standard affiché sur la fiche produit',
      'Pas de volume minimum requis',
      'Paiement direct (Stripe, Coolpay, Portefeuille KSM)',
      'Suivi de livraison en temps réel'
    ],
    color: 'border-zinc-800 bg-zinc-900/10'
  },
  {
    name: 'Vente en Demi-Gros',
    badge: 'Économique',
    description: 'Tarifs préférentiels appliqués automatiquement à partir d\'un volume d\'achat intermédiaire.',
    features: [
      'Remises sur volume (configurées par la boutique)',
      'Seuils de commande flexibles (ex: dès 10 articles)',
      'Facturation automatique consolidée',
      'Idéal pour les revendeurs de taille moyenne'
    ],
    color: 'border-zinc-800 bg-zinc-900/20'
  },
  {
    name: 'Vente en Gros',
    badge: 'Professionnel',
    description: 'Tarifs ultra-compétitifs pour les commandes importantes et les commerçants partenaires.',
    features: [
      'Tarifs de gros exclusifs',
      'Seuils de quantité spécifiques par article',
      'Gestion des devis et négociation directe',
      'Accès prioritaire aux arrivages de stocks'
    ],
    color: 'border-blue-500/50 bg-blue-950/10 ring-2 ring-blue-500/10'
  },
  {
    name: 'Super Gros',
    badge: 'Distributeur',
    description: 'Le tarif le plus bas possible, réservé aux distributeurs officiels et achats massifs.',
    features: [
      'Prix d\'usine négociés',
      'Minimum de commande par palette ou conteneur',
      'Responsable de compte dédié pour la logistique',
      'Conditions de paiement adaptées aux volumes'
    ],
    color: 'border-amber-500/50 bg-amber-950/10 ring-2 ring-amber-500/10'
  }
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');

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
            Grille Tarifaire
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Tarifs & Offres KSM
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Consultez nos politiques de prix selon votre profil d'utilisation.
          </p>
        </div>
      </section>

      {/* Main Content with Side Navigation List */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Side Plan Navigation List */}
          <div className="col-span-1 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-3xl space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-3 mb-4">Choisissez un plan</h3>
              <ul className="space-y-1 font-bold text-sm">
                <li>
                  <button
                    onClick={() => setActiveTab('client')}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                      activeTab === 'client'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Pour les Clients (Achats)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Pour les Boutiques (Admins)</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Content Area */}
          <div className="col-span-3">
            {activeTab === 'client' ? (
              /* Client Side Content */
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Politique tarifaire acheteur</h2>
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed">
                    Les boutiques KSM eShop intègrent un système intelligent de prix dégressifs selon les volumes commandés.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customerPricingTypes.map((type) => (
                    <div
                      key={type.name}
                      className={`border rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] ${type.color}`}
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/25">
                          {type.badge}
                        </span>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mt-4">{type.name}</h3>
                        <p className="text-zinc-500 text-xs font-bold leading-relaxed mt-2">{type.description}</p>
                        
                        <ul className="space-y-3 mt-6">
                          {type.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-medium leading-relaxed">
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 border-t border-zinc-900/50 mt-6">
                        <Link 
                          href="/" 
                          className="text-xs font-black uppercase tracking-widest text-zinc-300 hover:text-white flex items-center gap-1 group transition-colors"
                        >
                          Voir les produits
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/40 border border-zinc-900 p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl mt-8">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Vous êtes commerçant professionnel ?</h4>
                      <p className="text-zinc-500 text-xs mt-1 leading-relaxed max-w-xl">
                        Certaines boutiques proposent également des ventes par conteneur ou des devis sur mesure. N'hésitez pas à les contacter via les coordonnées de leur boutique.
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-[10px] px-6 py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all shrink-0 text-center w-full sm:w-auto"
                  >
                    Explorer la boutique
                  </Link>
                </div>
              </div>
            ) : (
              /* Admin Side Content */
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tarifs d'Abonnement de Boutique</h2>
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed">
                    Choisissez le plan adapté à la taille de votre organisation et débloquez la puissance e-commerce de KSM.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {adminPlans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <div
                        key={plan.name}
                        className={`flex flex-col bg-zinc-900/30 border rounded-3xl p-6 backdrop-blur-sm relative ${
                          plan.highlighted ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/5' : 'border-zinc-900 shadow-xl'
                        }`}
                      >
                        {plan.highlighted && (
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            Le plus populaire
                          </span>
                        )}
                        
                        <div className="text-center pb-6 border-b border-zinc-900/50">
                          <div className="mx-auto h-12 w-12 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-white">{plan.name}</h3>
                          <div className="mt-4 flex items-baseline justify-center">
                            <span className="text-3xl font-black tracking-tight text-white">{plan.price}</span>
                            {plan.price !== 'Gratuit' && (
                              <span className="text-xs font-bold text-zinc-500 ml-2">{plan.period}</span>
                            )}
                          </div>
                          <p className="mt-3 text-xs text-zinc-500 font-bold leading-relaxed">{plan.description}</p>
                        </div>

                        <ul className="space-y-4 my-6 flex-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-400 font-medium">
                              <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Link 
                          href="/admin/organizations"
                          className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs h-auto text-center flex items-center justify-center transition-colors ${
                            plan.highlighted
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                          }`}
                        >
                          {plan.cta}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
