/**
 * Comprehensive CSV Helper utilities for parsing, validating, auto-correcting column shifts,
 * generating templates, and exporting complete product data.
 */

export interface CSVProductRow {
  name: string;
  pageTitle?: string;
  slug?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  status: "active" | "draft" | "archived";
  productType: "physical" | "digital";
  shortDescription?: string;
  description?: string;
  nativeDescription?: string;
  imageUrl?: string;
  videoUrl?: string;
  categories?: string;
  tags?: string;
  isFeatured?: boolean;
  isCustomize2?: boolean;
  isCustomize3?: boolean;
  descriptionTabs?: string;
  faqs?: string;
  variants?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface ParsedCSVRow {
  rowNumber: number;
  data: CSVProductRow;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const CSV_HEADERS = [
  "name",
  "pageTitle",
  "slug",
  "price",
  "compareAtPrice",
  "inventory",
  "status",
  "productType",
  "shortDescription",
  "description",
  "nativeDescription",
  "imageUrl",
  "videoUrl",
  "categories",
  "tags",
  "isFeatured",
  "isCustomize2",
  "isCustomize3",
  "descriptionTabs",
  "faqs",
  "variants",
  "metaTitle",
  "metaDescription",
  "metaKeywords",
];

function escapeCSVCell(value: any): string {
  if (value === undefined || value === null) return '""';
  let str: string;
  if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSVTemplate(): string {
  const headers = CSV_HEADERS.join(",");
  const sampleRows = [
    [
      escapeCSVCell("Premium Cotton T-Shirt"),
      escapeCSVCell("Buy Premium Cotton T-Shirt Online"),
      escapeCSVCell("premium-cotton-tshirt"),
      escapeCSVCell(29.99),
      escapeCSVCell(39.99),
      escapeCSVCell(50),
      escapeCSVCell("active"),
      escapeCSVCell("physical"),
      escapeCSVCell("High quality 100% cotton tee"),
      escapeCSVCell("Soft and durable everyday wear t-shirt with reinforced stitching."),
      escapeCSVCell("عالي الجودة تي شيرت قطني 100%"),
      escapeCSVCell("https://images.unsplash.com/photo-1521572267360-ee0c2909d518;https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"),
      escapeCSVCell("https://www.youtube.com/watch?v=sample1"),
      escapeCSVCell("Apparel, Men"),
      escapeCSVCell("cotton, summer, bestseller"),
      escapeCSVCell(true),
      escapeCSVCell(false),
      escapeCSVCell(false),
      escapeCSVCell(JSON.stringify([{ title: "Material & Care", points: ["100% Organic Cotton", "Machine wash cold"] }])),
      escapeCSVCell(JSON.stringify([{ question: "What is the fit?", answer: "Regular true-to-size fit." }])),
      escapeCSVCell(JSON.stringify([{ name: "Size: M", sku: "TSHIRT-M", priceOverride: 29.99, inventory: 25 }])),
      escapeCSVCell("Premium Organic Cotton T-Shirt"),
      escapeCSVCell("Shop top quality 100% organic cotton t-shirts with fast shipping."),
      escapeCSVCell("tshirt, cotton, fashion"),
    ].join(","),
    [
      escapeCSVCell("Wireless Noise-Canceling Headphones"),
      escapeCSVCell("Wireless Noise-Canceling Bluetooth Headphones"),
      escapeCSVCell("wireless-headphones"),
      escapeCSVCell(149.00),
      escapeCSVCell(199.00),
      escapeCSVCell(25),
      escapeCSVCell("active"),
      escapeCSVCell("physical"),
      escapeCSVCell("Crystal clear sound with bass boost"),
      escapeCSVCell("Immersive sound experience with up to 30 hours battery life."),
      escapeCSVCell("سماعات لاسلكية عازلة للضوضاء"),
      escapeCSVCell("https://images.unsplash.com/photo-1505740420928-5e560c06d30e"),
      escapeCSVCell(""),
      escapeCSVCell("Electronics, Audio"),
      escapeCSVCell("wireless, bluetooth, audio"),
      escapeCSVCell(true),
      escapeCSVCell(true),
      escapeCSVCell(false),
      escapeCSVCell(JSON.stringify([{ title: "Battery Life", points: ["30 Hours Playback", "Quick Charge 10min = 3hrs"] }])),
      escapeCSVCell(JSON.stringify([{ question: "Is there warranty?", answer: "Includes 1 year full manufacturer warranty." }])),
      escapeCSVCell(JSON.stringify([{ name: "Color: Black", sku: "AUDIO-BLK", priceOverride: 149.00, inventory: 15 }])),
      escapeCSVCell("Wireless Noise-Canceling Headphones"),
      escapeCSVCell("Experience studio quality sound with long battery life."),
      escapeCSVCell("audio, headphones, bluetooth"),
    ].join(","),
  ];

  return [headers, ...sampleRows].join("\n");
}

export function exportProductsToCSV(products: any[]): string {
  const headers = CSV_HEADERS.join(",");
  const rows = products.map((p) => {
    const imagesStr = Array.isArray(p.images) && p.images.length > 0 ? p.images.map((img: any) => img.url).join(";") : "";
    const videosStr = Array.isArray(p.videos) && p.videos.length > 0 ? p.videos.map((vid: any) => vid.url).join(";") : "";
    
    const categoriesStr = Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories.map((c: any) => (typeof c === "object" ? c.name || c.slug : c)).join(";")
      : "";

    const tagsStr = Array.isArray(p.tags) && p.tags.length > 0
      ? p.tags.map((t: any) => (typeof t === "object" ? t.name || t.slug : t)).join(";")
      : "";

    const descriptionTabsStr = p.descriptionTabs && p.descriptionTabs.length > 0 ? JSON.stringify(p.descriptionTabs) : "";
    const faqsStr = p.faqs && p.faqs.length > 0 ? JSON.stringify(p.faqs) : "";
    const variantsStr = p.variants && p.variants.length > 0 ? JSON.stringify(p.variants) : "";

    return [
      escapeCSVCell(p.name || ""),
      escapeCSVCell(p.pageTitle || ""),
      escapeCSVCell(p.slug || ""),
      escapeCSVCell(p.price ?? 0),
      escapeCSVCell(p.compareAtPrice || ""),
      escapeCSVCell(p.inventory ?? 0),
      escapeCSVCell(p.status || "active"),
      escapeCSVCell(p.productType || "physical"),
      escapeCSVCell(p.shortDescription || ""),
      escapeCSVCell(p.description || ""),
      escapeCSVCell(p.nativeDescription || ""),
      escapeCSVCell(imagesStr),
      escapeCSVCell(videosStr),
      escapeCSVCell(categoriesStr),
      escapeCSVCell(tagsStr),
      escapeCSVCell(p.isFeatured ? true : false),
      escapeCSVCell(p.isCustomize2 ? true : false),
      escapeCSVCell(p.isCustomize3 ? true : false),
      escapeCSVCell(descriptionTabsStr),
      escapeCSVCell(faqsStr),
      escapeCSVCell(variantsStr),
      escapeCSVCell(p.seo?.metaTitle || ""),
      escapeCSVCell(p.seo?.metaDescription || ""),
      escapeCSVCell(p.seo?.metaKeywords ? p.seo.metaKeywords.join(",") : ""),
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

export function parseRawCSV(csvText: string): string[][] {
  const lines: string[][] = [];
  const cleanText = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if (char === "\n" && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function parseBool(val: string): boolean {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return lower === "true" || lower === "1" || lower === "yes";
}

function isNumeric(val: string): boolean {
  if (!val) return false;
  return !isNaN(Number(val));
}

/**
 * Parses CSV text with smart column auto-detection and column shift correction.
 */
export function parseAndValidateProductCSV(csvContent: string): ParsedCSVRow[] {
  const rawRows = parseRawCSV(csvContent);
  if (rawRows.length === 0) return [];

  // Clean header strings
  const headerRow = rawRows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/gi, ""));
  
  // Build header mapping table supporting aliases
  const colIndexMap: Record<string, number> = {};
  
  const aliases: Record<string, string[]> = {
    name: ["name", "title", "productname", "product_name"],
    pageTitle: ["pagetitle", "page_title", "seotitle", "seo_title"],
    slug: ["slug", "handle", "url_slug", "productslug"],
    price: ["price", "sellprice", "sellingprice", "cost", "unitprice"],
    compareAtPrice: ["compareatprice", "compareprice", "originalprice", "mrp", "regularprice"],
    inventory: ["inventory", "stock", "qty", "quantity", "stockquantity"],
    status: ["status", "state", "visibility"],
    productType: ["producttype", "product_type", "type", "category", "categories"],
    shortDescription: ["shortdescription", "short_description", "summary"],
    description: ["description", "longdescription", "body", "details"],
    nativeDescription: ["nativedescription", "native_description", "urdudescription"],
    imageUrl: ["imageurl", "image_url", "image", "images", "photo"],
    videoUrl: ["videourl", "video_url", "video", "videos"],
    categories: ["categories", "category"],
    tags: ["tags", "tag"],
  };

  CSV_HEADERS.forEach((h) => {
    const aliasList = aliases[h] || [h.toLowerCase()];
    const idx = headerRow.findIndex((col) => aliasList.includes(col));
    if (idx !== -1) colIndexMap[h] = idx;
  });

  const parsedRows: ParsedCSVRow[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const errors: string[] = [];
    const warnings: string[] = [];

    const getRaw = (colName: string): string => {
      const idx = colIndexMap[colName];
      return idx !== undefined && row[idx] !== undefined ? row[idx] : "";
    };

    let name = getRaw("name");
    let pageTitle = getRaw("pageTitle");
    let rawSlug = getRaw("slug");
    let rawPrice = getRaw("price");
    let rawComparePrice = getRaw("compareAtPrice");
    let rawInventory = getRaw("inventory");
    let rawStatus = getRaw("status");
    let rawProductType = getRaw("productType");
    let shortDescription = getRaw("shortDescription");
    let description = getRaw("description");
    let nativeDescription = getRaw("nativeDescription");
    let imageUrl = getRaw("imageUrl");
    let videoUrl = getRaw("videoUrl");
    let categories = getRaw("categories");
    let tags = getRaw("tags");
    let isFeatured = parseBool(getRaw("isFeatured"));
    let isCustomize2 = parseBool(getRaw("isCustomize2"));
    let isCustomize3 = parseBool(getRaw("isCustomize3"));
    let descriptionTabs = getRaw("descriptionTabs");
    let faqs = getRaw("faqs");
    let variants = getRaw("variants");
    let metaTitle = getRaw("metaTitle");
    let metaDescription = getRaw("metaDescription");
    let metaKeywords = getRaw("metaKeywords");

    // DETECT & AUTO-FIX COLUMN SHIFT (e.g. Header has `pageTitle` but rows omitted `pageTitle`)
    // Symptom: `rawSlug` is a numeric price (e.g. "890.00"), `pageTitle` is a slug (e.g. "improvit")
    if (isNumeric(rawSlug) && pageTitle && !isNumeric(pageTitle) && pageTitle.includes("-") || (pageTitle && !pageTitle.includes(" ") && pageTitle.length > 2 && isNumeric(rawSlug))) {
      // Shifted by 1 column!
      const actualSlug = pageTitle;
      const actualPrice = rawSlug;
      const actualCompare = rawPrice;
      const actualInventory = rawComparePrice;
      const actualStatus = rawInventory;
      const actualCategory = rawStatus;
      const actualShortDesc = rawProductType;
      const actualDesc = shortDescription;
      const actualImage = description || imageUrl;

      pageTitle = "";
      rawSlug = actualSlug;
      rawPrice = actualPrice;
      rawComparePrice = actualCompare;
      rawInventory = actualInventory;
      rawStatus = actualStatus;

      if (!categories) {
        categories = actualCategory;
      }
      shortDescription = actualShortDesc;
      description = actualDesc;
      if (actualImage && actualImage.startsWith("http")) {
        imageUrl = actualImage;
      }
    }

    // Validation & cleaning rules
    if (!name && row.length > 0) {
      name = row[0];
    }
    if (!name) {
      errors.push("Product name is required.");
    }

    const price = parseFloat(rawPrice);
    if (isNaN(price) || price < 0) {
      errors.push("Valid positive price is required.");
    }

    let compareAtPrice: number | undefined = undefined;
    if (rawComparePrice) {
      const parsedCompare = parseFloat(rawComparePrice);
      if (!isNaN(parsedCompare) && parsedCompare >= 0) {
        compareAtPrice = parsedCompare;
      }
    }

    let inventory = 0;
    if (rawInventory) {
      const parsedInv = parseInt(rawInventory, 10);
      if (!isNaN(parsedInv) && parsedInv >= 0) {
        inventory = parsedInv;
      }
    }

    // If status is not active/draft/archived, treat it as Category or ProductType and default status to 'active'
    let status: "active" | "draft" | "archived" = "active";
    const lowerStatus = rawStatus.toLowerCase().trim();
    if (["active", "draft", "archived"].includes(lowerStatus)) {
      status = lowerStatus as any;
    } else if (rawStatus) {
      // Unrecognized status -> treat as category/type
      if (!categories) categories = rawStatus;
      status = "active";
    }

    const productType = (["physical", "digital"].includes(rawProductType.toLowerCase().trim())
      ? rawProductType.toLowerCase().trim()
      : "physical") as "physical" | "digital";

    // Clean slug: if rawSlug is numeric or empty, slugify the name
    let slug = rawSlug ? slugify(rawSlug) : slugify(name || "");
    if (isNumeric(slug) || !slug) {
      slug = slugify(name || "");
    }

    parsedRows.push({
      rowNumber: r + 1,
      data: {
        name,
        pageTitle,
        slug,
        price: isNaN(price) ? 0 : price,
        compareAtPrice,
        inventory,
        status,
        productType,
        shortDescription,
        description,
        nativeDescription,
        imageUrl,
        videoUrl,
        categories,
        tags,
        isFeatured,
        isCustomize2,
        isCustomize3,
        descriptionTabs,
        faqs,
        variants,
        metaTitle,
        metaDescription,
        metaKeywords,
      },
      isValid: errors.length === 0,
      errors,
      warnings,
    });
  }

  return parsedRows;
}
