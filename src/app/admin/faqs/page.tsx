"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, GripVertical, FileText } from "lucide-react";
import { getAllGlobalFAQsAction, createGlobalFAQAction, updateGlobalFAQAction, deleteGlobalFAQAction } from "@/server/actions/faqActions";
import { toast } from "react-hot-toast";

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    const res = await getAllGlobalFAQsAction();
    if (res.success) {
      setFaqs(res.data || []);
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  };

  const handleOpenForm = (faq?: any) => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
      });
      setEditingId(faq._id);
    } else {
      setFormData({
        question: "",
        answer: "",
        isActive: true,
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      return toast.error("Question and answer are required");
    }

    try {
      if (editingId) {
        const res = await updateGlobalFAQAction(editingId, formData);
        if (res.success) {
          toast.success("FAQ updated successfully");
          fetchFaqs();
          handleCloseForm();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createGlobalFAQAction({
          ...formData,
          order: faqs.length,
        });
        if (res.success) {
          toast.success("FAQ created successfully");
          fetchFaqs();
          handleCloseForm();
        } else {
          toast.error(res.message);
        }
      }
    } catch (error: any) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      const res = await deleteGlobalFAQAction(id);
      if (res.success) {
        toast.success("FAQ deleted");
        fetchFaqs();
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await updateGlobalFAQAction(id, { isActive: !currentStatus });
    if (res.success) {
      fetchFaqs();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Global FAQs</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the frequently asked questions that appear on the global FAQ page.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-sm"
        >
          <Plus size={18} /> Add New FAQ
        </button>
      </div>

      {isFormOpen && (
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? "Edit FAQ" : "Add New FAQ"}</h2>
            <button onClick={handleCloseForm} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Question</label>
              <input 
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                placeholder="What is your return policy?"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Answer</label>
              <textarea 
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none whitespace-pre-wrap"
                placeholder="We accept returns within 30 days..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">
                Active (visible on site)
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={handleCloseForm}
                className="px-4 py-2 border border-border rounded-lg font-semibold hover:bg-muted/50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition shadow-sm"
              >
                {editingId ? "Update FAQ" : "Save FAQ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : faqs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl border border-border shadow-sm">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">No FAQs Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Create your first frequently asked question to help your customers find the information they need.</p>
          <button 
            onClick={() => handleOpenForm()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold shadow-sm"
          >
            Create FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq._id} className="glass-card p-5 rounded-xl border border-border shadow-sm flex items-start gap-4 transition hover:border-primary/30">
              <div className="mt-1 cursor-move text-muted-foreground hover:text-foreground">
                <GripVertical size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground truncate">{faq.question}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {faq.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleActive(faq._id, faq.isActive)}
                  className="p-2 text-muted-foreground hover:text-foreground transition rounded-md hover:bg-muted/50"
                  title={faq.isActive ? "Deactivate" : "Activate"}
                >
                  {faq.isActive ? <X size={18} /> : <Check size={18} />}
                </button>
                <button 
                  onClick={() => handleOpenForm(faq)}
                  className="p-2 text-blue-500 hover:text-blue-600 transition rounded-md hover:bg-blue-50"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(faq._id)}
                  className="p-2 text-red-500 hover:text-red-600 transition rounded-md hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
