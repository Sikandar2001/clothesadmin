"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImageUpload from "@/components/image-upload";
import { Save, X, Loader2 } from "lucide-react";
import { Product, Category, SubCategory, ChildSubCategory } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const COLORS = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Gray", "Navy", "Pink", "Multi"];

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childSubCategories, setChildSubCategories] = useState<ChildSubCategory[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    childSubCategory: "",
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    sku: "",
    stock: "",
    isFeatured: false,
    brand: "",
    discountPrice: "",
    returnPolicy: "",
    deliveryInfo: "",
    careInstructions: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        // Fetch categories
        const catQ = query(collection(db, "categories"), orderBy("name", "asc"));
        const catSnapshot = await getDocs(catQ);
        const catData = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        setCategories(catData);

        // Fetch subcategories
        const subCatQ = query(collection(db, "subcategories"), orderBy("name", "asc"));
        const subCatSnapshot = await getDocs(subCatQ);
        const subCatData = subCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubCategory[];
        setSubCategories(subCatData);

        // Fetch child subcategories
        const childSubCatQ = query(collection(db, "child-subcategories"), orderBy("name", "asc"));
        const childSubCatSnapshot = await getDocs(childSubCatQ);
        const childSubCatData = childSubCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChildSubCategory[];
        setChildSubCategories(childSubCatData);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        category: initialData.category || "",
        subCategory: initialData.subCategory || "",
        childSubCategory: initialData.childSubCategory || "",
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        images: initialData.images || [],
        sku: initialData.sku || "",
        stock: initialData.stock?.toString() || "",
        isFeatured: initialData.isFeatured || false,
        brand: initialData.brand || "",
        discountPrice: initialData.discountPrice?.toString() || "",
        returnPolicy: initialData.returnPolicy || "",
        deliveryInfo: initialData.deliveryInfo || "",
        careInstructions: initialData.careInstructions || "",
      });
    }
  }, [initialData]);

  // Filter subcategories based on selected category name
  const filteredSubCategories = subCategories.filter(sub => {
    const parentCat = categories.find(c => c.name === formData.category);
    return parentCat ? sub.categoryId === parentCat.id : false;
  });

  // Filter child subcategories based on selected subcategory name
  const filteredChildSubCategories = childSubCategories.filter(childSub => {
    const parentSub = subCategories.find(s => s.name === formData.subCategory && s.categoryId === categories.find(c => c.name === formData.category)?.id);
    return parentSub ? childSub.subCategoryId === parentSub.id : false;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detailed validation
    const missingFields = [];
    if (!formData.name) missingFields.push("Product Name");
    if (!formData.price) missingFields.push("Price");
    if (!formData.category) missingFields.push("Category");
    if (!formData.subCategory) missingFields.push("Subcategory");
    // childSubCategory is optional but recommended
    if (formData.images.length === 0) missingFields.push("At least one Image");

    if (missingFields.length > 0) {
      alert(`Please fill the following mandatory fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock) || 0,
        updatedAt: serverTimestamp(),
      };

      if (initialData) {
        await updateDoc(doc(db, "products", initialData.id), productData);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {initialData ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {initialData ? `Editing ${initialData.name}` : "Fill in the details for your new clothing item."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition shadow-sm"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Product
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Name *</label>
              <input
                required
                placeholder="e.g., Premium Cotton Crew Neck T-Shirt"
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <textarea
                required
                rows={5}
                placeholder="Describe the material, fit, and style..."
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Media <span className="text-red-500 text-sm">*</span></h3>
            <ImageUpload
              value={formData.images}
              onChange={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
              onRemove={(url) => setFormData({ ...formData, images: formData.images.filter((img) => img !== url) })}
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Inventory & Variants</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">SKU (Optional)</label>
                <input
                  placeholder="e.g., CLO-TSH-001"
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Available Sizes</label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition shadow-sm ${
                      formData.sizes.includes(size)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Available Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition shadow-sm ${
                      formData.colors.includes(color)
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Policies & Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Return Policy</label>
              <textarea
                rows={3}
                placeholder="e.g., 7-day easy returns if the tag is intact..."
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                value={formData.returnPolicy}
                onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Delivery Information</label>
              <textarea
                rows={3}
                placeholder="e.g., Ships within 2-3 business days..."
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                value={formData.deliveryInfo}
                onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Care Instructions</label>
              <textarea
                rows={3}
                placeholder="e.g., Hand wash cold, do not bleach..."
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                value={formData.careInstructions}
                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Discount Price ($) (Optional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Category & Organization</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <select
                required
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: "" })}
                disabled={fetchingData}
              >
                <option value="">
                  {fetchingData ? "Loading categories..." : "Select Category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {!fetchingData && categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No categories found. Please add them in the Categories page first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sub-Category *</label>
              <select
                required
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-50"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value, childSubCategory: "" })}
                disabled={fetchingData || !formData.category}
              >
                <option value="">
                  {!formData.category 
                    ? "Select category first" 
                    : fetchingData 
                      ? "Loading subcategories..." 
                      : "Select Sub-Category"
                  }
                </option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {formData.category && !fetchingData && filteredSubCategories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No subcategories found for this category.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Child Sub-Category (Optional)</label>
              <select
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:opacity-50 disabled:bg-gray-50"
                value={formData.childSubCategory}
                onChange={(e) => setFormData({ ...formData, childSubCategory: e.target.value })}
                disabled={fetchingData || !formData.subCategory}
              >
                <option value="">
                  {!formData.subCategory 
                    ? "Select sub-category first" 
                    : fetchingData 
                      ? "Loading child subcategories..." 
                      : "Select Child Sub-Category (Optional)"
                  }
                </option>
                {filteredChildSubCategories.map((child) => (
                  <option key={child.id} value={child.name}>{child.name}</option>
                ))}
              </select>
              {formData.subCategory && !fetchingData && filteredChildSubCategories.length === 0 && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  No child subcategories found.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand (Optional)</label>
              <input
                placeholder="e.g., MKSUKO Premium"
                className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 transition shadow-sm"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                Feature on homepage
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
