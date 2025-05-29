"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { fetchPostById } from "@/services/post.services";
import { IPost } from "@/types/post.type";
import { stripHtml } from "string-strip-html";
import { getWordCount } from "@/utils/editor.utils";
import TagManager from "./TagManager";
import { calculateReadingTime } from "@/utils/post.utils";
import ThumbnailPreview from "./ThumbnailPreview";
import CategoryManager from "./CategoryManager";
import { fetchById } from "../_utils/composites";
import EditableDocumentPreview from "./EditableDocumentPreview";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import { X } from "lucide-react"; // Added X icon

interface RightSidebarProps {
  toggleSidebar: () => void;
  isOpen: boolean;
  isMobile: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  toggleSidebar,
  isOpen,
  isMobile,
}) => {
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const currentContent = useEditorStore((state) => state.currentContent);

  const { data: documentData, isLoading } = useQuery<IPost | null>({
    queryKey: ["document", activeDocumentId], // Same queryKey, RQ efficiently shares this
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId,
  });

  if (isLoading) {
    return (
      <div className="flex size-full flex-col space-y-4 border-l border-border bg-background-alt p-4">
        <p className="text-sm text-muted-foreground">Loading details...</p>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex size-full flex-col space-y-4 border-l border-border bg-background-alt p-4">
        {isMobile && (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">No document selected.</p>
      </div>
    );
  }

  const { updated_at, created_at } = documentData;

  const readingLevel = 8.2;
  const sentiment = "Neutral";
  const strippedHtml = stripHtml(currentContent).result;
  const wordCount = getWordCount(strippedHtml);

  return (
    <div className="scrollbar-change flex size-full flex-col space-y-6 overflow-y-auto border-l border-border bg-background-alt p-6 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Document Details
        </h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <EditableDocumentPreview />

      <CategoryManager />

      <ThumbnailPreview />

      <TagManager />

      <div>
        <h3 className="mb-1 font-medium text-foreground">Word Count</h3>
        <p className="text-foreground-alt">{wordCount} words</p>
        <p className="text-xs text-muted-foreground">
          ~{calculateReadingTime(strippedHtml)} min read
        </p>
      </div>

      <div>
        <h3 className="mb-1 font-medium text-foreground">Last Edited</h3>
        <p className="text-foreground-alt">
          {new Date(updated_at).toLocaleString()}
        </p>
      </div>

      <div>
        <h3 className="mb-1 font-medium text-foreground">Created</h3>
        <p className="text-foreground-alt">
          {new Date(created_at).toLocaleString()}
        </p>
      </div>

      {/* <div className="mt-auto border-t border-border pt-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Document Statistics
        </h2>
        <div>
          <h3 className="mb-1 font-medium text-foreground">Reading Level</h3>
          <p className="text-foreground-alt">{readingLevel}</p>
        </div>
        <div className="mt-3">
          <h3 className="mb-1 font-medium text-foreground">Sentiment</h3>
          <p className="text-foreground-alt">{sentiment}</p>
        </div>
      </div> */}
    </div>
  );
};

export default RightSidebar;
