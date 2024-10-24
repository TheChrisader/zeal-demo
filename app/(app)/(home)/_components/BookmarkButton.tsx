"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import BookmarkIcon from "@/assets/svgs/utils/BookmarkIcon";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import useAuth from "@/context/auth/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toast } from "sonner";

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
  }, [matches]);

  if (!user) {
    return <></>;
  }

  const handleBookmark = async () => {
    const currentBookmarkedState = isBookmarked;
    try {
      setIsBookmarked(!isBookmarked);

      await fetcher(`/api/v1/bookmark/${id}`, {
        method: "POST",
      });

      await revalidatePathAction("/bookmarks");

      toast.success("Bookmarked successfully");

      if (pathName === "/bookmarks") {
        return;
      }
    } catch (error) {
      setIsBookmarked(currentBookmarkedState);
      console.log(error);
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
