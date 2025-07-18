import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ImageUploadPreview from "@/components/custom/ImageUploadPreview";
import { fetchPostById } from "@/services/post.services";
import { updatePostById } from "@/services/post.services";
import { IPost } from "@/types/post.type";
import { useEffect, useState } from "react";
import { fetchById, updateById } from "../_utils/composites";
import { IDraft } from "@/types/draft.type";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { toast } from "sonner";
import useAuth from "@/context/auth/useAuth";

interface ThumbnailPreviewProps {}

const ThumbnailPreview = ({}: ThumbnailPreviewProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const { data: documentData, isLoading } = useQuery<IPost | IDraft | null>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string),
    enabled: !!activeDocumentId, // Ensure query only runs if activeDocumentId exists
  });

  useEffect(() => {
    if (!documentData?.image_url) return;
    setOriginalImageUrl(documentData?.image_url);
  }, []);

  const updateThumbnailMutation = useMutation({
    mutationFn: (updateData: { image?: File; image_url?: string | null }) =>
      updateById(activeDocumentId as string, updateData, {
        published: documentData?.published || false,
        type: user?.role === "freelance_writer" ? "freelance_writer" : "writer",
      }),
    onSuccess: (updatedPost) => {
      if (updatedPost && activeDocumentId) {
        queryClient.setQueryData(["document", activeDocumentId], updatedPost);
      }
    },
    onError: (error) => {
      // Handle error, e.g., show a toast notification
      console.error("Error updating thumbnail:", error);
      toast.error("Error updating thumbnail. Please try again.");
    },
  });

  const handleImageFileSelect = (file: File | null) => {
    if (!activeDocumentId) return;

    if (file) {
      updateThumbnailMutation.mutate({ image: file });
    } else {
      // This case is typically when the 'Remove' button in ImageUploadPreview is clicked
      updateThumbnailMutation.mutate({ image_url: null });
    }
  };

  const handleImageReset = () => {
    if (!activeDocumentId || !documentData) return;
    // Reset to the original image_url from the fetched document data
    updateThumbnailMutation.mutate({ image_url: originalImageUrl });
  };

  return (
    <ImageUploadPreview
      currentImageUrl={documentData?.image_url}
      onFileSelect={handleImageFileSelect}
      onReset={handleImageReset}
      label={"Thumbnail Image"}
      // Pass loading state to disable interactions while mutating or initial loading
      // disabled={isLoading || updateThumbnailMutation.isLoading}
    />
  );
};

export default ThumbnailPreview;
