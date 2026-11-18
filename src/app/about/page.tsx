import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
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

      {/* Hero */}
      <section className="relative overflow-hidden py-24 border-b border-zinc-900 bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Qui sommes-nous ?
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            À Propos de KSM eShop
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            La plateforme e-commerce multi-tenant moderne qui connecte les organisations et simplifie le commerce en ligne au Cameroun et en Afrique.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 w-full space-y-20">
        {/* Intro Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Une infrastructure robuste et partagée
            </h2>
            <p className="text-zinc-400 leading-relaxed text-justify">
              KSM eShop n'est pas seulement un site de vente en ligne, c'est un écosystème e-commerce complet propulsé par le **Kernel Core de Yowyob**. Notre architecture multi-locataire (multi-tenant) permet à chaque organisation de posséder sa propre vitrine numérique cloisonnée tout en bénéficiant de la puissance et de la sécurité d'une base centrale.
            </p>
            <p className="text-zinc-400 leading-relaxed text-justify">
              Grâce à cette technologie, nous offrons une synchronisation instantanée des produits, de la gestion des stocks, du suivi des commandes et des portefeuilles électroniques de paiement.
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 shadow-2xl backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-black uppercase text-white tracking-tight">KSM en quelques chiffres</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-2 border-blue-500 pl-4">
                <div className="text-3xl font-black text-white">5%</div>
                <div className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mt-1">Frais de commission fixes</div>
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <div className="text-3xl font-black text-white">200+</div>
                <div className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mt-1">Boutiques actives</div>
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <div className="text-3xl font-black text-white">100%</div>
                <div className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mt-1">Paiements sécurisés</div>
              </div>
              <div className="border-l-2 border-blue-500 pl-4">
                <div className="text-3xl font-black text-white">24/7</div>
                <div className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mt-1">Disponibilité système</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-10">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">Nos valeurs fondamentales</h2>
            <p className="text-zinc-500 text-sm font-medium mt-2">Ce qui guide le développement et la maintenance de la plateforme KSM.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl space-y-3">
              <div className="text-xl font-bold text-white">1. Cloisonnement strict</div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Les données d'une organisation restent exclusives à cette organisation. Aucune fuite d'information sur les produits, les stocks, ou les transactions des clients d'une autre entité.
              </p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl space-y-3">
              <div className="text-xl font-bold text-white">2. Souveraineté financière</div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Chaque organisation configure son propre compte bancaire ou compte de paiement mobile. Les fonds lui sont directement transférés, déduits de la faible commission système.
              </p>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl space-y-3">
              <div className="text-xl font-bold text-white">3. Accessibilité & Vitesse</div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Une interface moderne conçue pour charger rapidement, y compris avec des connexions mobiles limitées. Vos clients accèdent à vos fiches produits instantanément.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Card */}
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-900/30 rounded-3xl p-10 md:p-16 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white relative z-10">Rejoignez l'aventure KSM</h2>
          <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed text-base relative z-10">
            Que vous soyez gérant d'une boutique physique souhaitant franchir le pas du numérique, ou développeur cherchant à vous interfacer avec notre architecture API robuste, KSM a été conçu pour vous.
          </p>
          <div className="flex justify-center gap-4 relative z-10 pt-4">
            <Link href="/admin/organizations">
              <span className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
                Créer ma boutique
              </span>
            </Link>
            <Link href="/contact">
              <span className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer">
                Nous contacter
              </span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
