"use client";

import { useEffect, useState } from "react";
import { 
  fetchPagesAction, 
  createPageAction, 
  updatePageAction, 
  deletePageAction 
} from "@/server/actions/pageActions";
import { ArrowLeft, Plus, Trash2, GripVertical, Image as ImageIcon, Type, ArrowRight, Save, Link as LinkIcon, ExternalLink, RefreshCw, Edit3, FileText, Sparkles } from "lucide-react";
import { BlockBuilder } from "@/components/admin/cms/BlockBuilder";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { IPage, IPageBlock } from "@/server/db/models/Page";

export default function PagesAdminPage() {
  const [pages, setPages] = useState<IPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "theme">("general");
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState<IPageBlock[]>([]);
  const [themeConfig, setThemeConfig] = useState<{theme?: string, backgroundColor?: string, textColor?: string}>({
    theme: "", backgroundColor: "", textColor: ""
  });
  const [saving, setSaving] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    const res = await fetchPagesAction();
    if (res.success && res.data) {
      setPages(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pages.length > 0 && !isEditing && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editSlug = params.get('edit');
      if (editSlug) {
        const pageToEdit = pages.find(p => p.slug === editSlug);
        if (pageToEdit) {
          handleEdit(pageToEdit);
          // Optional: clear the URL so it doesn't keep reopening if they click back
          window.history.replaceState({}, '', '/admin/cms/pages');
        }
      }
    }
  }, [pages, isEditing]);

  const handleCreateNew = () => {
    setSelectedPageId(null);
    setTitle("");
    setSlug("");
    setBlocks([]);
    setThemeConfig({ theme: "", backgroundColor: "", textColor: "" });
    setIsEditing(true);
    setActiveTab("general");
  };

  const handleEdit = (page: IPage) => {
    setSelectedPageId(String(page._id));
    setTitle(page.title);
    setSlug(page.slug);
    setBlocks(JSON.parse(JSON.stringify(page.blocks || [])));
    setThemeConfig(page.themeConfig || { theme: "", backgroundColor: "", textColor: "" });
    setIsEditing(true);
    setActiveTab("general");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    const res = await deletePageAction(id);
    if (res.success) {
      loadPages();
    } else {
      alert("Failed to delete page: " + res.error);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!selectedPageId) {
      // Auto-generate slug from title for new pages
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return alert("Title and Slug are required.");
    setSaving(true);

    const payload = {
      title,
      slug,
      blocks,
      themeConfig
    };

    let res;
    if (selectedPageId) {
      res = await updatePageAction(selectedPageId, payload);
    } else {
      res = await createPageAction(payload);
    }

    if (res.success) {
      setIsEditing(false);
      loadPages();
    } else {
      alert("Failed to save page: " + res.error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Area */}
      <div className="flex justify-between items-center border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <FileText className="text-primary" /> Custom Pages
          </h1>
          <p className="text-muted-foreground mt-1">Design customizable CMS pages for your storefront.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleCreateNew} 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus size={18} /> New Page
          </button>
        )}
      </div>

      {/* Pages List View */}
      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <Sparkles className="text-primary w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-bold text-foreground">Prefer Visual Editing?</p>
                <p className="text-xs text-muted-foreground">You can design and configure your custom pages with real-time drag-and-drop block previews in the Visual Studio Customizer.</p>
              </div>
            </div>
            <a 
              href="/admin/customizer" 
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-xs font-bold transition-opacity uppercase tracking-wider shrink-0"
            >
              Open Visual Studio <ExternalLink size={12} />
            </a>
          </div>

          <div className="glass-card rounded-2xl border border-border shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Title</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Slug</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Blocks count</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <RefreshCw className="animate-spin inline-block mr-2" size={18} /> Loading pages...
                      </td>
                    </tr>
                  ) : pages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                        No custom pages created yet. Click "New Page" to build one!
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={String(page._id)} className="hover:bg-muted/50 transition-all">
                        <td className="px-6 py-4 font-bold text-foreground">{page.title}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {["all", "collections", "about", "faq", "contact"].includes(page.slug) ? `/${page.slug}` : `/pages/${page.slug}`}
                        </td>
                        <td className="px-6 py-4 text-foreground">{page.blocks?.length || 0} blocks</td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button 
                            type="button"
                            onClick={() => handleEdit(page)} 
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          {!["all", "collections", "home"].includes((page.slug || "").toLowerCase()) && (
                            <button 
                              type="button"
                              onClick={() => handleDelete(String(page._id))} 
                              className="inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:underline cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        
        /* Interactive Page Editor View */
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex gap-4 border-b border-border pb-4">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mr-8"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-3 font-bold transition-colors ${activeTab === 'general' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Page Content
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("theme")}
              className={`pb-3 font-bold transition-colors ${activeTab === 'theme' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Theme Override
            </button>
          </div>

          <div className={activeTab === 'general' ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' : 'hidden'}>
            
            {/* Form Settings (Left Column) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-border shadow-sm space-y-6">
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground border-b border-border pb-3">Page Settings</h3>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Page Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    required
                    placeholder="e.g. Terms of Service"
                    className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Slug</label>
                  <div className="flex items-center bg-muted border border-border rounded-lg overflow-hidden">
                    <span className="bg-muted px-3 text-xs text-muted-foreground font-mono">
                      {["all", "collections"].includes(slug) ? "/" : "/pages/"}
                    </span>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      required
                      placeholder="terms-of-service"
                      disabled={["all", "collections"].includes(slug)}
                      className="w-full p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex gap-3 mt-6">
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Page"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="flex-1 bg-background text-foreground border border-border py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Block Builder using the reusable component */}
            <div className="lg:col-span-12 pt-4 border-t border-border mt-8">
              <BlockBuilder blocks={blocks} setBlocks={setBlocks} />
            </div>
          </div>

          <div className={activeTab === 'theme' ? 'block' : 'hidden'}>
            {/* Theme Configuration (Right Column) */}
            <div className="lg:col-span-8">
              <div className="glass-panel p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Theme Configuration</h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Optional</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={themeConfig.backgroundColor || "#000000"}
                            onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                            className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                          />
                          <input 
                            type="text" 
                            value={themeConfig.backgroundColor || ""}
                            onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                            placeholder="e.g. #000000"
                            className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-xs min-w-0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Text Color</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={themeConfig.textColor || "#ffffff"}
                            onChange={(e) => setThemeConfig({ ...themeConfig, textColor: e.target.value })}
                            className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                          />
                          <input 
                            type="text" 
                            value={themeConfig.textColor || ""}
                            onChange={(e) => setThemeConfig({ ...themeConfig, textColor: e.target.value })}
                            placeholder="e.g. #ffffff"
                            className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-xs min-w-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Live Preview</h3>
                    <div className="border border-border rounded-2xl overflow-hidden relative" style={{ height: '300px' }}>
                      <div className="absolute inset-0 pointer-events-none origin-top" style={{ transform: 'scale(0.6)', width: '166%' }}>
                        <ThemePreview 
                          config={themeConfig} 
                          defaultHeading={title || "Page Title"} 
                          defaultSubheading={`/pages/${slug || 'slug'}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
