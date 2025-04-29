"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useActionHandler from "../_context/action-handler/useActionHandler";
import { useState, useEffect } from "react"; // Import useEffect
import { createPost } from "@/services/post.services";
import { createDraft, updateDraft } from "@/services/draft.services";
import { useRouter } from "@/app/_components/useRouter";
import { usePathname } from "@/i18n/routing";
import { toast } from "sonner";

const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

function ConfirmationModal({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "publish" | "draft";
}) {
  const {
    file,
    publishPayload,
    draftPayload,
    title,
    category,
    isLoading, // Get from context
    setIsLoading, // Get from context
    error, // Get from context
    setError, // Get from context
  } = useActionHandler();
  const id = usePathname().split("/").pop();
  // const [isLoading, setIsLoading] = useState(false); // Remove local state
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Effect to show error toast
  useEffect(() => {
    if (error) {
      toast.error("Something went wrong");
      setError(null); // Clear error after showing toast
    }
  }, [error, setError, toast]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      if (type === "publish") {
        if (
          !title ||
          !category /* || !stripHtmlTags(publishPayload as string) */
        ) {
          setError("Title and category are required for publishing.");
          setIsLoading(false);
          return;
        }

        const post = await createPost({
          title: title,
          content: publishPayload as string,
          category: category,
          image: file || undefined,
        });

        router.push(`/post/${post.slug}`);
        setOpen(false); // Close modal on success
      } else {
        if (!title || !category || !stripHtmlTags(draftPayload as string)) {
          setError(
            "Title, category, and content are required for saving a draft.",
          );
          setIsLoading(false);
          return;
        }
        if (!id || id === "write") {
          await createDraft({
            title: title,
            content: draftPayload as string,
            category: category,
            image: file || undefined,
          });
        } else {
          await updateDraft(id, {
            title: title,
            content: draftPayload as string,
            category: category,
            image: file || undefined,
          });
        }
        router.push("/drafts");
        setOpen(false); // Close modal on success
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setError(`Failed to ${type}. Please try again.`); // Set error state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {/* <Button variant="outline">Show Dialog</Button> */}
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "publish" ? "Publish Post" : "Save to your drafts"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === "publish"
              ? "Are you sure you want to publish this post?"
              : "Are you sure you want to save this draft?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>{" "}
          {/* Disable cancel when loading */}
          <AlertDialogAction
            onClick={handleSubmit} // Directly call handleSubmit
            disabled={isLoading} // Disable button when loading
          >
            {isLoading
              ? type === "publish"
                ? "Publishing..."
                : "Saving..."
              : type === "publish"
                ? "Publish"
                : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationModal;
