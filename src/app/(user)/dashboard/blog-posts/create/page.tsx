"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload, Send, Loader2, X, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { createBlogPost } from "@/app/actions/blog";
import { getCloudinarySignature } from "@/app/actions/cloudinary";
import { toast } from "sonner";

const CATEGORIES = ["Agriculture", "Medicine", "Technology", "Textile"];

interface PreviewData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
}

export default function CreateBlogPostPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Close preview on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowPreview(false);
  }, []);

  useEffect(() => {
    if (showPreview) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showPreview, handleKeyDown]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setImageUrl(null);
    setUploading(true);

    try {
      const { signature, timestamp, cloudName, apiKey } =
        await getCloudinarySignature("symbodied/blogs");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("signature", signature);
      fd.append("timestamp", String(timestamp));
      fd.append("api_key", apiKey);
      fd.append("folder", "symbodied/blogs");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch {
      toast.error("Image upload failed. You can still submit without an image.");
      setPreview(null);
      setImageUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImageUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleOpenPreview = () => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    setPreviewData({
      title: (fd.get("title") as string)?.trim() || "",
      category: (fd.get("category") as string)?.trim() || "",
      excerpt: (fd.get("excerpt") as string)?.trim() || "",
      content: (fd.get("content") as string)?.trim() || "",
    });
    setShowPreview(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (imageUrl) formData.set("image_url", imageUrl);

    startTransition(async () => {
      const result = await createBlogPost(formData);
      if (result?.error) setError(result.error);
    });
  };

  const handleSubmitFromPreview = () => {
    setShowPreview(false);
    formRef.current?.requestSubmit();
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <>
      {/* ── Form ── */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-[#162018] rounded-xl border border-ink-200 dark:border-[#263a2b] p-6 flex flex-col gap-5">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink dark:text-[#dceee3] font-sans">Title</label>
              <input
                name="title"
                type="text"
                placeholder="Enter your title"
                required
                className="w-full h-11 px-4 rounded-lg border border-ink-200 dark:border-[#263a2b] font-sans text-sm text-ink dark:text-[#dceee3] bg-white dark:bg-[#1b2d20] placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink dark:text-[#dceee3] font-sans">Category</label>
              <div className="relative">
                <select
                  name="category"
                  defaultValue=""
                  required
                  className="w-full h-11 px-4 pr-9 rounded-lg border border-ink-200 dark:border-[#263a2b] font-sans text-sm text-ink dark:text-[#dceee3] bg-white dark:bg-[#1b2d20] appearance-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
              </div>
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink dark:text-[#dceee3] font-sans">
                Excerpt <span className="font-normal text-ink-400">(optional — shown on the blog listing)</span>
              </label>
              <textarea
                name="excerpt"
                rows={2}
                maxLength={220}
                placeholder="A short summary of your post…"
                className="w-full px-4 py-3 rounded-lg border border-ink-200 dark:border-[#263a2b] font-sans text-sm text-ink dark:text-[#dceee3] bg-white dark:bg-[#1b2d20] placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink dark:text-[#dceee3] font-sans">
                Thumbnail Image <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="relative h-16 w-16 rounded-lg border border-ink-200 dark:border-[#263a2b] flex items-center justify-center bg-ink-100 dark:bg-[#1b2d20] overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => !uploading && fileRef.current?.click()}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Thumbnail preview" className="h-full w-full object-cover" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 size={18} className="text-white animate-spin" />
                        </div>
                      )}
                    </>
                  ) : (
                    <ImageIcon size={24} className="text-ink-400" />
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leadingIcon={uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading…" : preview ? "Change" : "Upload Image"}
                  </Button>
                  {preview && !uploading && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </div>
              {imageUrl && (
                <p className="text-xs text-success-green font-sans">✓ Image uploaded successfully</p>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink dark:text-[#dceee3] font-sans">Content</label>
              <textarea
                name="content"
                rows={12}
                required
                placeholder="Write your article here…"
                className="w-full px-4 py-3 rounded-lg border border-ink-200 dark:border-[#263a2b] font-sans text-sm text-ink dark:text-[#dceee3] bg-white dark:bg-[#1b2d20] placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
              />
            </div>

            {error && <p className="text-sm text-error font-sans">{error}</p>}

            <p className="text-xs text-ink-400 font-sans">
              Your post will be reviewed by an admin before it appears publicly.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/blog-posts")}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                leadingIcon={<Eye size={14} />}
                onClick={handleOpenPreview}
                disabled={uploading}
              >
                Preview
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={pending}
                disabled={uploading}
                leadingIcon={<Send size={14} />}
              >
                Submit for Review
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && previewData && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
        >
          <div className="relative w-full max-w-2xl my-8 mx-4 bg-white dark:bg-[#162018] rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white dark:bg-[#162018] border-b border-ink-200 dark:border-[#263a2b]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-ink-400 dark:text-[#4d6356] font-sans">Draft Preview</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-light text-gold-dark font-sans">
                  Not yet published
                </span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-[#1b2d20] dark:text-[#89a895] transition-colors"
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview content */}
            <div className="px-8 pb-8">

              {/* Thumbnail */}
              {(preview || imageUrl) && (
                <div className="mt-6">
                  <div className="relative h-[280px] rounded-xl overflow-hidden">
                    <img
                      src={imageUrl ?? preview ?? ""}
                      alt={previewData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                  </div>
                </div>
              )}

              <article className={preview || imageUrl ? "pt-8" : "pt-8"}>

                {previewData.category && (
                  <Badge tone="brand" className="mb-5">{previewData.category}</Badge>
                )}

                <h1 className="font-display font-bold text-3xl text-ink dark:text-[#dceee3] leading-tight tracking-tight mb-6">
                  {previewData.title || <span className="text-ink-400 italic">No title yet…</span>}
                </h1>

                <div className="flex items-center gap-4 pb-6 border-b border-ink-200 dark:border-[#263a2b] mb-7">
                  <Avatar name="You" size="md" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-ink dark:text-[#dceee3] font-sans">You</div>
                    <div className="text-xs text-ink-500 dark:text-[#668074] font-sans">{today} · Draft</div>
                  </div>
                </div>

                <div className="space-y-5 font-sans text-ink-600 dark:text-[#89a895] leading-[1.8]">
                  {previewData.excerpt && (
                    <p className="text-lg text-ink-700 dark:text-[#b0cbb8] font-medium leading-relaxed">
                      {previewData.excerpt}
                    </p>
                  )}
                  {previewData.content ? (
                    <div className="whitespace-pre-wrap text-sm">{previewData.content}</div>
                  ) : (
                    <p className="text-ink-400 italic">No content yet…</p>
                  )}
                </div>
              </article>
            </div>

            {/* Modal action bar */}
            <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#162018] border-t border-ink-200 dark:border-[#263a2b]">
              <button
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center gap-1.5 text-sm text-ink-500 dark:text-[#89a895] hover:text-brand dark:hover:text-brand font-sans transition-colors"
              >
                <ArrowLeft size={14} /> Back to Edit
              </button>
              <Button
                variant="primary"
                loading={pending}
                leadingIcon={<Send size={14} />}
                onClick={handleSubmitFromPreview}
              >
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
