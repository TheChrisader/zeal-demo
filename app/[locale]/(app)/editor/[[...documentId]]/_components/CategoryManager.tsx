import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { CATEGORIES } from "@/categories/flattened";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { fetchById, updateById } from "../_utils/composites";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEffect, useState } from "react";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { toast } from "sonner";
import useAuth from "@/context/auth/useAuth";

interface CategoryManagerProps {}
const CategoryManager = ({}: CategoryManagerProps) => {
  const { user } = useAuth();
  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const queryClient = useQueryClient();
  const {
    data: documentData,
    isLoading,
    isError,
    error,
  } = useQuery<IPost | IDraft | null, Error>({
    queryKey: ["document", activeDocumentId],
    queryFn: () => fetchById(activeDocumentId as string), // Fallback if not hydrated or stale
    enabled: !!activeDocumentId,
  });
  const [currentCategories, setCurrentCategories] = useState<string[]>(
    documentData?.category || [],
  );

  const updateCategoryMutation = useMutation({
    mutationFn: (updatedCategories: string[]) => {
      if (!activeDocumentId) throw new Error("No active document ID");
      return updateById(
        activeDocumentId,
        { category: updatedCategories },
        {
          published: documentData?.published || false,
          type:
            user?.role === "freelance_writer" ? "freelance_writer" : "writer",
        },
      );
    },
    onSuccess: (updatedPost) => {
      if (updatedPost && activeDocumentId) {
        queryClient.setQueryData(["document", activeDocumentId], updatedPost);
      }
    },
    // Optional: onError for error handling
    onError: (error) => {
      console.error("Error updating category:", error);
      // Handle error, e.g., show a toast notification
      toast.error(`Error updating category. Please try again.`);
    },
  });

  useEffect(() => {
    if (documentData?.category) {
      setCurrentCategories(documentData.category);
    }
  }, [documentData?.category]);

  const debouncedUpdateCategory = useDebouncedCallback(
    (categories: string[]) => {
      updateCategoryMutation.mutate(categories);
    },
    500,
  );

  const handleCategoryChange = (category: string) => {
    if (!documentData) return;
    // const currentCategories = documentData.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    setCurrentCategories(newCategories);
    debouncedUpdateCategory(newCategories);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (!documentData) return;
    // const currentCategories = documentData.category || [];
    const newCategories = currentCategories.filter(
      (category) => category !== categoryToRemove,
    );
    setCurrentCategories(newCategories);
    debouncedUpdateCategory(newCategories);
  };

  return (
    <div className="space-y-2">
      <label className="flex gap-1 text-sm font-medium">
        <span>Categories</span>
        {/* {updateCategoryMutation.isPending && <LoadingSpinner size={16} />} */}
        <LoadingSpinner
          size={16}
          isLoading={updateCategoryMutation.isPending}
        />
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {currentCategories.length > 0
              ? `${currentCategories.length} selected`
              : "Select categories"}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {CATEGORIES.map((category) => {
                  const isSelected = currentCategories.includes(category);
                  return (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={() => handleCategoryChange(category)}
                    >
                      <Check
                        className={`mr-2 size-4 ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {category}
                    </CommandItem>
                  );
                })}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="mt-2 flex flex-wrap gap-2">
        {currentCategories.map((category: string) => (
          <Badge
            key={category}
            variant="secondary"
            className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/20"
          >
            {category}
            <button
              onClick={() => handleRemoveCategory(category)}
              className="ml-1 text-xs hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
