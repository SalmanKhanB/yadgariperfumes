import { NextResponse } from "next/server";
import connectToDatabase from "@/server/db/mongoose";
import Product from "@/server/db/models/Product";
import Category from "@/server/db/models/Category";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10));

    await connectToDatabase();

    const filter: any = { status: "active" };

    // Search query matching regex (searches ONLY on item name)
    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.name = { $regex: regex };
    }

    // Category filter lookup (handles slug, case-insensitive slug, name, subcategories)
    if (categorySlug.trim()) {
      const catQuery = categorySlug.trim();
      let categoryDoc = null;
      if (mongoose.Types.ObjectId.isValid(catQuery)) {
        categoryDoc = await Category.findById(catQuery).select("_id").lean();
      }
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({
          $or: [
            { slug: catQuery },
            { slug: new RegExp(`^${catQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
            { name: new RegExp(`^${catQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
          ]
        }).select("_id").lean();
      }

      if (categoryDoc) {
        const subCats = await Category.find({ parent: categoryDoc._id }).select("_id").lean();
        const catIds = [categoryDoc._id, ...subCats.map((sc) => sc._id)];
        filter.categories = { $in: catIds };
      } else {
        filter.categories = new mongoose.Types.ObjectId();
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortObj: any = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "rating") sortObj = { averageRating: -1 };

    const skip = (page - 1) * limit;

    const [rawProducts, totalCount] = await Promise.all([
      Product.find(filter)
        .populate("categories")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const products = JSON.parse(JSON.stringify(rawProducts));
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        totalCount,
        totalPages,
        page,
        limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
