"use client";
import revalidatePathAction from "@/app/actions/revalidatePath";
import SendIcon from "@/assets/svgs/utils/SendIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export default function CommentInput({ articleId }: { articleId: string }) {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const commentRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const handleComment = async () => {
    if (value) {
      try {
        setIsLoading(true);
        const comment = {
          content: value,
          article_id: articleId,
          user_id: user?.id,
          parent_id: null,
        };

        const response = await fetch("/api/v1/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comment),
        });

        setValue("");

        if (commentRef.current) {
          commentRef.current.value = "";
        }

        revalidatePathAction(`/post/${articleId}`);
      } catch (error) {
        console.log(error);
        // @ts-expect-error TODO
        if (error.status === 500) toast.error("Something went wrong");
        // @ts-expect-error TODO
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <label className="flex w-full gap-2 rounded-md border border-input bg-background px-3 py-2">
      <Textarea
        id="comment"
        name="comment"
        placeholder="Write a comment..."
        className="h-28 min-h-12 border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={(e) => setValue(e.target.value)}
        ref={commentRef}
      />
      <Button
        variant={"unstyled"}
        size={"unstyled"}
        disabled={!value.trim()}
        onClick={handleComment}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <SendIcon
            className={`${value.trim() ? "[&>path]:fill-primary" : ""}`}
          />
        )}
      </Button>
    </label>
  );
}
