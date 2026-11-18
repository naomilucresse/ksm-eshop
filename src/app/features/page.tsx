'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Search, Wallet, ShoppingBag, Store, ShieldAlert, Sparkles, Database, BarChart3, Settings } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

const clientFeatures = [
  {
    title: 'Recherche Globale & Filtres',
    description: 'Trouvez instantanément le produit que vous cherchez parmi toutes les boutiques actives.',
    details: [
      'Recherche textuelle intelligente en temps réel',
      'Filtrage dynamique par catégorie ou famille de produits',
      'Tri par prix croissant ou décroissant',
      'Raccourcis vers les différentes vitrines d\'organisations'
    ],
    icon: Search
  },
  {
    title: 'Portefeuille Électronique KSM',
    description: 'Payez vos achats de manière sécurisée sans sortir votre carte à chaque transaction.',
    details: [
      'Recharge rapide par paiement mobile (Orange Money, MTN MoMo via Coolpay)',
      'Recharge internationale par carte bancaire via Stripe',
      'Paiement sécurisé instantané en 1 clic',
      'Historique complet des recharges et des débits'
    ],
    icon: Wallet
  },
  {
    title: 'Suivi de Commandes Unifié',
    description: 'Suivez le statut de toutes vos commandes passées auprès des différentes boutiques.',
    details: [
      'Visualisation claire de l\'historique des achats',
      'Statuts de traitement en temps réel (En attente, Confirmée, Livrée, Annulée)',
      'Détails des articles et factures téléchargeables',
      'Support de contact direct pour chaque commande'
    ],
    icon: ShoppingBag
  }
];

const adminFeatures = [
  {
    title: 'Multi-Tenant & Cloisonnement',
    description: 'Une infrastructure isolée et sécurisée pour votre marque.',
    details: [
      'Séparation stricte des données entre les boutiques',
      'Gestion indépendante de vos clients et commandes',
      'Sous-domaine KSM ou nom de domaine personnalisé',
      'Hébergement Cloud robuste et disponibilité maximale'
    ],
    icon: Database
  },
  {
    title: 'Catalogue & Gestion des Stocks',
    description: 'Mettez en valeur vos articles et gardez le contrôle de votre inventaire.',
    details: [
      'Création simplifiée de fiches produits',
      'Compression automatique d\'images pour la performance',
      'Gestion en temps réel des quantités disponibles',
      'Configuration des prix de gros et de détail'
    ],
    icon: Store
  },
  {
    title: 'Tableau de bord & Analyses',
    description: 'Suivez vos performances de vente et optimisez votre croissance.',
    details: [
      'Graphiques de chiffre d\'affaires et de ventes',
      'Gestion centralisée du flux de commandes clients',
      'Export des données de ventes',
      'Outils d\'analyse de performance des produits'
    ],
    icon: BarChart3
  }
];

export default function FeaturesPage() {
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
            Fonctionnalités Clés
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Fonctionnalités KSM
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Découvrez nos outils conçus pour faciliter votre commerce.
          </p>
        </div>
      </section>

      {/* Main Content with Side Navigation List */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Side Navigation List */}
          <div className="col-span-1 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-3xl space-y-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-3 mb-4">Navigation</h3>
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
                    <ShoppingBag className="h-4 w-4" />
                    <span>Pour les Clients</span>
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
                    <Settings className="h-4 w-4" />
                    <span>Pour les Admins</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Features Content Area */}
          <div className="col-span-3">
            {activeTab === 'client' ? (
              /* Client Features */
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Fonctionnalités pour les Clients</h2>
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed">
                    Une expérience d'achat fluide, sécurisée et optimisée pour tous les acheteurs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clientFeatures.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.title} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="h-10 w-10 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center text-blue-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-white">{feat.title}</h3>
                          <p className="text-zinc-500 text-xs font-bold leading-relaxed">{feat.description}</p>
                          
                          <ul className="space-y-3 pt-4">
                            {feat.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-medium">
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Admin Features */
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">Fonctionnalités pour les Administrateurs</h2>
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed">
                    Les outils professionnels requis pour développer et gérer efficacement votre commerce multi-tenant.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {adminFeatures.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.title} className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="h-10 w-10 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center text-blue-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-white">{feat.title}</h3>
                          <p className="text-zinc-500 text-xs font-bold leading-relaxed">{feat.description}</p>
                          
                          <ul className="space-y-3 pt-4">
                            {feat.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-medium">
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
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
