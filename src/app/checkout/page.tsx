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

import { useLocale, useTranslations } from 'next-intl';

function translateVariantInName(name: string, locale: string): string {
  if (locale !== 'en') return name;
  const match = name.match(/\(([^)]+)\)$/);
  if (!match) return name;
  const rawVal = match[1];
  const lowerVal = rawVal.toLowerCase().trim();
  let translated = rawVal;
  if (lowerVal === 'noir' || lowerVal === 'noir sidéral') translated = 'Space Gray';
  else if (lowerVal === 'blanc') translated = 'White';
  else if (lowerVal === 'rouge') translated = 'Red';
  else if (lowerVal === 'argent') translated = 'Silver';
  else if (lowerVal === 'or') translated = 'Gold';
  else if (lowerVal === 'bleu') translated = 'Blue';
  else if (lowerVal === 'vert') translated = 'Green';
  else if (lowerVal === 'gris') translated = 'Gray';
  else if (lowerVal === 'petit') translated = 'Small';
  else if (lowerVal === 'moyen') translated = 'Medium';
  else if (lowerVal === 'grand') translated = 'Large';
  return name.slice(0, match.index) + `(${translated.toUpperCase()})`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCheckedItems } = useCartStore();
  const { addOrder } = useOrderStore();
  const locale = useLocale();
  const t = useTranslations('Checkout');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const user = useCustomerAuthStore((state) => state.user);

  const activeItems = items.filter(item => item.selectedForPurchase !== false);
  const totalPrice = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    if (user) {
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '';
      setCustomerName(name);
    }
  }, [user]);

  const [wallet, setWallet] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'WALLET' | 'MOBILE_MONEY'>('WALLET');
  /** Facultatif : pré-remplit le numéro chez le prestataire, qui le redemande de toute façon. */
  const [payerPhone, setPayerPhone] = useState('');
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
    if (activeItems.length === 0) return;

    setIsProcessing(true);
    setWalletError(null);

    const displayName = customerName || 'Client Anonyme';
    const payload = {
      items: activeItems,
      customerName: displayName,
      customerId: user?.partyId || user?.id || '00000000-0000-0000-0000-000000000000',
      paymentMethod: paymentMethod,
      payerPhone: paymentMethod === 'MOBILE_MONEY' ? payerPhone.trim() : undefined
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success && data.paymentUrl) {
         // L'identifiant de l'achat est confié au navigateur AVANT de partir : l'adresse de retour
         // est fixée à la création de l'achat, donc elle ne peut pas le contenir, et la page de
         // retour n'a aucun autre moyen de savoir quel paiement constater.
         try {
           sessionStorage.setItem('ksm_mobile_money_checkout', JSON.stringify({
             sessionId: data.checkoutSessionId,
             orderIds: data.data?.map((o: any) => o.orderNumber).join(',') || ''
           }));
         } catch {
           // Navigation privée ou stockage refusé : la page de retour le dira au lieu d'annoncer
           // un succès qu'elle n'a pas vérifié.
         }
         // On quitte le site pour la page du prestataire. Le panier reste intact : tant que le
         // paiement n'est pas constaté, le client doit pouvoir revenir et réessayer.
         window.location.href = data.paymentUrl;
      } else if (data.success && data.stripeCheckoutUrl) {
         if (data.stripeCheckoutUrl.startsWith('http')) {
           window.location.href = data.stripeCheckoutUrl;
         } else {
           router.push(data.stripeCheckoutUrl);
         }
      } else if (data.success && data.paid) {
         clearCheckedItems();
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

  const [rechargeMethod, setRechargeMethod] = useState('ORANGE_MONEY');
  const [rechargePhone, setRechargePhone] = useState('');

  const handleRecharge = async () => {
    if (!wallet) return;
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    // Déterminer les paramètres réels à envoyer au BFF
    let provider = 'MYCOOLPAY';
    let method = 'MOBILE_MONEY';

    if (rechargeMethod === 'STRIPE') {
      provider = 'STRIPE';
      method = 'CARD';
    }

    // Formater le numéro de téléphone si Cameroun
    let formattedPhone = rechargePhone;
    if (rechargeMethod !== 'STRIPE' && rechargePhone.length === 9 && rechargePhone.startsWith('6')) {
      formattedPhone = '237' + rechargePhone;
    }

    setIsRecharging(true);
    try {
      const res = await fetch('/api/payments/my-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amt, 
          provider, 
          method, 
          payerReference: rechargeMethod !== 'STRIPE' ? formattedPhone : '' 
        })
      });
      const data = await res.json().catch(() => ({ success: false, message: 'Réponse JSON invalide du serveur' }));
      if (data.success) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert(`Demande de recharge initiée avec succès ! (Ref: ${data.orderId || 'N/A'}). Veuillez valider le paiement sur votre téléphone (saisie du code PIN).`);
          setRechargeAmount('');
          setRechargePhone('');
        }
      } else {
        alert(data.message || `Erreur lors de l'initiation de la recharge (Code: ${res.status}).`);
      }
    } catch (err: any) {
      alert(`Une erreur réseau est survenue : ${err.message || err}`);
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
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </Button>
        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase italic">{t('title')}</h1>
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
              <CardTitle className="text-xl uppercase italic tracking-tighter font-black text-zinc-900">{t('deliveryDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-8 bg-white">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('fullName')}</label>
                <input 
                  required 
                  className={inputClasses} 
                  placeholder="Ex: Jean-Luc Moussa" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('phone')}</label>
                <input required className={inputClasses} placeholder={t('phonePlaceholder')} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('address')}</label>
                <textarea required className={`${inputClasses} h-24 resize-none`} placeholder={t('addressPlaceholder')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 overflow-hidden shadow-xl">
            <CardHeader className="bg-zinc-900 text-white p-6">
              <CardTitle className="text-xl flex items-center gap-3 uppercase italic tracking-tighter font-black text-white">
                <Wallet className="h-6 w-6 text-white" /> 
                {t('paymentMethod')}
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
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">{t('walletOption')}</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-1 pl-6">
                    {wallet 
                      ? t('walletBalance', {balance: formatPrice(wallet.balance)}) 
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
                    {t('insufficientBalance', {missing: formatPrice(totalPrice - wallet.balance)})}
                  </p>
                  
                  {/* Moyen de Recharge */}
                  <div className="grid grid-cols-3 gap-2">
                    {['ORANGE_MONEY', 'MTN_MONEY', 'STRIPE'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRechargeMethod(m)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border-2 uppercase transition-all ${
                          rechargeMethod === m 
                            ? 'border-amber-600 bg-amber-600 text-white' 
                            : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {m === 'ORANGE_MONEY' ? 'Orange' : m === 'MTN_MONEY' ? 'MTN' : 'Stripe / Carte'}
                      </button>
                    ))}
                  </div>

                  {rechargeMethod !== 'STRIPE' && (
                    <input 
                      type="tel"
                      className="w-full rounded-lg border-2 border-amber-300 bg-white p-3 text-sm font-bold text-zinc-900 focus:border-amber-500 focus:outline-none"
                      placeholder={t('rechargePhone')}
                      value={rechargePhone}
                      onChange={(e) => setRechargePhone(e.target.value)}
                    />
                  )}

                  <div className="flex gap-3">
                    <input 
                      type="number"
                      className="flex-1 rounded-lg border-2 border-amber-300 bg-white p-2 text-sm font-bold text-zinc-900 focus:border-amber-500 focus:outline-none"
                      placeholder={t('rechargeAmount')}
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                    <Button 
                      type="button"
                      onClick={handleRecharge}
                      disabled={isRecharging}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs px-6 py-3 rounded-lg"
                    >
                      {isRecharging ? t('recharging') : t('rechargeBtn')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Option Mobile Money — le seul chemin pour un client SANS compte Yowyob :
                  l'argent part de son téléphone et arrive au portefeuille du vendeur. */}
              <div
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  paymentMethod === 'MOBILE_MONEY' ? 'border-blue-600 bg-blue-50/20 shadow-md' : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'MOBILE_MONEY'}
                      onChange={() => setPaymentMethod('MOBILE_MONEY')}
                      className="h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                    />
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">Mobile Money</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-1 pl-6">
                    Payez depuis votre téléphone. Aucun compte ni solde n&apos;est nécessaire.
                  </p>
                  {paymentMethod === 'MOBILE_MONEY' && (
                    <div className="mt-4 pl-6 space-y-2">
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="699000000 (facultatif)"
                        aria-label="Numéro de téléphone pour le paiement (facultatif)"
                        className="w-full rounded-lg border-2 border-zinc-300 bg-white p-3 text-sm font-bold text-zinc-900 focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-[11px] font-bold text-zinc-500">
                        Vous serez redirigé vers la page de paiement, où vous validerez depuis votre
                        téléphone. Votre panier reste intact tant que le paiement n&apos;est pas confirmé.
                      </p>
                    </div>
                  )}
                </div>
                <div className="h-10 px-4 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-200 flex-shrink-0 self-start sm:self-center">
                  <span className="text-white font-black text-sm italic uppercase">MTN · Orange</span>
                </div>
              </div>

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
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">{t('stripeOption')}</p>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 mt-1 pl-6">{t('stripeDesc')}</p>
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
              <CardTitle className="text-xl uppercase italic tracking-tighter font-black text-white">{t('finalSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                {activeItems.length > 0 ? activeItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-bold">
                    <span className="text-zinc-500">{item.quantity}x <span className="text-zinc-900 uppercase italic tracking-tighter">{translateVariantInName(item.name, locale)}</span></span>
                    <span className="text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                )) : (
                  <p className="text-zinc-500 font-bold italic text-center">{t('noActiveItems')}</p>
                )}
                <div className="border-t-2 border-zinc-100 pt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{t('totalNet')}</span>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter italic">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="mt-10 w-full bg-blue-600 hover:bg-blue-700 h-20 text-xl font-black uppercase italic tracking-tighter shadow-xl shadow-blue-100 transition-all hover:scale-105" 
                size="lg" 
                disabled={isProcessing || activeItems.length === 0}
              >
                {isProcessing ? t('submitting') : t('payButton')}
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
