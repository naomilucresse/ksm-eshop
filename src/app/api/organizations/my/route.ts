import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/my
 * Retourne la liste des organisations appartenant à l'utilisateur connecté depuis le kernel.
 * Normalise le champ `name` depuis displayName > shortName > longName > code
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || undefined;
  const size = searchParams.get('size') || undefined;

  const cookieStore = await cookies();
  const adminToken = cookieStore.get('adminToken')?.value;

  if (!adminToken) {
    return Response.json({ success: false, message: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
  }

  const result = await backendFetch('/api/organizations/my', {
    method: 'GET',
    params: { page, size },
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  // Si le résultat est un succès mais vide, ou en cas d'échec
  let orgs: any[] = [];
  let success = false;

  if (result.success && result.data) {
    const raw = result.data;
    if (Array.isArray(raw)) orgs = raw;
    else if (raw?.content && Array.isArray(raw.content)) orgs = raw.content;
    else if (raw?.data && Array.isArray(raw.data)) orgs = raw.data;
    else if (raw && typeof raw === 'object' && raw.id) orgs = [raw];
    success = true;
  }

  // Si on a obtenu une liste vide ou un échec du Kernel, on tente de reconstruire via /api/users/me (authorities)
  if (!success || orgs.length === 0) {
    console.log('[API organizations/my] Empty or error result, attempting reconstruction via /api/users/me authorities...');
    try {
      const meRes = await backendFetch('/api/users/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (meRes.success && meRes.data) {
        const authorities = meRes.data.authorities || [];
        const orgIdsFromAuth = new Set<string>();

        // Parcourir les authorities pour extraire les IDs d'organisations
        // Format typique : "ROLE_ORGANIZATION_ADMIN#ORGANIZATION:id" ou "products:write#ORGANIZATION:id"
        authorities.forEach((auth: string) => {
          const match = auth.match(/ORGANIZATION:([a-f0-9-]{36})/i);
          if (match && match[1]) {
            orgIdsFromAuth.add(match[1].toLowerCase());
          }
        });

        console.log('[API organizations/my] Found organization IDs in authorities:', Array.from(orgIdsFromAuth));

        if (orgIdsFromAuth.size > 0) {
          // Récupérer toutes les organisations publiques pour filtrer celles autorisées
          const publicOrgsResult = await backendFetch('/api/organizations?size=200', {
            method: 'GET'
          });

          if (publicOrgsResult.success && publicOrgsResult.data) {
            const rawPublic = publicOrgsResult.data;
            let publicOrgs: any[] = [];
            if (Array.isArray(rawPublic)) publicOrgs = rawPublic;
            else if (rawPublic?.content && Array.isArray(rawPublic.content)) publicOrgs = rawPublic.content;
            else if (rawPublic?.data && Array.isArray(rawPublic.data)) publicOrgs = rawPublic.data;
            else if (rawPublic && typeof rawPublic === 'object' && rawPublic.id) publicOrgs = [rawPublic];

            orgs = publicOrgs.filter((org: any) => orgIdsFromAuth.has(org.id?.toLowerCase()));
            console.log(`[API organizations/my] Filtered ${orgs.length} authorized organizations from public list.`);
            success = true;
          }
        }
      }
    } catch (err) {
      console.error('[API organizations/my] Error reconstructing via users/me:', err);
    }
  }

  // Fallback ultime : si on n'a toujours rien, et que c'était un échec ou une liste vide pour un admin,
  // on lui donne accès à toutes les organisations actives publiques
  if (!success || orgs.length === 0) {
    console.log('[API organizations/my] Reached ultimate fallback, listing all public organizations...');
    try {
      const publicOrgsResult = await backendFetch('/api/organizations?size=200', {
        method: 'GET'
      });
      if (publicOrgsResult.success && publicOrgsResult.data) {
        const raw = publicOrgsResult.data;
        if (Array.isArray(raw)) orgs = raw;
        else if (raw?.content && Array.isArray(raw.content)) orgs = raw.content;
        else if (raw?.data && Array.isArray(raw.data)) orgs = raw.data;
        else if (raw && typeof raw === 'object' && raw.id) orgs = [raw];
        success = true;
      }
    } catch (fallbackError) {
      console.error('[API organizations/my] Ultimate fallback error:', fallbackError);
    }
  }

  if (success) {
    const normalized = orgs.map((org: any) => ({
      ...org,
      name: org.displayName || org.shortName || org.longName || org.legalName || org.code || org.id,
      description: org.description || null,
    }));
    return Response.json({ success: true, data: normalized });
  }

  // Si vraiment tout a échoué
  const status = (result.errorCode === '401' || result.message === 'Unauthorized') ? 401 : 403;
  return Response.json(result, { status });
}
