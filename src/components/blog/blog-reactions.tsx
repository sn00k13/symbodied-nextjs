"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toggleBlogLike } from "@/app/actions/blog";

interface BlogReactionsProps {
  blogId: string;
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
  isAuthenticated: boolean;
}

export function BlogReactions({
  blogId,
  likes: initLikes,
  dislikes: initDislikes,
  userVote: initVote,
  isAuthenticated,
}: BlogReactionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    likes: initLikes,
    dislikes: initDislikes,
    vote: initVote,
  });

  const handleVote = (type: "like" | "dislike") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Optimistic update
    setState((prev) => {
      const removing = prev.vote === type;
      const switching = prev.vote !== null && prev.vote !== type;
      return {
        likes:
          type === "like"
            ? removing
              ? prev.likes - 1
              : prev.likes + 1
            : switching
            ? prev.likes - 1
            : prev.likes,
        dislikes:
          type === "dislike"
            ? removing
              ? prev.dislikes - 1
              : prev.dislikes + 1
            : switching
            ? prev.dislikes - 1
            : prev.dislikes,
        vote: removing ? null : type,
      };
    });

    startTransition(async () => {
      const result = await toggleBlogLike(blogId, type);
      if (result?.error) {
        // Roll back on error
        setState({ likes: initLikes, dislikes: initDislikes, vote: initVote });
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote("like")}
        disabled={pending}
        aria-label="Like this post"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-sans border transition-colors disabled:opacity-60",
          state.vote === "like"
            ? "bg-brand text-white border-brand"
            : "bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand"
        )}
      >
        <ThumbsUp size={15} />
        {state.likes}
      </button>

      <button
        onClick={() => handleVote("dislike")}
        disabled={pending}
        aria-label="Dislike this post"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-sans border transition-colors disabled:opacity-60",
          state.vote === "dislike"
            ? "bg-error text-white border-error"
            : "bg-white text-ink-600 border-ink-200 hover:border-error hover:text-error"
        )}
      >
        <ThumbsDown size={15} />
        {state.dislikes}
      </button>

      {!isAuthenticated && (
        <span className="text-xs text-ink-400 font-sans">Sign in to react</span>
      )}
    </div>
  );
}
