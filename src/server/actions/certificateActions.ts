"use server";

import connectDB from "@/server/db/mongoose";
import Certificate from "@/server/db/models/Certificate";
import { revalidatePath } from "next/cache";

export async function getCertificatesAction() {
  try {
    await connectDB();
    const certificates = await Certificate.find().sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, certificates: JSON.parse(JSON.stringify(certificates)) };
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return { success: false, error: error.message };
  }
}

export async function getActiveCertificatesAction() {
  try {
    await connectDB();
    const certificates = await Certificate.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return { success: true, certificates: JSON.parse(JSON.stringify(certificates)) };
  } catch (error: any) {
    console.error("Error fetching active certificates:", error);
    return { success: false, error: error.message };
  }
}

export async function createCertificateAction(data: { imageUrl: string; description: string; isActive?: boolean }) {
  try {
    await connectDB();
    const newCertificate = await Certificate.create(data);
    
    // Revalidate paths that use certificates
    revalidatePath('/', 'layout');
    
    return { success: true, certificate: JSON.parse(JSON.stringify(newCertificate)) };
  } catch (error: any) {
    console.error("Error creating certificate:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCertificateAction(id: string, data: any) {
  try {
    await connectDB();
    const updatedCertificate = await Certificate.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
    
    revalidatePath('/', 'layout');
    
    return { success: true, certificate: JSON.parse(JSON.stringify(updatedCertificate)) };
  } catch (error: any) {
    console.error("Error updating certificate:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCertificateAction(id: string) {
  try {
    await connectDB();
    await Certificate.findByIdAndDelete(id);
    
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting certificate:", error);
    return { success: false, error: error.message };
  }
}
