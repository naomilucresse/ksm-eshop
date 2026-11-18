import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getKernelBaseHeaders, getKernelBase } from '@/lib/kernel-auth';

export async function POST(request: NextRequest) {
  try {
    const { principal, password } = await request.json();

    if (!principal || !password) {
      return Response.json(
        { success: false, message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // Résolution intelligente du principal (ex: kkl921@yowyob.com -> kkl921)
    let resolvedPrincipal = (principal || '').trim();
    try {
      const fs = require('fs');
      const path = require('path');
      const allUsersPath = path.join(process.cwd(), 'all_users.json');
      if (fs.existsSync(allUsersPath)) {
        const allUsers = JSON.parse(fs.readFileSync(allUsersPath, 'utf8') || '[]');
        const found = allUsers.find((u: any) =>
          (u.email && u.email.toLowerCase() === resolvedPrincipal.toLowerCase()) ||
          (u.phoneNumber && u.phoneNumber.toLowerCase() === resolvedPrincipal.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === resolvedPrincipal.toLowerCase())
        );
        if (found?.username) {
          resolvedPrincipal = found.username;
        }
      }
    } catch (e) {}

    if (resolvedPrincipal.toLowerCase().endsWith('@yowyob.com')) {
      resolvedPrincipal = resolvedPrincipal.replace(/@yowyob\.com$/i, '');
    }

    const executeLogin = async (p: string) => {
      return fetch(`${getKernelBase()}/api/auth/login`, {
        method: 'POST',
        headers: getKernelBaseHeaders(),
        body: JSON.stringify({ principal: p, password }),
        cache: 'no-store',
      });
    };

    let res = await executeLogin(resolvedPrincipal);
    let data = await res.json();

    if (!res.ok && principal.includes('@')) {
      const fallbackPrefix = principal.split('@')[0];
      if (fallbackPrefix && fallbackPrefix !== resolvedPrincipal) {
        const fallbackRes = await executeLogin(fallbackPrefix);
        if (fallbackRes.ok) {
          res = fallbackRes;
          data = await fallbackRes.json();
        }
      }
    }

    // Détecter si le Kernel indique qu'un code MFA / OTP est requis pour cette session.
    const isMfa =
      data?.data?.nextStep === 'CONFIRM_MFA' ||
      data?.nextStep === 'CONFIRM_MFA' ||
      !!data?.data?.mfaToken ||
      !!data?.mfaToken ||
      data?.data?.mfaRequired ||
      data?.mfaRequired ||
      data?.errorCode === 'MFA_REQUIRED' ||
      data?.message?.includes('MFA') ||
      data?.message?.includes('OTP') ||
      (data?.data && !data?.data?.accessToken && (data?.data?.sessionId || data?.data?.mfaToken));

    if (isMfa) {
      const challengeToken = data?.data?.mfaToken || data?.mfaToken || data?.data?.sessionId || data?.sessionId || null;
      return Response.json({
        success: true,
        requiresMfa: true,
        nextStep: 'CONFIRM_MFA',
        sessionId: challengeToken,
        mfaToken: challengeToken,
        message: data?.message || 'Un code de vérification (OTP) est requis pour ce compte.'
      });
    }

    if (!res.ok || !data.success) {
      return Response.json(
        { success: false, message: data.message || 'Identifiants invalides.' },
        { status: res.status === 200 ? 401 : res.status }
      );
    }

    const accessToken = data?.data?.accessToken || data?.data?.access_token;
    const sessionId   = data?.data?.sessionId   || data?.data?.sessionToken;
    const token       = accessToken || sessionId;

    if (!token) {
      return Response.json(
        { success: false, message: 'Erreur lors de la récupération du jeton.' },
        { status: 500 }
      );
    }

    // Token expire dans expiresInSeconds (900s = 15 min), on met 23h pour le cookie
    // car le refresh se fait via le sharedToken
    const tokenExpiry  = data?.data?.expiresInSeconds || data?.data?.expiresIn || 900;
    const cookieMaxAge = Math.max(tokenExpiry, 23 * 60 * 60); // min 23h pour le cookie

    const sharedToken    = data?.data?.sharedSession?.token;
    const sharedMaxAge   = data?.data?.sharedSession?.expiresInSeconds || 8 * 60 * 60;

    const cookieStore = await cookies();

    cookieStore.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    cookieStore.set('adminSessionId', sessionId || token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    if (sharedToken) {
      cookieStore.set('adminSharedToken', sharedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Number(sharedMaxAge),
      });
    }

    // Stocker le tokenExpiry pour permettre le refresh côté client si nécessaire
    cookieStore.set('adminTokenExpiry', String(Date.now() + tokenExpiry * 1000), {
      httpOnly: false, // lisible côté client pour planifier le refresh
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return Response.json({ success: true, message: 'Connecté avec succès.', expiresIn: tokenExpiry });
  } catch (error: any) {
    console.error('[Admin Login Error]', error);
    return Response.json(
      { success: false, message: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
