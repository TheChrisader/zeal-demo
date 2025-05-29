import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react"; // Import PenLine icon
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import { IPost } from "@/types/post.type";
import { fetchById, updateById } from "../_utils/composites";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { toast } from "sonner";

interface EditableDocumentTitleProps {}

const EditableDocumentTitle = ({}: EditableDocumentTitleProps) => {
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  useEffect(() => {
    if (documentData) {
      setTitle(documentData.title);
    }
  }, [documentData]);

  const mutation = useMutation<IPost, Error, { id: string; title: string }>({
    mutationFn: (variables) =>
      updateById(
        variables.id,
        { title: variables.title },
        documentData?.published || false,
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
    onError: (error) => {
      console.error("Error updating title:", error);
      toast.error(`Error updating title. Please try again.`);
    },
    // Optionally handle onError
  });

  const debouncedUpdateTitle = useDebouncedCallback((newTitle: string) => {
    if (activeDocumentId && newTitle.trim() !== "") {
      mutation.mutate({ id: activeDocumentId, title: newTitle });
    }
  }, 1500); // 500ms debounce delay

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    debouncedUpdateTitle(newTitle);
  };

  // if (isLoadingDocument) {
  //   return <LoadingSpinner />;
  // }

  if (isError) {
    return <div>Error loading document: {error?.message}</div>;
  }

  return (
    <div className="relative flex w-full items-center">
      <Input
        type="text"
        value={title}
        onChange={handleTitleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={100}
        placeholder="Untitled Document"
        className={`w-full rounded-none border-0 border-b border-dotted bg-transparent text-lg font-semibold text-foreground outline-0 ring-0 focus:outline-none focus-visible:ring-0 ${isFocused ? "border-primary" : "w-96 truncate border-gray-400 max-[750px]:w-60"}`}
      />
      <div className="ml-2 flex items-center gap-1">
        <PenLine
          className={`size-4 ${isFocused ? "text-primary" : "text-gray-400"}`}
        />
        <LoadingSpinner isLoading={mutation.isPending} size={16} />
      </div>
    </div>
  );
};

export default EditableDocumentTitle;
