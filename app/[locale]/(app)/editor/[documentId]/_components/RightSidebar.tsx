"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react"; // Added X icon
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { useSidebarStore } from "@/context/sidebarStore/useSidebarStore";
import { useResizeDelta } from "@/hooks/useResizeDelta";
import { fetchPostById } from "@/services/post.services";
import { IPost } from "@/types/post.type";
import { calculateReadingTime } from "@/utils/post.utils";
import CategoryManager from "./CategoryManager";
import EditableDocumentPreview from "./EditableDocumentPreview";
import ModerationNotes from "./ModerationNotes";
import TagManager from "./TagManager";
import ThumbnailPreview from "./ThumbnailPreview";
import { fetchById } from "../_utils/composites";

interface RightSidebarProps {}

const RightSidebar: React.FC<RightSidebarProps> = ({}) => {
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const wordCount = useEditorStore((state) => state.wordCount);
  const strippedHTML = useEditorStore((state) => state.strippedHTML);
  const isRightSidebarOpen = useSidebarStore(
    (state) => state.isRightSidebarOpen,
  );
  const isMobile = useSidebarStore((state) => state.isMobile);
  const setIsMobile = useSidebarStore((state) => state.setIsMobile);
  const toggleRightSidebar = useSidebarStore(
    (state) => state.toggleRightSidebar,
  );
  const { delta } = useResizeDelta();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    const handleSidebar = () => {
      if (window.innerWidth < 850 && isRightSidebarOpen && delta.width < 0)
        toggleRightSidebar();
      if (window.innerWidth > 850 && !isRightSidebarOpen && delta.width > 0)
        toggleRightSidebar();
    };

    window.addEventListener("resize", handleSidebar);
    return () => window.removeEventListener("resize", handleSidebar);
  }, [delta, isRightSidebarOpen, toggleRightSidebar]);

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

  // if (!documentData) {
  //   return (
  //     <div className="flex size-full flex-col space-y-4 border-l border-border bg-background-alt p-4">
  //       {isMobile && (
  //         <div className="flex items-center justify-end">
  //           <Button variant="ghost" size="icon" onClick={toggleRightSidebar}>
  //             <X className="size-5" />
  //           </Button>
  //         </div>
  //       )}
  //       <p className="text-sm text-muted-foreground">No document selected.</p>
  //     </div>
  //   );
  // }

  // const { updated_at, created_at } = documentData;

  const readingLevel = 8.2;
  const sentiment = "Neutral";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0, transitionEnd: { display: "none" } }}
              onClick={toggleRightSidebar}
            />
          )}
        </AnimatePresence>
      )}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: "100%" }}
            animate={{ width: isMobile ? "80%" : 256, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`shrink-0 border-l border-border bg-background-alt lg:flex lg:flex-col ${isMobile ? "fixed right-0 top-0 z-40 h-full shadow-xl" : "relative"} xl:w-72`}
            style={{ overflow: "hidden" }}
          >
            <div className="scrollbar-change flex size-full flex-col space-y-6 overflow-y-auto border-l border-border bg-background-alt p-6 text-sm">
              <div className="flex items-center justify-between">
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document Details
                </h2>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRightSidebar}
                  >
                    <X className="size-5" />
                  </Button>
                )}
              </div>

              <ModerationNotes />

              <EditableDocumentPreview />

              <CategoryManager />

              <ThumbnailPreview />

              <TagManager />

              <div>
                <h3 className="mb-1 font-medium text-foreground">Word Count</h3>
                <p className="text-foreground-alt">{wordCount} words</p>
                <p className="text-xs text-muted-foreground">
                  ~{calculateReadingTime(strippedHTML)} min read
                </p>
              </div>

              {documentData && (
                <>
                  <div>
                    <h3 className="mb-1 font-medium text-foreground">
                      Last Edited
                    </h3>
                    <p className="text-foreground-alt">
                      {new Date(documentData.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-1 font-medium text-foreground">
                      Created
                    </h3>
                    <p className="text-foreground-alt">
                      {new Date(documentData.created_at).toLocaleString()}
                    </p>
                  </div>
                </>
              )}

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
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default RightSidebar;
