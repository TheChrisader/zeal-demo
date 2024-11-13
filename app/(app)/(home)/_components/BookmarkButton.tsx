"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import revalidatePathAction from "@/app/actions/revalidatePath";
import BookmarkIcon from "@/assets/svgs/utils/BookmarkIcon";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { fetcher } from "@/lib/fetcher";
import revalidateTagAction from "@/app/actions/revalidateTag";

const BookmarkButton = ({
  id,
  bookmarked,
  imageExists = true,
}: {
  id: string;
  bookmarked: boolean | null | undefined;
  imageExists?: boolean;
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isMatch, setIsMatch] = useState(false);
  const pathName = usePathname();

  const matches = useMediaQuery("(max-width: 1000px)");

  useEffect(() => {
    if (user) {
      setIsMatch(matches);
    }
  }, [matches, user]);

  if (!user) {
    return null;
  }

  const handleBookmark = async () => {
    const currentBookmarkedState = isBookmarked;
    try {
      setIsBookmarked(!isBookmarked);

      if (!isBookmarked) {
        toast.success("Bookmarked successfully");
      } else {
        toast.success("Unbookmarked successfully");
      }

      await fetcher(`/api/v1/bookmark/${id}`, {
        method: "POST",
      });

      // await revalidatePathAction("/bookmarks");
      // await revalidateTagAction(`bookmarks-${user?.id.toString()}`);

      if (pathName === "/bookmarks") {
        return;
      }
    } catch (error) {
      setIsBookmarked(currentBookmarkedState);
      toast.error("Bookmarking failed");
    }
  };

  return (
    <Button
      className={`absolute bottom-1 right-2 rounded-full bg-white p-3 shadow-lg hover:stroke-primary ${
        isBookmarked ? "stroke-primary" : ""
      } ${isMatch && imageExists ? "" : "bottom-1 right-2"}`}
      variant="unstyled"
      size="unstyled"
      onClick={handleBookmark}
    >
      <BookmarkIcon />
    </Button>
  );
};

export default BookmarkButton;
