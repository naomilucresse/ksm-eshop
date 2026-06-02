'use client';

import { TENANTS } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from '@/components/shop/AddToCartButton';
import { ArrowLeft, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useProductStore } from '@/store/useProductStore';

export default function ProductDetailPage() {
 const { tenantId, productId } = useParams();
 const { products } = useProductStore();
 
 const tenant = TENANTS.find((t) => t.slug === tenantId);
 const product = products.find((p) => p.id === productId && p.tenantId === tenant?.id);

 if (!tenant || !product) {
 notFound();
 }

 return (
 <div className="container mx-auto px-4 py-12">
   <div className="mb-8">
     <Link 
       href={`/${tenant.slug}/products`} 
       className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-600 hover:text-black hover:border-zinc-400 transition-all shadow-sm"
     >
       <ArrowLeft className="h-4 w-4" />
       Retour au catalogue
     </Link>
   </div>
 <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
 {/* Product Image */}
 <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 ">
 <img 
 src={product.imageUrl} 
 alt={product.name} 
 className="h-full w-full object-cover"
 />
 </div>

 {/* Product Info */}
 <div className="flex flex-col">
 <div className="flex-1">
 <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
 <p className="mt-4 text-3xl font-bold text-zinc-900 ">
 {formatPrice(product.price)}
 </p>
 
 <div className="mt-8">
 <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Description</h3>
 <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
 {product.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
 Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
 Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
 </p>
 </div>

 <div className="mt-8 flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
 <span className="text-sm font-medium">
 {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
 </span>
 </div>
 <div className="flex items-center gap-2 border-l pl-4">
 <ShieldCheck className="h-4 w-4 text-blue-500" />
 <span className="text-sm font-medium text-zinc-500">Produit Vérifié KSM</span>
 </div>
 </div>
 </div>

 <div className="mt-12 space-y-6">
 <AddToCartButton product={product} />
 
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-8 border-t">
 <div className="flex flex-col items-center text-center p-4 rounded-xl bg-zinc-50 ">
 <Truck className="h-5 w-5 mb-2 text-zinc-500" />
 <span className="text-xs font-bold uppercase tracking-tighter">Livraison</span>
 <span className="text-[10px] text-zinc-500">24h - 48h</span>
 </div>
 <div className="flex flex-col items-center text-center p-4 rounded-xl bg-zinc-50 ">
 <RefreshCcw className="h-5 w-5 mb-2 text-zinc-500" />
 <span className="text-xs font-bold uppercase tracking-tighter">Retours</span>
 <span className="text-[10px] text-zinc-500">Sous 14 jours</span>
 </div>
 <div className="flex flex-col items-center text-center p-4 rounded-xl bg-zinc-50 ">
 <ShieldCheck className="h-5 w-5 mb-2 text-zinc-500" />
 <span className="text-xs font-bold uppercase tracking-tighter">Garantie</span>
 <span className="text-[10px] text-zinc-500">Qualité KSM</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
