import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api-client';
import { getKernelBaseHeaders } from '@/lib/kernel-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code: password, email, organizationId } = body;

    if (!email || !password || !name) {
      return Response.json({ success: false, message: 'Tous les champs sont requis' }, { status: 400 });
    }

    // ALWAYS use global tenant for Actor creation, even if initiated from an org page.
    const orgId = process.env.KERNEL_X_TENANT_ID || "11111111-1111-1111-1111-111111111111";

    // 1. Appel du /sign-up (Kernel Core) pour créer l'ACTOR
    const signUpPayload = {
      tenantId: orgId,
      username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
      email,
      password,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || name,
      phoneNumber: ''
    };

    const KERNEL_BASE = process.env.BACKEND_URL || 'https://kernel-core.yowyob.com';
    const authRes = await fetch(`${KERNEL_BASE}/api/auth/sign-up`, {
      method: 'POST',
      body: JSON.stringify(signUpPayload),
      headers: {
        ...getKernelBaseHeaders(),
        'X-Tenant-Id': orgId,
        'X-Organization-Id': orgId
      }
    });

    if (!authRes.ok) {
      const errData = await authRes.text();
      console.error('[Register] Erreur de création Kernel:', authRes.status, errData);
      let message = 'Erreur lors de la création du compte';
      try {
        const errObj = JSON.parse(errData);
        if (errObj.message) {
          if (errObj.message.toLowerCase().includes('password must contain') || errObj.message.toLowerCase().includes('password')) {
            message = 'Le mot de passe doit comporter au moins 10 caractères et contenir des majuscules, des minuscules, au moins un chiffre et un symbole spécial (ex: MonPass123@!).';
          } else {
            message = errObj.message;
          }
        }
      } catch {}
      return Response.json({ success: false, message }, { status: 400 });
    }

    const authData = await authRes.json().catch(() => ({}));
    
    // Save to local DB to count registrations via our page
    const { saveLocalUser } = require('@/lib/local-db');
    saveLocalUser({ name, email, username: signUpPayload.username, organizationId });

    return NextResponse.json({
      success: true,
      message: `Compte créé avec succès ! Votre identifiant de connexion est : ${signUpPayload.username}`,
      username: signUpPayload.username,
      emailVerificationRequired: true
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Register] Erreur interne:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
