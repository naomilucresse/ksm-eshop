'use client';

import { TENANTS, CATEGORIES } from '@/lib/mock-data';
import ProductCard from '@/components/shop/ProductCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Filter, ChevronRight, X, Search, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';

export default function ProductsPage() {
  const { tenantId } = useParams();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const { products } = useProductStore();
  
  const tenant = TENANTS.find((t) => t.slug === tenantId);
  if (!tenant) return null;

  let filteredProducts = products.filter((p) => p.tenantId === tenant.id);

  if (categorySlug) {
    const category = CATEGORIES.find((c) => c.slug === categorySlug);
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.categoryId === category.id);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Breadcrumb style */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
            <Link href="/" className="hover:text-zinc-900">KSM eShop</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${tenant.slug}`} className="hover:text-zinc-900">{tenant.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-blue-600">Catalogue</span>
          </nav>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 uppercase italic">Catalogue Complet</h1>
        </div>
        <div className="bg-zinc-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="text-2xl font-black italic tracking-tighter">{filteredProducts.length}</span>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none text-zinc-400">Articles<br/>Disponibles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Advanced Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <Card className="border-4 border-zinc-900 overflow-hidden shadow-xl">
              <div className="bg-zinc-900 p-4 flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                <span className="font-black uppercase italic tracking-tighter">Filtres</span>
              </div>
              <CardContent className="p-6 space-y-8 bg-white">
                {/* Categories */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 border-b pb-2">Catégories</h3>
                  <div className="space-y-2">
                    <Link 
                      href={`/${tenant.slug}/products`} 
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all font-bold text-sm ${!categorySlug ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-zinc-50 border-transparent text-zinc-600 hover:border-zinc-200'}`}
                    >
                      <span>Tous les articles</span>
                      {!categorySlug && <CheckCircle2 className="h-4 w-4" />}
                    </Link>
                    {CATEGORIES.filter(c => products.some(p => p.categoryId === c.id && p.tenantId === tenant.id)).map((category) => (
                      <Link 
                        key={category.id}
                        href={`/${tenant.slug}/products?category=${category.slug}`}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all font-bold text-sm ${categorySlug === category.slug ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-zinc-50 border-transparent text-zinc-600 hover:border-zinc-200'}`}
                      >
                        <span>{category.name}</span>
                        {categorySlug === category.slug && <CheckCircle2 className="h-4 w-4" />}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 border-b pb-2">Disponibilité</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="h-5 w-5 rounded border-2 border-zinc-300 group-hover:border-blue-600 transition-colors flex items-center justify-center">
                        <div className="h-2.5 w-2.5 bg-blue-600 rounded-sm opacity-0 group-hover:opacity-10" />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">En Stock Immédiat</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="h-5 w-5 rounded border-2 border-zinc-300 group-hover:border-blue-600 transition-colors flex items-center justify-center">
                        <div className="h-2.5 w-2.5 bg-blue-600 rounded-sm opacity-0 group-hover:opacity-10" />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">Promotions ePay</span>
                    </label>
                  </div>
                </div>

                {/* Search in results */}
                <div className="pt-4 border-t-2 border-zinc-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Filtrer par nom..." 
                      className="w-full h-10 bg-zinc-50 border-2 border-zinc-100 rounded-xl pl-10 pr-4 text-xs font-bold focus:border-zinc-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {categorySlug && (
                  <Link href={`/${tenant.slug}/products`}>
                    <Button variant="outline" className="w-full gap-2 border-2 border-zinc-200 font-black uppercase text-[10px] tracking-widest h-10">
                      <X className="h-3 w-3" /> Réinitialiser
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 border-b-4 border-blue-800">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Service Client</p>
               <p className="text-lg font-black italic tracking-tighter mb-4">Besoin d&apos;aide ?</p>
               <Button className="w-full bg-white text-blue-600 hover:bg-zinc-100 font-black uppercase text-xs tracking-widest h-10 border-none shadow-none">
                 Nous Contacter
               </Button>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-3xl border-4 border-dashed border-zinc-200 bg-white">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-zinc-300" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">Aucun produit trouvé</h3>
              <p className="mt-2 text-zinc-500 font-bold">Essayez de modifier vos filtres de recherche.</p>
              <Link href={`/${tenant.slug}/products`} className="mt-8">
                <Button className="bg-zinc-900 font-black uppercase italic px-8">Voir tout le catalogue</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} tenantSlug={tenant.slug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
