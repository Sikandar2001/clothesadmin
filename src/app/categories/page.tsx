"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash, Loader2, Tag } from "lucide-react";
import { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setIsAdding(true);
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: serverTimestamp()
      });
      
      const newlyAdded: Category = {
        id: docRef.id,
        name: newCategory.trim(),
        createdAt: Timestamp.now() as any // Temporary for UI before refetch
      };

      setCategories([newlyAdded, ...categories]);
      setNewCategory("");
      fetchCategories(); // Refetch to get proper server timestamp
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setIsAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure? Products using this category won't be deleted, but the category itself will be gone.")) return;

    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Category Management</h1>
        <p className="text-gray-500 mt-1">Add or remove categories for your clothing products.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={onAddCategory} className="flex gap-4">
          <input
            placeholder="Category name (e.g. Winter Wear, Summer Collection)"
            className="flex-1 rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newCategory.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Category
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Tag className="h-12 w-12 mb-4 opacity-20" />
            <p>No categories found. Add your first one above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <button
                  onClick={() => onDelete(category.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition text-gray-400"
                  title="Delete Category"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
