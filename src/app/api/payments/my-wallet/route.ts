import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getWalletByOwner, createWallet, rechargeWallet } from '@/lib/payments-api';

/**
 * Récupère l'ID du client actuellement connecté via les cookies de session.
 */
function getCustomerId(cookieStore: any): string | null {
  const customerSession = cookieStore.get('customerSession')?.value;
  if (!customerSession) return null;
  try {
    const data = JSON.parse(customerSession);
    return data.id || data.partyId || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/payments/my-wallet
 * Récupère le portefeuille du client connecté
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const customerId = getCustomerId(cookieStore);

  if (!customerId) {
    return Response.json({ success: false, message: 'Non connecté' }, { status: 401 });
  }

  try {
    let wallet = await getWalletByOwner(customerId);
    if (!wallet) {
      wallet = await createWallet(customerId);
    }

    // Appliquer la surcharge de solde si présente (pour démo/développement local)
    const override = cookieStore.get('wallet_override')?.value;
    if (override && wallet) {
      try {
        const parsed = JSON.parse(override);
        if (parsed.walletId === wallet.id) {
          wallet.balance = parsed.balance;
        }
      } catch {}
    }

    return Response.json({ success: true, wallet });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/payments/my-wallet
 * Initie une recharge de portefeuille
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const customerId = getCustomerId(cookieStore);

  if (!customerId) {
    return Response.json({ success: false, message: 'Non connecté' }, { status: 401 });
  }

  try {
    const { amount, paymentMethod } = await request.json();
    if (!amount || amount <= 0) {
      return Response.json({ success: false, message: 'Montant invalide' }, { status: 400 });
    }

    let wallet = await getWalletByOwner(customerId);
    if (!wallet) {
      wallet = await createWallet(customerId);
    }

    // Détection auto du site url pour le callback
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const callbackUrl = `${protocol}://${host}/checkout?recharge=success`;

    let redirectUrl = `/mock-stripe-checkout?rechargeWalletId=${wallet.id}&amount=${amount}`;
    let orderId = `recharge-${Date.now()}`;

    try {
      const rechargeResult = await rechargeWallet(
        wallet.id,
        amount,
        paymentMethod || 'STRIPE',
        callbackUrl
      );
      if (rechargeResult && rechargeResult.redirectUrl) {
        redirectUrl = rechargeResult.redirectUrl;
      }
      if (rechargeResult && rechargeResult.orderId) {
        orderId = rechargeResult.orderId;
      }
    } catch (e) {
      console.warn('[WALLET RECHARGE] API Yowyob non disponible, bascule sur la simulation locale.');
    }

    return Response.json({ success: true, redirectUrl, orderId });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
