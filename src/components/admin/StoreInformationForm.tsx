import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { ImageUploader } from "./ImageUploader";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { CreditCard, Banknote, Landmark, Truck, Plus, Trash2 } from "lucide-react";

import { useCurrency } from "@/components/providers/CurrencyProvider";

const defaultShippingMethods = [
  { id: "standard", name: "Standard Shipping", price: 0, timeframe: "3 - 5 Business Days", description: "Standard tracked home delivery", enabled: true },
  { id: "express", name: "Express / Fast Delivery", price: 25, timeframe: "1 - 2 Business Days", description: "Priority expedited express shipping", enabled: true }
];

export default function StoreInformationForm({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const { setCurrency } = useCurrency();
  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      contact: {
        email: initialSettings.contact?.email || "",
        phone: initialSettings.contact?.phone || "",
      },
      logo: initialSettings.logo || "",
      showLogo: initialSettings.showLogo ?? initialSettings.headerStyle?.showLogo ?? false,
      showStoreName: initialSettings.showStoreName ?? initialSettings.headerStyle?.showStoreName ?? true,
      favicon: initialSettings.favicon || "",
      physicalAddress: initialSettings.physicalAddress || "",
      businessHours: initialSettings.businessHours || "",
      socialLinks: {
        facebook: initialSettings.socialLinks?.facebook || "",
        twitter: initialSettings.socialLinks?.twitter || "",
        instagram: initialSettings.socialLinks?.instagram || "",
        tiktok: initialSettings.socialLinks?.tiktok || "",
        whatsapp: initialSettings.socialLinks?.whatsapp || "",
      },
      currency: initialSettings.currency || "USD",
      paymentSettings: {
        stripeEnabled: initialSettings.paymentSettings?.stripeEnabled ?? true,
        codEnabled: initialSettings.paymentSettings?.codEnabled ?? true,
        codMinOrder: initialSettings.paymentSettings?.codMinOrder || 0,
        codMaxOrder: initialSettings.paymentSettings?.codMaxOrder || 0,
        manualEnabled: initialSettings.paymentSettings?.manualEnabled ?? true,
        manualPaymentTitle: initialSettings.paymentSettings?.manualPaymentTitle || "Bank Transfer / EasyPaisa / JazzCash",
        manualPaymentInstructions: initialSettings.paymentSettings?.manualPaymentInstructions || "Please transfer the total amount to Account # 123456789 and enter your TRX reference ID.",
        manualBankDetails: initialSettings.paymentSettings?.manualBankDetails || "Account Title: Yaadgari Perfumes\nAccount #: 1234567890\nBank / Provider: EasyPaisa / JazzCash / Bank Alfalah",
      },
      shippingMethods: (initialSettings.shippingMethods && initialSettings.shippingMethods.length > 0)
        ? initialSettings.shippingMethods
        : defaultShippingMethods,
    }
  });

  const { fields: shippingFields, append: appendShipping, remove: removeShipping } = useFieldArray({
    control,
    name: "shippingMethods",
  });

  const onSubmit = async (data: any) => {
    setSaving(true);
    const res = await updateSiteSettingsAction(data);
    setSaving(false);
    if (res.success) {
      if (data.currency) setCurrency(data.currency);
      alert("Store Information & Payment Methods updated successfully!");
    } else {
      alert("Failed to update settings: " + res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Contact Information</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">Support Email</label>
            <input 
              {...register("contact.email")} 
              type="email" 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
              placeholder="support@yourstore.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Support Phone</label>
            <input 
              {...register("contact.phone")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
              placeholder="1-800-YOURSTORE"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Store Currency</label>
            <select 
              {...register("currency")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary font-semibold"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="PKR">PKR (Rs)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SAR">SAR (ر.س)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
              <option value="QAR">QAR (ر.ق)</option>
              <option value="KWD">KWD (د.ك)</option>
              <option value="BHD">BHD (د.ب)</option>
              <option value="OMR">OMR (ر.ع.)</option>
              <option value="SGD">SGD ($)</option>
              <option value="MYR">MYR (RM)</option>
              <option value="NZD">NZD ($)</option>
              <option value="CHF">CHF (CHF)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="TRY">TRY (₺)</option>
              <option value="EGP">EGP (E£)</option>
            </select>
          </div>
        </div>

        {/* Location & Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Location & Hours</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">Physical Address</label>
            <input 
              {...register("physicalAddress")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
              placeholder="123 Commerce St, NY 10012"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Business Hours</label>
            <input 
              {...register("businessHours")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
              placeholder="Mon-Fri, 9am - 5pm EST"
            />
          </div>
        </div>

        {/* Branding Images */}
        <div className="space-y-4 md:col-span-2 border-t border-border pt-6 mt-2">
          <h3 className="text-lg font-bold border-b border-border pb-2">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold mb-2">Store Logo</label>
              <ImageUploader 
                images={watch("logo") ? [watch("logo") as string] : []} 
                onChange={(urls) => {
                  setValue("logo", urls.length > 0 ? urls[urls.length - 1] : "");
                }} 
              />
              <p className="text-xs text-muted-foreground mt-2">Upload a transparent PNG. Used in navbar and emails.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Favicon</label>
              <ImageUploader 
                images={watch("favicon") ? [watch("favicon") as string] : []} 
                onChange={(urls) => {
                  setValue("favicon", urls.length > 0 ? urls[urls.length - 1] : "");
                }} 
              />
              <p className="text-xs text-muted-foreground mt-2">Square image (e.g. 32x32) for the browser tab.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-background border border-border hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                {...register("showLogo")}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider">Show Store Logo in Header</span>
                <span className="text-[11px] text-muted-foreground">Display store logo image in header navigation</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-background border border-border hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                {...register("showStoreName")}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider">Show Store Name in Header</span>
                <span className="text-[11px] text-muted-foreground">Display store title text in header navigation</span>
              </div>
            </label>
          </div>
        </div>

        {/* ─── Payment Methods Enable / Disable ─── */}
        <div className="space-y-6 md:col-span-2 border-t border-border pt-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">Payment Methods Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stripe Card Payment */}
            <div className="p-5 border border-border rounded-2xl bg-card shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <span className="font-bold text-sm">Stripe Card</span>
                  </div>
                  <Controller
                    name="paymentSettings.stripeEnabled"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Accept Visa, Mastercard, AMEX and international credit/debit card payments online.
                </p>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/50">
                {watch("paymentSettings.stripeEnabled") ? "Active on Checkout" : "Disabled"}
              </div>
            </div>

            {/* Cash on Delivery (COD) */}
            <div className="p-5 border border-border rounded-2xl bg-card shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950 dark:text-emerald-300">
                      <Banknote size={18} />
                    </div>
                    <span className="font-bold text-sm">Cash on Delivery</span>
                  </div>
                  <Controller
                    name="paymentSettings.codEnabled"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow customers to pay cash in hand when their parcel is delivered.
                </p>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/50">
                {watch("paymentSettings.codEnabled") ? "Active on Checkout" : "Disabled"}
              </div>
            </div>

            {/* Manual Payment / Bank Transfer */}
            <div className="p-5 border border-border rounded-2xl bg-card shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-950 dark:text-amber-300">
                      <Landmark size={18} />
                    </div>
                    <span className="font-bold text-sm">Manual / Bank Transfer</span>
                  </div>
                  <Controller
                    name="paymentSettings.manualEnabled"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Accept bank transfers, EasyPaisa, JazzCash or custom manual payment methods.
                </p>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border/50">
                {watch("paymentSettings.manualEnabled") ? "Active on Checkout" : "Disabled"}
              </div>
            </div>
          </div>

          {/* Manual Payment Instructions Details */}
          {watch("paymentSettings.manualEnabled") && (
            <div className="p-5 border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm text-foreground">Manual Payment Details & Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Method Title</label>
                  <input
                    {...register("paymentSettings.manualPaymentTitle")}
                    className="w-full border border-border rounded-md p-2 text-xs font-semibold bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Bank Transfer / EasyPaisa / JazzCash"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bank / Account Details</label>
                  <textarea
                    {...register("paymentSettings.manualBankDetails")}
                    rows={3}
                    className="w-full border border-border rounded-md p-2 text-xs bg-background focus:ring-2 focus:ring-primary font-mono"
                    placeholder="Account Title, Account #, IBAN, Bank Name..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Customer Instructions</label>
                  <textarea
                    {...register("paymentSettings.manualPaymentInstructions")}
                    rows={3}
                    className="w-full border border-border rounded-md p-2 text-xs bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Steps for customer after transferring payment..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Delivery & Shipping Methods Options Configuration ─── */}
        <div className="space-y-6 md:col-span-2 border-t border-border pt-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="text-lg font-bold">Delivery & Shipping Options</h3>
              <p className="text-xs text-muted-foreground">Configure delivery methods, delivery timeframes, and shipping charges for checkout.</p>
            </div>
            <button
              type="button"
              onClick={() => appendShipping({ id: `ship-${Date.now()}`, name: "Custom Shipping", price: 15, timeframe: "2-4 Days", description: "Custom delivery method", enabled: true })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Add Shipping Method
            </button>
          </div>

          <div className="space-y-4">
            {shippingFields.map((field, idx) => (
              <div key={field.id} className="p-4 border border-border rounded-2xl bg-card/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Method Name</label>
                  <input
                    {...register(`shippingMethods.${idx}.name` as const)}
                    placeholder="e.g. Express / Fast Delivery"
                    className="w-full border border-border rounded-lg p-2 text-xs font-bold bg-background focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Shipping Charge / Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`shippingMethods.${idx}.price` as const, { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full border border-border rounded-lg p-2 text-xs font-bold bg-background focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Estimated Timeframe</label>
                  <input
                    {...register(`shippingMethods.${idx}.timeframe` as const)}
                    placeholder="e.g. 1 - 2 Business Days"
                    className="w-full border border-border rounded-lg p-2 text-xs bg-background focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                  <input
                    {...register(`shippingMethods.${idx}.description` as const)}
                    placeholder="Priority delivery"
                    className="w-full border border-border rounded-lg p-2 text-xs bg-background focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 sm:pt-0">
                  <Controller
                    name={`shippingMethods.${idx}.enabled` as const}
                    control={control}
                    render={({ field: f }) => (
                      <ToggleSwitch checked={f.value} onChange={f.onChange} />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeShipping(idx)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Shipping Method"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4 md:col-span-2 border-t border-border pt-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Instagram URL</label>
              <input 
                {...register("socialLinks.instagram")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
                placeholder="https://instagram.com/yourstore"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">TikTok URL</label>
              <input 
                {...register("socialLinks.tiktok")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
                placeholder="https://tiktok.com/@yourstore"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Twitter / X URL</label>
              <input 
                {...register("socialLinks.twitter")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
                placeholder="https://twitter.com/yourstore"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Facebook URL</label>
              <input 
                {...register("socialLinks.facebook")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
                placeholder="https://facebook.com/yourstore"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">WhatsApp Number</label>
              <input 
                {...register("socialLinks.whatsapp")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary" 
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {saving ? "Saving..." : "Save Store Settings"}
        </button>
      </div>
    </form>
  );
}
