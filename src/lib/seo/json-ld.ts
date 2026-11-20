export function generateProductJsonLd(product: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productUrl = `${baseUrl}/${(product.categories?.[0] as any)?.slug || "uncategorized"}/${product.slug}`;
  const imageUrl = product.images && product.images.length > 0 
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) 
    : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": imageUrl ? [imageUrl] : [],
    "description": product.seo?.metaDescription || product.shortDescription || product.description || product.name,
    "sku": product.sku || String(product._id),
    "mpn": product.sku || String(product._id),
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "USD",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
}
