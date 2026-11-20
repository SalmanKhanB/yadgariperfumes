import { ImageResponse } from 'next/og';
import { fetchProductBySlugAction } from '@/server/actions/productActions';
import { getEffectivePrice } from '@/server/services/pricing.service';
import { getCachedSiteSettings } from '@/server/cache/siteSettingsCache';

export const alt = 'Product Image';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> | { category: string; slug: string } }) {
  const resolvedParams = await params;
  const productRes = await fetchProductBySlugAction(resolvedParams.slug);
  
  if (!productRes.success) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', fontSize: 60 }}>
          Sqodex Shop
        </div>
      ),
      { ...size }
    );
  }

  const product = productRes.data;
  const effectivePrice = getEffectivePrice(product, null); // Simplified for OG image

  const settings = await getCachedSiteSettings();
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency || 'USD' }).format(amount);
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#000',
          color: '#fff',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 72, fontWeight: 'bold', textAlign: 'center', margin: 0, paddingBottom: 20 }}>
            {product.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981' }}>
              {formatPrice(effectivePrice.price)}
            </span>
            {effectivePrice.compareAt && (
              <span style={{ fontSize: 36, color: '#6b7280', textDecoration: 'line-through' }}>
                {formatPrice(effectivePrice.compareAt)}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', borderTop: '2px solid #333', width: '100%', paddingTop: '20px', justifyContent: 'space-between', fontSize: 32, color: '#9ca3af' }}>
          <span>Sqodex Shop</span>
          <span>{product.slug}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
