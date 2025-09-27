"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  FileWarning,
  Hourglass,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react"; // Added X icon
import React, { useEffect, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { useSidebarStore } from "@/context/sidebarStore/useSidebarStore";
import { useAuth } from "@/hooks/useAuth";
import { useResizeDelta } from "@/hooks/useResizeDelta";
import { Link } from "@/i18n/routing";
import {
  createInitialDraft,
  deleteDraftById,
  getDraftsByUserId,
} from "@/services/draft.services";
import { deletePostById, fetchPostsByAuthorId } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";

interface LeftSidebarProps {}

interface ItemToDelete {
  id: string;
  title?: string;
  type: "draft" | "post";
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({}) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingItemIds, setDeletingItemIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const isLeftSidebarOpen = useSidebarStore((state) => state.isLeftSidebarOpen);
  const isMobile = useSidebarStore((state) => state.isMobile);
  const setIsMobile = useSidebarStore((state) => state.setIsMobile);
  const toggleLeftSidebar = useSidebarStore((state) => state.toggleLeftSidebar);
  const { delta } = useResizeDelta();

  const activeDocumentId = useEditorStore((state) => state.activeDocumentId);
  const setActiveDocumentId = useEditorStore(
    (state) => state.setActiveDocumentId,
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  useEffect(() => {
    const handleSidebar = () => {
      if (window.innerWidth < 1000 && isLeftSidebarOpen && delta.width < 0)
        toggleLeftSidebar();
      if (window.innerWidth > 1000 && !isLeftSidebarOpen && delta.width > 0)
        toggleLeftSidebar();
    };

    window.addEventListener("resize", handleSidebar);
    return () => window.removeEventListener("resize", handleSidebar);
  }, [delta, isLeftSidebarOpen, toggleLeftSidebar]);

  const {
    data: draftsData,
    isLoading: isLoadingDrafts,
    fetchNextPage: fetchMoreDrafts,
    hasNextPage: hasMoreDrafts,
    isFetchingNextPage: isFetchingMoreDrafts,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "drafts" }],
    queryFn: ({ pageParam = 1 }) => getDraftsByUserId(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages = []): number | undefined => {
      if (lastPage.length < 5) {
        return undefined;
      }
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
    hasNextPage: hasMorePosts,
    isFetchingNextPage: isFetchingMorePosts,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "published" }],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => {
      if (!user?.id) return Promise.resolve([]);
      return fetchPostsByAuthorId(user.id as string, pageParam);
    },
    getNextPageParam: (lastPage, allPages = []): number | undefined => {
      if (lastPage.length < 5) {
        return undefined;
      }
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
    // enabled: !!user?.id,
  });

  const published: IPost[] = publishedData?.pages?.flat() || [];

  const createDraftMutation = useMutation({
    mutationFn: createInitialDraft,
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts" }],
      });
      router.push(`/editor/${newDraft._id}`);
    },
    onError: (error) => {
      console.error("Failed to create new document:", error);
    },
  });

  const handleCreateNewDocument = () => {
    createDraftMutation.mutate();
  };

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
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <AnimatePresence>
          {isLeftSidebarOpen && (
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0, transitionEnd: { display: "none" } }}
              onClick={toggleLeftSidebar}
            />
          )}
        </AnimatePresence>
      )}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: "-100%" }}
            animate={{ width: isMobile ? "80%" : 256, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`shrink-0 border-r border-border bg-background-alt md:flex md:flex-col ${isMobile ? "fixed left-0 top-0 z-40 h-full shadow-xl" : "relative"}`}
            style={{ overflow: "hidden" }}
          >
            <div className="flex h-full flex-col space-y-6 border-r border-border bg-background-alt p-4">
              {isMobile && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLeftSidebar}
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              )}

              {/* New Document Button */}
              {/* <Link
                href="/editor"
                onClick={() => {
                  setActiveDocumentId(undefined);
                  if (isMobile) toggleLeftSidebar();
                }}
                className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                + New Document
              </Link> */}
              <div className="flex justify-center">
                <Button
                  onClick={handleCreateNewDocument}
                  disabled={createDraftMutation.isPending}
                  className="group w-full max-w-md rounded-xl bg-gradient-to-r from-primary to-primary/90 py-2.5 shadow-lg transition-all hover:shadow-xl"
                >
                  <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
                  <span className="font-medium">
                    {createDraftMutation.isPending
                      ? "Creating..."
                      : "Blank Document"}
                  </span>
                </Button>
              </div>

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
                        exit={{
                          opacity: 0,
                          x: -20,
                          transition: { duration: 0.3 },
                        }}
                        className="group flex items-center justify-between rounded-md hover:bg-subtle-hover-bg"
                      >
                        <Link
                          href={`/editor/${draft.id}`}
                          onClick={() => {
                            setActiveDocumentId(draft.id as string);
                            if (isMobile) toggleLeftSidebar();
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
                            deletingItemIds.includes(
                              draft._id?.toString() as string,
                            )
                          }
                          className="rounded-r-md p-2 text-muted-foreground hover:text-red-500 focus:outline-none"
                          aria-label={`Delete draft ${draft.title || "Untitled Draft"}`}
                        >
                          {deleteDraftMutation.isPending &&
                          deletingItemIds.includes(
                            draft._id?.toString() as string,
                          ) ? (
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
                  {drafts.length >= 5 && hasMoreDrafts && (
                    <Button
                      variant="link"
                      onClick={() => fetchMoreDrafts()}
                      disabled={isFetchingMoreDrafts}
                    >
                      {isFetchingMoreDrafts ? "Loading..." : "Load more"}
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
                        exit={{
                          opacity: 0,
                          x: -20,
                          transition: { duration: 0.3 },
                        }}
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
                            deletingItemIds.includes(
                              post._id?.toString() as string,
                            )
                          }
                          className="rounded-r-md p-2 text-muted-foreground hover:text-red-500 focus:outline-none"
                          aria-label={`Delete post ${post.title}`}
                        >
                          {deletePostMutation.isPending &&
                          deletingItemIds.includes(
                            post._id?.toString() as string,
                          ) ? (
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
                  {published.length >= 5 && hasMorePosts && (
                    <Button
                      variant="link"
                      onClick={() => fetchMorePosts()}
                      disabled={isFetchingMorePosts}
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
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the
                        {itemToDelete.type === "draft"
                          ? " draft"
                          : " post"}{" "}
                        &quot;
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
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftSidebar;
