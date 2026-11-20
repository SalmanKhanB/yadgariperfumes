"use server";

import { revalidatePath } from "next/cache";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct as deleteProductRepo 
} from "@/server/repositories/productRepository";
import { IProduct } from "@/server/db/models/Product";

export async function saveProductAction(id: string | null, data: Partial<IProduct>) {
  try {
    if (id && id !== 'new') {
      await updateProduct(id, data);
    } else {
      await createProduct(data);
    }
    
    // Revalidate paths so the storefront and admin panel update immediately
    revalidatePath("/(admin)/products", "page");
    revalidatePath("/(public)/all", "page");
    revalidatePath("/", "layout"); // Full layout revalidation for shared state
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save product:", error);
    return { success: false, error: error.message || "Failed to save product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProductRepo(id);
    
    revalidatePath("/(admin)/products", "page");
    revalidatePath("/(public)/all", "page");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { success: false, error: error.message || "Failed to delete product" };
  }
}
