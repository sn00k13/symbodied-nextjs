"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/app/actions/product";

const CATEGORIES = ["Agriculture", "Medicine", "Technology", "Textile"];
const UNITS = ["bag", "kg", "piece", "yard", "keg", "bundle", "set", "kit", "bottle", "litre", "pack"];

export default function CreateProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<"draft" | "pending">("pending");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const handleSubmit = (status: "draft" | "pending") => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitStatus(status);
    const formData = new FormData(e.currentTarget);
    formData.set("status", status);

    startTransition(async () => {
      const result = await createProduct(formData);
      if (result?.error) setError(result.error);
    });
  };

  const fieldClass = "w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
  const labelClass = "text-sm font-semibold text-ink font-sans";

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-sans font-bold text-xl text-ink mb-6">Add New Product</h2>

        <form
          onSubmit={handleSubmit(submitStatus)}
          className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Product Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Premium Abakaliki Rice — 50kg bag"
              required
              className={fieldClass}
            />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select name="category" defaultValue="" required
                  className={`${fieldClass} appearance-none pr-9`}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Unit</label>
              <div className="relative">
                <select name="unit" defaultValue="" required
                  className={`${fieldClass} appearance-none pr-9`}>
                  <option value="" disabled>Select unit</option>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
              </div>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Price (₦)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Stock Quantity</label>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                required
                className={fieldClass}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Location <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <input
              name="location"
              type="text"
              placeholder="e.g. Abakaliki, Ebonyi"
              className={fieldClass}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Description <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe your product — provenance, quality, how it's made…"
              className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {/* Image */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              Product Image <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                className="h-20 w-20 rounded-lg border border-ink-200 flex items-center justify-center bg-ink-100 overflow-hidden shrink-0 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                {thumbnail ? (
                  <img src={thumbnail} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-ink-400" />
                )}
              </div>
              <input
                ref={fileRef}
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={<Upload size={14} />}
                onClick={() => fileRef.current?.click()}
              >
                {thumbnail ? "Change Image" : "Upload Image"}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-error font-sans">{error}</p>}

          <p className="text-xs text-ink-400 font-sans">
            Submitted products are reviewed by an admin before appearing in the marketplace.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => router.push("/studio/products")}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={pending && submitStatus === "draft"}
              leadingIcon={<Save size={14} />}
              onClick={() => setSubmitStatus("draft")}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={pending && submitStatus === "pending"}
              leadingIcon={<Send size={14} />}
              onClick={() => setSubmitStatus("pending")}
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
