"use client";

import { useEffect, useState } from "react";
import { getCertificatesAction, createCertificateAction, updateCertificateAction, deleteCertificateAction } from "@/server/actions/certificateActions";
import { uploadImageAction } from "@/server/actions/uploadActions";
import { Plus, Trash2, Edit2, Check, X, GripVertical, Award, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form Fields
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    const res = await getCertificatesAction();
    if (res.success && res.certificates) {
      setCertificates(res.certificates);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folder", "sqodex_certificates"); 
    formData.append("preserveRatio", "true");

    const res = await uploadImageAction(formData);
    
    if (res.success && res.url) {
      setImageUrl(res.url);
      toast.success("Certificate image uploaded!");
    } else {
      toast.error(res.error || "Upload failed");
    }
    setUploading(false);
    
    if (e.target) e.target.value = '';
  };

  const handleSave = async () => {
    if (!imageUrl || !description.trim()) {
      toast.error("Image and description are required.");
      return;
    }

    const data = {
      imageUrl,
      description,
      isActive
    };

    if (editingId) {
      const res = await updateCertificateAction(editingId, data);
      if (res.success) {
        toast.success("Certificate updated!");
        fetchCertificates();
        resetForm();
      } else {
        toast.error(res.error || "Update failed");
      }
    } else {
      const res = await createCertificateAction(data);
      if (res.success) {
        toast.success("Certificate created!");
        fetchCertificates();
        resetForm();
      } else {
        toast.error(res.error || "Creation failed");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    const res = await deleteCertificateAction(id);
    if (res.success) {
      toast.success("Certificate deleted!");
      fetchCertificates();
    } else {
      toast.error(res.error || "Failed to delete");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await updateCertificateAction(id, { isActive: !currentStatus });
    if (res.success) {
      toast.success("Status updated");
      fetchCertificates();
    } else {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setImageUrl("");
    setDescription("");
    setIsActive(true);
    setIsFormOpen(false);
  };

  const editCertificate = (cert: any) => {
    setEditingId(cert._id);
    setImageUrl(cert.imageUrl);
    setDescription(cert.description);
    setIsActive(cert.isActive);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Award className="text-primary" />
            Certificates & Awards
          </h1>
          <p className="text-muted-foreground mt-1">Manage global certificates and awards displayed on product pages.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Add Certificate
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <h2 className="text-xl font-bold flex items-center justify-between">
            {editingId ? "Edit Certificate" : "New Certificate"}
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-foreground">Certificate Image</label>
              
              {imageUrl ? (
                <div className="relative aspect-square w-full max-w-[200px] border border-border rounded-lg overflow-hidden group bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Certificate" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <button 
                      onClick={() => setImageUrl("")}
                      className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center w-full max-w-[200px] aspect-square border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="text-muted-foreground animate-pulse text-sm flex flex-col items-center">
                      Uploading...
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                      <ImageIcon className="mb-2 opacity-50" size={32} />
                      Click to upload
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Short Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4} 
                  className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                  placeholder="e.g., ISO 9001 Certified for Quality Management"
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">
                  Active (Visible on Storefront)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-4 py-2 border border-border text-foreground font-bold rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={!imageUrl || !description.trim() || uploading}
              className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Check size={18} />
              Save Certificate
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse">Loading certificates...</div>
      ) : certificates.length === 0 && !isFormOpen ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Award className="mx-auto text-muted-foreground/30 mb-4" size={48} />
          <h3 className="text-lg font-bold text-foreground">No certificates yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">Upload your first certificate to display on product pages.</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} /> Add Certificate
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert._id} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors">
              <div className="w-full md:w-32 aspect-video md:aspect-square shrink-0 rounded overflow-hidden bg-muted border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cert.imageUrl} alt="Certificate" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cert.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {cert.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{cert.description}</p>
              </div>

              <div className="flex items-center gap-2 justify-end mt-4 md:mt-0">
                <button 
                  onClick={() => toggleStatus(cert._id, cert.isActive)}
                  className={`p-2 border rounded hover:bg-muted transition-colors ${cert.isActive ? 'border-border text-muted-foreground' : 'border-green-500/30 text-green-500'}`}
                  title={cert.isActive ? "Deactivate" : "Activate"}
                >
                  {cert.isActive ? <X size={16} /> : <Check size={16} />}
                </button>
                <button 
                  onClick={() => editCertificate(cert)}
                  className="p-2 border border-border rounded text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cert._id)}
                  className="p-2 border border-border rounded text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
