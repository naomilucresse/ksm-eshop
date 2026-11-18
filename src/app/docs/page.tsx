import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

export default function DocsPage() {
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
            Documentation Technique & Guide Gérant
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Guides & Manuels KSM
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Découvrez comment configurer votre boutique, ajouter vos produits et optimiser vos ventes avec la documentation KSM eShop.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 w-full grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Pour commencer</h3>
            <ul className="space-y-2 text-sm font-bold text-zinc-400">
              <li><a href="#intro" className="hover:text-white transition-colors block">Introduction</a></li>
              <li><a href="#quickstart" className="hover:text-white transition-colors block">Démarrage Rapide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Gestion Boutique</h3>
            <ul className="space-y-2 text-sm font-bold text-zinc-400">
              <li><a href="#add-products" className="hover:text-white transition-colors block">Ajouter des Produits</a></li>
              <li><a href="#images-tips" className="hover:text-white transition-colors block">Conseils d'Images</a></li>
              <li><a href="#bank-setup" className="hover:text-white transition-colors block">Configuration Bancaire</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Transactions</h3>
            <ul className="space-y-2 text-sm font-bold text-zinc-400">
              <li><a href="#fees" className="hover:text-white transition-colors block">Frais de plateforme</a></li>
              <li><a href="#wallet" className="hover:text-white transition-colors block">Portefeuille Électronique</a></li>
            </ul>
          </div>
        </div>

        {/* Documentation Content */}
        <div className="col-span-3 space-y-12">
          {/* Introduction */}
          <section id="intro" className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">1. Introduction</h2>
            <p className="text-zinc-400 leading-relaxed text-justify">
              KSM eShop est une plateforme multi-tenant. Chaque boutique créée sur KSM correspond à une organisation unique au sein du Kernel de Yowyob. Les clients peuvent explorer toutes les boutiques de manière globale sur la page d'accueil principale, ou accéder directement à une boutique via son URL dédiée.
            </p>
          </section>

          {/* Démarrage Rapide */}
          <section id="quickstart" className="space-y-4 border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">2. Guide de Démarrage Rapide</h2>
            <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
              <p>Suivez les étapes ci-dessous pour lancer votre boutique e-shop en moins de 10 minutes :</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connectez-vous à votre espace d'administration via la page <Link href="/admin/login" className="text-blue-500 hover:underline">Connexion Gérant</Link>.</li>
                <li>Sélectionnez l'organisation que vous souhaitez administrer dans la liste.</li>
                <li>Sur le tableau de bord, cliquez sur **Ajouter un produit** ou accédez à l'onglet produits.</li>
                <li>Remplissez les détails du produit (nom, prix, description, stock disponible).</li>
                <li>Votre produit est immédiatement en ligne et visible par tous les visiteurs de la plateforme KSM.</li>
              </ol>
            </div>
          </section>

          {/* Ajouter des Produits */}
          <section id="add-products" className="space-y-4 border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">3. Ajouter et Gérer des Produits</h2>
            <p className="text-zinc-400 leading-relaxed text-justify">
              Lors de l'ajout d'un produit, vous pouvez spécifier un SKU unique (code article), son prix de vente unitaire, la quantité en stock actuelle ainsi qu'un ou plusieurs fichiers d'images d'illustration.
            </p>
          </section>

          {/* Conseils d'Images */}
          <section id="images-tips" className="space-y-4 border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">4. Conseils d'Images & Performance</h2>
            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl text-zinc-400 text-sm space-y-3 leading-relaxed">
              <h4 className="font-bold text-white uppercase tracking-tight">⚠️ Attention à la taille des images</h4>
              <p>
                Pour garantir une vitesse de chargement optimale et éviter les limitations de stockage du Kernel Core, toutes les images que vous téléversez sur KSM eShop sont compressées en arrière-plan (largeur max : 300px, qualité : 0.4).
              </p>
              <p>
                Nous vous conseillons de téléverser des fichiers de format carré (ratio 1:1) et de petite taille (idéalement JPEG sous les 500 Ko) pour préserver une qualité optimale après compression.
              </p>
            </div>
          </section>

          {/* Configuration Bancaire */}
          <section id="bank-setup" className="space-y-4 border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">5. Configuration Bancaire</h2>
            <p className="text-zinc-400 leading-relaxed text-justify">
              Afin de pouvoir recevoir les fonds des achats de vos clients, vous devez impérativement configurer les informations de paiement de votre organisation. Rendez-vous sur votre profil administrateur, onglet **Compte Bancaire**, et renseignez votre IBAN/RIB ou votre compte marchand de paiement mobile.
            </p>
          </section>

          {/* Frais et transactions */}
          <section id="fees" className="space-y-4 border-t border-zinc-900 pt-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">6. Frais de plateforme & Commissions</h2>
            <p className="text-zinc-400 leading-relaxed text-justify">
              L'hébergement et l'utilisation de KSM eShop sont gratuits. Une **commission fixe de 5%** est prélevée automatiquement sur le montant brut de chaque transaction finalisée sur le site pour financer les frais d'infrastructure et de passerelle de paiement.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
