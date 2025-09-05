"use client";

import { useIsMutating, useQuery } from "@tanstack/react-query";
import { User } from "lucia";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pen,
  Pencil,
} from "lucide-react";
import React, { useState } from "react";

import { toast } from "sonner";
import { stripHtml } from "string-strip-html";
import { useRouter } from "@/app/_components/useRouter";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { useSidebarStore } from "@/context/sidebarStore/useSidebarStore";
import { useAuth } from "@/hooks/useAuth";
import { pushDraftForApproval } from "@/services/draft.services";
import { createPost } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import EditableDocumentTitle from "./EditableDocumentTitle";
import { fetchById } from "../_utils/composites";

interface TopbarProps {}

const Topbar: React.FC<TopbarProps> = ({}) => {
  const { user } = useAuth();
  const isMutating = useIsMutating();
  const [isPublishing, setIsPublishing] = useState(false);
  const isLeftSidebarOpen = useSidebarStore((state) => state.isLeftSidebarOpen);
  const isRightSidebarOpen = useSidebarStore(
    (state) => state.isRightSidebarOpen,
  );
  const toggleLeftSidebar = useSidebarStore((state) => state.toggleLeftSidebar);
  const toggleRightSidebar = useSidebarStore(
    (state) => state.toggleRightSidebar,
  );
  const wordCount = useEditorStore((state) => state.wordCount);
  const isContentUpdating = useEditorStore((state) => state.isContentUpdating);
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const {
    data: documentData,
    isLoading,
    isError,
    error,
  } = useQuery<IPost | IDraft | null, Error>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId,
  });
  const router = useRouter();

  const validateBeforePublish = async (doc: IPost) => {
    if (!doc.title.trim()) {
      toast.error(`Title is required.`);
      return;
    }
    if (doc.title.trim() === "Untitled Document") {
      toast.error(
        `Your current title is "Untitled Document". Please change it.`,
      );
      return;
    }
    if (!doc.content || !stripHtml(doc.content?.trim()).result?.trim()) {
      toast.error(`Content is required.`);
      return;
    }
    if (!doc.description || !doc.description.trim()) {
      toast.error(`Preview is required.`);
      return;
    }
    if (doc.category.length === 0) {
      toast.error(`Category is required.`);
      return;
    }

    setIsPublishing(true);
    try {
      if (user?.role === "freelance_writer") {
        const post = await pushDraftForApproval(doc._id?.toString() as string);
        toast.success(`Your post has been pushed for approval successfully.`);
        router.push(`/awaiting_approval/${post._id}`);
      } else {
        const post = await createPost(doc);
        toast.success(`Your post has been published successfully.`);
        router.push(`/published/${post._id}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Something went wrong. Please try again.`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between space-x-6 border-b border-border bg-background p-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLeftSidebar}
          className="md:hidden"
        >
          <Menu className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLeftSidebar}
          className="hidden md:inline-flex"
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
        <EditableDocumentTitle />
      </div>

      {/* Right side: Actions (e.g., Word Count, Share, Publish) */}
      <div className="flex items-center space-x-1 md:space-x-4">
        <span className="hidden gap-2 whitespace-nowrap text-sm text-muted-foreground md:flex">
          {`${wordCount} words`}
          <LoadingSpinner size={16} isLoading={isContentUpdating} />
        </span>
        <button
          disabled={
            isMutating > 0 ||
            documentData?.published ||
            (documentData as IDraft)?.moderationStatus ===
              "awaiting_approval" ||
            (documentData as IDraft)?.moderationStatus === "published"
          }
          onClick={() => validateBeforePublish(documentData as IPost)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="hidden md:inline">
            {isPublishing ? "Publishing..." : "Publish"}
          </span>
          <Pencil size={16} className="md:hidden" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRightSidebar}
          className="hidden lg:inline-flex"
        >
          {isRightSidebarOpen ? (
            <PanelRightClose className="size-5" />
          ) : (
            <PanelRightOpen className="size-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRightSidebar}
          className="lg:hidden"
        >
          <Menu className="size-5" />{" "}
          {/* Or a different icon for mobile right toggle if needed */}
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
