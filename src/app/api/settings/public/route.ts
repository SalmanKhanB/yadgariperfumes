import { NextResponse } from "next/server";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

import { getShippingMethods } from "@/server/stripe/shipping";

export async function GET() {
  try {
    const settings = await getCachedSiteSettings();

    const shippingMethods = getShippingMethods(settings);
    const freeShippingThreshold = Number(settings.freeShippingThreshold ?? 0);

    const paymentSettings = {
      stripeEnabled: settings.paymentSettings?.stripeEnabled ?? true,
      codEnabled: settings.paymentSettings?.codEnabled ?? true,
      manualEnabled: settings.paymentSettings?.manualEnabled ?? true,
      woocommerceEnabled: settings.woocommerceConfig?.enabled ?? false,
      manualPaymentTitle: settings.paymentSettings?.manualPaymentTitle || "Bank Transfer / EasyPaisa / JazzCash",
      manualPaymentInstructions: settings.paymentSettings?.manualPaymentInstructions || "Please transfer the total amount to Account # 123456789 and enter your TRX reference ID.",
      manualBankDetails: settings.paymentSettings?.manualBankDetails || "Account Title: Yaadgari Perfumes\nAccount #: 1234567890\nBank / Provider: EasyPaisa / JazzCash / Bank Alfalah",
    };

    return NextResponse.json({
      success: true,
      currency: settings.currency || "AED",
      freeShippingThreshold,
      paymentSettings,
      shippingMethods,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
