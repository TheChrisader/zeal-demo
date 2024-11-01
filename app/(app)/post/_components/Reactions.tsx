"use client";

import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";
import { fetcher } from "@/lib/fetcher";
import { CircleCheckBig, CircleX, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Reactions = ({
  postID,
  reaction,
}: {
  postID: string;
  reaction: { like?: boolean; dislike?: boolean };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (reaction.like || reaction.dislike) {
      setCurrentReaction(
        reaction.like ? "like" : reaction.dislike ? "dislike" : null,
      );
    }
  }, [reaction]);

  if (!user) return null;

  const handleLike = async () => {
    const oldReaction = currentReaction;
    try {
      setIsLoading(true);
      if (currentReaction === "like") {
        setCurrentReaction(null);
      } else {
        setCurrentReaction("like");
      }

      toast.success(
        currentReaction === "like" ? "Like removed." : "Post liked!",
        {
          icon: <CircleCheckBig className="stroke-primary" />,
          classNames: {
            toast: "flex gap-4 items-center w-fit",
          },
        },
      );

      await fetcher(`/api/v1/like/${postID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await fetcher(`/api/v1/dislike/${postID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error("Error liking post.", {
        icon: <CircleX className="stroke-destructive" />,
        classNames: {
          toast: "flex gap-4 items-center w-fit",
        },
      });

      setCurrentReaction(oldReaction);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    try {
      setIsLoading(true);

      if (currentReaction === "dislike") {
        setCurrentReaction(null);
      } else {
        setCurrentReaction("dislike");
      }

      toast.success(
        currentReaction === "dislike" ? "Dislike removed." : "Post disliked!",
        {
          icon: <CircleCheckBig className="stroke-primary" />,
          classNames: {
            toast: "flex gap-4 items-center w-fit",
          },
        },
      );

      await fetcher(`/api/v1/dislike/${postID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await fetcher(`/api/v1/like/${postID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error("Error disliking post.", {
        icon: <CircleX className="stroke-destructive" />,
        classNames: {
          toast: "flex gap-4 items-center w-fit",
        },
      });

      setCurrentReaction(null);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-5">
      <Button
        variant="unstyled"
        className={`p-0 text-[#696969] hover:bg-transparent has-[svg]:hover:text-[#2F2D32]`}
        onClick={handleLike}
      >
        <ThumbsUp
          className={` ${currentReaction === "like" && "text-blue-500"}`}
        />
      </Button>
      <Button
        variant="unstyled"
        className={`p-0 text-[#696969] hover:bg-transparent has-[svg]:hover:text-[#2F2D32]`}
        onClick={handleDislike}
      >
        <ThumbsDown
          className={` ${currentReaction === "dislike" && "text-blue-500"}`}
        />
      </Button>
    </div>
  );
};

export default Reactions;
