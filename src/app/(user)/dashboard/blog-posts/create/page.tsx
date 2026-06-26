"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBlogPost } from "@/app/actions/blog";

const CATEGORIES = ["Agriculture", "Medicine", "Technology", "Textile"];

export default function CreateBlogPostPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createBlogPost(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink font-sans">Title</label>
            <input
              name="title"
              type="text"
              placeholder="Enter your title"
              required
              className="w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink font-sans">Category</label>
            <div className="relative">
              <select
                name="category"
                defaultValue=""
                required
                className="w-full h-11 px-4 pr-9 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white appearance-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink font-sans">
              Excerpt <span className="font-normal text-ink-400">(optional — shown on the blog listing)</span>
            </label>
            <textarea
              name="excerpt"
              rows={2}
              maxLength={220}
              placeholder="A short summary of your post…"
              className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {/* Thumbnail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink font-sans">
              Thumbnail Image <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div
                className="h-16 w-16 rounded-lg border border-ink-200 flex items-center justify-center bg-ink-100 overflow-hidden shrink-0 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                {thumbnail ? (
                  <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
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

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink font-sans">Content</label>
            <textarea
              name="content"
              rows={12}
              required
              placeholder="Write your article here…"
              className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-error font-sans">{error}</p>
          )}

          <p className="text-xs text-ink-400 font-sans">
            Your post will be reviewed by an admin before it appears publicly.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/blog-posts")}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={pending}
              leadingIcon={<Send size={14} />}
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
