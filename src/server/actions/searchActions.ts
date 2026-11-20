"use server";

import { searchProducts } from "@/server/repositories/productRepository";

export async function searchProductsAction(
  query: string,
  options?: { categorySlug?: string; sort?: string; minPrice?: string; maxPrice?: string; limit?: number }
) {
  try {
    const products = await searchProducts(query, options);
    return JSON.parse(JSON.stringify(products)); // Ensure serializeable
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
