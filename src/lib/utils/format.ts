export function formatCurrency(amount: number, currency: string = "USD"): string {
  const safeAmount = (isNaN(amount) || amount === null || amount === undefined) ? 0 : amount;
  const safeCurrency = currency || "USD";
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
    }).format(safeAmount);
  } catch (err) {
    return `${safeCurrency} ${safeAmount.toFixed(2)}`;
  }
}

export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("f_auto")) {
    const params = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
    return url.replace("/upload/", `/upload/${params}/`);
  }
  return url;
}

