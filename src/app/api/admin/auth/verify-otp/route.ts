import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getKernelBaseHeaders, getKernelBase } from '@/lib/kernel-auth';

export async function POST(request: NextRequest) {
  try {
    const { principal, code, sessionId } = await request.json();

    if (!principal || !code) {
      return Response.json(
        { success: false, message: 'Le code OTP et l\'adresse e-mail sont requis.' },
        { status: 400 }
      );
    }

    // Endpoint officiel Kernel : POST /api/auth/login/mfa/confirm
    let res = await fetch(`${getKernelBase()}/api/auth/login/mfa/confirm`, {
      method: 'POST',
      headers: {
        ...getKernelBaseHeaders(),
      },
      body: JSON.stringify({ mfaToken: sessionId, code }),
      cache: 'no-store'
    });

    let data = await res.json().catch(() => ({}));

    // Si 404 ou non supporté, tenter /api/auth/verify-mfa
    if (!res.ok && res.status === 404) {
      const fallbackRes = await fetch(`${getKernelBase()}/api/auth/verify-mfa`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Accept':        '*/*',
          'Authorization': `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ principal, code, sessionId }),
        cache: 'no-store'
      });
      if (fallbackRes.ok) {
        res = fallbackRes;
        data = await fallbackRes.json().catch(() => ({}));
      }
    }

    if (!res.ok || !data.success) {
      return Response.json(
        { success: false, message: data.message || 'Code OTP incorrect ou expiré.' },
        { status: res.status === 200 ? 400 : res.status }
      );
    }

    const accessToken = data?.data?.accessToken || data?.data?.access_token;
    const newSessionId = data?.data?.sessionId || data?.data?.sessionToken || sessionId;
    const token = accessToken || newSessionId;

    if (!token) {
      return Response.json(
        { success: false, message: 'Erreur lors de la récupération du jeton de session final.' },
        { status: 500 }
      );
    }

    const tokenExpiry = data?.data?.expiresInSeconds || data?.data?.expiresIn || 900;
    const cookieMaxAge = Math.max(tokenExpiry, 23 * 60 * 60);

    const sharedToken = data?.data?.sharedSession?.token;
    const sharedMaxAge = data?.data?.sharedSession?.expiresInSeconds || 8 * 60 * 60;

    const cookieStore = await cookies();

    // Enregistrer le token final dans les cookies
    cookieStore.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    cookieStore.set('adminSessionId', newSessionId, {
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

    cookieStore.set('adminTokenExpiry', String(Date.now() + tokenExpiry * 1000), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return Response.json({ success: true, message: 'OTP validé. Connexion établie.' });
  } catch (error: any) {
    console.error('[Verify OTP Error]', error);
    return Response.json(
      { success: false, message: 'Erreur interne lors de la validation OTP.' },
      { status: 500 }
    );
  }
}
