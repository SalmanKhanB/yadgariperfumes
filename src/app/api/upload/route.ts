import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "sqodex",
          format: "webp",
          transformation: [{ fetch_format: "webp", quality: "auto" }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // End the stream with the buffer
      uploadStream.end(buffer);
    });

    const fileUrl = (uploadResult as any).secure_url;
    
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file to cloud" }, { status: 500 });
  }
}
