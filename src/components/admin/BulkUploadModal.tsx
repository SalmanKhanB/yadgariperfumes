"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import {
  parseAndValidateProductCSV,
  generateCSVTemplate,
  ParsedCSVRow,
} from "@/lib/csvHelper";
import { bulkCreateProductsAction } from "@/server/actions/productActions";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<{
    success: boolean;
    insertedCount?: number;
    errors?: string[];
    message?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.name.endsWith(".csv")) {
      alert("Please select a valid .csv file");
      return;
    }
    setFile(uploadedFile);
    setIsParsing(true);
    setServerResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const rows = parseAndValidateProductCSV(text);
        setParsedRows(rows);
      }
      setIsParsing(false);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setParsedRows([]);
    setServerResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRowsCount = parsedRows.length - validRows.length;

  const handleSubmit = async () => {
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setServerResult(null);

    const productsToCreate = validRows.map((r) => {
      const p = r.data;
      const images = p.imageUrl
        ? p.imageUrl.split(/[;,]/).map((url, idx) => ({
            url: url.trim(),
            isPrimary: idx === 0,
            sortOrder: idx,
          })).filter((img) => img.url.length > 0)
        : [];

      return {
        name: p.name,
        pageTitle: p.pageTitle,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        inventory: p.inventory,
        status: p.status,
        productType: p.productType,
        shortDescription: p.shortDescription,
        description: p.description,
        nativeDescription: p.nativeDescription,
        images,
        videoUrl: p.videoUrl,
        categoriesStr: p.categories,
        tagsStr: p.tags,
        isFeatured: p.isFeatured,
        isCustomize2: p.isCustomize2,
        isCustomize3: p.isCustomize3,
        descriptionTabs: p.descriptionTabs,
        faqs: p.faqs,
        variants: p.variants,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        metaKeywords: p.metaKeywords,
      };
    });


    const res = await bulkCreateProductsAction(productsToCreate);

    setIsSubmitting(false);

    if (res.success && res.data) {
      setServerResult({
        success: true,
        insertedCount: res.data.insertedCount,
        errors: res.data.errors,
      });
      onSuccess();
    } else {
      setServerResult({
        success: false,
        message: res.error || "Failed to import products.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Bulk Upload Products</h2>
              <p className="text-xs text-muted-foreground">
                Import multiple products at once via CSV sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Bar & Template Link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Need the template format?</span>
                <p className="text-xs text-muted-foreground">
                  Download our pre-filled CSV sample template to populate your products.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary bg-background border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors shadow-sm shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Template CSV
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!file && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold mb-1">Click to upload or drag & drop</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Upload your completed CSV file containing product details (`.csv` format only).
              </p>
            </div>
          )}

          {/* File Parsing Spinner */}
          {isParsing && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">
                Analyzing CSV structure and validating rows...
              </p>
            </div>
          )}

          {/* Parsed Results Overview */}
          {file && !isParsing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/40 p-3.5 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows found
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Change File
                </button>
              </div>

              {/* Status Badges Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Rows</p>
                    <p className="text-base font-bold">{parsedRows.length}</p>
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ready to Import</p>
                    <p className="text-base font-bold text-green-600 dark:text-green-400">
                      {validRows.length}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Errors / Skipped</p>
                    <p className="text-base font-bold text-red-600 dark:text-red-400">
                      {invalidRowsCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              {parsedRows.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground sticky top-0 font-semibold border-b border-border">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Product Name</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Stock</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {parsedRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? "hover:bg-muted/30" : "bg-red-500/5 hover:bg-red-500/10"}
                        >
                          <td className="p-2.5 font-mono text-muted-foreground">#{row.rowNumber}</td>
                          <td className="p-2.5">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                                <XCircle className="w-3.5 h-3.5" /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-medium max-w-[160px] truncate">
                            {row.data.name || <span className="italic text-muted-foreground">Empty</span>}
                          </td>
                          <td className="p-2.5 font-mono">${row.data.price}</td>
                          <td className="p-2.5 font-mono">{row.data.inventory}</td>
                          <td className="p-2.5 uppercase font-mono text-[10px]">{row.data.productType}</td>
                          <td className="p-2.5">
                            {row.errors.length > 0 ? (
                              <span className="text-red-500 font-medium">
                                {row.errors.join("; ")}
                              </span>
                            ) : row.warnings.length > 0 ? (
                              <span className="text-amber-500 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {row.warnings.join("; ")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Server Upload Result Feedback */}
              {serverResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    serverResult.success
                      ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                      : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {serverResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {serverResult.success
                      ? `Successfully imported ${serverResult.insertedCount} products!`
                      : "Import Failed"}
                  </div>
                  {serverResult.message && <p className="text-xs">{serverResult.message}</p>}
                  {serverResult.errors && serverResult.errors.length > 0 && (
                    <ul className="text-xs list-disc list-inside mt-2 space-y-1">
                      {serverResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>

          {file && (
            <button
              onClick={handleSubmit}
              disabled={validRows.length === 0 || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing Products...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Import {validRows.length} Products
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
