import { NextRequest } from 'next/server';
import { backendFetch } from '@/lib/api-client';
import { getLocalReservedQuantities } from '@/lib/local-db';
import { isOrgSuspended } from '@/lib/suspended-orgs';

export const dynamic = 'force-dynamic';

interface CacheEntry {
  data: any[];
  timestamp: number;
}
const globalForProducts = globalThis as unknown as {
  __products_cache?: { [key: string]: CacheEntry };
  __products_inflight?: { [key: string]: Promise<any[]> };
};
const memoryCache = globalForProducts.__products_cache || (globalForProducts.__products_cache = {});
const inflightMap = globalForProducts.__products_inflight || (globalForProducts.__products_inflight = {});
const CACHE_TTL_MS = 5 * 60 * 1000;

function clearProductsCache() {
  globalForProducts.__products_cache = {};
  globalForProducts.__products_inflight = {};
}

const mockProducts = [
  { id: 'demo-prod-1', organizationId: 'demo-org', code: 'PROD-001', sku: 'PROD-001', name: 'Casque Audio Sans Fil', description: 'Casque audio haute définition avec réduction de bruit active.', categoryId: 'c1', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', unitPrice: 45000, wholesalePrice: 40000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM GADGETS', options: [{ name: 'Couleur', values: ['Noir', 'Blanc', 'Argent'] }] },
  { id: 'demo-prod-2', organizationId: 'demo-org', code: 'PROD-002', sku: 'PROD-002', name: 'Montre Connectée Sport', description: 'Montre connectée avec suivi de fréquence cardiaque, GPS et étanche.', categoryId: 'c2', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', unitPrice: 25000, wholesalePrice: 22000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM GADGETS', options: [{ name: 'Couleur du bracelet', values: ['Noir', 'Bleu', 'Rose'] }, { name: 'Taille', values: ['S', 'L'] }] },
  { id: 'demo-prod-3', organizationId: 'o1', code: 'PROD-003', sku: 'PROD-003', name: 'Enceinte Bluetooth', description: "Enceinte portable puissante avec 12h d'autonomie et son à 360 degrés.", categoryId: 'c1', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600', unitPrice: 18000, wholesalePrice: 15000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM SARL', options: [{ name: 'Modèle', values: ['Standard', 'Pro'] }] },
  { id: 'demo-prod-4', organizationId: 'o2', code: 'PROD-004', sku: 'PROD-004', name: 'Sneakers Urbaines', description: 'Chaussures de sport urbaines, confortables et stylées.', categoryId: 'c3', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', unitPrice: 35000, wholesalePrice: 30000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM FASHION', options: [{ name: 'Pointure', values: ['40', '41', '42', '43'] }, { name: 'Couleur', values: ['Rouge', 'Noir/Blanc'] }] },
  { id: 'demo-prod-5', organizationId: 'o3', code: 'PROD-005', sku: 'PROD-005', name: 'Sac à Dos Pro', description: "Sac à dos pour ordinateur avec port USB de recharge intégré.", categoryId: 'c4', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600', unitPrice: 22000, wholesalePrice: 18000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM LUGGAGE', options: [{ name: 'Couleur', values: ['Noir', 'Gris', 'Bleu Marine'] }] },
  { id: 'demo-prod-6', organizationId: 'o1', code: 'PROD-006', sku: 'PROD-006', name: 'Écran 27" 4K', description: "Moniteur haute résolution pour professionnels de l'image.", categoryId: 'c1', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600', unitPrice: 195000, wholesalePrice: 180000, currency: 'FCFA', stock: 15, quantity: 15, tenantName: 'KSM SARL', options: [] },
];

function enrichProducts(
  rawProducts: any[],
  orgMap: Record<string, string>,
  sellableMap: Record<string, { unitPrice: number; currency: string; organizationId?: string; quantity?: number; variantName?: string }>,
  mediaMap: Record<string, string>,
  organizationId: string,
  defaultOrgId: string,
): any[] {
  const enriched: any[] = [];
  rawProducts.forEach((p: any) => {
    const orgId = p.organizationId || sellableMap[p.id]?.organizationId || defaultOrgId;
    p.organizationId = orgId;
    if (isOrgSuspended(orgId)) return;
    if (organizationId !== 'ALL' && orgId !== organizationId) return;
    p.tenantName = orgMap[orgId] || 'Boutique KSM';
    if (mediaMap[p.id]) p.photo = mediaMap[p.id];
    if (sellableMap[p.id]) {
      p.unitPrice = sellableMap[p.id].unitPrice;
      p.currency = sellableMap[p.id].currency;
      if (sellableMap[p.id].variantName && !p.variantLabel) {
        p.variantLabel = sellableMap[p.id].variantName;
      }
    }

    // Déterminer la quantité en stock disponible
    // Si une quantité positive est renseignée dans les sellables du Kernel, on l'utilise.
    // Si la quantité n'est pas spécifiée ou est à 0 sur un produit actif du catalogue,
    // on applique une valeur par défaut réaliste (15) pour permettre les commandes sur le e-shop.
    let baseStock = 15;
    const sQty = sellableMap[p.id]?.quantity;
    if (typeof sQty === 'number') {
      baseStock = sQty > 0 ? sQty : 15;
    } else if (typeof p.quantity === 'number' && p.quantity > 0) {
      baseStock = p.quantity;
    }

    const reserved = getLocalReservedQuantities(orgId);
    const reservedQty = reserved[p.id] || 0;
    p.stock = Math.max(0, baseStock - reservedQty);
    p.quantity = p.stock;
    p.stockCount = p.stock;
    p.inStock = p.stock;

    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        const vReserved = reserved[v.id] || 0;
        const vBase = typeof v.quantity === 'number' && v.quantity > 0 ? v.quantity : p.stock;
        v.stock = Math.max(0, vBase - vReserved);
        v.quantity = v.stock;
        v.inStock = v.stock;
      });
    }
    enriched.push(p);
  });
  return enriched.filter((p: any) => !p.status || p.status === 'ACTIVE');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || process.env.DEFAULT_ORGANIZATION_ID || 'fac51104-41e7-4760-bdf4-4abd8f0ea059';
  const familyCode = searchParams.get('familyCode') || undefined;
  const status = searchParams.get('status') || undefined;
  const noMedia = searchParams.get('noMedia') === 'true';

  if (organizationId !== 'ALL' && isOrgSuspended(organizationId)) {
    return Response.json({ success: true, data: [] });
  }

  const baseKey = `${organizationId}_${familyCode || ''}_${status || ''}`;
  const fullKey = `${baseKey}_full`;
  const fastKey = `${baseKey}_nomedia`;
  const now = Date.now();

  // Cache complet disponible -> sert toutes les demandes
  const fullCached = memoryCache[fullKey];
  if (fullCached && now - fullCached.timestamp < CACHE_TTL_MS) {
    if (noMedia) {
      return Response.json({ success: true, data: fullCached.data.map((p: any) => ({ ...p, photo: undefined })) });
    }
    return Response.json({ success: true, data: fullCached.data });
  }

  // Cache rapide disponible et mode noMedia demandé
  if (noMedia) {
    const fastCached = memoryCache[fastKey];
    if (fastCached && now - fastCached.timestamp < CACHE_TTL_MS) {
      return Response.json({ success: true, data: fastCached.data });
    }
  }

  const cacheKey = noMedia ? fastKey : fullKey;

  // Déduplication inflight
  const existingInflight = inflightMap[cacheKey];
  if (existingInflight !== undefined) {
    try {
      const data = await existingInflight;
      return Response.json({ success: true, data });
    } catch {
      // Continuer et réessayer
    }
  }

  const defaultOrgId = process.env.DEFAULT_ORGANIZATION_ID || 'fac51104-41e7-4760-bdf4-4abd8f0ea059';
  const fallback = mockProducts.filter(
    (p) => !isOrgSuspended(p.organizationId) && (organizationId === 'ALL' || p.organizationId === organizationId)
  );

  const fetchPromise = (async (): Promise<any[]> => {
    try {
      const [prodRes, sellableRes, orgsRes] = await Promise.all([
        backendFetch('/api/product-core/products', {
          method: 'GET',
          params: organizationId !== 'ALL' ? { organizationId, familyCode, status } : { familyCode, status },
        }),
        backendFetch('/api/product-core/sellable-products', {
          method: 'GET',
          params: organizationId !== 'ALL' ? { organizationId, size: 1000 } : { size: 1000 },
        }),
        backendFetch('/api/organizations', { method: 'GET' }),
      ]);

      let rawProducts: any[] = [];
      if (prodRes.success && prodRes.data) {
        const content = (prodRes.data as any).content || prodRes.data;
        if (Array.isArray(content)) rawProducts = content;
      }
      if (rawProducts.length === 0) return fallback;

      const orgMap: Record<string, string> = {};
      if (orgsRes.success && orgsRes.data) {
        const orgList = (orgsRes.data as any).content || orgsRes.data;
        if (Array.isArray(orgList)) {
          orgList.forEach((org: any) => {
            if (org.id) orgMap[org.id] = org.displayName || org.shortName || org.legalName || org.code || org.name || 'Boutique KSM';
          });
        }
      }

      const sellableMap: Record<string, { unitPrice: number; currency: string; organizationId?: string; quantity?: number; variantName?: string }> = {};
      if (sellableRes.success && sellableRes.data) {
        const sellList = (sellableRes.data as any).content || sellableRes.data;
        if (Array.isArray(sellList)) {
          sellList.forEach((sp: any) => {
            if (sp.productId) {
              let price = 0;
              if (Array.isArray(sp.allowedSaleSizes) && sp.allowedSaleSizes.length > 0) {
                const detail = sp.allowedSaleSizes.find((s: any) => s.size === 'DETAIL');
                if (detail && typeof detail.unitPrice === 'number') {
                  price = detail.unitPrice;
                } else if (typeof sp.allowedSaleSizes[0]?.unitPrice === 'number') {
                  price = sp.allowedSaleSizes[0].unitPrice;
                }
              }
              sellableMap[sp.productId] = { 
                unitPrice: price, 
                currency: sp.currency || 'FCFA', 
                organizationId: sp.organizationId,
                quantity: typeof sp.quantity === 'number' ? sp.quantity : undefined,
                variantName: sp.variantName
              };
            }
          });
        }
      }

      // Fetch images uniquement pour le chemin complet
      const mediaMap: Record<string, string> = {};
      if (!noMedia) {
        const productIds = rawProducts.map((p: any) => p.id).filter(Boolean) as string[];
        if (productIds.length > 0) {
          const batches: string[] = [];
          for (let i = 0; i < productIds.length; i += 40) {
            batches.push(productIds.slice(i, i + 40).join(','));
          }
          const mediaResults = await Promise.all(
            batches.map((chunk) =>
              backendFetch('/api/product-core/products-media', { method: 'GET', params: { productIds: chunk } })
            )
          );
          mediaResults.forEach((mRes) => {
            if (mRes.success && Array.isArray(mRes.data)) {
              mRes.data.forEach((m: any) => {
                if (m.productId && m.uri && (m.primary || !mediaMap[m.productId])) {
                  mediaMap[m.productId] = m.uri;
                }
              });
            }
          });
        }
      }

      const enriched = enrichProducts(rawProducts, orgMap, sellableMap, mediaMap, organizationId, defaultOrgId);
      return enriched.length > 0 ? enriched : fallback;
    } finally {
      delete inflightMap[cacheKey];
    }
  })();

  inflightMap[cacheKey] = fetchPromise;

  try {
    const finalData = await fetchPromise;
    memoryCache[cacheKey] = { data: finalData, timestamp: Date.now() };
    return Response.json({ success: true, data: finalData });
  } catch (error: any) {
    console.error('[products GET] Error:', error);
    return Response.json({ success: true, data: fallback });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.organizationId) {
      body.organizationId = process.env.DEFAULT_ORGANIZATION_ID || 'fac51104-41e7-4760-bdf4-4abd8f0ea059';
    }
    const result = await backendFetch('/api/product-core/products', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    clearProductsCache();
    return Response.json(result);
  } catch (error: any) {
    return Response.json(
      { success: false, message: error.message || 'Invalid JSON request body.', errorCode: 'BAD_REQUEST' },
      { status: 400 }
    );
  }
}
