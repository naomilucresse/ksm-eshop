import Link from 'next/link';
import { SiteFooter } from '@/components/marketing/site-footer';

export const dynamic = 'force-dynamic';

export default function HelpPage() {
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
            Support & Questions Fréquentes
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mt-6 mb-4">
            Centre d'Aide KSM
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Une question ? Consultez notre FAQ ou contactez notre support pour débloquer votre situation.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full space-y-12">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-8 text-center">Foire aux questions</h2>
          
          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-white">🔑 Comment me connecter en tant que gérant d'organisation ?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                Rendez-vous sur la page <Link href="/admin/login" className="text-blue-500 hover:underline">Connexion Gérant</Link>. Entrez l'adresse e-mail et le mot de passe de votre compte Kernel Yowyob. Si vous y êtes invité, entrez le code de sécurité (OTP) envoyé par e-mail ou SMS.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-white">🔄 Pourquoi ma session d'administration s'ouvre puis se referme immédiatement ?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                Ce problème survient lorsque vos requêtes d'administration sont rejetées par le Kernel avec une erreur 401 ou 403 (autorisation refusée). Nous avons corrigé ce bug en ajoutant l'en-tête de sécurité obligatoire `X-Organization-Id` et en configurant des mécanismes de secours (fallback) sur la liste globale des organisations. Si le problème persiste, videz le cache de votre navigateur ou reconnectez-vous.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-white">🖼️ Pourquoi ai-je un point d'interrogation bleu à la place d'une photo de produit ?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                Le point d'interrogation signifie que la chaîne d'image Base64 a été coupée ou tronquée silencieusement par le Kernel (limitation de la base de données à 65 535 caractères par champ textuel). Cela se produit si vous téléversez des images trop lourdes ou non compressées. 
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                Nous avons optimisé la compression automatique (canvas 300px max, qualité 0.4) lors des téléversements pour éviter ce problème. Pour les produits déjà endommagés, modifiez le produit et remplacez la photo par une image plus légère.
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 p-6 md:p-8 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-white">💳 Comment mes clients rechargent-ils leur portefeuille KSM ?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed text-justify">
                Les clients peuvent recharger leur solde directement depuis leur espace client avec Stripe (Cartes bancaires) ou Coolpay (Orange Money, MTN Mobile Money). Une fois la transaction validée, le solde de leur portefeuille est instantanément crédité en Francs CFA (XAF) et ils peuvent effectuer leurs achats d'un simple clic.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="bg-zinc-900/50 border border-zinc-900 p-8 rounded-3xl text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Besoin d'une assistance personnalisée ?</h3>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Notre équipe technique et support est disponible par e-mail à l'adresse **support@yowyob.com** pour vous aider à résoudre tout problème de configuration ou de transaction.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl cursor-pointer shadow-lg shadow-blue-600/20">
                Ouvrir un ticket support
              </span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
