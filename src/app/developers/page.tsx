import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';


export const dynamic = 'force-dynamic';

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <span className="flex items-center gap-2 group border-2 border-zinc-800 p-1 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 transition-colors"><span className="text-sm font-black tracking-tighter text-zinc-100 uppercase italic">KSM eShop</span></span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-24 border-b border-zinc-900 bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            API & Documentation
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Espace Développeurs KSM
          </h1>
          <p className="text-zinc-400 text-lg font-medium max-w-2xl mx-auto">
            Intégrez la puissance de vente de KSM eShop au sein de vos propres applications et services.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 shadow-xl space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Intégration d'API</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Grâce à l'API Core de Yowyob, vous pouvez interroger les stocks, pousser des commandes, gérer des paniers et automatiser les facturations.
          </p>
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 font-mono text-xs text-blue-400">
            GET /api/products?organizationId=YOUR_ORG_ID
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
