import Link from 'next/link';

const footerColumns = [
  {
    title: 'Produit',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Fonctionnalités', href: '/features' },
      { label: 'Tarifs', href: '/pricing' },
      { label: 'API', href: '/developers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: "Centre d'aide", href: '/help' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '/about' },
      { label: 'Carrières', href: '/careers' },
      { label: 'Presse', href: '/press' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions KSM', href: '/terms' },
      { label: 'Confidentialité', href: '/privacy' },
      { label: 'Cookies & Publicité', href: '/cookies' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group border-2 border-white/90 p-1 px-3 rounded-lg bg-zinc-950 hover:bg-black transition-colors">
              <span className="text-lg font-black tracking-tighter text-white uppercase italic">KSM eShop</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Solution complète pour maîtriser votre commerce et vos ventes en ligne.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} YowYob Inc. Ltd. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
