import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getKernelBaseHeaders, getKernelBase } from '@/lib/kernel-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, mfaToken, otp } = body;

    // Toujours utiliser le tenant global pour l'auth
    const orgId = process.env.KERNEL_X_TENANT_ID || '11111111-1111-1111-1111-111111111111';

    let authRes: Response | null = null;
    let authData: any = {};

    // Étape 2 : Confirmation du code MFA reçu par e-mail
    if (mfaToken && (otp || code)) {
      const confirmationCode = String(otp || code).trim();

      // Appel de l'endpoint officiel Kernel : POST /api/auth/login/mfa/confirm
      authRes = await fetch(`${getKernelBase()}/api/auth/login/mfa/confirm`, {
        method: 'POST',
        headers: {
          ...getKernelBaseHeaders(),
          'X-Tenant-Id': orgId,
        },
        body: JSON.stringify({ mfaToken, code: confirmationCode }),
        cache: 'no-store',
      });

      authData = await authRes.json().catch(() => ({}));

      // Fallback vers /api/auth/verify-mfa si l'endpoint principal renvoie 404
      if (!authRes.ok && authRes.status === 404) {
        const fallbackRes = await fetch(`${getKernelBase()}/api/auth/verify-mfa`, {
          method: 'POST',
          headers: {
            ...getKernelBaseHeaders(),
            'Authorization': `Bearer ${mfaToken}`,
          },
          body: JSON.stringify({ principal: email, code: confirmationCode, sessionId: mfaToken }),
          cache: 'no-store',
        });
        if (fallbackRes.ok) {
          authRes = fallbackRes;
          authData = await fallbackRes.json().catch(() => ({}));
        }
      }

      if (!authRes.ok) {
        console.error('[CustomerLogin MFA] Validation échouée:', authRes.status, authData);
        return NextResponse.json({
          success: false,
          message: authData?.message || 'Code de sécurité invalide ou expiré. Veuillez vérifier le code reçu par e-mail.',
          errorCode: authData?.errorCode || 'INVALID_MFA_CODE',
        }, { status: 400 });
      }
    } else {
      // Étape 1 : Connexion initiale avec résolution multi-candidats
      const rawInput = (email || '').trim();
      const candidates: string[] = [];

      // 1. Recherche dans .data/users.json (utilisateurs inscrits sur le E-shop)
      try {
        const { getLocalUsers } = require('@/lib/local-db');
        const localUsers = getLocalUsers();
        const matched = localUsers.find((u: any) =>
          (u.email && u.email.toLowerCase() === rawInput.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === rawInput.toLowerCase()) ||
          (u.name && u.name.toLowerCase() === rawInput.toLowerCase())
        );
        if (matched?.username) candidates.push(matched.username);
        if (matched?.name && !matched.name.includes(' ')) candidates.push(matched.name);
      } catch (e) {}

      // 2. Recherche dans all_users.json (utilisateurs synchronisés du Kernel)
      try {
        const fs = require('fs');
        const path = require('path');
        const allUsersPath = path.join(process.cwd(), 'all_users.json');
        if (fs.existsSync(allUsersPath)) {
          const allUsers = JSON.parse(fs.readFileSync(allUsersPath, 'utf8') || '[]');
          const foundKernelUser = allUsers.find((u: any) =>
            (u.email && u.email.toLowerCase() === rawInput.toLowerCase()) ||
            (u.phoneNumber && u.phoneNumber.toLowerCase() === rawInput.toLowerCase()) ||
            (u.username && u.username.toLowerCase() === rawInput.toLowerCase())
          );
          if (foundKernelUser?.username) candidates.push(foundKernelUser.username);
        }
      } catch (e) {}

      // 3. Recherche dans clients.json
      try {
        const { getLocalClients } = require('@/lib/local-db');
        const clients = getLocalClients();
        const matchedClient = clients.find((c: any) =>
          c.code?.toLowerCase() === rawInput.toLowerCase() ||
          c.name?.toLowerCase() === rawInput.toLowerCase() ||
          c.accountingAccount?.toLowerCase() === rawInput.toLowerCase() ||
          c.uniqueIdentificationNumber?.toLowerCase() === rawInput.toLowerCase()
        );
        if (matchedClient?.name && !matchedClient.name.includes(' ')) {
          candidates.push(matchedClient.name);
        }
      } catch (e) {}

      // 4. Formats directs
      if (rawInput) {
        candidates.push(rawInput);
        if (rawInput.toLowerCase().endsWith('@yowyob.com')) {
          candidates.push(rawInput.replace(/@yowyob\.com$/i, ''));
        }
        if (rawInput.includes('@')) {
          candidates.push(rawInput.split('@')[0]);
        }
      }

      // Dédupliquer les candidats en gardant l'ordre
      const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

      const executeLogin = async (p: string) => {
        return fetch(`${getKernelBase()}/api/auth/login`, {
          method: 'POST',
          headers: {
            ...getKernelBaseHeaders(),
            'X-Tenant-Id': orgId,
          },
          body: JSON.stringify({ principal: p, password: code }),
          cache: 'no-store',
        });
      };

      // Essayer les candidats
      for (const candidate of uniqueCandidates) {
        const res = await executeLogin(candidate);
        const json = await res.json().catch(() => ({}));

        // Si le Kernel indique que la requête est acceptée ou demande un code MFA
        const isMfa =
          json?.data?.nextStep === 'CONFIRM_MFA' ||
          json?.nextStep === 'CONFIRM_MFA' ||
          !!json?.data?.mfaToken ||
          !!json?.mfaToken ||
          json?.errorCode === 'MFA_REQUIRED' ||
          json?.errorCode === 'AUTH_MFA_REQUIRED';

        if (res.ok || isMfa) {
          authRes = res;
          authData = json;
          break;
        }

        // Garder la dernière réponse d'erreur en mémoire
        authRes = res;
        authData = json;
      }
    }

    if (!authRes) {
      return NextResponse.json({ success: false, message: 'Identifiant ou mot de passe requis.' }, { status: 400 });
    }

    const data = authData?.data || authData;

    // Détection d'un challenge MFA / OTP (code envoyé par e-mail)
    const isMfaRequired =
      data?.nextStep === 'CONFIRM_MFA' ||
      authData?.nextStep === 'CONFIRM_MFA' ||
      !!data?.mfaToken ||
      !!authData?.mfaToken ||
      !!data?.challengeToken ||
      authData?.errorCode === 'MFA_REQUIRED' ||
      authData?.errorCode === 'AUTH_MFA_REQUIRED' ||
      (authData?.message && (authData.message.includes('MFA') || authData.message.includes('OTP')));

    if (isMfaRequired) {
      const challengeToken = data?.mfaToken || authData?.mfaToken || data?.challengeToken || data?.sessionId || authData?.sessionId;
      return NextResponse.json({
        success: true,
        requiresMfa: true,
        nextStep: 'CONFIRM_MFA',
        mfaToken: challengeToken,
        message: authData?.message || 'Un code de sécurité (OTP) vous a été envoyé par e-mail. Veuillez le saisir ci-dessous.',
      });
    }

    if (!authRes.ok || authData?.success === false) {
      console.log('[CustomerLogin] Échec connexion pour:', email, 'status:', authRes.status, authData);

      let errorMsg = 'Identifiant ou mot de passe incorrect.';
      const errorCode = authData?.errorCode || String(authRes.status);

      if (authData?.message) errorMsg = authData.message;
      if (errorCode === 'AUTH_INVALID_CREDENTIALS') {
        errorMsg = "Mot de passe incorrect ou identifiant invalide. Assurez-vous de saisir votre mot de passe (le code de sécurité OTP ne sera demandé qu'à l'étape suivante).";
      }
      if (errorCode === 'AUTH_YOWYOB_IDENTITY_REMINDER_SENT') {
        errorMsg = "Le Kernel exige l'utilisation de votre identifiant Yowyob. Veuillez saisir votre nom d'utilisateur (ex: maso21) plutôt que l'adresse e-mail.";
      }
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        errorMsg = "Votre adresse e-mail n'a pas encore été validée. Consultez votre boîte de réception pour cliquer sur le lien de confirmation.";
      }
      if (errorCode === 'AUTH_THROTTLED_PRINCIPAL') {
        errorMsg = "Trop de tentatives infructueuses. Le compte est temporairement protégé par sécurité. Veuillez patienter 5 minutes avant de réessayer.";
      }

      return NextResponse.json({ success: false, message: errorMsg, errorCode }, { status: 401 });
    }

    // Récupérer le token une fois connecté
    const accessToken =
      data?.accessToken ||
      data?.sessionToken ||
      authData?.accessToken ||
      authData?.token;

    if (!accessToken) {
      console.error('[CustomerLogin] Aucun token dans la réponse:', JSON.stringify(authData).slice(0, 300));
      return NextResponse.json({ success: false, message: 'Erreur inattendue : token manquant.' }, { status: 500 });
    }

    const expiresIn = data?.expiresInSeconds || data?.expiresIn || 23 * 3600;
    const userData = data?.user || data;

    // Profil client normalisé
    const customer = {
      partyId: userData?.id || userData?.partyId || userData?.actorId,
      name:
        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() ||
        userData?.name ||
        userData?.displayName ||
        userData?.username ||
        email ||
        'Client',
      email: userData?.email || email,
      username: userData?.username,
      roles: userData?.roles || userData?.authorities || [],
    };

    // Stocker le token dans un cookie httpOnly sécurisé
    const cookieStore = await cookies();
    cookieStore.set('customerToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.max(Number(expiresIn), 23 * 3600),
    });

    // Sauvegarder localement pour la synchronisation
    try {
      const { saveLocalUser } = require('@/lib/local-db');
      saveLocalUser({
        name: customer.name,
        email: customer.email,
        username: customer.username
      });
    } catch (e) {
      console.error('[CustomerLogin] Erreur sauvegarde locale user:', e);
    }

    return NextResponse.json({
      success: true,
      data: { ...customer, token: accessToken },
    });
  } catch (error: any) {
    console.error('[CustomerLogin] Erreur inattendue:', error);
    return NextResponse.json({ success: false, message: error.message || 'Erreur serveur.' }, { status: 500 });
  }
}

