"use client";

import { useState } from "react";
import { addAddressAction, updateAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/server/actions/addressActions";
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-foreground text-background py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        isUpdate ? "Update Address" : "Save Address"
      )}
    </button>
  );
}

export default function AddressBookClient({ initialAddresses }: { initialAddresses: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: any) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  async function handleAction(formData: FormData) {
    let res;
    if (editingAddress) {
      res = await updateAddressAction(editingAddress._id, formData);
    } else {
      res = await addAddressAction(formData);
    }
    
    if (res.success) {
      handleCloseModal();
    } else {
      alert(res.error || "Failed to save address");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this address?")) {
      setIsProcessing(id);
      const res = await deleteAddressAction(id);
      if (!res.success) alert(res.error || "Failed to delete address");
      setIsProcessing(null);
    }
  }

  async function handleSetDefault(id: string) {
    setIsProcessing(id);
    const res = await setDefaultAddressAction(id);
    if (!res.success) alert(res.error || "Failed to set default address");
    setIsProcessing(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add New Card */}
        <button
          onClick={handleOpenAdd}
          className="glass-card rounded-2xl border border-dashed border-border p-6 min-h-[220px] flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-bold uppercase tracking-widest text-sm text-muted-foreground group-hover:text-foreground">Add New Address</span>
        </button>

        {/* Address Cards */}
        {initialAddresses.map((address) => (
          <div key={address._id} className={`glass-card rounded-2xl p-6 relative flex flex-col min-h-[220px] border ${address.isDefault ? 'border-primary' : 'border-border'}`}>
            {address.isDefault && (
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <CheckCircle2 size={12} />
                Default
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-foreground">
              <MapPin size={18} className="text-primary" />
              <h3 className="font-bold uppercase tracking-wider text-sm">{address.label}</h3>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed flex-1 space-y-1">
              <p className="font-medium text-foreground">{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(address)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  aria-label="Edit address"
                  disabled={isProcessing === address._id}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  aria-label="Delete address"
                  disabled={isProcessing === address._id}
                >
                  {isProcessing === address._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address._id)}
                  disabled={isProcessing === address._id}
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {isProcessing === address._id ? <Loader2 size={12} className="animate-spin" /> : 'Set as Default'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold uppercase tracking-tighter">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form action={handleAction} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Label</label>
                <select 
                  name="label" 
                  defaultValue={editingAddress?.label || "Home"} 
                  required 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm font-semibold"
                >
                  <option value="Home">Home</option>
                  <option value="Work / Office">Work / Office</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Warehouse / Shipping">Warehouse / Shipping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 1</label>
                <input type="text" name="line1" defaultValue={editingAddress?.line1 || ""} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 2 (Optional)</label>
                <input type="text" name="line2" defaultValue={editingAddress?.line2 || ""} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                  <input type="text" name="city" defaultValue={editingAddress?.city || ""} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">State / Province</label>
                  <input type="text" name="state" defaultValue={editingAddress?.state || ""} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                  <input type="text" name="postalCode" defaultValue={editingAddress?.postalCode || ""} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Country</label>
                  <input type="text" name="country" defaultValue={editingAddress?.country || ""} required className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 pb-4">
                <input type="checkbox" id="isDefault" name="isDefault" value="true" defaultChecked={editingAddress?.isDefault} className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
              </div>

              <SubmitButton isUpdate={!!editingAddress} />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
