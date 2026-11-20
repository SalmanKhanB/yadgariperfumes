"use client";

import { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useTheme } from "next-themes";

interface RevenueChartProps {
  orders: any[];
}

export function RevenueChart({ orders }: RevenueChartProps) {
  const { formatPrice } = useCurrency();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const primaryColor = isDark ? "#c5a86d" : "#8f703e";
  const tickColor = isDark ? "#a39b8b" : "#7A6A57";
  const gridColor = isDark ? "rgba(244, 241, 234, 0.12)" : "rgba(20, 18, 16, 0.1)";

  // Process orders to get daily revenue for the last 30 days
  const data = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const days = 30;
    const result: { dateStr: string; date: number; revenue: number }[] = [];
    const now = new Date();
    
    // Initialize last 30 days with 0 revenue
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      result.push({
        dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: new Date(d.setHours(0, 0, 0, 0)).getTime(),
        revenue: 0,
      });
    }

    // Accumulate revenue
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDay = new Date(orderDate.setHours(0, 0, 0, 0)).getTime();
      
      const targetDay = result.find((r) => r.date === orderDay);
      if (targetDay) {
        targetDay.revenue += order.totals?.total || 0;
      }
    });

    return result;
  }, [orders]);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="dateStr" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: tickColor }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: tickColor }}
            tickFormatter={(value) => formatPrice(Number(value))}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-2xl">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5 font-price">
                      {formatPrice(Number(payload[0].value))}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={primaryColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{
              r: 5,
              fill: primaryColor,
              stroke: isDark ? "#1c1a17" : "#F4F1EA",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

