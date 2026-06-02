'use client';

import { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface AddToCartButtonProps {
 product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
 const addItem = useCartStore((state) => state.addItem);
 const [isAdded, setIsAdded] = useState(false);

 const handleAdd = () => {
 addItem(product);
 setIsAdded(true);
 setTimeout(() => setIsAdded(false), 2000);
 };

 return (
 <Button 
 className="w-full h-14 text-lg gap-2 transition-all" 
 disabled={product.stock === 0}
 onClick={handleAdd}
 variant={isAdded ? 'secondary' : 'primary'}
 >
 <ShoppingCart className="h-5 w-5" />
 {isAdded ? 'Ajouté !' : 'Ajouter au panier'}
 </Button>
 );
}
