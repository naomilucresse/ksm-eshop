import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TENANTS } from '@/lib/mock-data';
import ShopNavbar from '@/components/shop/ShopNavbar';
import ShopFooter from '@/components/shop/ShopFooter';

interface ShopLayoutProps {
 children: React.ReactNode;
 params: Promise<{ tenantId: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ tenantId: string }> }): Promise<Metadata> {
 const { tenantId } = await params;
 const tenant = TENANTS.find((t) => t.slug === tenantId);

 if (!tenant) return { title: 'Shop not found' };

 return {
 title: `${tenant.name} | KSM eShop`,
 description: tenant.description,
 };
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
 const { tenantId } = await params;
 const tenant = TENANTS.find((t) => t.slug === tenantId);

 if (!tenant) {
 notFound();
 }

 return (
 <div className="flex min-h-screen flex-col">
 <ShopNavbar tenant={tenant} />
 <main className="flex-1">{children}</main>
 <ShopFooter tenant={tenant} />
 </div>
 );
}
