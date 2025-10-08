"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { BookOpen, Calendar, CheckSquare, Edit3, FileText, Plus, Square, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import {
  batchDeleteDrafts,
  createInitialDraft,
  getDraftsByUserId,
  searchDrafts,
} from "@/services/draft.services";
import { batchDeletePosts, fetchPostsByAuthorId, searchPosts } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { Search } from "lucide-react";

interface NewDocumentPageClientProps {}

const NewDocumentPageClient: React.FC<NewDocumentPageClientProps> = ({}) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("drafts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Batch selection state
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  // Track if we're currently debouncing (typing but search hasn't executed yet)
  const isDebouncing =
    searchQuery.trim().length > 0 && searchQuery !== debouncedSearchQuery;

  // Update searching state based on debounced query
  useEffect(() => {
    setIsSearching(debouncedSearchQuery.trim().length > 0);
  }, [debouncedSearchQuery]);

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
  });

  // Set up intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMoreDrafts || isFetchingMoreDrafts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreDrafts) {
          fetchMoreDrafts();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMoreDrafts, isFetchingMoreDrafts, fetchMoreDrafts, isSearching]);

  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    fetchNextPage: fetchMorePublished,
    hasNextPage: hasMorePublished,
    isFetchingNextPage: isFetchingMorePublished,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "published" }],
    queryFn: ({ pageParam = 1 }) =>
      fetchPostsByAuthorId(user?.id as string, pageParam),
    initialPageParam: 1,
    enabled: !!user?.id,
    getNextPageParam: (lastPage, allPages = []): number | undefined => {
      if (lastPage.length < 5) {
        return undefined;
      }
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
  });

  // Set up intersection observer for published documents infinite scroll
  const loadMorePublishedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMorePublished || isFetchingMorePublished) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMorePublished) {
          fetchMorePublished();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMorePublishedRef.current) {
      observer.observe(loadMorePublishedRef.current);
    }

    return () => {
      if (loadMorePublishedRef.current) {
        observer.unobserve(loadMorePublishedRef.current);
      }
    };
  }, [hasMorePublished, isFetchingMorePublished, fetchMorePublished, isSearching]);

  const {
    data: searchDraftsData,
    isLoading: isLoadingSearchDrafts,
    fetchNextPage: fetchMoreSearchDrafts,
    hasNextPage: hasMoreSearchDrafts,
    isFetchingNextPage: isFetchingMoreSearchDrafts,
  } = useInfiniteQuery({
    queryKey: ["documents", { type: "drafts", search: debouncedSearchQuery }],
    queryFn: ({ pageParam = 1 }) =>
      searchDrafts(debouncedSearchQuery, pageParam),
    initialPageParam: 1,
    enabled: !!debouncedSearchQuery.trim(),
    getNextPageParam: (lastPage, allPages = []): number | undefined => {
      if (lastPage.length < 5) {
        return undefined;
      }
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
  });

  const {
    data: searchPublishedData,
    isLoading: isLoadingSearchPublished,
    fetchNextPage: fetchMoreSearchPublished,
    hasNextPage: hasMoreSearchPublished,
    isFetchingNextPage: isFetchingMoreSearchPublished,
  } = useInfiniteQuery({
    queryKey: [
      "documents",
      { type: "published", search: debouncedSearchQuery },
    ],
    queryFn: ({ pageParam = 1 }) =>
      searchPosts(debouncedSearchQuery, user?.id as string, pageParam),
    initialPageParam: 1,
    enabled: !!debouncedSearchQuery.trim() && !!user?.id,
    getNextPageParam: (lastPage, allPages = []): number | undefined => {
      if (lastPage.length < 5) {
        return undefined;
      }
      const nextPage = allPages?.length + 1;
      return nextPage;
    },
  });

  const drafts: IDraft[] = debouncedSearchQuery.trim()
    ? searchDraftsData?.pages?.flat() || []
    : draftsData?.pages?.flat() || [];
  const published: IPost[] = debouncedSearchQuery.trim()
    ? searchPublishedData?.pages?.flat() || []
    : publishedData?.pages?.flat() || [];

  const isLoadingDraftsFinal = debouncedSearchQuery.trim()
    ? isLoadingSearchDrafts
    : isLoadingDrafts;
  const isLoadingPublishedFinal = debouncedSearchQuery.trim()
    ? isLoadingSearchPublished
    : isLoadingPublished;

  // Set up intersection observer for search drafts infinite scroll
  const loadMoreSearchDraftsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !hasMoreSearchDrafts ||
      isFetchingMoreSearchDrafts ||
      !debouncedSearchQuery.trim()
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreSearchDrafts) {
          fetchMoreSearchDrafts();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreSearchDraftsRef.current) {
      observer.observe(loadMoreSearchDraftsRef.current);
    }

    return () => {
      if (loadMoreSearchDraftsRef.current) {
        observer.unobserve(loadMoreSearchDraftsRef.current);
      }
    };
  }, [
    hasMoreSearchDrafts,
    isFetchingMoreSearchDrafts,
    fetchMoreSearchDrafts,
    debouncedSearchQuery,
  ]);

  // Set up intersection observer for search published documents infinite scroll
  const loadMoreSearchPublishedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !hasMoreSearchPublished ||
      isFetchingMoreSearchPublished ||
      !debouncedSearchQuery.trim()
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreSearchPublished) {
          fetchMoreSearchPublished();
        }
      },
      { threshold: 1.0 },
    );

    if (loadMoreSearchPublishedRef.current) {
      observer.observe(loadMoreSearchPublishedRef.current);
    }

    return () => {
      if (loadMoreSearchPublishedRef.current) {
        observer.unobserve(loadMoreSearchPublishedRef.current);
      }
    };
  }, [
    hasMoreSearchPublished,
    isFetchingMoreSearchPublished,
    fetchMoreSearchPublished,
    debouncedSearchQuery,
  ]);

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

  // Batch delete mutations
  const batchDeleteDraftsMutation = useMutation({
    mutationFn: batchDeleteDrafts,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts" }],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts", search: debouncedSearchQuery }],
      });
      setSelectedDrafts(new Set());
      setIsSelectionMode(false);
      console.log(`Successfully deleted ${result.deletedCount} drafts`);
    },
    onError: (error) => {
      console.error("Failed to batch delete drafts:", error);
    },
  });

  const batchDeletePostsMutation = useMutation({
    mutationFn: batchDeletePosts,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "published" }],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "published", search: debouncedSearchQuery }],
      });
      setSelectedPosts(new Set());
      setIsSelectionMode(false);
      console.log(`Successfully deleted ${result.deletedCount} posts`);
    },
    onError: (error) => {
      console.error("Failed to batch delete posts:", error);
    },
  });

  const handleCreateNewDocument = () => {
    createDraftMutation.mutate();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  // Batch selection handlers
  const toggleDraftSelection = (draftId: string) => {
    setSelectedDrafts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(draftId)) {
        newSet.delete(draftId);
      } else {
        newSet.add(draftId);
      }
      return newSet;
    });
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSelectAllDrafts = () => {
    if (selectedDrafts.size === drafts.length && drafts.length > 0) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(drafts.map(draft => draft._id)));
    }
  };

  const toggleSelectAllPosts = () => {
    if (selectedPosts.size === published.length && published.length > 0) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(published.map(post => post._id)));
    }
  };

  const handleBatchDelete = () => {
    if (activeTab === "drafts") {
      batchDeleteDraftsMutation.mutate(Array.from(selectedDrafts));
    } else {
      batchDeletePostsMutation.mutate(Array.from(selectedPosts));
    }
    setShowDeleteConfirmation(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDrafts(new Set());
    setSelectedPosts(new Set());
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedDrafts(new Set());
    setSelectedPosts(new Set());
  };

  const truncateContent = (content: string, maxLength: number = 180) => {
    if (!content) return "No content";
    const cleanContent = content.replace(/<[^>]*>/g, "");
    return cleanContent.length > maxLength
      ? `${cleanContent.substring(0, maxLength)}...`
      : cleanContent;
  };

  const renderDocumentGrid = (
    documents: Array<IDraft | IPost>,
    isLoading: boolean,
    type: "drafts" | "published",
  ) => {
    const selectedCount = type === "drafts" ? selectedDrafts.size : selectedPosts.size;
    const totalCount = documents.length;
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="group relative h-52 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-primary/5 transition-all duration-500 group-hover:w-full"></div>
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-3 h-3 w-1/2" />
                <div className="mt-auto space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (documents.length > 0) {
      return (
        <div className="space-y-4">
          {/* Batch Selection Controls */}
          {isSelectionMode && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => type === "drafts" ? toggleSelectAllDrafts() : toggleSelectAllPosts()}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                >
                  {isAllSelected ? (
                    <CheckSquare className="size-4 text-primary" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  {isAllSelected ? "Deselect All" : "Select All"}
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {totalCount} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelSelectionMode}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                {selectedCount > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirmation(true)}
                    disabled={batchDeleteDraftsMutation.isPending || batchDeletePostsMutation.isPending}
                    className="gap-2"
                  >
                    <Trash2 className="size-4" />
                    Delete ({selectedCount})
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {documents.map((doc) => {
              const isSelected = type === "drafts"
                ? selectedDrafts.has(doc._id)
                : selectedPosts.has(doc._id);

              return (
                <Card
                  key={doc._id?.toString()}
                  className={`group relative h-72 overflow-hidden rounded-2xl border bg-transparent p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${
                    isSelectionMode ? "cursor-default" : "cursor-pointer"
                  } ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}
                  onClick={() => {
                    if (isSelectionMode) {
                      if (type === "drafts") {
                        toggleDraftSelection(doc._id);
                      } else {
                        togglePostSelection(doc._id);
                      }
                    } else {
                      router.push(`/editor/${doc._id}`);
                    }
                  }}
                >
              {/* Selection Checkbox */}
              {isSelectionMode && (
                <div className="absolute left-3 top-3 z-20">
                  <div className={`flex size-6 items-center justify-center rounded-md border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary"
                  }`}>
                    {isSelected && <CheckSquare className="size-4" />}
                  </div>
                </div>
              )}

              <div className={`absolute right-0 top-0 size-24 rounded-bl-full bg-primary/5 transition-all duration-500 ${
                isSelectionMode && isSelected ? "bg-primary/10" : ""
              } group-hover:w-full`}></div>
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {type === "drafts" ? "Draft" : "Published"}
                  </span>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {type === "drafts" ? (
                      <FileText className="size-4" />
                    ) : (
                      <BookOpen className="size-4" />
                    )}
                  </div>
                </div>
                <CardTitle className="mb-1 line-clamp-2 text-lg font-bold leading-tight">
                  {doc.title || "Untitled Document"}
                </CardTitle>
                <div className="mb-3 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 size-3" />
                  <span>
                    {doc.updated_at
                      ? format(new Date(doc.updated_at), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {truncateContent(doc.content || doc.description)}
                </CardDescription>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Edit3 className="mr-1 size-3" />
                    <span>
                      {doc.updated_at || doc.created_at
                        ? `${formatDistanceToNow(new Date(doc.updated_at || doc.created_at), { addSuffix: true })}`
                        : "Never"}
                    </span>
                  </div>
                  {type === "published" && (
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-green-800">
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          {isSearching ? (
            <Search className="size-8 text-muted-foreground" />
          ) : activeTab === "drafts" ? (
            <FileText className="size-8 text-muted-foreground" />
          ) : (
            <BookOpen className="size-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="mt-4 text-lg font-medium">
          {isSearching ? "No search results found" : `No ${activeTab} found`}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSearching
            ? `No ${activeTab === "drafts" ? "drafts" : "published documents"} match your search "${debouncedSearchQuery}"`
            : activeTab === "drafts"
              ? "Your drafts will appear here once you create them"
              : "Your published documents will appear here once you publish them"}
        </p>
        {!isSearching && activeTab === "drafts" && (
          <div className="mt-6">
            <Button
              onClick={handleCreateNewDocument}
              disabled={createDraftMutation.isPending}
              className="group rounded-full"
            >
              <Plus className="mr-2 size-4 transition-transform group-hover:rotate-90" />
              Create your first draft
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header Section */}
        {/* <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Zeal Editor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create a new document or choose from your existing documents
          </p>
        </div> */}

        {/* Blank Document Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCreateNewDocument}
            disabled={createDraftMutation.isPending}
            className="group h-14 w-full max-w-md rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg transition-all hover:shadow-xl"
          >
            <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
            <span className="font-medium">
              {createDraftMutation.isPending ? "Creating..." : "Blank Document"}
            </span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab === "drafts" ? "drafts" : "published documents"}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-10 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {isDebouncing ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border border-muted-foreground border-t-transparent"></div>
                </div>
              ) : (
                searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )
              )}
            </div>
            {isSearching && (
              <div className="mt-2 text-sm text-muted-foreground">
                Showing results for "{debouncedSearchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Documents Tabs */}
        <div className="mt-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger
                value="drafts"
                className="relative rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-300 before:content-[''] hover:bg-muted/50 hover:before:w-2/5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:before:w-4/5"
              >
                <FileText className="mr-2 size-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="relative rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-300 before:content-[''] hover:bg-muted/50 hover:before:w-2/5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:before:w-4/5"
              >
                <BookOpen className="mr-2 size-4" />
                Published
              </TabsTrigger>
            </TabsList>

            {/* Selection Mode Toggle */}
            <div className="mt-4 flex items-center justify-end">
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectionMode}
                className="gap-2"
              >
                {isSelectionMode ? (
                  <CheckSquare className="size-4" />
                ) : (
                  <Square className="size-4" />
                )}
                {isSelectionMode ? "Exit Selection" : "Select Multiple"}
              </Button>
            </div>
            <TabsContent value="drafts" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                {isSearching ? "Search Results" : "Recent Drafts"}
              </h2>
              {renderDocumentGrid(drafts, isLoadingDraftsFinal, "drafts")}
              {isSearching && hasMoreSearchDrafts && (
                <div
                  ref={loadMoreSearchDraftsRef}
                  className="mt-4 flex justify-center"
                >
                  {isFetchingMoreSearchDrafts && (
                    <div className="py-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
              {!isSearching && hasMoreDrafts && (
                <div ref={loadMoreRef} className="mt-4 flex justify-center">
                  {isFetchingMoreDrafts && (
                    <div className="py-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="published" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                {isSearching ? "Search Results" : "Published Documents"}
              </h2>
              {renderDocumentGrid(
                published,
                isLoadingPublishedFinal,
                "published",
              )}
              {isSearching && hasMoreSearchPublished && (
                <div
                  ref={loadMoreSearchPublishedRef}
                  className="mt-4 flex justify-center"
                >
                  {isFetchingMoreSearchPublished && (
                    <div className="py-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
              {!isSearching && hasMorePublished && (
                <div
                  ref={loadMorePublishedRef}
                  className="mt-4 flex justify-center"
                >
                  {isFetchingMorePublished && (
                    <div className="py-4 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-lg bg-background p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Confirm Deletion
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to delete {activeTab === "drafts" ? selectedDrafts.size : selectedPosts.size} {activeTab === "drafts" ? "draft" : "published document"}{selectedDrafts.size > 1 || selectedPosts.size > 1 ? "s" : ""}? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={batchDeleteDraftsMutation.isPending || batchDeletePostsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={batchDeleteDraftsMutation.isPending || batchDeletePostsMutation.isPending}
              >
                {batchDeleteDraftsMutation.isPending || batchDeletePostsMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewDocumentPageClient;
