import { Tenant } from '@/lib/types';
import Link from 'next/link';

interface ShopFooterProps {
 tenant: Tenant;
}

export default function ShopFooter({ tenant }: ShopFooterProps) {
 return (
 <footer className="border-t bg-zinc-50 ">
 <div className="container mx-auto px-4 py-12">
 <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
 <div className="col-span-1 md:col-span-2">
 <h2 className="text-xl font-bold" style={{ color: tenant.themeColor }}>
 {tenant.name}
 </h2>
 <p className="mt-4 max-w-xs text-sm text-zinc-500 ">
 {tenant.description}
 </p>
 </div>
 <div>
 <h3 className="text-sm font-semibold uppercase tracking-wider">Boutique</h3>
 <ul className="mt-4 space-y-2">
 <li>
 <Link href={`/${tenant.slug}/products`} className="text-sm text-zinc-500 hover:text-zinc-900 ">
 Tous les produits
 </Link>
 </li>
 <li>
 <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 ">
 Nouveautés
 </Link>
 </li>
 <li>
 <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 ">
 Promotions
 </Link>
 </li>
 </ul>
 </div>
 <div>
 <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
 <ul className="mt-4 space-y-2">
 <li>
 <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 ">
 Contact
 </Link>
 </li>
 <li>
 <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 ">
 Livraison
 </Link>
 </li>
 <li>
 <Link href="#" className="text-sm text-zinc-500 hover:text-zinc-900 ">
 FAQ
 </Link>
 </li>
 </ul>
 </div>
 </div>
 <div className="mt-12 border-t pt-8">
 <p className="text-center text-xs text-zinc-500 ">
 &copy; {new Date().getFullYear()} {tenant.name} - Propulsé par KSM Core.
 </p>
 </div>
 </div>
 </footer>
 );
}
