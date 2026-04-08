"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  query 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2,
  Package
} from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products Management</h1>
          <p className="text-gray-500 mt-1">Manage your store inventory and details.</p>
        </div>
        <Link
          href="/products/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          placeholder="Search products by name or category..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="h-12 w-12 mb-4 opacity-20" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Featured</th>
                  <th className="px-6 py-4 text-sm font-semibold text-right text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          {product.images?.[0] ? (
                            <Image
                              fill
                              src={product.images[0]}
                              alt={product.name}
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 m-3 text-gray-300" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock > 0 ? "text-gray-600" : "text-red-600 font-medium"}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.isFeatured ? (
                        <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs uppercase tracking-wider">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-2 hover:bg-red-50 hover:text-white rounded-lg transition text-gray-400"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/products/edit/${product.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
