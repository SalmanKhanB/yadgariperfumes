"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProductOrder,
  swapTwoProducts,
} from "../repositories/productRepository";
import { IProduct } from "../db/models/Product";
import { requireAdminSession } from "@/server/auth/adminGuard";

export async function fetchProductsAction(filter: any = {}) {
  try {
    const products = await getProducts(filter);
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchPaginatedProductsAction(filter: any = {}, options: { limit?: number; page?: number; sort?: any } = {}) {
  try {
    // Import dynamically to avoid circular dependencies if any
    const { getPaginatedProducts } = await import("../repositories/productRepository");
    const result = await getPaginatedProducts(filter, options);
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProductsByIdsAction(ids: string[]) {
  try {
    const products = await getProducts({ _id: { $in: ids } });
    return { success: true, data: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProductByIdAction(id: string) {
  try {
    const product = await getProductById(id);
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProductBySlugAction(slug: string) {
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProductAction(data: Partial<IProduct>) {
  try {
    await requireAdminSession();
    const product = await createProduct(data);
    revalidateTag("products", "max");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(id: string, data: Partial<IProduct>) {
  try {
    await requireAdminSession();
    const product = await updateProduct(id, data);
    revalidateTag("products", "max");
    if (product?.slug) revalidateTag(`product-${product.slug}`, "max");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleFeaturedProductAction(id: string, isFeatured: boolean, section: "isFeatured" | "isCustomize2" | "isCustomize3" = "isFeatured") {
  try {
    await requireAdminSession();
    const updatePayload = { [section]: isFeatured };
    const product = await updateProduct(id, updatePayload);
    revalidateTag("products", "max");
    if (product?.slug) revalidateTag(`product-${product.slug}`, "max");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdminSession();
    await deleteProduct(id);
    revalidateTag("products", "max");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateProductOrderAction(orderedIds: string[]) {
  try {
    await requireAdminSession();
    await bulkUpdateProductOrder(orderedIds);
    revalidateTag("products", "max");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function swapTwoProductsAction(idA: string, idB: string) {
  try {
    await requireAdminSession();
    await swapTwoProducts(idA, idB);
    revalidateTag("products", "max");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkCreateProductsAction(productsData: any[]) {
  try {
    await requireAdminSession();
    const created = [];
    const errors: any[] = [];
    for (const data of productsData) {
      try {
        const prod = await createProduct(data);
        if (prod) created.push(prod);
      } catch (err: any) {
        errors.push({ row: data.name || "Product", error: err.message });
      }
    }
    revalidateTag("products", "max");
    revalidatePath("/", "layout");
    return {
      success: true,
      data: {
        insertedCount: created.length,
        errors,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


