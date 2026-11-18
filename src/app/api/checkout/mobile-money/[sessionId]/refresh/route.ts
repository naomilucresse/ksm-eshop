import { NextRequest } from 'next/server';
import { relireIssue, estRegle } from '@/lib/checkout-session';

/**
 * Constate l'issue d'un règlement mobile money.
 *
 * Appelée par la page de retour. Elle existe parce que revenir de chez le prestataire ne prouve
 * RIEN : le client revient aussi s'il a renoncé, et l'URL de retour peut être ouverte à la main.
 * Seul le noyau, qui relit le statut serveur-à-serveur, dit si l'argent est arrivé.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  if (!/^[0-9a-fA-F-]{36}$/.test(sessionId)) {
    return Response.json({ success: false, message: "Identifiant d'achat invalide." }, { status: 400 });
  }
  try {
    const issue = await relireIssue(sessionId);
    return Response.json({ success: true, paid: estRegle(issue.status), data: issue });
  } catch (error: any) {
    return Response.json(
      { success: false, message: error?.message || "La vérification du paiement n'a pas abouti." },
      { status: 502 },
    );
  }
}
