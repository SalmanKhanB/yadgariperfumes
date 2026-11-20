"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function NewsletterAdminClient({ initialSubscribers }: { initialSubscribers: any[] }) {
  const [subscribers] = useState(initialSubscribers);

  const downloadCSV = () => {
    if (!subscribers.length) return;

    const headers = ["Email", "Subscribed At"];
    const rows = subscribers.map(sub => [
      sub.email,
      new Date(sub.subscribedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!subscribers.length) return;

    const doc = new jsPDF();
    doc.text("Newsletter Subscribers", 14, 15);

    const tableColumn = ["#", "Email", "Subscribed At"];
    const tableRows = subscribers.map((sub, idx) => [
      (idx + 1).toString(),
      sub.email,
      new Date(sub.subscribedAt).toLocaleString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("newsletter_subscribers.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Subscribers ({subscribers.length})</h2>
        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {subscribers.length > 0 ? (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscribers.map((sub: any) => (
                <tr key={sub._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{sub.email}</td>
                  <td className="px-6 py-4 text-muted-foreground" suppressHydrationWarning>
                    {new Date(sub.subscribedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No subscribers found.</p>
        </div>
      )}
    </div>
  );
}
