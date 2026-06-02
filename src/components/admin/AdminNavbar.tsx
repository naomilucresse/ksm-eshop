'use client';

import { Tenant } from '@/lib/types';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminNavbarProps {
 tenant: Tenant;
}

export default function AdminNavbar() {
 return (
 <header className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-30">
 <div className="flex items-center gap-4 flex-1">
 <div className="relative w-96 hidden lg:block">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
 <input
 type="search"
 placeholder="Rechercher une commande, un produit..."
 className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 "
 />
 </div>
 </div>

 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" className="relative">
 <Bell className="h-5 w-5" />
 <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
 </Button>
 
 <div className="flex items-center gap-3 ml-2 border-l pl-4">
 <div className="text-right hidden sm:block">
 <p className="text-sm font-medium">Jean Dupont</p>
 <p className="text-xs text-zinc-500">Administrateur</p>
 </div>
 <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
 <User className="h-4 w-4" />
 </div>
 </div>
 </div>
 </header>
 );
}
