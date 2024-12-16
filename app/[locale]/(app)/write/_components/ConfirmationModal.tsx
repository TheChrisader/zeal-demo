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
import { useState } from "react";
import { createPost } from "@/services/post.services";
import { createDraft, updateDraft } from "@/services/draft.services";
import { useRouter } from "@/app/_components/useRouter";
import { usePathname } from "@/i18n/routing";

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
  const { file, publishPayload, draftPayload, title, category } =
    useActionHandler();
  const id = usePathname().split("/").pop();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (type === "publish") {
        if (!title || !category || !stripHtmlTags(publishPayload as string))
          return;

        const post = await createPost({
          title: title,
          content: publishPayload as string,
          category: category,
          image: file || undefined,
        });

        const postID = post._id?.toString();
        router.push(`/post/${postID}`);
      } else {
        console.log(title, category, stripHtmlTags(draftPayload as string));
        if (!title || !category || !stripHtmlTags(draftPayload as string))
          return;
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
      }
    } catch (error) {
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await handleSubmit();
            }}
          >
            {type === "publish" ? "Publish" : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationModal;
