import type { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

export function getShippingMethods(settings: Awaited<ReturnType<typeof getCachedSiteSettings>>) {
  const defaultShippingMethods = [
    { id: "standard", name: "Standard Shipping", price: 25, timeframe: "1 - 2 Business Days", description: "Standard tracked home delivery", freeShippingMin: 0, enabled: true },
    { id: "express", name: "Express / Fast Delivery", price: 45, timeframe: "1 - 2 Business Days", description: "Priority expedited express shipping", freeShippingMin: 0, enabled: true }
  ];

  let shippingMethods = defaultShippingMethods;
  if (settings.shippingMethods && settings.shippingMethods.length > 0) {
    shippingMethods = settings.shippingMethods
      .filter((m: any) => m.enabled !== false)
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        price: Number(m.price ?? 0),
        timeframe: m.timeframe || "",
        description: m.description || "",
        freeShippingMin: Number((m as any).freeShippingMin || 0),
        enabled: true
      }));
  } else if (settings.deliverySettings?.options && settings.deliverySettings.options.length > 0) {
    shippingMethods = settings.deliverySettings.options
      .filter((d: any) => d.isActive !== false)
      .map((d: any) => ({
        id: d.id,
        name: d.name,
        price: Number(d.cost || 0),
        timeframe: d.estimatedDays || "1 - 2 Business Days",
        description: "",
        freeShippingMin: Number(d.freeShippingMin || 0),
        enabled: true
      }));
  }

  return shippingMethods;
}
