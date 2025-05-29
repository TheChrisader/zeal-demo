import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react"; // Using lucide-react for icons
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Assuming Button component is available
import { Input } from "@/components/ui/input"; // Assuming Input component is available
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import the new spinner
import { fetchPostById, updatePostById } from "@/services/post.services";
import { IPost } from "@/types/post.type";
import { fetchById, updateById } from "../_utils/composites";
import { useEditorStore } from "@/context/editorStore/useEditorStore";

interface TagManagerProps {}

const TagManager = ({}: TagManagerProps) => {
  const queryClient = useQueryClient();
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const [inputValue, setInputValue] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: documentData, isLoading: isLoadingDocument } =
    useQuery<IPost | null>({
      queryKey: ["document", activeDocumentId],
      queryFn: () => fetchById(activeDocumentId as string),
      enabled: !!activeDocumentId,
    });

  const [currentTags, setCurrentTags] = useState<string[]>(
    documentData?.keywords || [],
  );

  const updatePostMutation = useMutation({
    mutationFn: (params: { id: string; data: Partial<IPost> }) =>
      updateById(params.id, params.data, documentData?.published || false),
    onSuccess: (updatedPost) => {
      console.log(updatedPost);
      if (updatedPost && activeDocumentId) {
        queryClient.setQueryData(["document", activeDocumentId], updatedPost);
      }
      // console.log("Tags updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tags:", error);
      toast.error("Error updating tags. Please try again.");
    },
  });

  useEffect(() => {
    if (documentData?.keywords) {
      setCurrentTags(documentData.keywords);
    } else {
      setCurrentTags([]);
    }
  }, []);

  useEffect(() => {
    if (!activeDocumentId || isLoadingDocument || !documentData?.keywords) {
      return;
    }

    const serverKeywords = documentData.keywords || [];
    // Deep comparison to avoid unnecessary saves if order changed but content is same
    const sortedCurrentTags = [...currentTags].sort();
    const sortedServerKeywords = [...serverKeywords].sort();

    if (
      JSON.stringify(sortedCurrentTags) === JSON.stringify(sortedServerKeywords)
    ) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updatePostMutation.mutate({
        id: activeDocumentId,
        data: { keywords: currentTags },
      });
    }, 1200); // 1.2-second debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    currentTags,
    // documentData?.keywords,
    activeDocumentId,
    // isLoadingDocument,
    // updatePostMutation,
  ]);

  const handleAddTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !currentTags.includes(newTag) && activeDocumentId) {
      setCurrentTags((prevTags) => [...prevTags, newTag]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (activeDocumentId) {
      setCurrentTags((prevTags) =>
        prevTags.filter((tag) => tag !== tagToRemove),
      );
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  if (isLoadingDocument && activeDocumentId) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Tags</h3>
        <p className="text-xs text-muted-foreground">Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">Tags</label>
        {/* {updatePostMutation.isPending && <LoadingSpinner size={16} />} */}
        <LoadingSpinner size={16} isLoading={updatePostMutation.isPending} />
      </div>
      <div className="flex flex-wrap gap-2">
        {currentTags.length > 0 ? (
          currentTags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/20"
            >
              {tag}
              {activeDocumentId && (
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 flex size-2 items-center justify-center rounded-full text-primary/70 hover:bg-primary/30 hover:text-primary"
                  aria-label={`Remove ${tag}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            No tags yet. Add some!
          </p>
        )}
      </div>
      {activeDocumentId && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Add a tag..."
            className="h-8 grow rounded-md border-border bg-transparent px-3 py-1 text-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            disabled={updatePostMutation.isPending || !activeDocumentId}
          />
          <Button
            onClick={handleAddTag}
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            disabled={
              !inputValue.trim() ||
              updatePostMutation.isPending ||
              !activeDocumentId
            }
          >
            Add
          </Button>
        </div>
      )}
      {updatePostMutation.isPending && (
        <p className="mt-1 text-xs text-muted-foreground">Saving tags...</p>
      )}
      {/* Error message is now handled by toast, so this can be removed or kept as a fallback */}
      {/* {updatePostMutation.isError && (
        <p className="mt-1 text-xs text-destructive">
          Error saving tags. Please try again.
        </p>
      )} */}
    </div>
  );
};

export default TagManager;
