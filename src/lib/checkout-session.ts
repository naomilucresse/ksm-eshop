import { getKernelBase, getKernelBaseHeaders } from './kernel-auth';

/**
 * Caisse commune du noyau, pour encaisser un client SANS compte Yowyob.
 *
 * La boutique déclare l'achat côté serveur — vendeur, articles, prix — puis ouvre le règlement
 * mobile money. Le client est redirigé chez le prestataire et paie depuis son téléphone.
 *
 * Deux garanties qui viennent du noyau et qu'il ne faut pas contourner ici :
 *
 *  - **Le prix ne vient jamais du navigateur.** Le noyau recalcule le montant à partir des lignes
 *    qu'on lui envoie depuis le serveur ; c'est SON total que le client voit chez le prestataire.
 *  - **Le statut du prestataire n'est jamais cru sur parole.** Revenir sur la page de retour ne
 *    prouve rien : il faut relire l'issue (`relireIssue`) avant d'annoncer un paiement.
 *
 * L'authentification est celle de l'application cliente (`X-Client-Id` / `X-Api-Key`), pas celle
 * d'un utilisateur : aucun compte personnel n'intervient dans ce chemin.
 */

export type LigneAchat = {
  label: string;
  description?: string | null;
  quantity: number;
  unitAmount: number;
};

export type AchatOuvert = {
  sessionId: string;
  paymentUrl: string;
  qrCode?: string | null;
  status: string;
  amount: number;
  currency: string;
};

export type IssueAchat = {
  sessionId: string;
  status: string;
  amount: number;
  currency: string;
};

/** Les états rendus par le noyau pour un règlement par prestataire. */
export const REGLE = "SETTLED";

/** Un achat réglé : le seul état qui autorise à annoncer un paiement au client. */
export function estRegle(status: string | null | undefined): boolean {
  return status === REGLE || status === "PAID";
}

/**
 * Transforme une ligne de panier en ligne d'achat.
 *
 * `quantity` est un entier côté noyau. Une quantité fractionnaire (une vente au poids, par
 * exemple) est donc portée en UNE ligne au montant total, la quantité réelle passant dans le
 * libellé : tronquer 2,5 à 2 ferait payer deux unités pour deux et demie.
 */
export function ligneDepuisPanier(item: {
  name?: string | null;
  quantity?: number | null;
  price?: number | null;
}): LigneAchat {
  const nom = (item.name ?? "Article").toString().trim().slice(0, 160) || "Article";
  const quantite = Number(item.quantity ?? 0);
  const prix = Number(item.price ?? 0);
  if (!Number.isInteger(quantite) && quantite > 0) {
    return {
      label: `${nom} (× ${quantite})`,
      description: null,
      quantity: 1,
      unitAmount: Number((prix * quantite).toFixed(2)),
    };
  }
  return { label: nom, description: null, quantity: Math.max(1, quantite), unitAmount: prix };
}

async function appeler(chemin: string, init: RequestInit) {
  const res = await fetch(`${getKernelBase()}${chemin}`, {
    ...init,
    headers: { ...getKernelBaseHeaders(), ...(init.headers ?? {}) },
    cache: "no-store",
  });
  const texte = await res.text();
  const corps = texte.trim() ? JSON.parse(texte) : null;
  if (!res.ok) {
    const message = corps?.message || corps?.error || `Noyau: ${res.status}`;
    throw new Error(message);
  }
  return corps?.data ?? corps;
}

/**
 * Déclare l'achat, puis ouvre le règlement mobile money.
 *
 * Les deux appels vont ensemble : un achat sans règlement ouvert n'est qu'une intention. En cas
 * d'échec du second, l'identifiant du premier est renvoyé dans l'erreur, car la `reference` rend
 * la création idempotente — un nouvel essai rouvrira le MÊME achat au lieu d'en créer un second.
 */
export async function ouvrirMobileMoney(entree: {
  merchantOrganizationId: string;
  items: LigneAchat[];
  reference?: string | null;
  returnUrl?: string | null;
  phone?: string | null;
}): Promise<AchatOuvert> {
  const cree = await appeler("/api/payments/checkout-sessions", {
    method: "POST",
    body: JSON.stringify({
      merchantOrganizationId: entree.merchantOrganizationId,
      merchantAgencyId: null,
      items: entree.items,
      currency: "XAF",
      reference: entree.reference ?? null,
      returnUrl: entree.returnUrl ?? null,
      webhookUrl: null,
    }),
  });

  const sessionId = cree?.session?.id ?? cree?.id ?? null;
  if (!sessionId) {
    throw new Error("Le noyau n'a pas rendu d'identifiant d'achat.");
  }

  const ouvert = await appeler(
    `/api/payments/guest-checkout/${encodeURIComponent(sessionId)}/mobile-money`,
    { method: "POST", body: JSON.stringify({ phone: entree.phone ?? null, email: null }) },
  );

  const paymentUrl = ouvert?.paymentUrl ?? ouvert?.payment_url ?? null;
  if (!paymentUrl) {
    throw new Error("Le prestataire n'a pas rendu d'adresse de paiement.");
  }

  return {
    sessionId: String(sessionId),
    paymentUrl: String(paymentUrl),
    qrCode: ouvert?.qrCode ?? ouvert?.qr_code ?? null,
    status: String(ouvert?.status ?? "PENDING_PAYMENT"),
    amount: Number(ouvert?.amount ?? 0),
    currency: String(ouvert?.currency ?? "XAF"),
  };
}

/**
 * Relit l'issue chez le prestataire.
 *
 * Le noyau impose un intervalle minimal entre deux relectures réelles (3 s par défaut) : en deçà,
 * il rend l'état déjà connu sans rappeler le prestataire.
 */
export async function relireIssue(sessionId: string): Promise<IssueAchat> {
  const issue = await appeler(
    `/api/payments/guest-checkout/${encodeURIComponent(sessionId)}/refresh`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return {
    sessionId: String(issue?.sessionId ?? issue?.session_id ?? sessionId),
    status: String(issue?.status ?? "PENDING_PAYMENT"),
    amount: Number(issue?.amount ?? 0),
    currency: String(issue?.currency ?? "XAF"),
  };
}
