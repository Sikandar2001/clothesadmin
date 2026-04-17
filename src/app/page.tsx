"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp,
  Loader2,
  Package
} from "lucide-react";
import Image from "next/image";
import { Order, Product } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: "Total Sales", value: "₹0", change: "Live", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Active Products", value: "0", change: "Total", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Customers", value: "0", change: "Total", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Recent Orders", value: "0", change: "New", icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
  ]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for orders to update sales and recent orders
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      
      // Calculate Total Sales
      const totalSales = ordersData.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
      
      // Update Stats
      setStats(prev => {
        const newStats = [...prev];
        newStats[0].value = `₹${(totalSales / 100).toLocaleString('en-IN')}`;
        newStats[3].value = ordersData.length.toString();
        return newStats;
      });

      // Set Recent Orders (last 5)
      setRecentOrders(ordersData.slice(0, 5));
    });

    // Fetch static counts (Products and Users)
    const fetchCounts = async () => {
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        const usersSnap = await getDocs(collection(db, "users"));
        
        setStats(prev => {
          const newStats = [...prev];
          newStats[1].value = productsSnap.size.toString();
          newStats[2].value = usersSnap.size.toString();
          return newStats;
        });

        // Fetch top products (for now just last 4 products)
        const topProductsQuery = query(collection(db, "products"), limit(4));
        const topProductsSnap = await getDocs(topProductsQuery);
        setTopProducts(topProductsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    return () => unsubscribeOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Fetching real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Real-time statistics from your store.</p>
        </div>
        <div className="flex items-center self-start sm:self-auto gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live Sync
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No orders found.</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50">
                      {order.image ? (
                        <Image src={order.image} alt={order.item} fill className="object-cover" unoptimized />
                      ) : (
                        <Package className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.item}</p>
                      <p className="text-xs text-gray-500">{order.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{(order.totalAmount / 100).toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Store Products</h3>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No products found.</div>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                      ) : (
                        <ShoppingBag className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-blue-600 font-medium">{product.stock} in stock</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
