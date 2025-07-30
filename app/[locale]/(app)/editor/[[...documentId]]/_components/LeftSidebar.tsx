"use client";

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileWarning, Hourglass, Link2, Trash2, X } from "lucide-react"; // Added X icon
import React, { useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
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
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { Link } from "@/i18n/routing";
import { deleteDraftById, getDraftsByUserId } from "@/services/draft.services";
import { deletePostById, fetchPostsByAuthorId } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { useAuth } from "@/hooks/useAuth";

interface Page<T> {
  items: T[];
  totalPages: number;
}

interface LeftSidebarProps {
  toggleSidebar: () => void;
  isOpen: boolean;
  isMobile: boolean;
}

interface ItemToDelete {
  id: string;
  title?: string;
  type: "draft" | "post";
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  toggleSidebar,
  isOpen,
  isMobile,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingItemIds, setDeletingItemIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const setActiveDocumentId = useEditorStore(
    (state) => state.setActiveDocumentId,
  );

  const {
    data: draftsData,
    isLoading: isLoadingDrafts,
    fetchNextPage: fetchMoreDrafts,
    isFetchingNextPage: isFetchingMoreDrafts,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "drafts" }],
    queryFn: ({ pageParam = 1 }) => getDraftsByUserId(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages = []): number => {
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
    // enabled: !!user?.id,
  });
  const drafts: IDraft[] = draftsData?.pages?.flat() || [];

  // const drafts = data.pages

  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    fetchNextPage: fetchMorePosts,
    isFetchingNextPage: isFetchingMorePosts,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "published" }],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      if (!user?.id) return Promise.resolve([]);
      return fetchPostsByAuthorId(user.id as string, pageParam);
    },
    getNextPageParam: (lastPage, allPages = []): number => {
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
    // enabled: !!user?.id,
  });

  const published: IPost[] = publishedData?.pages?.flat() || [];

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      setDeletingItemIds((prev) => [...prev, draftId]);
      return deleteDraftById(draftId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts" }],
      });
    },
    onSettled: (draft: IDraft | undefined) => {
      if (!draft) return;
      if (activeDocumentId === draft?._id) {
        const undeletedDrafts = drafts.filter(
          (draft) =>
            !deletingItemIds.includes(draft?._id!.toString() as string),
        );
        const newDraftId = undeletedDrafts[0]?._id?.toString();
        if (newDraftId) {
          setActiveDocumentId(newDraftId);
          router.replace(`/editor/${newDraftId}`);
        } else {
          setActiveDocumentId(undefined);
          router.replace(`/editor`);
        }
      }
      setDeletingItemIds((prev: string[]) =>
        prev.filter((id) => id !== draft?._id?.toString()),
      );
      setItemToDelete(null); // Reset item to delete
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      setDeletingItemIds((prev) => [...prev, postId]);
      return deletePostById(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "published" }],
      });
    },
    onSettled: (post: IPost | null | undefined) => {
      if (!post) return;
      if (activeDocumentId === post?._id) {
        const undeletedPosts = published.filter(
          (post) => !deletingItemIds.includes(post?._id!.toString() as string),
        );
        const newPostId = undeletedPosts[0]?._id?.toString();
        if (newPostId) {
          setActiveDocumentId(newPostId);
          router.replace(`/editor/${newPostId}`);
        } else {
          setActiveDocumentId(undefined);
          router.replace(`/editor`);
        }
      }
      setDeletingItemIds((prev: string[]) =>
        prev.filter((id) => id !== post?._id?.toString()),
      );
      setItemToDelete(null); // Reset item to delete
    },
  });

  const openDeleteConfirmation = (
    id: string,
    title: string | undefined,
    type: "draft" | "post",
  ) => {
    setItemToDelete({ id, title, type });
  };

  const confirmDeletion = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "draft") {
      deleteDraftMutation.mutate(itemToDelete.id);
    } else if (itemToDelete.type === "post") {
      deletePostMutation.mutate(itemToDelete.id);
    }
  };

  if (!user) return null;
  if (isLoadingDrafts || isLoadingPublished)
    return (
      <div className="h-full bg-slate-800 p-4 text-white">
        Loading sidebar...
      </div>
    );
  return (
    <div className="flex h-full flex-col space-y-6 border-r border-border bg-background-alt p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Zeal News Africa</h1>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* New Document Button */}
      <Link
        href="/editor"
        onClick={() => {
          setActiveDocumentId(undefined);
          if (isMobile) toggleSidebar();
        }}
        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        + New Document
      </Link>

      {/* My Drafts Section */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My Drafts
        </h2>
        <nav className="scrollbar-change max-h-48 space-y-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {drafts.map((draft) => (
              <motion.div
                key={draft.id as string}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                className="group flex items-center justify-between rounded-md hover:bg-subtle-hover-bg"
              >
                <Link
                  href={`/editor/${draft.id}`}
                  onClick={() => {
                    setActiveDocumentId(draft.id as string);
                    if (isMobile) toggleSidebar();
                  }}
                  className={`grow truncate rounded-l-md px-3 py-2 text-sm font-medium hover:text-foreground ${activeDocumentId === draft.id ? "font-semibold text-primary" : "text-foreground-alt"}`}
                >
                  {draft.title || "Untitled Draft"}
                </Link>
                {draft.moderationStatus === "awaiting_approval" && (
                  <Link href={`/awaiting_approval/${draft.id}`}>
                    <Hourglass className="size-4 text-muted-foreground hover:text-primary focus:outline-none" />
                  </Link>
                )}
                {draft.moderationStatus === "rejected" && (
                  <FileWarning className="size-4 text-destructive focus:outline-none" />
                )}
                {draft.moderationStatus === "published" && (
                  <Check className="size-4 text-primary focus:outline-none" />
                )}
                <button
                  onClick={() =>
                    openDeleteConfirmation(
                      draft.id as string,
                      draft.title,
                      "draft",
                    )
                  }
                  disabled={
                    deleteDraftMutation.isPending &&
                    deletingItemIds.includes(draft._id?.toString() as string)
                  }
                  className="rounded-r-md p-2 text-muted-foreground hover:text-red-500 focus:outline-none"
                  aria-label={`Delete draft ${draft.title || "Untitled Draft"}`}
                >
                  {deleteDraftMutation.isPending &&
                  deletingItemIds.includes(draft._id?.toString() as string) ? (
                    <LoadingSpinner size={16} isLoading />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {drafts.length === 0 && !isLoadingDrafts && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No drafts yet.
            </p>
          )}
          {drafts.length >= 5 && (
            <Button
              variant="link"
              onClick={() => fetchMoreDrafts()}
              disabled={isFetchingMoreDrafts}
            >
              Load more
            </Button>
          )}
        </nav>
      </div>

      {/* Published Posts Section */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Published Posts
        </h2>
        <nav className="scrollbar-change max-h-48 space-y-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {published.map((post) => (
              <motion.div
                key={post.id as string}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                className="group flex items-center justify-between rounded-md hover:bg-subtle-hover-bg"
              >
                <Link
                  href={`/editor/${post.id}`}
                  className={`grow truncate rounded-l-md px-3 py-2 text-sm font-medium hover:text-foreground ${activeDocumentId === post.id ? "font-semibold text-primary" : "text-foreground-alt"}`}
                >
                  {post.title}
                </Link>
                <Link href={`/published/${post.id}`}>
                  <Link2 className="size-4 text-muted-foreground hover:text-primary focus:outline-none" />
                </Link>
                <button
                  onClick={() =>
                    openDeleteConfirmation(
                      post.id as string,
                      post.title,
                      "post",
                    )
                  }
                  disabled={
                    deletePostMutation.isPending &&
                    deletingItemIds.includes(post._id?.toString() as string)
                  }
                  className="rounded-r-md p-2 text-muted-foreground hover:text-red-500 focus:outline-none"
                  aria-label={`Delete post ${post.title}`}
                >
                  {deletePostMutation.isPending &&
                  deletingItemIds.includes(post._id?.toString() as string) ? (
                    <LoadingSpinner size={16} isLoading />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {published.length === 0 && !isLoadingPublished && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No published posts yet.
            </p>
          )}
          {published.length >= 5 && (
            <Button
              variant="link"
              onClick={() => fetchMoreDrafts()}
              disabled={isFetchingMoreDrafts}
            >
              Load more
            </Button>
          )}
        </nav>
      </div>

      {/* Spacer to push user profile to bottom */}
      <div className="grow"></div>

      {/* User Profile Section */}
      <div className="mt-auto border-t border-border pt-4">
        <div className="flex items-center space-x-3">
          {/* <UserCircle className="h-8 w-8 text-muted-foreground" /> */}
          <div>
            <p className="text-sm font-medium text-foreground">
              {/* {user.username || "User"} */}
            </p>
            {/* <p className="text-xs text-muted-foreground">Pro Member</p> */}
          </div>
        </div>
        {/* Add settings or logout link if needed */}
      </div>

      {itemToDelete && (
        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                {itemToDelete.type === "draft" ? " draft" : " post"} &quot;
                <strong>
                  {itemToDelete.title ||
                    (itemToDelete.type === "draft"
                      ? "Untitled Draft"
                      : "Untitled Post")}
                </strong>
                &quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletion}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default LeftSidebar;
