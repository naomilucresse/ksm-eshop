'use client';

import { TENANTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, LayoutGrid } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';

export default function ShopHomePage() {
  const { tenantId } = useParams();
  const { products } = useProductStore();
  const tenant = TENANTS.find((t) => t.slug === tenantId);

  if (!tenant) return null;

  const featuredProducts = products.filter(
    (p) => p.tenantId === tenant.id && p.isFeatured
  );

  return (
    <div className="flex flex-col gap-12 pb-16 bg-zinc-50 min-h-screen">
      {/* Header Section Simple - Plus d'image de fond */}
      <section className="bg-white border-b-4 border-zinc-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Boutique Officielle</span>
                <div className="h-1 w-12 bg-blue-600 rounded-full" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-zinc-900 uppercase italic mb-4">
                {tenant.name}
              </h1>
              <p className="text-xl font-bold text-zinc-500 leading-relaxed">
                {tenant.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${tenant.slug}/products`}>
                <Button size="lg" className="h-16 px-8 text-lg font-black uppercase italic tracking-tighter bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
                  <LayoutGrid className="mr-2 h-6 w-6" /> Voir tout le catalogue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between border-b-2 border-zinc-200 pb-6 mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase italic">Sélection du moment</h2>
            <p className="mt-2 text-zinc-500 font-bold uppercase text-xs tracking-widest">Nos articles les plus demandés</p>
          </div>
          <Link href={`/${tenant.slug}/products`} className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-zinc-900 transition-colors">
            Voir le catalogue complet <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} tenantSlug={tenant.slug} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-zinc-200 rounded-3xl p-20 text-center">
            <ShoppingBag className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-xl font-black text-zinc-400 uppercase tracking-tighter">Aucun produit vedette pour le moment</p>
            <Link href={`/${tenant.slug}/products`} className="mt-6 inline-block">
              <Button variant="outline" className="border-2 border-zinc-900 font-black uppercase italic">Parcourir le catalogue</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Trust Values Bar */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-zinc-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-100">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="font-black text-zinc-900 uppercase italic text-sm tracking-tighter">Paiement ePay</p>
              <p className="text-xs font-bold text-zinc-500">Transaction sécurisée KSM</p>
            </div>
          </div>
          <div className="bg-white border-2 border-zinc-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center border-2 border-green-100">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <p className="font-black text-zinc-900 uppercase italic text-sm tracking-tighter">Retrait Immédiat</p>
              <p className="text-xs font-bold text-zinc-500">Stock physique vérifié</p>
            </div>
          </div>
          <div className="bg-white border-2 border-zinc-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center border-2 border-orange-100">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <p className="font-black text-zinc-900 uppercase italic text-sm tracking-tighter">Qualité KSM</p>
              <p className="text-xs font-bold text-zinc-500">Boutique certifiée locale</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
