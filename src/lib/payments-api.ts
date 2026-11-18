import { getKernelBase, getKernelBaseHeaders, getKernelToken } from './kernel-auth';

/**
 * Interface pour représenter un Portefeuille (Wallet) du Kernel
 */
export interface Wallet {
  id: string;
  ownerId: string;
  balance: number;
  currency: string;
  status: string;
}

/**
 * Retourne les headers complets avec Bearer token (soit celui du client, soit celui du système)
 */
async function getAuthHeaders(customToken?: string): Promise<Record<string, string>> {
  const token = customToken || (await getKernelToken());
  return {
    ...getKernelBaseHeaders(),
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Récupère le portefeuille personnel de l'utilisateur connecté via /api/payments/wallets/mine
 */
export async function getPersonalWallet(customToken?: string): Promise<Wallet | null> {
  try {
    const headers = await getAuthHeaders(customToken);
    const res = await fetch(`${getKernelBase()}/api/payments/wallets/mine`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Erreur récupération wallet personnel (${res.status})`);
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('[Payments API] getPersonalWallet error:', error);
    return null;
  }
}

/**
 * Récupère le portefeuille associé à un propriétaire (ownerId)
 */
export async function getWalletByOwner(ownerId: string, customToken?: string): Promise<Wallet | null> {
  try {
    const headers = await getAuthHeaders(customToken);
    const res = await fetch(`${getKernelBase()}/api/payments/wallets/owner/${ownerId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Erreur récupération wallet (${res.status})`);
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error(`[Payments API] getWalletByOwner error for ${ownerId}:`, error);
    return null;
  }
}

/**
 * Crée un portefeuille pour un utilisateur
 */
export async function createWallet(ownerId: string, currency: string = 'XAF', customToken?: string): Promise<Wallet> {
  const headers = await getAuthHeaders(customToken);
  const res = await fetch(`${getKernelBase()}/api/payments/wallets`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ownerId, currency }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Impossible de créer le portefeuille (${res.status})`);
  }

  return data.data || data;
}

/**
 * Vérifie si le solde du portefeuille permet de payer un certain montant
 */
export async function canOperate(walletId: string, amount: number, customToken?: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders(customToken);
    const res = await fetch(`${getKernelBase()}/api/payments/wallets/${walletId}/can-operate?amount=${amount}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.data === true || data.success === true;
  } catch {
    return false;
  }
}

/**
 * Effectue un virement direct de portefeuille à portefeuille pour payer un achat
 */
export async function payWithWallet(
  senderWalletId: string,
  recipientWalletId: string,
  amount: number,
  description: string = 'Achat KSM eShop',
  metadata: Record<string, any> = {},
  customToken?: string
): Promise<any> {
  const headers = await getAuthHeaders(customToken);
  const res = await fetch(`${getKernelBase()}/api/payments/wallets/${senderWalletId}/pay`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientWalletId,
      amount,
      description,
      metadata,
    }),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Échec du virement de portefeuille (${res.status})`);
  }

  return data;
}

/**
 * Initie un ordre de recharge pour le portefeuille du client
 */
export async function rechargeWallet(
  walletId: string,
  amount: number,
  params: {
    provider?: string;
    method?: string;
    payerReference?: string;
    currency?: string;
    clientId?: string;
  } = {},
  callbackUrl?: string,
  customToken?: string
): Promise<{ redirectUrl?: string; orderId: string; rawResponse?: any }> {
  const payload = {
    amount,
    currency: params.currency || 'XAF',
    clientId: params.clientId || process.env.KERNEL_X_CLIENT_ID || 'prod-platform-backend',
    provider: params.provider || 'MYCOOLPAY',
    method: params.method || 'MOBILE_MONEY',
    payerReference: params.payerReference || '',
    idempotencyKey: `rec-${walletId}-${Date.now()}`,
    callbackUrl: callbackUrl,
    returnUrl: callbackUrl,
    successUrl: callbackUrl,
  };

  const headers = await getAuthHeaders(customToken);
  const res = await fetch(`${getKernelBase()}/api/payments/wallets/${walletId}/recharge`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Impossible d'initier la recharge (${res.status})`);
  }

  return {
    redirectUrl:
      data.stripeCheckoutUrl ||
      data.redirectUrl ||
      data.checkoutUrl ||
      data.paymentUrl ||
      data.data?.stripeCheckoutUrl ||
      data.data?.redirectUrl ||
      data.data?.checkoutUrl ||
      data.data?.paymentUrl ||
      data.data?.paymentLink,
    orderId: data.orderId || data.id || data.data?.orderId || data.data?.id,
    rawResponse: data,
  };
}

/**
 * Récupère l'historique des transactions d'un portefeuille (walletId)
 */
export async function getWalletTransactions(walletId: string, customToken?: string): Promise<any[]> {
  try {
    const headers = await getAuthHeaders(customToken);
    const res = await fetch(`${getKernelBase()}/api/payments/wallets/${walletId}/transactions`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur récupération transactions (${res.status})`);
    }

    const data = await res.json();
    const content = data.data?.content || data.data || data.content || data || [];
    return Array.isArray(content) ? content : [];
  } catch (error) {
    console.error(`[Payments API] getWalletTransactions error for ${walletId}:`, error);
    return [];
  }
}
