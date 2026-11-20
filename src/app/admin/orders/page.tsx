"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchOrdersAction, updateOrderStatusAction, updatePaymentStatusAction } from "@/server/actions/orderActions";
import { IOrder } from "@/server/db/models/Order";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { Filter, Calendar, DollarSign, ShoppingCart, Clock, RotateCcw, Eye, Printer, FileSpreadsheet } from "lucide-react";

type DateRangePreset = "today" | "yesterday" | "this_week" | "this_month" | "last_month" | "all";

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  
  // Filter States
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  const { formatPrice, currency } = useCurrency();

  useEffect(() => {
    async function load() {
      const res = await fetchOrdersAction();
      if (res.success) setOrders(res.data);
      setLoading(false);
    }
    load();
  }, []);

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id?.toString() === orderId ? ({ ...o, paymentStatus: newPaymentStatus as any } as IOrder) : o))
    );
    const res = await updatePaymentStatusAction(orderId, newPaymentStatus);
    if (!res.success) {
      alert("Failed to update payment status: " + res.error);
      const refreshed = await fetchOrdersAction();
      if (refreshed.success) setOrders(refreshed.data);
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id?.toString() === orderId ? ({ ...o, status: newStatus as any } as IOrder) : o))
    );
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (!res.success) {
      alert("Failed to update order status: " + res.error);
      const refreshed = await fetchOrdersAction();
      if (refreshed.success) setOrders(refreshed.data);
    }
  };

  // ─── Filter Logic ────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    // Start of Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of Yesterday
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
    const yesterdayEnd = todayStart - 1;

    // Start of This Week (Monday)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = Mon
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();

    // Start of This Month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Start & End of Last Month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const lastMonthEnd = thisMonthStart - 1;

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt!).getTime();

      // Date Preset Filter
      if (datePreset === "today" && createdAt < todayStart) return false;
      if (datePreset === "yesterday" && (createdAt < yesterdayStart || createdAt > yesterdayEnd)) return false;
      if (datePreset === "this_week" && createdAt < weekStart) return false;
      if (datePreset === "this_month" && createdAt < thisMonthStart) return false;
      if (datePreset === "last_month" && (createdAt < lastMonthStart || createdAt > lastMonthEnd)) return false;

      // Order Status Filter
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      // Payment Status Filter
      if (paymentStatusFilter !== "all" && (order.paymentStatus || "pending") !== paymentStatusFilter) return false;

      // Payment Method Filter
      if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) return false;

      return true;
    });
  }, [orders, datePreset, statusFilter, paymentStatusFilter, paymentMethodFilter]);

  // ─── Summary Stats for Filtered Data ──────────────────────────────────────────
  const summary = useMemo(() => {
    let totalRev = 0;
    let pendingCount = 0;
    let awaitingVerificationCount = 0;

    filteredOrders.forEach((o) => {
      totalRev += o.totals?.total || 0;
      if (o.status === "pending") pendingCount++;
      if (o.paymentStatus === "awaiting_verification") awaitingVerificationCount++;
    });

    return {
      count: filteredOrders.length,
      revenue: totalRev,
      pendingCount,
      awaitingVerificationCount,
    };
  }, [filteredOrders]);

  const resetFilters = () => {
    setDatePreset("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setPaymentMethodFilter("all");
  };

  // ─── Export to Native Excel (.xls) ──────────────────────────────────────────
  const handleExportXLS = () => {
    if (filteredOrders.length === 0) {
      alert("No orders available to export for current filters.");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    const rowsHtml = filteredOrders
      .map(
        (o) => `
      <tr>
        <td style="mso-number-format:'\\@'; font-weight:bold;">#${o._id?.toString().slice(-8)}</td>
        <td>${new Date(o.createdAt!).toLocaleString()}</td>
        <td>${(o.customerName || "N/A").replace(/</g, "&lt;")}</td>
        <td>${(o.customerEmail || "").replace(/</g, "&lt;")}</td>
        <td style="mso-number-format:'\\@';">${(o.customerPhone || "").replace(/</g, "&lt;")}</td>
        <td style="text-transform:uppercase;">${o.paymentMethod || "stripe"}</td>
        <td style="text-transform:uppercase; font-weight:bold;">${o.paymentStatus || "pending"}</td>
        <td style="text-transform:uppercase; font-weight:bold;">${o.status || "pending"}</td>
        <td>${(o.shippingAddress ? `${o.shippingAddress.line1}, ${o.shippingAddress.city}, ${o.shippingAddress.country}` : "").replace(/</g, "&lt;")}</td>
        <td>${(o.totals?.subtotal || 0).toFixed(2)}</td>
        <td>${(o.totals?.shippingFee || 0).toFixed(2)}</td>
        <td>${(o.totals?.tax || 0).toFixed(2)}</td>
        <td style="font-weight:bold; color:#1b2a6b;">${(o.totals?.total || 0).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Orders Export</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #1b2a6b; color: #ffffff; font-weight: bold; font-size: 12px; padding: 6px; }
          td { font-size: 11px; padding: 6px; }
        </style>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Customer Phone</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Shipping Address</th>
              <th>Subtotal</th>
              <th>Shipping Fee</th>
              <th>Tax</th>
              <th>Total Amount (${currency})</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_export_${datePreset}_${dateStr}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Export / Print PDF ──────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (filteredOrders.length === 0) {
      alert("No orders available to print/PDF.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredOrders
      .map(
        (o) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd; font-family:monospace; font-weight:bold;">#${o._id?.toString().slice(-8)}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${new Date(o.createdAt!).toLocaleDateString()}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${o.customerName || "N/A"}<br/><small style="color:#666;">${o.customerEmail || ""}</small></td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-transform:uppercase; font-size:11px;">${o.paymentMethod}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-transform:uppercase; font-size:11px; font-weight:bold;">${o.paymentStatus || "pending"}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-transform:uppercase; font-size:11px; font-weight:bold;">${o.status}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right; font-weight:bold;">${formatPrice(o.totals?.total || 0)}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Summary Report - Sqodex Admin</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 4px; font-size: 24px; }
            .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
            .summary-box { display: flex; gap: 20px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .summary-item { flex: 1; }
            .summary-item label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #64748b; }
            .summary-item p { font-size: 18px; font-weight: bold; margin: 4px 0 0 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { text-align: left; background: #f1f5f9; padding: 8px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Orders Summary Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleString()} | Filter: Date Range [${datePreset.toUpperCase()}]</div>

          <div class="summary-box">
            <div class="summary-item">
              <label>Total Orders</label>
              <p>${summary.count}</p>
            </div>
            <div class="summary-item">
              <label>Total Revenue (${currency})</label>
              <p>${formatPrice(summary.revenue)}</p>
            </div>
            <div class="summary-item">
              <label>Pending Orders</label>
              <p>${summary.pendingCount}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Pay Status</th>
                <th>Order Status</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "processing": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "shipped": return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "delivered": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "refunded": return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
      case "cancelled": return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const columns = useMemo<ColumnDef<IOrder>[]>(
    () => [
      {
        accessorKey: "_id",
        header: "Order ID",
        cell: ({ row }) => (
          <Link href={`/admin/orders/${row.original._id}`} className="font-mono font-bold text-primary hover:underline">
            #{row.original._id?.toString().slice(-8)}
          </Link>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-xs">
              {new Date(row.original.createdAt!).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(row.original.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col max-w-[160px] truncate">
            <span className="font-bold text-foreground text-xs truncate">
              {row.original.customerName || "N/A"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {row.original.customerEmail || row.original.customerPhone || ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totals.total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-bold text-foreground">
            {formatPrice(Number(row.original.totals?.total || 0))}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => {
          const method = row.original.paymentMethod;
          return (
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              {method === "cod" ? "💵 COD" : method === "manual" ? "🏦 Bank/Wallet" : "💳 Stripe"}
            </span>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
          const pStatus = row.original.paymentStatus || "pending";
          const orderId = row.original._id?.toString();

          return (
            <select
              value={pStatus}
              onChange={(e) => orderId && handlePaymentStatusChange(orderId, e.target.value)}
              className="bg-card border border-border rounded-xl px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-foreground outline-none cursor-pointer hover:border-foreground transition-all shadow-xs"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="awaiting_verification">Awaiting Verification</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Order Status",
        cell: ({ row }) => {
          const status = (row.getValue("status") as string) || "pending";
          const orderId = row.original._id?.toString();

          return (
            <select
              value={status}
              onChange={(e) => orderId && handleOrderStatusChange(orderId, e.target.value)}
              className="bg-card border border-border rounded-xl px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-foreground outline-none cursor-pointer hover:border-foreground transition-all shadow-xs"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right flex items-center justify-end gap-2">
            <button 
              onClick={() => setSelectedOrder(row.original)}
              className="px-2.5 py-1.5 text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Shipping
            </button>
            <Link 
              href={`/admin/orders/${row.original._id}`} 
              className="px-2.5 py-1.5 text-xs font-bold text-primary-foreground bg-primary hover:opacity-90 rounded-lg transition-opacity flex items-center gap-1"
            >
              <Eye size={12} />
              View
            </Link>
          </div>
        ),
      },
    ],
    [formatPrice]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">View, filter and manage customer orders.</p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportXLS}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Export filtered orders to Excel Sheet (.xls)"
          >
            <FileSpreadsheet size={16} />
            Export Excel (.xls)
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Print or Save PDF report"
          >
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      </div>

      {/* ─── Summary Stats Bar ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtered Orders</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{summary.count}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filtered Revenue</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{formatPrice(summary.revenue)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Orders</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{summary.pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Needed</p>
            <p className="text-2xl font-black text-foreground mt-0.5">{summary.awaitingVerificationCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Filter size={20} />
          </div>
        </div>
      </div>

      {/* ─── Rich Filters Panel ─── */}
      <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-xs">
        {/* Date Presets Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-2 shrink-0">
            <Calendar size={14} /> Date Range:
          </span>
          {(
            [
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "this_week", label: "This Week" },
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "all", label: "All Time" },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDatePreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                datePreset === preset.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Order Status */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 border border-border bg-background text-foreground px-3 rounded-lg text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="h-9 border border-border bg-background text-foreground px-3 rounded-lg text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="awaiting_verification">Awaiting Verification</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="h-9 border border-border bg-background text-foreground px-3 rounded-lg text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="manual">Manual / Bank Transfer</option>
              <option value="stripe">Stripe Card</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(datePreset !== "all" || statusFilter !== "all" || paymentStatusFilter !== "all" || paymentMethodFilter !== "all") && (
            <button
              onClick={resetFilters}
              className="h-9 px-3 mt-auto bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Data Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredOrders} searchKey="_id" />
      )}

      {/* Shipping Address Quick Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-border text-foreground p-8 max-w-md w-full relative shadow-2xl rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSelectedOrder(null)}
            >
              CLOSE
            </button>
            <h2 className="text-xl font-bold mb-6 border-b border-border pb-3">Customer & Shipping Details</h2>
            
            <div className="mb-6 space-y-2 text-sm">
              <p className="uppercase text-xs font-bold text-muted-foreground mb-1">Customer</p>
              <p className="font-semibold">{selectedOrder.customerName || "N/A"}</p>
              <p className="text-muted-foreground text-xs">{selectedOrder.customerEmail || "N/A"}</p>
              <p className="text-muted-foreground text-xs">{selectedOrder.customerPhone || "N/A"}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="uppercase text-xs font-bold text-muted-foreground mb-1">Shipping Address</p>
              {selectedOrder.shippingAddress ? (
                <div className="bg-muted/50 p-3 rounded-xl border border-border text-xs leading-relaxed">
                  <p className="font-semibold text-foreground truncate max-w-40">{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                  <p className="font-bold text-foreground mt-1 uppercase">{selectedOrder.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="italic text-xs text-muted-foreground">No shipping details provided.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
