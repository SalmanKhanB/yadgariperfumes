"use client";

import { useEffect, useState } from "react";
import { uploadImageAction, getCloudinaryMediaAction, deleteCloudinaryMediaAction } from "@/server/actions/uploadActions";
import { Copy, Trash2, UploadCloud, RefreshCw, Image as ImageIcon, Folder, Globe, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function MediaLibraryPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"media" | "all">("media");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMedia = async (tab = activeTab) => {
    setLoading(true);
    // If tab is 'media', fetch only sqodex_media/ prefix. If 'all', fetch everything (no prefix).
    const prefix = tab === "media" ? "sqodex_media/" : undefined;
    const res = await getCloudinaryMediaAction(prefix);
    if (res.success && res.resources) {
      setResources(res.resources);
    } else {
      toast.error(res.error || "Failed to load media");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia(activeTab);
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "sqodex_media"); // Always upload to the dedicated media folder

    const res = await uploadImageAction(formData);
    
    if (res.success) {
      toast.success("Image uploaded successfully");
      fetchMedia(); // Refresh list
    } else {
      toast.error(res.error || "Upload failed");
    }
    setUploading(false);
    
    // Reset file input
    if (e.target) e.target.value = '';
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this image from Cloudinary? This action cannot be undone and may break links in your store.")) {
      return;
    }

    const res = await deleteCloudinaryMediaAction(publicId);
    if (res.success) {
      toast.success("Image deleted");
      setResources(resources.filter(r => r.public_id !== publicId));
    } else {
      toast.error(res.error || "Failed to delete image");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const filteredResources = resources.filter(r => 
    r.public_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ImageIcon className="text-primary" size={32} />
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1">Manage and upload images directly to your Cloudinary storage.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fetchMedia()}
            disabled={loading}
            className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
            title="Refresh Library"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-muted-foreground" : "text-foreground"} />
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <button 
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <UploadCloud size={18} />
              {uploading ? "Uploading..." : "Upload New Image"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border">
        <button 
          type="button"
          onClick={() => setActiveTab("media")}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'media' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Folder size={18} />
          Media Library Uploads
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("all")}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'all' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Globe size={18} />
          All Website Media
        </button>
      </div>

      <div className="flex items-center bg-background border border-border rounded-lg px-3 py-2 w-full max-w-md">
        <Search size={18} className="text-muted-foreground mr-2" />
        <input 
          type="text"
          placeholder="Search media by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
        />
      </div>

      {loading && resources.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <RefreshCw className="animate-spin mr-2" /> Loading media...
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <ImageIcon className="mx-auto text-muted-foreground/30 mb-4" size={48} />
          <h3 className="text-lg font-bold">No Media Found</h3>
          <p className="text-muted-foreground mt-2">Upload your first image to see it here.</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Search className="mx-auto text-muted-foreground/30 mb-4" size={48} />
          <h3 className="text-lg font-bold">No matches found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredResources.map((resource) => (
            <div key={resource.public_id} className="glass-card rounded-xl overflow-hidden border border-border group relative flex flex-col">
              <div className="h-44 w-full bg-muted/30 relative flex items-center justify-center p-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resource.secure_url} 
                  alt={resource.public_id} 
                  className="max-h-full max-w-full object-contain rounded transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 p-4">
                  <button
                    onClick={() => copyUrl(resource.secure_url)}
                    className="flex items-center gap-2 w-full justify-center px-3 py-2 bg-foreground text-background font-bold text-xs rounded hover:bg-foreground/80 transition-colors"
                  >
                    <Copy size={14} /> Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(resource.public_id)}
                    className="flex items-center gap-2 w-full justify-center px-3 py-2 bg-destructive/10 text-destructive font-bold text-xs rounded hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground truncate" title={resource.public_id}>
                  {resource.public_id.split('/').pop()}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase">
                  {(resource.bytes / 1024).toFixed(0)} KB • {resource.format}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
