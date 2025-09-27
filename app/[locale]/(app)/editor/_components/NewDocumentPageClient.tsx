"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { BookOpen, Calendar, Edit3, FileText, Plus } from "lucide-react";
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
import {
  createInitialDraft,
  getDraftsByUserId,
} from "@/services/draft.services";
import { fetchPostsByAuthorId } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";

interface NewDocumentPageClientProps {}

const NewDocumentPageClient: React.FC<NewDocumentPageClientProps> = ({}) => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("drafts");

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
  }, [hasMoreDrafts, isFetchingMoreDrafts, fetchMoreDrafts]);

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
  }, [hasMorePublished, isFetchingMorePublished, fetchMorePublished]);

  const drafts: IDraft[] = draftsData?.pages?.flat() || [];
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
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {documents.map((doc) => (
            <Card
              key={doc._id?.toString()}
              className="group relative h-72 cursor-pointer overflow-hidden rounded-2xl border bg-transparent p-5 shadow-sm transition-all duration-300 hover:shadow-lg"
              onClick={() => router.push(`/editor/${doc._id}`)}
            >
              <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-primary/5 transition-all duration-500 group-hover:w-full"></div>
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
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          {activeTab === "drafts" ? (
            <FileText className="size-8 text-muted-foreground" />
          ) : (
            <BookOpen className="size-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="mt-4 text-lg font-medium">No {activeTab} found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {activeTab === "drafts"
            ? "Your drafts will appear here once you create them"
            : "Your published documents will appear here once you publish them"}
        </p>
        {activeTab === "drafts" && (
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
            <TabsContent value="drafts" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Recent Drafts
              </h2>
              {renderDocumentGrid(drafts, isLoadingDrafts, "drafts")}
              {hasMoreDrafts && (
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
                Published Documents
              </h2>
              {renderDocumentGrid(published, isLoadingPublished, "published")}
              {hasMorePublished && (
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
    </div>
  );
};

export default NewDocumentPageClient;
