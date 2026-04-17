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
  Timestamp,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash, Loader2, Tags, Layers } from "lucide-react";
import { Category, SubCategory, ChildSubCategory } from "@/types";
import ImageUpload from "@/components/image-upload";
import Image from "next/image";

export default function ChildSubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childSubCategories, setChildSubCategories] = useState<ChildSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChildSubCategory, setNewChildSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const catQuery = query(collection(db, "categories"), orderBy("name", "asc"));
      const catSnap = await getDocs(catQuery);
      const catData = catSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(catData);

      // Fetch all subcategories
      const subCatQuery = query(collection(db, "subcategories"), orderBy("name", "asc"));
      const subCatSnap = await getDocs(subCatQuery);
      const subCatData = subCatSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubCategory[];
      setSubCategories(subCatData);

      // Fetch child subcategories
      const childSubCatQuery = query(collection(db, "child-subcategories"), orderBy("createdAt", "desc"));
      const childSubCatSnap = await getDocs(childSubCatQuery);
      const childSubCatData = childSubCatSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChildSubCategory[];
      setChildSubCategories(childSubCatData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.categoryId === selectedCategory
  );

  const onAddChildSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildSubCategory.trim() || !selectedSubCategory) {
      alert("Please enter child subcategory name and select a parent sub-category.");
      return;
    }

    if (imageUrls.length === 0) {
      alert("Please upload a child sub-category image.");
      return;
    }

    try {
      setIsAdding(true);
      const docRef = await addDoc(collection(db, "child-subcategories"), {
        name: newChildSubCategory.trim(),
        subCategoryId: selectedSubCategory,
        image: imageUrls[0],
        createdAt: serverTimestamp()
      });
      
      const newlyAdded: ChildSubCategory = {
        id: docRef.id,
        name: newChildSubCategory.trim(),
        subCategoryId: selectedSubCategory,
        image: imageUrls[0],
        createdAt: Timestamp.now() as any
      };

      setChildSubCategories([newlyAdded, ...childSubCategories]);
      setNewChildSubCategory("");
      setImageUrls([]);
      fetchData(); // Refetch to get proper server timestamp
    } catch (error) {
      console.error("Error adding child subcategory:", error);
      alert("Failed to add child subcategory");
    } finally {
      setIsAdding(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure? Products using this child subcategory will lose the reference.")) return;

    try {
      await deleteDoc(doc(db, "child-subcategories", id));
      setChildSubCategories(childSubCategories.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting child subcategory:", error);
      alert("Failed to delete child subcategory");
    }
  };

  const getSubCategoryName = (id: string) => {
    const sub = subCategories.find(s => s.id === id);
    if (!sub) return "Unknown Sub-Category";
    const cat = categories.find(c => c.id === sub.categoryId);
    return `${sub.name} (${cat?.name || "Unknown Category"})`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Child Sub-Category Management</h1>
        <p className="text-gray-500 mt-1">Add or remove nested subcategories (Level 3) for specific product classification.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={onAddChildSubCategory} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory(""); // Reset subcategory when category changes
              }}
              disabled={isAdding}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:bg-gray-50"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={isAdding || !selectedCategory}
            >
              <option value="">Select Sub-Category</option>
              {filteredSubCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>

            <input
              placeholder="Child Subcategory name (e.g. Skinny Jeans, Slim Fit)"
              className="lg:col-span-1 rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={newChildSubCategory}
              onChange={(e) => setNewChildSubCategory(e.target.value)}
              disabled={isAdding}
            />

            <button
              type="submit"
              disabled={isAdding || !newChildSubCategory.trim() || !selectedSubCategory}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Child Sub-Category
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child Sub-Category Image <span className="text-red-500">*</span></label>
            <ImageUpload
              value={imageUrls.slice(0, 1)}
              onChange={(url) => setImageUrls([url])}
              onRemove={() => setImageUrls([])}
              disabled={isAdding}
            />
            <p className="text-xs text-gray-500 mt-1">Image is mandatory for all child sub-categories.</p>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p>Loading child subcategories...</p>
          </div>
        ) : childSubCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Layers className="h-12 w-12 mb-4 opacity-20" />
            <p>No child subcategories found. Select a sub-category and add your first one above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {childSubCategories.map((childSub) => (
              <div key={childSub.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {childSub.image ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                      <Image src={childSub.image} alt={childSub.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900 block">{childSub.name}</span>
                    <span className="text-xs text-gray-500 italic">Parent Sub: {getSubCategoryName(childSub.subCategoryId)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(childSub.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition text-gray-400"
                  title="Delete Child Subcategory"
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
