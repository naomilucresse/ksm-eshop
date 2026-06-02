'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { TENANTS, PRODUCTS, CATEGORIES } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Package,
  X
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

import { useProductStore } from '@/store/useProductStore';

export default function AdminProductsPage() {
  const { tenantId } = useParams();
  const { products, deleteProduct, addProduct, updateProduct } = useProductStore();
  const tenant = TENANTS.find(t => t.slug === tenantId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProductData, setNewProductData] = useState({ name: '', price: '', stock: '10' });
  
  if (!tenant) return null;

  const tenantProducts = products.filter(p => p.tenantId === tenant.id);
  const filteredProducts = tenantProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${name}" ? Cette action est irréversible.`)) {
      deleteProduct(id);
    }
  };

  const handleEdit = (product: any) => {
    const newName = prompt("Nouveau nom :", product.name);
    if (!newName) return;
    const newPrice = prompt("Nouveau prix :", product.price.toString());
    if (!newPrice) return;
    const newStock = prompt("Nouveau stock :", product.stock.toString());
    if (!newStock) return;

    updateProduct({
      ...product,
      name: newName,
      price: parseInt(newPrice),
      stock: parseInt(newStock),
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name || !newProductData.price) return;

    const newProduct = {
      id: `p${Date.now()}`,
      name: newProductData.name,
      description: "Nouveau produit ajouté via l'admin",
      price: parseInt(newProductData.price),
      imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80',
      categoryId: 'c1',
      tenantId: tenant.id,
      stock: parseInt(newProductData.stock),
      isFeatured: true
    };
    
    addProduct(newProduct);
    setIsAdding(false);
    setNewProductData({ name: '', price: '', stock: '10' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase italic">Catalogue</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
            Inventaire & Stocks Synchro
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className={`h-10 font-black uppercase italic tracking-tighter gap-2 px-6 shadow-lg transition-all ${isAdding ? 'bg-zinc-100 text-zinc-900 border-2 border-zinc-900 shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Annuler' : 'Nouveau Produit'}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-blue-600 bg-blue-50/30 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddProduct} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Nom du Produit</label>
              <input 
                required
                className="w-full h-9 bg-white border-2 border-blue-200 rounded-lg px-3 text-xs font-bold focus:border-blue-600 outline-none"
                placeholder="Ex: Baguette Tradition"
                value={newProductData.name}
                onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Prix (CFA)</label>
              <input 
                required
                type="number"
                className="w-full h-9 bg-white border-2 border-blue-200 rounded-lg px-3 text-xs font-bold focus:border-blue-600 outline-none"
                placeholder="150"
                value={newProductData.price}
                onChange={(e) => setNewProductData({...newProductData, price: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Stock Initial</label>
              <input 
                required
                type="number"
                className="w-full h-9 bg-white border-2 border-blue-200 rounded-lg px-3 text-xs font-bold focus:border-blue-600 outline-none"
                value={newProductData.stock}
                onChange={(e) => setNewProductData({...newProductData, stock: e.target.value})}
              />
            </div>
            <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[10px] tracking-widest italic">
              Enregistrer l&apos;article
            </Button>
          </form>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Rechercher..."
            className="w-full h-10 bg-white border-2 border-zinc-200 rounded-xl pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="h-10 bg-white border-2 border-zinc-200 rounded-xl px-4 text-xs font-bold focus:outline-none uppercase tracking-widest">
          <option>Catégories</option>
          {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <Card className="border-2 border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b text-zinc-500 uppercase text-[9px] font-black tracking-widest">
                <th className="p-4">Produit</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4 text-right">Prix HT</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-center">Visibilité</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="bg-white hover:bg-zinc-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border overflow-hidden shrink-0">
                        <img src={product.imageUrl} className="h-full w-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-black text-xs text-zinc-900 uppercase italic tracking-tight">{product.name}</p>
                        <p className="text-[9px] text-zinc-400 font-bold tracking-widest">ID: {product.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded text-zinc-500">
                      {CATEGORIES.find(c => c.id === product.categoryId)?.name}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-xs text-zinc-900 italic">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-black ${product.stock <= 5 ? 'text-red-600' : 'text-zinc-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {product.stock > 0 ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded">En Ligne</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded">Masqué</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center bg-white">
            <Package className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
            <p className="text-xl font-black text-zinc-300 uppercase italic tracking-tighter">Aucun produit trouvé</p>
          </div>
        )}
      </Card>
    </div>
  );
}
