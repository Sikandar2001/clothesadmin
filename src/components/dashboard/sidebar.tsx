"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  Settings, 
  Users, 
  LogOut,
  Tag,
  Tags,
  Layers,
  Package
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Orders", href: "/orders" },
  { icon: ShoppingBag, label: "Products", href: "/products" },
  { icon: PlusCircle, label: "Add Product", href: "/products/add" },
  { icon: Tag, label: "Categories", href: "/categories" },
  { icon: Tags, label: "Sub-Categories", href: "/subcategories" },
  { icon: Layers, label: "Child Sub-Categories", href: "/child-subcategories" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white text-gray-900 border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          MKSUKO <span className="text-blue-600">Admin</span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4",
                pathname === item.href ? "text-blue-600" : "text-gray-400"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <LogOut className="h-4 w-4 text-gray-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
