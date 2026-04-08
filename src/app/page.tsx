import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp 
} from "lucide-react";

const stats = [
  { 
    label: "Total Sales", 
    value: "$12,450.00", 
    change: "+12%", 
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-100"
  },
  { 
    label: "Active Products", 
    value: "48", 
    change: "+4", 
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  { 
    label: "Total Customers", 
    value: "1,200", 
    change: "+85", 
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  { 
    label: "Conversion Rate", 
    value: "3.2%", 
    change: "+0.4%", 
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-100"
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back to your store administration.</p>
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
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
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
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Sales</h3>
          <div className="text-sm text-gray-500">Sales chart will be implemented here.</div>
          <div className="mt-8 h-[240px] w-full bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <TrendingUp className="h-10 w-10 text-gray-300" />
          </div>
        </div>
        
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Products</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-gray-100" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Summer Cotton T-Shirt</p>
                    <p className="text-xs text-gray-500">Clothes • Men</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">$29.99</p>
                  <p className="text-xs text-green-600 font-medium">124 sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
