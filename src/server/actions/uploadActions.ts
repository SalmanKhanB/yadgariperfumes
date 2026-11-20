"use server";

import { v2 as cloudinary } from "cloudinary";
import { requireAdminSession } from "@/server/auth/adminGuard";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(formData: FormData) {
  try {
    await requireAdminSession();
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");
    const folder = (formData.get("folder") as string) || "sqodex_products";
    const preserveRatio = formData.get("preserveRatio") === "true" || folder === "sqodex_certificates";

    // Attempt Cloudinary upload if API keys are set
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const transformation = [{ fetch_format: "webp", quality: "auto" }];

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              public_id: `${Date.now()}-${originalName}`,
              format: "webp",
              transformation: transformation
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        const publicUrl = (uploadResult as any).secure_url;
        return { success: true, url: publicUrl };
      } catch (cloudErr: any) {
        console.warn("Cloudinary upload failed, falling back to Base64 data URL:", cloudErr);
      }
    }

    // Fallback to Base64 Data URL so file upload always succeeds reliably
    const mimeType = file.type || "image/png";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return { success: true, url: dataUrl };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message || "Failed to upload file" };
  }
}

export async function uploadVideoAction(formData: FormData) {
  try {
    await requireAdminSession();
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");
    const folder = (formData.get("folder") as string) || "sqodex_products";

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: `${Date.now()}-${originalName}`,
          resource_type: "video"
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const publicUrl = (uploadResult as any).secure_url;
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Cloudinary video upload error:", error);
    return { success: false, error: error.message || "Failed to upload video to Cloudinary" };
  }
}

export async function getCloudinaryMediaAction(prefix?: string) {
  try {
    await requireAdminSession();
    // We use the admin API to get resources
    const options: any = {
      type: 'upload',
      max_results: 100,
    };
    if (prefix) {
      options.prefix = prefix;
    }
    const result = await cloudinary.api.resources(options);

    return { success: true, resources: result.resources };
  } catch (error: any) {
    console.error("Cloudinary fetch error:", error);
    return { success: false, error: error.message || "Failed to fetch media from Cloudinary" };
  }
}

export async function deleteCloudinaryMediaAction(publicId: string) {
  try {
    await requireAdminSession();
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      return { success: false, error: "Failed to delete from Cloudinary" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return { success: false, error: error.message || "Failed to delete media from Cloudinary" };
  }
}
