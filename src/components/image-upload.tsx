"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default1");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        return response.data?.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      urls.forEach(url => {
        if (url) onChange(url);
      });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert(`Failed to upload image. Please ensure you have an 'Unsigned' upload preset named '${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default1"}' in your Cloudinary settings.`);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value && value.length > 0 ? (
          value.map((url) => (
            <div key={url} className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
              <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Image
                fill
                className="object-cover"
                alt="Product Preview"
                src={url}
                unoptimized
              />
            </div>
          ))
        ) : null}
        
        <label className={cn(
          "flex flex-col items-center justify-center w-[200px] h-[200px] border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all bg-gray-50/50 group cursor-pointer",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}>
          <input 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={onUpload}
            disabled={disabled || isUploading}
          />
          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
            )}
          </div>
          <span className="text-sm text-gray-500 font-medium group-hover:text-blue-600">
            {isUploading ? "Uploading..." : "Upload Images"}
          </span>
          <span className="text-xs text-gray-400 mt-1">Direct Upload</span>
        </label>
      </div>
    </div>
  );
}
