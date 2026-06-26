"use client";

import { useOptimistic, useTransition, useRef, useState } from "react";
import { MessageCircle, Trash2, Send } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { addBlogComment, deleteBlogComment } from "@/app/actions/blog";

export type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

interface BlogCommentsProps {
  blogId: string;
  initialComments: CommentRow[];
  currentUserId: string | null;
  isAdmin: boolean;
}

function authorName(c: CommentRow) {
  const p = c.profiles;
  if (!p) return "Community Member";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Community Member";
}

export function BlogComments({
  blogId,
  initialComments,
  currentUserId,
  isAdmin,
}: BlogCommentsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [optimisticComments, removeOptimistic] = useOptimistic(
    initialComments,
    (current: CommentRow[], id: string) => current.filter((c) => c.id !== id)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const content = (new FormData(e.currentTarget).get("content") as string) ?? "";

    startTransition(async () => {
      const result = await addBlogComment(blogId, content);
      if (result?.error) {
        setSubmitError(
          result.error === "Not authenticated"
            ? "Please sign in to comment."
            : result.error
        );
      } else {
        formRef.current?.reset();
      }
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      removeOptimistic(commentId);
      await deleteBlogComment(commentId, blogId);
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-ink-200">
      <h3 className="font-display font-bold text-xl text-ink mb-6 flex items-center gap-2">
        <MessageCircle size={20} />
        {optimisticComments.length === 1 ? "1 Comment" : `${optimisticComments.length} Comments`}
      </h3>

      {/* Comment form */}
      {currentUserId ? (
        <form ref={formRef} onSubmit={handleSubmit} className="mb-8">
          <textarea
            name="content"
            rows={3}
            maxLength={1000}
            required
            placeholder="Share your thoughts on this article…"
            className="w-full px-4 py-3 rounded-xl border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none"
          />
          {submitError && (
            <p className="mt-1 text-xs text-error font-sans">{submitError}</p>
          )}
          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={pending}
              leadingIcon={<Send size={13} />}
            >
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-ink-100 border border-ink-200 text-center">
          <p className="text-sm text-ink-500 font-sans">
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {/* List */}
      {optimisticComments.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400 font-sans">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-ink-200">
          {optimisticComments.map((c) => {
            const name = authorName(c);
            const canDelete = currentUserId === c.user_id || isAdmin;
            return (
              <div key={c.id} className="flex gap-3 py-5">
                <Avatar name={name} size="sm" className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink font-sans">{name}</span>
                      <span className="text-xs text-ink-400 font-sans">
                        {formatDate(c.created_at, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="shrink-0 text-ink-300 hover:text-error transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-ink-600 font-sans leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
