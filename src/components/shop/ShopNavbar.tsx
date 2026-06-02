'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';

interface ShopNavbarProps {
  tenant: Tenant;
}

export default function ShopNavbar({ tenant }: ShopNavbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setIsMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-zinc-200 bg-white shadow-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group border-2 border-zinc-900 p-1 px-2 rounded-lg">
            <span className="text-xl font-black tracking-tighter text-zinc-900 uppercase italic">KSM eShop</span>
          </Link>
          
          <div className="h-8 w-[2px] bg-zinc-200 hidden md:block" />
          
          <Link href={`/${tenant.slug}`} className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg shadow-inner flex items-center justify-center text-white font-black" style={{ backgroundColor: tenant.themeColor }}>
              {tenant.name[0]}
            </div>
            <span className="text-lg font-black text-zinc-900 uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
              {tenant.name}
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <Link href={`/${tenant.slug}/products`} className="text-sm font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors">
            Catalogue
          </Link>
          <Link href="#" className="text-sm font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors">
            Nouveautés
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="search"
              placeholder="Chercher..."
              className="h-10 w-48 rounded-full border-2 border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm font-bold focus:border-zinc-900 focus:outline-none transition-all"
            />
          </div>
          
          <Link href={`/${tenant.slug}/cart`}>
            <Button variant="ghost" size="icon" className="relative h-12 w-12 hover:bg-zinc-100 border-2 border-transparent hover:border-zinc-200">
              <ShoppingCart className="h-6 w-6 text-zinc-900" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-lg border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-zinc-100 border-2 border-transparent hover:border-zinc-200">
            <User className="h-6 w-6 text-zinc-900" />
          </Button>
        </div>
      </div>
    </header>
  );
}
