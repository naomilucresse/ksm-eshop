import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getWalletByOwner, getPersonalWallet, createWallet, rechargeWallet } from '@/lib/payments-api';

/**
 * Récupère le token client et l'ID du client actuellement connecté via les cookies de session.
 */
function getCustomerAuth(cookieStore: any): { customerId: string | null; customerToken: string | null } {
  const customerToken = cookieStore.get('customerToken')?.value || null;
  if (!customerToken) return { customerId: null, customerToken: null };
  try {
    const parts = customerToken.split('.');
    if (parts.length !== 3) return { customerId: null, customerToken };
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedJson);

    // Préférer l'UUID unique (actor, userId, id, partyId, sub)
    const resolvedId = payload.actor || payload.userId || payload.id || payload.partyId || payload.sub || null;
    return { customerId: resolvedId, customerToken };
  } catch (e) {
    console.error('[getCustomerAuth] Erreur décodage JWT:', e);
    return { customerId: null, customerToken };
  }
}

/**
 * GET /api/payments/my-wallet
 * Récupère le portefeuille du client connecté
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const { customerId, customerToken } = getCustomerAuth(cookieStore);

  if (!customerId && !customerToken) {
    return Response.json({ success: false, message: 'Non connecté' }, { status: 401 });
  }

  try {
    let wallet = null;

    // 1. Tenter d'abord la route native /wallets/mine avec le token du client
    if (customerToken) {
      wallet = await getPersonalWallet(customerToken);
    }

    // 2. Si non trouvé ou pas de token client, chercher par ownerId
    if (!wallet && customerId) {
      wallet = await getWalletByOwner(customerId, customerToken || undefined);
    }

    // 3. Si aucun portefeuille n'existe encore, en créer un
    if (!wallet && customerId) {
      wallet = await createWallet(customerId, 'XAF', customerToken || undefined);
    }

    if (!wallet) {
      return Response.json({ success: false, message: 'Portefeuille introuvable' }, { status: 404 });
    }

    // 4. Vérifier s'il existe une simulation de crédit locale (cookie wallet_override)
    const overrideCookie = cookieStore.get('wallet_override')?.value;
    if (overrideCookie) {
      try {
        const override = JSON.parse(overrideCookie);
        if (override.walletId === wallet.id && typeof override.balance === 'number') {
          wallet = {
            ...wallet,
            balance: override.balance,
          };
        }
      } catch (e) {
        console.error('[my-wallet] Erreur lecture wallet_override:', e);
      }
    }

    return Response.json({ success: true, wallet });
  } catch (error: any) {
    console.error('[my-wallet GET error]:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/payments/my-wallet
 * Initie une recharge de portefeuille
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const { customerId, customerToken } = getCustomerAuth(cookieStore);

  if (!customerId && !customerToken) {
    return Response.json({ success: false, message: 'Non connecté' }, { status: 401 });
  }

  try {
    const { amount, provider, method, payerReference } = await request.json();
    if (!amount || amount <= 0) {
      return Response.json({ success: false, message: 'Montant invalide' }, { status: 400 });
    }

    let wallet = customerToken ? await getPersonalWallet(customerToken) : null;
    if (!wallet && customerId) {
      wallet = await getWalletByOwner(customerId, customerToken || undefined);
    }

    if (!wallet) {
      return Response.json(
        { success: false, message: 'Vous ne possédez pas encore de portefeuille actif sur le Kernel Core.' },
        { status: 400 }
      );
    }

    // Détection auto du site url pour le callback de retour
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const callbackUrl = `${protocol}://${host}/account/wallet?recharge=success`;

    const resolvedCurrency = wallet.currency === 'FCFA' || !wallet.currency ? 'XAF' : wallet.currency;
    const rechargeResult = await rechargeWallet(
      wallet.id,
      amount,
      {
        provider: provider || 'MYCOOLPAY',
        method: method || 'MOBILE_MONEY',
        payerReference: payerReference || '',
        currency: resolvedCurrency,
      },
      callbackUrl,
      customerToken || undefined
    );

    if (!rechargeResult.redirectUrl) {
      return Response.json(
        {
          success: false,
          message: "Le Kernel Core n'a retourné aucun lien de redirection pour le paiement.",
          debugKernelResponse: (rechargeResult as any).rawResponse || null,
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      redirectUrl: rechargeResult.redirectUrl,
      orderId: rechargeResult.orderId,
    });
  } catch (error: any) {
    console.error('[WALLET RECHARGE ERROR]', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
