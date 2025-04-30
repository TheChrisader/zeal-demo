"use client";
import { useEffect, useState } from "react"; // Import useEffect
import { toast } from "sonner";
import { useRouter } from "@/app/_components/useRouter";
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
import { usePathname } from "@/i18n/routing";
import { createDraft, updateDraft } from "@/services/draft.services";
import { createPost } from "@/services/post.services";
import useActionHandler from "../_context/action-handler/useActionHandler";

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
    description, // Add description
    category,
    isPublishLoading, // Get from context
    isDraftLoading, // Get from context
    setIsPublishLoading, // Get from context
    setIsDraftLoading, // Get from context
    draftError, // Get from context
    publishError, // Get from context
    setPublishError, // Get from context
    setDraftError, // Get from context
  } = useActionHandler();
  const id = usePathname().split("/").pop();
  // const [isLoading, setIsLoading] = useState(false); // Remove local state
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Effect to show error toast
  useEffect(() => {
    if (draftError) {
      toast.error("Something went wrong");
      setDraftError(null); // Clear error after showing toast
    } else if (publishError) {
      toast.error("Something went wrong");
      setPublishError(null); // Clear error after showing toast
    }
  }, [setDraftError, setPublishError, toast]);

  const handleSubmit = async () => {
    try {
      console.log("work");
      if (type === "publish") {
        setIsPublishLoading(true);
        setPublishError(null); // Clear previous errors
        if (
          !title ||
          !description || // Add description validation
          !category /* || !stripHtmlTags(publishPayload as string) */
        ) {
          setPublishError(
            "Title, description, and category are required for publishing.",
          );
          setIsPublishLoading(false);
          return;
        }

        const post = await createPost({
          title: title,
          content: publishPayload as string,
          description: description || "", // Add description
          category: category,
          image: file || undefined,
        });

        router.push(`/post/${post.slug}`);
        setOpen(false); // Close modal on success
      } else {
        console.log("work2");
        setIsDraftLoading(true);
        setDraftError(null); // Clear previous errors
        console.log("work3");
        if (
          !title ||
          !description ||
          !category
          // ||
          // !stripHtmlTags(draftPayload as string)
        ) {
          // Add description validation
          console.log("work4");
          setDraftError(
            "Title, description, category, and content are required for saving a draft.",
          );
          setIsDraftLoading(false);
          return;
        }
        if (!id || id === "write") {
          console.log("work5");
          await createDraft({
            title: title,
            content: draftPayload as string,
            description: description, // Add description
            category: category,
            image: file || undefined,
          });
        } else {
          await updateDraft(id, {
            title: title,
            content: draftPayload as string,
            description: description || "", // Add description
            category: category,
            image: file || undefined,
          });
        }
        router.push("/drafts");
        setOpen(false); // Close modal on success
      }
    } catch (err: unknown) {
      console.error("Submission error:", err);
      if (type === "publish") {
        setPublishError(`Failed to ${type}. Please try again.`); // Set error state
      } else if (type === "draft") {
        setDraftError(`Failed to ${type}. Please try again.`); // Set error state
      }
    } finally {
      setIsDraftLoading(false);
      setIsPublishLoading(false);
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
          <AlertDialogCancel disabled={isPublishLoading || isDraftLoading}>
            Cancel
          </AlertDialogCancel>{" "}
          {/* Disable cancel when loading */}
          <AlertDialogAction
            onClick={handleSubmit} // Directly call handleSubmit
            disabled={isPublishLoading || isDraftLoading} // Disable button when loading
          >
            {isPublishLoading || isDraftLoading
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
