import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getPersonalWallet, getWalletByOwner, getWalletTransactions } from '@/lib/payments-api';

function getCustomerAuth(cookieStore: any): { customerId: string | null; customerToken: string | null } {
  const customerToken = cookieStore.get('customerToken')?.value || null;
  if (!customerToken) return { customerId: null, customerToken: null };
  try {
    const parts = customerToken.split('.');
    if (parts.length !== 3) return { customerId: null, customerToken };
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedJson);

    const resolvedId = payload.actor || payload.userId || payload.id || payload.partyId || payload.sub || null;
    return { customerId: resolvedId, customerToken };
  } catch (e) {
    console.error('[getCustomerAuth] Erreur décodage JWT:', e);
    return { customerId: null, customerToken };
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const { customerId, customerToken } = getCustomerAuth(cookieStore);

  if (!customerId && !customerToken) {
    return Response.json({ success: false, message: 'Non connecté' }, { status: 401 });
  }

  try {
    let wallet = customerToken ? await getPersonalWallet(customerToken) : null;
    if (!wallet && customerId) {
      wallet = await getWalletByOwner(customerId, customerToken || undefined);
    }

    if (!wallet) {
      return Response.json({ success: true, transactions: [] });
    }

    const transactions = await getWalletTransactions(wallet.id, customerToken || undefined);
    return Response.json({ success: true, transactions });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
