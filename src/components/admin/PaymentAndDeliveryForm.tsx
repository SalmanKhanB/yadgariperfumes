"use client";

import { useState } from "react";
import { updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { CreditCard, Banknote, Landmark, Truck, Plus, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

export default function PaymentAndDeliveryForm({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    freeShippingThreshold: initialSettings.freeShippingThreshold ?? 500,
    paymentSettings: {
      stripeEnabled: initialSettings.paymentSettings?.stripeEnabled ?? true,
      codEnabled: initialSettings.paymentSettings?.codEnabled ?? true,
      codMinOrder: initialSettings.paymentSettings?.codMinOrder ?? 0,
      codMaxOrder: initialSettings.paymentSettings?.codMaxOrder ?? 0,
      manualEnabled: initialSettings.paymentSettings?.manualEnabled ?? true,
      manualPaymentTitle: initialSettings.paymentSettings?.manualPaymentTitle || "Bank Transfer / Mobile Wallet",
      manualPaymentInstructions: initialSettings.paymentSettings?.manualPaymentInstructions || "Please transfer the order total to Bank Alpha (IBAN: PK00ALPH12345678901234) or JazzCash/EasyPaisa: 0300-1234567. Upload your transaction screenshot or enter reference ID at checkout.",
    },
    deliverySettings: {
      options: initialSettings.deliverySettings?.options || [
        { id: "standard", name: "Standard Shipping", cost: 5.00, estimatedDays: "3-5 Business Days", freeShippingMin: 100, isActive: true },
        { id: "express", name: "Express Delivery", cost: 15.00, estimatedDays: "1-2 Business Days", freeShippingMin: 0, isActive: true },
        { id: "cod-delivery", name: "Cash on Delivery Shipping", cost: 3.00, estimatedDays: "2-4 Business Days", freeShippingMin: 0, isActive: true },
      ],
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await updateSiteSettingsAction({
      freeShippingThreshold: Number(settings.freeShippingThreshold),
      paymentSettings: settings.paymentSettings,
      deliverySettings: settings.deliverySettings,
    });

    setSaving(false);
    if (res.success) {
      alert("Payment Methods & Delivery Options updated successfully!");
    } else {
      alert("Failed to update settings: " + res.error);
    }
  };

  const updatePaymentField = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      paymentSettings: {
        ...prev.paymentSettings,
        [field]: value,
      },
    }));
  };

  const updateDeliveryOption = (index: number, field: string, value: any) => {
    setSettings((prev) => {
      const updatedOptions = [...prev.deliverySettings.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      return {
        ...prev,
        deliverySettings: { options: updatedOptions },
      };
    });
  };

  const addDeliveryOption = () => {
    setSettings((prev) => ({
      ...prev,
      deliverySettings: {
        options: [
          ...prev.deliverySettings.options,
          {
            id: `delivery-${Date.now()}`,
            name: "New Shipping Method",
            cost: 10,
            estimatedDays: "2-3 Days",
            freeShippingMin: 0,
            isActive: true,
          },
        ],
      },
    }));
  };

  const removeDeliveryOption = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      deliverySettings: {
        options: prev.deliverySettings.options.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-10 font-sans">
      {/* 1. Payment Options Control Panel */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2">
            <CreditCard className="text-[#1B2A6B]" size={22} />
            Payment Methods Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">Control which payment methods customers can use during checkout.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stripe Card Payment Card */}
          <div className={`p-6 rounded-xl border-2 transition-all ${settings.paymentSettings.stripeEnabled ? "border-[#1B2A6B] bg-blue-50/20" : "border-gray-200 bg-gray-50/50"}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1B2A6B] flex items-center justify-center font-bold">
                  💳
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Stripe Credit Card</h4>
                  <p className="text-xs text-gray-500">Online Card Payments</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentSettings.stripeEnabled}
                onChange={(e) => updatePaymentField("stripeEnabled", e.target.checked)}
                className="w-5 h-5 accent-[#1B2A6B] rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Accept Visa, Mastercard, AMEX safely via Stripe Elements with automated webhooks.
            </p>
          </div>

          {/* Cash On Delivery (COD) Card */}
          <div className={`p-6 rounded-xl border-2 transition-all ${settings.paymentSettings.codEnabled ? "border-[#1B2A6B] bg-emerald-50/20" : "border-gray-200 bg-gray-50/50"}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  💵
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-gray-500">Pay at Doorstep</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentSettings.codEnabled}
                onChange={(e) => updatePaymentField("codEnabled", e.target.checked)}
                className="w-5 h-5 accent-[#1B2A6B] rounded cursor-pointer"
              />
            </div>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase">Min Order Subtotal ($)</label>
                <input
                  type="number"
                  value={settings.paymentSettings.codMinOrder}
                  onChange={(e) => updatePaymentField("codMinOrder", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                  placeholder="0 (No minimum)"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600 uppercase">Max Order Subtotal ($)</label>
                <input
                  type="number"
                  value={settings.paymentSettings.codMaxOrder}
                  onChange={(e) => updatePaymentField("codMaxOrder", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                  placeholder="0 (No limit)"
                />
              </div>
            </div>
          </div>

          {/* Manual Payment Card */}
          <div className={`p-6 rounded-xl border-2 transition-all ${settings.paymentSettings.manualEnabled ? "border-[#1B2A6B] bg-amber-50/20" : "border-gray-200 bg-gray-50/50"}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🏦
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Manual / Bank Transfer</h4>
                  <p className="text-xs text-gray-500">Direct Bank / Mobile Wallet</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.paymentSettings.manualEnabled}
                onChange={(e) => updatePaymentField("manualEnabled", e.target.checked)}
                className="w-5 h-5 accent-[#1B2A6B] rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Customers transfer payment and upload transaction proof screenshot or reference ID.
            </p>
          </div>
        </div>

        {/* Manual Payment Instructions Editor */}
        {settings.paymentSettings.manualEnabled && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Landmark size={18} className="text-amber-600" />
              Manual Payment Account Details & Instructions for Customers
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title Displayed at Checkout</label>
                <input
                  type="text"
                  value={settings.paymentSettings.manualPaymentTitle}
                  onChange={(e) => updatePaymentField("manualPaymentTitle", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bank / Wallet Details & Instructions (Shown at checkout)</label>
                <textarea
                  rows={4}
                  value={settings.paymentSettings.manualPaymentInstructions}
                  onChange={(e) => updatePaymentField("manualPaymentInstructions", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm bg-white font-mono leading-relaxed"
                  placeholder="Enter account number, IBAN, bank name, account holder name, or EasyPaisa/JazzCash instructions..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Delivery Options Control Panel */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2">
              <Truck className="text-[#1B2A6B]" size={22} />
              Delivery & Shipping Options
            </h3>
            <p className="text-sm text-gray-500 mt-1">Configure shipping rates, delivery times, and free shipping rules.</p>
          </div>
          <button
            type="button"
            onClick={addDeliveryOption}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2A6B] text-white rounded-lg text-xs font-bold hover:bg-[#152055] transition-colors"
          >
            <Plus size={16} />
            Add Shipping Option
          </button>
        </div>

        {/* Global Free Delivery Threshold Card */}
        <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
            Free Delivery Limit / Threshold Amount (e.g. 500 AED)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              className="w-48 border border-blue-300 rounded-lg p-2.5 text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500"
            />
            <span className="text-xs font-medium text-blue-700">
              Orders meeting or exceeding this subtotal automatically receive <strong>FREE Delivery</strong> on backend checkout.
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {settings.deliverySettings.options.map((option: any, idx: number) => (
            <div key={option.id || idx} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Option Name</label>
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateDeliveryOption(idx, "name", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900"
                  placeholder="e.g. Standard Shipping"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Shipping Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={option.cost}
                  onChange={(e) => updateDeliveryOption(idx, "cost", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-gray-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Estimated Delivery Time</label>
                <input
                  type="text"
                  value={option.estimatedDays}
                  onChange={(e) => updateDeliveryOption(idx, "estimatedDays", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700"
                  placeholder="e.g. 2-4 Business Days"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Free Over ($ Subtotal)</label>
                <input
                  type="number"
                  value={option.freeShippingMin || 0}
                  onChange={(e) => updateDeliveryOption(idx, "freeShippingMin", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700"
                  placeholder="0 (Disabled)"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 md:pt-0">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={option.isActive !== false}
                    onChange={(e) => updateDeliveryOption(idx, "isActive", e.target.checked)}
                    className="w-4 h-4 accent-[#1B2A6B] rounded"
                  />
                  Active
                </label>
                {settings.deliverySettings.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDeliveryOption(idx)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Option"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#1B2A6B] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#152055] transition-all shadow-md disabled:opacity-50"
        >
          {saving ? (
            <span>Saving Settings...</span>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Save Payment & Delivery Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
