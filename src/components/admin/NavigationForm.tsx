"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { updateNavigationAction } from "@/app/admin/settings/actions";

import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

type FormData = {
  name: string;
  logo: string;
  showLogo: boolean;
  showStoreName: boolean;
  favicon: string;
  seoDefaults: { title: string };
  headerLinks: { label: string; url: string }[];
  footerWidgets: { title: string; links: { label: string; url: string }[] }[];
  footerCopyright: string;
  footerLinks: { label: string; url: string }[];
};

export default function NavigationForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: initialData.name || "STOREFRONT",
      logo: initialData.logo || "",
      showLogo: initialData.showLogo ?? initialData.headerStyle?.showLogo ?? false,
      showStoreName: initialData.showStoreName ?? initialData.headerStyle?.showStoreName ?? true,
      favicon: initialData.favicon || "",
      seoDefaults: {
        title: initialData.seoDefaults?.title || "STOREFRONT",
      },
      headerLinks: initialData.headerLinks || [],
      footerWidgets: initialData.footerWidgets || [],
      footerCopyright: initialData.footerCopyright || "",
      footerLinks: initialData.footerLinks || [],
    },
  });

  const currentFormValues = watch();
  const previewSettings = {
    ...initialData,
    ...currentFormValues,
    name: currentFormValues.name || initialData.name || "STOREFRONT"
  };

  const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
    control,
    name: "headerLinks",
  });

  const { fields: widgetFields, append: appendWidget, remove: removeWidget } = useFieldArray({
    control,
    name: "footerWidgets",
  });

  const { fields: footerLinkFields, append: appendFooterLink, remove: removeFooterLink } = useFieldArray({
    control,
    name: "footerLinks",
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateNavigationAction(data);
      if (result.success) {
        toast.success("Navigation updated successfully!");
      } else {
        toast.error("Failed to update navigation: " + result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Live Preview</h2>
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
          <div className="w-full relative bg-muted/20">
            <Navbar settings={previewSettings} isPreview={true} />
            <div className="py-20 text-center text-muted-foreground bg-background/50 italic">
              Main Content Area
            </div>
            <Footer settings={previewSettings} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

        {/* Brand & Identity */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Brand & Identity</h2>
            <p className="text-sm text-muted-foreground">Manage your store's name, logo, and browser tab display.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-6 rounded-2xl border border-border shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Store Name</label>
              <input
                {...register("name")}
                placeholder="e.g. Acme Corp"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tab Title (SEO Title)</label>
              <input
                {...register("seoDefaults.title")}
                placeholder="e.g. Acme | Quality Goods"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Logo Image URL</label>
              <div className="flex gap-2">
                <input
                  {...register("logo")}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <label className="cursor-pointer bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm flex items-center hover:opacity-90">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const formData = new FormData();
                        formData.append("file", e.target.files[0]);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setValue("logo", data.url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Favicon Image URL</label>
              <div className="flex gap-2">
                <input
                  {...register("favicon")}
                  placeholder="https://example.com/favicon.ico"
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <label className="cursor-pointer bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm flex items-center hover:opacity-90">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const formData = new FormData();
                        formData.append("file", e.target.files[0]);
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setValue("favicon", data.url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Header Brand Visibility Toggles */}
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-background border border-border hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  {...register("showLogo")}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold block uppercase tracking-wider">Show Store Logo in Header</span>
                  <span className="text-[11px] text-muted-foreground">Toggle store logo icon/image in top navigation</span>
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
                  <span className="text-[11px] text-muted-foreground">Toggle store title text in top navigation</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Header Links */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Navbar Links</h2>
              <p className="text-sm text-muted-foreground">Manage the main navigation links in the header.</p>
            </div>
            <button
              type="button"
              onClick={() => appendHeader({ label: "", url: "" })}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={16} /> Add Link
            </button>
          </div>

          <div className="space-y-3">
            {headerFields.length === 0 && (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                No header links configured.
              </div>
            )}
            {headerFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
                <GripVertical className="text-muted-foreground cursor-grab opacity-50" size={20} />
                <input
                  {...register(`headerLinks.${index}.label`)}
                  placeholder="Label (e.g. Shop)"
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  required
                />
                <input
                  {...register(`headerLinks.${index}.url`)}
                  placeholder="URL (e.g. /all)"
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Footer Widgets */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Footer Widgets</h2>
              <p className="text-sm text-muted-foreground">Manage columns of links displayed in the footer.</p>
            </div>
            <button
              type="button"
              onClick={() => appendWidget({ title: "", links: [] })}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={16} /> Add Widget
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgetFields.length === 0 && (
              <div className="col-span-full p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                No footer widgets configured.
              </div>
            )}
            {widgetFields.map((widgetField, widgetIndex) => (
              <div key={widgetField.id} className="bg-muted/10 border border-border rounded-2xl p-5 space-y-4 shadow-sm relative">
                <button
                  type="button"
                  onClick={() => removeWidget(widgetIndex)}
                  className="absolute top-4 right-4 p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="pr-8">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Widget Title</label>
                  <input
                    {...register(`footerWidgets.${widgetIndex}.title`)}
                    placeholder="e.g. Shop"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <WidgetLinks
                  control={control}
                  register={register}
                  widgetIndex={widgetIndex}
                />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Footer Bottom */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Footer Bottom</h2>
            <p className="text-sm text-muted-foreground">Manage your copyright text and bottom links (Privacy, Terms, etc.).</p>
          </div>

          <div className="bg-muted/10 border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Copyright Text</label>
              <input
                {...register("footerCopyright")}
                placeholder="e.g. 2024 SQODEX SHOP."
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Leave empty to use default: &copy; {new Date().getFullYear()} {currentFormValues.name}.</p>
            </div>

            <div className="pt-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bottom Links</label>
                <button
                  type="button"
                  onClick={() => appendFooterLink({ label: "", url: "" })}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>

              <div className="space-y-3">
                {footerLinkFields.length === 0 && (
                  <div className="p-4 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm">
                    No bottom links configured.
                  </div>
                )}
                {footerLinkFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
                    <GripVertical className="text-muted-foreground cursor-grab opacity-50" size={20} />
                    <input
                      {...register(`footerLinks.${index}.label`)}
                      placeholder="Label (e.g. Privacy)"
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                    <input
                      {...register(`footerLinks.${index}.url`)}
                      placeholder="URL (e.g. /privacy)"
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeFooterLink(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Navigation"}
          </button>
        </div>
      </form>
    </div>
  );
}

function WidgetLinks({ control, register, widgetIndex }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `footerWidgets.${widgetIndex}.links`,
  });

  return (
    <div className="space-y-3 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Links</span>
        <button
          type="button"
          onClick={() => append({ label: "", url: "" })}
          className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
        >
          + Link
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((linkField, linkIndex) => (
          <div key={linkField.id} className="flex items-center gap-2 relative group">
            <input
              {...register(`footerWidgets.${widgetIndex}.links.${linkIndex}.label`)}
              placeholder="Label"
              className="w-1/2 bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              required
            />
            <input
              {...register(`footerWidgets.${widgetIndex}.links.${linkIndex}.url`)}
              placeholder="URL"
              className="w-1/2 bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
              required
            />
            <button
              type="button"
              onClick={() => remove(linkIndex)}
              className="absolute -right-2 bg-background border border-border rounded-full p-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity translate-x-full"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
