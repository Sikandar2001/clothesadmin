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
import { Plus, Trash, Loader2, Tags } from "lucide-react";
import { Category, SubCategory } from "@/types";
import ImageUpload from "@/components/image-upload";
import Image from "next/image";

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories for dropdown
      const catQuery = query(collection(db, "categories"), orderBy("name", "asc"));
      const catSnap = await getDocs(catQuery);
      const catData = catSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(catData);

      // Fetch subcategories
      const subCatQuery = query(collection(db, "subcategories"), orderBy("createdAt", "desc"));
      const subCatSnap = await getDocs(subCatQuery);
      const subCatData = subCatSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubCategory[];
      setSubCategories(subCatData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategory.trim() || !selectedCategory) {
      alert("Please enter subcategory name and select a parent category.");
      return;
    }

    if (imageUrls.length === 0) {
      alert("Please upload a sub-category image.");
      return;
    }

    try {
      setIsAdding(true);
      const docRef = await addDoc(collection(db, "subcategories"), {
        name: newSubCategory.trim(),
        categoryId: selectedCategory,
        image: imageUrls[0],
        createdAt: serverTimestamp()
      });
      
      const newlyAdded: SubCategory = {
        id: docRef.id,
        name: newSubCategory.trim(),
        categoryId: selectedCategory,
        image: imageUrls[0],
        createdAt: Timestamp.now() as any
      };

      setSubCategories([newlyAdded, ...subCategories]);
      setNewSubCategory("");
      setImageUrls([]);
      fetchData(); // Refetch to get proper server timestamp
    } catch (error) {
      console.error("Error adding subcategory:", error);
      alert("Failed to add subcategory");
    } finally {
      setIsAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure? Products using this subcategory will lose the reference.")) return;

    try {
      await deleteDoc(doc(db, "subcategories", id));
      setSubCategories(subCategories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Failed to delete subcategory");
    }
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || "Unknown Category";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sub-Category Management</h1>
        <p className="text-gray-500 mt-1">Add or remove subcategories for specific product classification.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={onAddSubCategory} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <select
              className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isAdding}
            >
              <option value="">Select Parent Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              placeholder="Subcategory name (e.g. Jeans, Shirts, T-shirts)"
              className="flex-1 rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newSubCategory.trim() || !selectedCategory}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Sub-Category
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Category Image <span className="text-red-500">*</span></label>
            <ImageUpload
              value={imageUrls.slice(0, 1)}
              onChange={(url) => setImageUrls([url])}
              onRemove={() => setImageUrls([])}
              disabled={isAdding}
            />
            <p className="text-xs text-gray-500 mt-1">Image is mandatory for all sub-categories.</p>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Loading subcategories...</p>
          </div>
        ) : subCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Tags className="h-12 w-12 mb-4 opacity-20" />
            <p>No subcategories found. Select a category and add your first one above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subCategories.map((subCategory) => (
              <div key={subCategory.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {subCategory.image ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                      <Image src={subCategory.image} alt={subCategory.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Tags className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900 block">{subCategory.name}</span>
                    <span className="text-xs text-gray-500 italic">Parent: {getCategoryName(subCategory.categoryId)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(subCategory.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition text-gray-400"
                  title="Delete Subcategory"
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
