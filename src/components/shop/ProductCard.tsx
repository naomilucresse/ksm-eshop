'use client';

import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  tenantSlug: string;
}

export default function ProductCard({ product, tenantSlug }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Card className="overflow-hidden group transition-all hover:shadow-xl border-zinc-200">
      <div className="relative aspect-square overflow-hidden bg-zinc-100 border-b border-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
           <Link href={`/${tenantSlug}/products/${product.id}`}>
            <Button size="icon" variant="secondary" className="rounded-full bg-white text-zinc-900 shadow-lg">
              <Eye className="h-5 w-5" />
            </Button>
           </Link>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
            Stock Limité
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
            Épuisé
          </span>
        )}
      </div>
      <CardContent className="p-5 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-lg text-zinc-900 line-clamp-1 italic uppercase tracking-tighter">{product.name}</h3>
        </div>
        <p className="text-sm font-bold text-zinc-500 line-clamp-2 min-h-[2.5rem] leading-snug">
          {product.description}
        </p>
        <p className="mt-4 text-2xl font-black text-blue-600 tracking-tighter">
          {formatPrice(product.price)}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0 bg-white">
        <Button 
          className="w-full gap-2 h-12 font-bold text-md shadow-sm bg-zinc-900 hover:bg-zinc-800" 
          disabled={product.stock === 0}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-5 w-5" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}
