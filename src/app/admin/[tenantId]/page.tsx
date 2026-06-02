'use client';

import { TENANTS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  RefreshCw,
  Bell,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';

export default function AdminHomePage() {
  const { tenantId } = useParams();
  const { products } = useProductStore();
  const tenant = TENANTS.find((t) => t.slug === tenantId);

  if (!tenant) return null;

  const tenantProducts = products.filter((p) => p.tenantId === tenant.id);
  const lowStockProducts = tenantProducts.filter((p) => p.stock > 0 && p.stock <= 5);

  const stats = [
    { label: 'Ventes du Jour', value: formatPrice(245000), icon: TrendingUp, color: 'text-green-600', trend: '+18%', trendType: 'up' },
    { label: 'Commandes eShop', value: '42', icon: ShoppingCart, color: 'text-blue-600', trend: '+5', trendType: 'up' },
    { label: 'Articles Catalogués', value: tenantProducts.length.toString(), icon: Package, color: 'text-purple-600', trend: 'Stable', trendType: 'neutral' },
    { label: 'Alertes Stock', value: lowStockProducts.length.toString(), icon: Bell, color: 'text-orange-600', trend: 'Suivi requis', trendType: 'neutral' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-zinc-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">KSM Admin</span>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Sync Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase italic">Vue d&apos;ensemble</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            Enseigne : <span className="text-blue-600">{tenant.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" className="border-2 border-zinc-900 font-black uppercase text-[10px] gap-2 h-9">
            <RefreshCw className="h-3 w-3" /> Sync
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-2 border-zinc-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 border-none">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</CardTitle>
              <stat.icon className={stat.color + " h-4 w-4"} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-black italic tracking-tight text-zinc-900">{stat.value}</div>
              <p className="mt-1 flex items-center text-[9px] font-black uppercase tracking-widest">
                {stat.trendType === 'up' && <ArrowUpRight className="h-2.5 w-2.5 mr-1 text-green-600" />}
                <span className={stat.trendType === 'up' ? 'text-green-600' : 'text-zinc-400'}>
                  {stat.trend}
                </span>
                <span className="ml-1.5 text-zinc-300">Vs hier</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Inventory View */}
        <Card className="lg:col-span-2 border-2 border-zinc-200">
          <CardHeader className="border-b bg-zinc-50/50 py-3">
            <CardTitle className="text-sm uppercase italic tracking-tighter font-black">État des Stocks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100">
              {tenantProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-lg border overflow-hidden shrink-0">
                      <img src={product.imageUrl} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-900 uppercase italic tracking-tight leading-none">{product.name}</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Stock actuel</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black tracking-tight ${product.stock <= 5 ? 'text-red-600' : 'text-zinc-900'}`}>{product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <Link href={`/admin/${tenant.slug}/products`}>
                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-8">
                  Voir tout l&apos;inventaire
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notifications / Activity */}
        <Card className="border-2 border-zinc-200">
          <CardHeader className="border-b bg-zinc-50/50 py-3">
            <CardTitle className="text-sm uppercase italic tracking-tighter font-black">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-900">Nouvelle commande #892</p>
                <p className="text-[9px] text-zinc-500">Il y a 5 min • par Client KSM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-900">Alerte Stock : Croissant</p>
                <p className="text-[9px] text-zinc-500">Il y a 2h • Seuil critique atteint</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-900">Catalogue mis à jour</p>
                <p className="text-[9px] text-zinc-500">Hier • 2 nouveaux articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
