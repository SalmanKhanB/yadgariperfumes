"use server";

import { revalidateTag } from "next/cache";
import connectToDatabase from "../db/mongoose";
import Product from "../db/models/Product";
import Category from "../db/models/Category";
import { read, utils, write } from "xlsx";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

export async function downloadProductTemplateAction() {
  try {
    const wb = utils.book_new();
    const headers = [
      [
        "#Name", "#Slug", "#Price", "CompareAtPrice", "#Category", "Inventory", "Images", 
        "ShortDescription", "LongDescription", "ProductType", "Status", 
        "Tags", "VideoURLs", "SEOTitle", "SEODescription", "IsFeatured"
      ]
    ];
    
    const ws = utils.aoa_to_sheet(headers);
    utils.book_append_sheet(wb, ws, "Products");
    
    // Convert to base64
    const base64 = write(wb, { type: 'base64', bookType: 'xlsx' });
    return { success: true, data: base64 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUploadProductsAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const buffer = await file.arrayBuffer();
    const wb = read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    const rows = utils.sheet_to_json(ws, { defval: "" }) as any[];

    if (rows.length === 0) {
      return { success: false, error: "The uploaded file is empty" };
    }

    await connectToDatabase();
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Cache categories to avoid repeated DB calls
    const categoryCache = new Map<string, any>();

    for (const [index, row] of rows.entries()) {
      try {
        const name = row["#Name"] || row["Name"];
        let slug = row["#Slug"] || row["Slug"];
        const priceStr = row["#Price"] || row["Price"];
        const comparePriceStr = row["CompareAtPrice"];
        const categoryName = row["#Category"] || row["Category"];
        const inventoryStr = row["Inventory"];
        const imagesStr = row["Images"];
        const shortDescription = row["ShortDescription"];
        const longDescription = row["LongDescription"];
        const productType = row["ProductType"] || "physical";
        const status = row["Status"] || "active";
        const tagsStr = row["Tags"];
        const videosStr = row["VideoURLs"];
        const seoTitle = row["SEOTitle"];
        const seoDescription = row["SEODescription"];
        const isFeaturedStr = row["IsFeatured"];

        if (!name) {
          throw new Error("Name is required");
        }
        if (!slug) {
          slug = slugify(name);
        }
        if (!priceStr) {
          throw new Error("Price is required");
        }

        const price = parseFloat(priceStr);
        if (isNaN(price)) {
          throw new Error("Invalid price format");
        }

        const compareAtPrice = comparePriceStr ? parseFloat(comparePriceStr) : undefined;
        const inventory = inventoryStr ? parseInt(inventoryStr, 10) : 0;
        
        let images: { url: string }[] = [];
        if (imagesStr && typeof imagesStr === "string") {
          images = imagesStr.split(",").map((url: string) => ({ url: url.trim() })).filter(img => img.url !== "");
        }
        
        if (images.length === 0) {
          // Add a default placeholder if none provided
          images.push({ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000" });
        }
        
        let videos: { url: string }[] = [];
        if (videosStr && typeof videosStr === "string") {
          videos = videosStr.split(",").map((url: string) => ({ url: url.trim() })).filter(vid => vid.url !== "");
        }

        const isFeatured = isFeaturedStr && isFeaturedStr.toString().toLowerCase() === "true";

        const productData: any = {
          name,
          slug,
          price,
          compareAtPrice: isNaN(compareAtPrice as number) ? undefined : compareAtPrice,
          inventory: isNaN(inventory) ? 0 : inventory,
          images,
          videos,
          shortDescription,
          description: longDescription,
          productType: productType.toLowerCase(),
          status: status.toLowerCase(),
          isFeatured,
          seo: {
            metaTitle: seoTitle || name,
            metaDescription: seoDescription || shortDescription || name,
          }
        };

        // Handle Category
        if (categoryName) {
          const catSlug = slugify(categoryName);
          let catDoc = categoryCache.get(catSlug);
          
          if (!catDoc) {
            catDoc = await Category.findOne({ slug: catSlug });
            if (!catDoc) {
              catDoc = await Category.create({ 
                name: categoryName, 
                slug: catSlug
              });
            }
            categoryCache.set(catSlug, catDoc);
          }
          
          productData.categories = [catDoc._id];
        }

        // Upsert product by slug (overwrite if exists)
        await Product.findOneAndUpdate(
          { slug },
          { $set: productData },
          { upsert: true, new: true }
        );

        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`Row ${index + 2} (${row["#Name"] || "Unknown"}): ${err.message}`);
      }
    }

    // @ts-ignore
    revalidateTag("products", "max");
    // @ts-ignore
    revalidateTag("categories", "max");

    return { 
      success: true, 
      data: { successCount, errorCount, errors } 
    };

  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return { success: false, error: error.message };
  }
}
