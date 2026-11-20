"use client";

import { useEffect, useState } from "react";
import { fetchOrdersAction } from "@/server/actions/orderActions";
import { fetchProductsAction } from "@/server/actions/productActions";
import { fetchUsersAction } from "@/server/actions/userActions";
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { ActivityLog, buildActivityFeed } from "@/components/admin/ActivityLog";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function DashboardPage() {
  const { formatPrice } = useCurrency();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    totalProducts: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    recentOrders: [],
    allOrders: [],
    allUsers: [],
    loading: true
  });

  useEffect(() => {
    async function loadDashboard() {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetchOrdersAction(),
        fetchProductsAction(),
        fetchUsersAction()
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }

      let revenue = 0;
      let prevRevenue = 0;
      let orderCount = 0;
      let prevOrderCount = 0;
      let productCount = 0;
      let customerCount = 0;
      let prevCustomerCount = 0;
      let recent = [];
      let revenueGrowth = 0;
      let ordersGrowth = 0;
      let customersGrowth = 0;

      if (ordersRes.success) {
        orderCount = ordersRes.data.length;
        recent = ordersRes.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        
        ordersRes.data.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const total = order.totals?.total || 0;
          revenue += total;
          
          if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
            prevRevenue += total;
            prevOrderCount++;
          }
        });
        
        // Count current month orders and revenue for growth
        let currentMonthRevenue = 0;
        let currentMonthOrders = 0;
        ordersRes.data.forEach((order: any) => {
          const date = new Date(order.createdAt);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            currentMonthRevenue += order.totals?.total || 0;
            currentMonthOrders++;
          }
        });
        
        revenueGrowth = prevRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : ((currentMonthRevenue - prevRevenue) / prevRevenue) * 100;
        ordersGrowth = prevOrderCount === 0 ? (currentMonthOrders > 0 ? 100 : 0) : ((currentMonthOrders - prevOrderCount) / prevOrderCount) * 100;
      }

      if (productsRes.success) {
        productCount = productsRes.data.length;
      }

      if (usersRes.success) {
        customerCount = usersRes.data.length;
        let currentMonthCustomers = 0;
        usersRes.data.forEach((user: any) => {
          const date = new Date(user.createdAt || now);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            currentMonthCustomers++;
          }
          if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
            prevCustomerCount++;
          }
        });
        
        customersGrowth = prevCustomerCount === 0 ? (currentMonthCustomers > 0 ? 100 : 0) : ((currentMonthCustomers - prevCustomerCount) / prevCustomerCount) * 100;
      }

      setMetrics({
        totalRevenue: revenue,
        revenueGrowth: revenueGrowth || 0,
        totalOrders: orderCount,
        ordersGrowth: ordersGrowth || 0,
        totalProducts: productCount,
        totalCustomers: customerCount,
        customersGrowth: customersGrowth || 0,
        recentOrders: recent,
        allOrders: ordersRes.success ? ordersRes.data : [],
        allUsers: usersRes.success ? usersRes.data : [],
        loading: false
      });
    }

    loadDashboard();
  }, []);

  if (metrics.loading) {
    return <div className="p-8 flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const activities = buildActivityFeed(metrics.allOrders, metrics.allUsers);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Here is what is happening with your store today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
            <DollarSign className="text-primary" size={16} />
          </div>
          <div className="text-3xl font-bold">{formatPrice(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {metrics.revenueGrowth > 0 ? <TrendingUp size={12} className="text-green-500" /> : metrics.revenueGrowth < 0 ? <TrendingDown size={12} className="text-red-500" /> : <Minus size={12} className="text-gray-500" />}
            {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}% from last month
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Orders</h3>
            <ShoppingCart className="text-primary" size={16} />
          </div>
          <div className="text-3xl font-bold">{metrics.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {metrics.ordersGrowth > 0 ? <TrendingUp size={12} className="text-green-500" /> : metrics.ordersGrowth < 0 ? <TrendingDown size={12} className="text-red-500" /> : <Minus size={12} className="text-gray-500" />}
            {metrics.ordersGrowth > 0 ? '+' : ''}{metrics.ordersGrowth.toFixed(1)}% from last month
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Products</h3>
            <Package className="text-primary" size={16} />
          </div>
          <div className="text-3xl font-bold">{metrics.totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            Active products in catalog
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Active Customers</h3>
            <Users className="text-primary" size={16} />
          </div>
          <div className="text-3xl font-bold">{metrics.totalCustomers}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {metrics.customersGrowth > 0 ? <TrendingUp size={12} className="text-green-500" /> : metrics.customersGrowth < 0 ? <TrendingDown size={12} className="text-red-500" /> : <Minus size={12} className="text-gray-500" />}
            {metrics.customersGrowth > 0 ? '+' : ''}{metrics.customersGrowth.toFixed(1)}% from last month
          </p>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Revenue Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">Daily revenue for the last 30 days</p>
          </div>
          <div className="p-6 flex-1">
            <RevenueChart orders={metrics.allOrders} />
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-1 glass-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[380px]">
            <ActivityLog activities={activities} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-xl border border-border shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Order ID</th>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-semibold text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No recent orders found.</td></tr>
              ) : metrics.recentOrders.map((order: any) => (
                <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-foreground">{order._id.toString().slice(-8)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">{formatPrice(order.totals?.total || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
