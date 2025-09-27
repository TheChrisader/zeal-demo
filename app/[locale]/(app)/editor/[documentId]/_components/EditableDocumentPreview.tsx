import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react"; // Import PenLine icon
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import { IPost } from "@/types/post.type";
import { fetchById, updateById } from "../_utils/composites";
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface EditableDocumentPreviewProps {}

const EditableDocumentPreview = ({}: EditableDocumentPreviewProps) => {
  const { user } = useAuth();
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const queryClient = useQueryClient();

  const {
    data: documentData,
    isLoading: isLoadingDocument,
    isError,
    error,
  } = useQuery<IPost | null, Error>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId,
  });

  const [preview, setPreview] = useState(documentData?.description || "");
  const [isFocused, setIsFocused] = useState(false);

  const mutation = useMutation<
    IPost,
    Error,
    { id: string; description: string }
  >({
    mutationFn: (variables) =>
      updateById(
        variables.id,
        { description: variables.description },
        {
          published: documentData?.published || false,
          type:
            user?.role === "freelance_writer" ? "freelance_writer" : "writer",
        },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["document", activeDocumentId], data);
      if (documentData?.published) {
        queryClient.invalidateQueries({
          queryKey: ["documents", { type: "published" }],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["documents", { type: "drafts" }],
        });
      }
    },
    // Optionally handle onError
    onError: (error) => {
      console.error("Error updating preview:", error);
      toast.error("Error updating preview. Please try again.");
    },
  });

  const debouncedUpdatePreview = useDebouncedCallback((newPreview: string) => {
    if (activeDocumentId && newPreview.trim() !== "") {
      mutation.mutate({ id: activeDocumentId, description: newPreview });
    }
  }, 1500); // 500ms debounce delay

  const handlePreviewChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newPreview = event.target.value;
    setPreview(newPreview);
    debouncedUpdatePreview(newPreview);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">Preview</label>
        <LoadingSpinner size={16} isLoading={mutation.isPending} />
      </div>
      <Textarea
        value={preview}
        className="h-24 bg-transparent"
        onChange={handlePreviewChange}
      />
    </div>
  );
};

export default EditableDocumentPreview;
