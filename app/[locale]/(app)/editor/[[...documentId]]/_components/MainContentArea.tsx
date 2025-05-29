"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Content } from "@tiptap/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/components/custom/Editor";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import { fetchPostById, updatePostById } from "@/services/post.services";
import { IPost } from "@/types/post.type";
import { fetchById, updateById } from "../_utils/composites";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { toast } from "sonner";

interface MainContentAreaProps {}

const DEBOUNCE_DELAY = 1500; // 1.5 seconds

const MainContentArea: React.FC<MainContentAreaProps> = ({}) => {
  const queryClient = useQueryClient();
  const currentContent = useEditorStore((state) => state.currentContent);
  const setCurrentContent = useEditorStore((state) => state.setCurrentContent);
  const setIsContentUpdating = useEditorStore(
    (state) => state.setIsContentUpdating,
  );
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);

  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);
  const hasUserMadeChangesRef = useRef(hasUserMadeChanges);

  useEffect(() => {
    hasUserMadeChangesRef.current = hasUserMadeChanges;
  }, [hasUserMadeChanges]);

  const {
    data: documentData,
    isLoading: isLoadingDocument,
    isError: isDocumentError,
    error: documentError,
  } = useQuery<IPost | null, Error>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId,
  });

  // Effect to load fetched document content into the Zustand store or clear it
  useEffect(() => {
    let newContentToSet: string | undefined = undefined;
    let shouldResetDirtyFlag = false;

    if (activeDocumentId) {
      if (!isLoadingDocument && !isDocumentError && documentData) {
        const contentFromServer = documentData.content || "";
        if (contentFromServer !== currentContent) {
          newContentToSet = contentFromServer;
        }
        shouldResetDirtyFlag = true; // Reset flag because we are syncing with server data
      }
    } else {
      // No active document
      if (currentContent !== "") {
        newContentToSet = "";
      }
      shouldResetDirtyFlag = true; // Reset flag because we are clearing content
    }

    if (newContentToSet !== undefined) {
      setCurrentContent(newContentToSet);
    }
    if (shouldResetDirtyFlag) {
      setHasUserMadeChanges(false);
    }
  }, [activeDocumentId]);

  const updateMutation = useMutation({
    mutationFn: (content: string) => {
      return updateById(
        activeDocumentId as string,
        { content },
        documentData?.published || false,
      );
    },

    onMutate: () => {
      setIsContentUpdating(true);
    },
    onSuccess: (updatedPost) => {
      setHasUserMadeChanges(false);
      // Optionally, inform user of successful save (e.g., via toast)
      // Invalidate and refetch the document query to ensure data consistency
      if (updatedPost && activeDocumentId) {
        queryClient.setQueryData(["document", activeDocumentId], updatedPost);
      }
      // Or, if the mutation returns the updated post, update the cache directly:
      // queryClient.setQueryData(["document", activeDocumentId], data);
    },
    onError: (error) => {
      console.error("Failed to save content for doc:", activeDocumentId, error);
      toast.error(`Failed to save content for doc: ${activeDocumentId}`);
      // Handle error (e.g., show toast to user)
      // Do not reset hasUserMadeChanges on error, so user knows content is still "dirty"
    },
    onSettled: () => {
      setIsContentUpdating(false);
    },
  });

  // Callback for the actual save operation
  //   const internalSaveContent = useCallback(
  //     async (contentToSave: string) => {
  //       if (!activeDocumentId || !hasUserMadeChangesRef.current) {
  //         return;
  //       }
  //       updateMutation.mutate(contentToSave);
  //     },
  //     [activeDocumentId, updateMutation],
  //   );
  const internalSaveContent = async (contentToSave: string) => {
    if (!activeDocumentId || !hasUserMadeChangesRef.current) {
      return;
    }
    console.log(`Saving content for doc: ${activeDocumentId}`);
    updateMutation.mutate(contentToSave);
  };

  // Debounced save function using the custom hook
  const debouncedSave = useDebouncedCallback(
    internalSaveContent,
    DEBOUNCE_DELAY,
  );

  if (isLoadingDocument && activeDocumentId)
    return <div className="h-full bg-white p-6">Loading content...</div>;
  if (isDocumentError && activeDocumentId)
    return (
      <div className="h-full bg-white p-6">Error: {documentError?.message}</div>
    );

  if (!activeDocumentId) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Your document is being generated. It may take a few seconds to ...
        </p>
      </div>
    );
  }

  const handleEditorChange = (newContentString: Content) => {
    const newContent = newContentString as string;
    setCurrentContent(newContent); // Update store immediately

    if (!hasUserMadeChanges) {
      console.log(
        `Setting hasUserMadeChanges to true for doc: ${activeDocumentId}`,
      );
      setHasUserMadeChanges(true);
    }
    debouncedSave(newContent);
  };

  return (
    <div className="flex-1">
      <RichTextEditor
        className="h-screen text-muted-foreground"
        editorContentClassName="[&>div]:h-screen"
        value={currentContent} // Editor value comes from the store
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default MainContentArea;
