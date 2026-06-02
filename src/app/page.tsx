import Link from 'next/link';
import { TENANTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Zap, Globe, BarChart3, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function KSMCoreLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 font-sans text-zinc-950">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase">KSM eShop</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors">Fonctionnalités</Link>
            <Link href="#tenants" className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors">Boutiques</Link>
          </nav>
          <div className="flex gap-4">
             <Link href="/admin/boulangerie-delices">
               <Button variant="outline" className="border-zinc-300 font-bold hover:bg-zinc-50">Espace Admin</Button>
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section - Forte visibilité */}
        <section className="py-24 md:py-32 bg-white border-b border-zinc-200">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl text-zinc-900">
              Digitalisez votre commerce <br />
              <span className="text-blue-600">au Cameroun.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl text-zinc-600 font-medium">
              KSM eShop est la solution locale pour gérer vos stocks en temps réel et vendre en toute sécurité avec ePay.
            </p>
            <div className="mt-12">
              <Link href="#tenants">
                <Button size="lg" className="h-16 px-10 text-xl gap-3 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105 font-bold">
                  Explorer les boutiques <ArrowRight className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Boutiques Section - Grille contrastée */}
        <section id="tenants" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic">Nos Enseignes Partenaires</h2>
              <div className="h-1.5 w-24 bg-blue-600 mx-auto mt-4 rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-5xl mx-auto">
              {TENANTS.map((tenant) => (
                <Card key={tenant.id} className="group hover:border-blue-400 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-8">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner" style={{ backgroundColor: tenant.themeColor }}>
                          {tenant.name[0]}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-zinc-900">{tenant.name}</h3>
                          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Boutique Vérifiée KSM</p>
                        </div>
                      </div>
                      <p className="text-zinc-700 font-medium mb-8 leading-relaxed">
                        {tenant.description}
                      </p>
                      <Link href={`/${tenant.slug}`}>
                        <Button className="w-full h-14 text-lg font-bold shadow-md" style={{ backgroundColor: tenant.themeColor }}>
                          Entrer dans la boutique
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Section Commerçant - Sombre pour trancher */}
        <section className="py-20 bg-zinc-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Accès Administration</h2>
            <p className="mt-4 text-zinc-400 font-medium max-w-xl mx-auto">
              Réservé aux gérants de boutiques. Synchronisez votre stock physique avec eShop en un clic.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {TENANTS.map(t => (
                <Link key={t.id} href={`/admin/${t.slug}`}>
                  <Button variant="outline" className="border-zinc-700 text-white hover:bg-white hover:text-black font-bold h-12 px-6">
                    Gérer {t.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features - Éléments visuels clairs */}
        <section id="features" className="py-24 bg-white border-y border-zinc-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center text-zinc-900 uppercase mb-16">La technologie au service du commerce</h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors border-2 border-blue-100">
                  <Zap className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase italic">Stock Sync</h3>
                <p className="mt-4 text-zinc-600 font-medium text-sm leading-relaxed">
                  Mise à jour immédiate entre vos rayons physiques et votre vitrine digitale.
                </p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 bg-green-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors border-2 border-green-100">
                  <ShieldCheck className="h-10 w-10 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase italic">ePay Secure</h3>
                <p className="mt-4 text-zinc-600 font-medium text-sm leading-relaxed">
                  Paiements sécurisés via notre passerelle ePay intégrée nativement.
                </p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 bg-purple-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors border-2 border-purple-100">
                  <Globe className="h-10 w-10 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase italic">Vente Hybride</h3>
                <p className="mt-4 text-zinc-600 font-medium text-sm leading-relaxed">
                  Une seule plateforme pour gérer vos ventes comptoir et vos commandes web.
                </p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="h-20 w-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors border-2 border-orange-100">
                  <BarChart3 className="h-10 w-10 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase italic">Statistiques</h3>
                <p className="mt-4 text-zinc-600 font-medium text-sm leading-relaxed">
                  Tableaux de bord précis pour suivre votre croissance au quotidien.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-zinc-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-black tracking-tight text-zinc-900 uppercase">KSM eShop</span>
          </div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">&copy; 2026 KSM Core Service - Cameroun</p>
        </div>
      </footer>
    </div>
  );
}
