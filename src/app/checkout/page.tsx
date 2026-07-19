'use client';

import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Wallet, ArrowLeft, Printer, Download, ShieldCheck } from 'lucide-react';
import { useOrderStore, Order } from '@/store/useOrderStore';

import { TENANTS } from '@/lib/mock-data';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useProductStore } from '@/store/useProductStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const user = useCustomerAuthStore((state) => state.user);

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    if (user) {
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '';
      setCustomerName(name);
    }
  }, [user]);

  const [wallet, setWallet] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'WALLET'>('WALLET');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch('/api/payments/my-wallet');
        const data = await res.json();
        if (data.success && data.wallet) {
          setWallet(data.wallet);
        }
      } catch (err) {
        console.error('Error loading wallet:', err);
      }
    }
    if (user) {
      loadWallet();
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    setWalletError(null);

    const displayName = customerName || 'Client Anonyme';
    const payload = {
      items,
      customerName: displayName,
      customerId: user?.partyId || user?.id || '00000000-0000-0000-0000-000000000000',
      paymentMethod: paymentMethod
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success && data.stripeCheckoutUrl) {
         if (data.stripeCheckoutUrl.startsWith('http')) {
           window.location.href = data.stripeCheckoutUrl;
         } else {
           router.push(data.stripeCheckoutUrl);
         }
      } else if (data.success && data.paid) {
         clearCart();
         router.push('/checkout/success?paid=true');
      } else {
         setWalletError(data.message || 'Erreur lors de la validation.');
         setIsProcessing(false);
      }
    } catch (err: any) {
      setWalletError(err.message || 'Une erreur réseau est survenue.');
      setIsProcessing(false);
    }
  };

  const handleRecharge = async () => {
    if (!wallet) return;
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    setIsRecharging(true);
    try {
      const res = await fetch('/api/payments/my-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, paymentMethod: 'STRIPE' })
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.message || 'Erreur lors de l\'initiation de la recharge.');
      }
    } catch {
      alert('Une erreur réseau est survenue.');
    } finally {
      setIsRecharging(false);
    }
  };

  if (!isMounted) return null;

  const inputClasses = "w-full rounded-lg border-2 border-zinc-300 bg-zinc-50 p-3 text-sm font-bold text-zinc-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-400";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2 font-bold border-2 border-zinc-900 uppercase text-xs">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase italic">Caisse & Règlement</h1>
        <div className="w-20" />
      </div>
      
      {walletError && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-sm font-bold">
          {walletError}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-2 border-zinc-200 shadow-lg">
            <CardHeader className="bg-zinc-50 border-b-2 border-zinc-100">
              <CardTitle className="text-xl uppercase italic tracking-tighter font-black text-zinc-900">Coordonnées de Livraison</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-8 bg-white">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Nom Complet</label>
                <input 
                  required 
                  className={inputClasses} 
                  placeholder="Ex: Jean-Luc Moussa" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Téléphone (+237)</label>
                <input required className={inputClasses} placeholder="Ex: 6xx xxx xxx" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Adresse Exacte</label>
                <textarea required className={`${inputClasses} h-24 resize-none`} placeholder="Quartier, Rue, Point de repère..." />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 overflow-hidden shadow-xl">
            <CardHeader className="bg-zinc-900 text-white p-6">
              <CardTitle className="text-xl flex items-center gap-3 uppercase italic tracking-tighter font-black text-white">
                <Wallet className="h-6 w-6 text-white" /> 
                Méthode de Règlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white space-y-6">
              {/* Option Portefeuille KSM */}
              <div 
                onClick={() => setPaymentMethod('WALLET')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  paymentMethod === 'WALLET' ? 'border-blue-600 bg-blue-50/20 shadow-md' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'WALLET'} 
                      onChange={() => setPaymentMethod('WALLET')}
                      className="h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500" 
                    />
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">Portefeuille ePay KSM</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-1 pl-6">
                    {wallet 
                      ? `Solde actuel : ${formatPrice(wallet.balance)}` 
                      : 'Chargement de votre solde...'
                    }
                  </p>
                </div>
                <div className="h-10 px-4 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0 self-start sm:self-center">
                  <span className="text-white font-black text-sm italic uppercase">ePay KSM</span>
                </div>
              </div>

              {/* Option Recharge Solde si Portefeuille sélectionné et solde insuffisant */}
              {paymentMethod === 'WALLET' && wallet && wallet.balance < totalPrice && (
                <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-amber-800">
                    ⚠️ Votre solde est insuffisant pour finaliser cet achat. Il vous manque <strong>{formatPrice(totalPrice - wallet.balance)}</strong>. Rechargez votre portefeuille instantanément :
                  </p>
                  <div className="flex gap-3">
                    <input 
                      type="number"
                      className="flex-1 rounded-lg border-2 border-amber-300 bg-white p-2 text-sm font-bold text-zinc-900 focus:border-amber-500 focus:outline-none"
                      placeholder="Montant à recharger (CFA)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                    <Button 
                      type="button"
                      onClick={handleRecharge}
                      disabled={isRecharging}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs px-4"
                    >
                      {isRecharging ? 'Redirection...' : 'Recharger'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Option Carte / Stripe direct */}
              <div 
                onClick={() => setPaymentMethod('STRIPE')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  paymentMethod === 'STRIPE' ? 'border-blue-600 bg-blue-50/20 shadow-md' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === 'STRIPE'} 
                      onChange={() => setPaymentMethod('STRIPE')}
                      className="h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500" 
                    />
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">Paiement Direct (Stripe)</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-1 pl-6">Règlement direct par carte bancaire.</p>
                </div>
                <div className="h-10 px-4 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 self-start sm:self-center">
                  <span className="text-white font-black text-sm italic uppercase">Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-24 border-4 border-zinc-900 shadow-2xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-zinc-900 text-white">
              <CardTitle className="text-xl uppercase italic tracking-tighter font-black text-white">Résumé Final</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                {items.length > 0 ? items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-bold">
                    <span className="text-zinc-500">{item.quantity}x <span className="text-zinc-900 uppercase italic tracking-tighter">{item.name}</span></span>
                    <span className="text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                )) : (
                  <p className="text-zinc-500 font-bold italic text-center">Votre panier est vide</p>
                )}
                <div className="border-t-2 border-zinc-100 pt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Net</span>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter italic">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="mt-10 w-full bg-blue-600 hover:bg-blue-700 h-20 text-xl font-black uppercase italic tracking-tighter shadow-xl shadow-blue-100 transition-all hover:scale-105" 
                size="lg" 
                disabled={isProcessing || items.length === 0}
              >
                {isProcessing ? 'Connexion au paiement...' : `Payer avec Yowyob`}
              </Button>
              <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] uppercase font-black tracking-widest">KSM Encryption Active</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
