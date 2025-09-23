"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FileText, Plus, BookOpen, Calendar, Edit3 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  createInitialDraft,
  getDraftsByUserId,
} from "@/services/draft.services";
import { fetchPostsByAuthorId } from "@/services/post.services";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

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

  const { data: publishedData, isLoading: isLoadingPublished } = useQuery({
    queryKey: ["documents", { type: "published" }],
    queryFn: () => fetchPostsByAuthorId(user?.id as string, 1),
    enabled: !!user?.id && activeTab === "published",
  });

  const drafts: IDraft[] = draftsData?.pages?.flat() || [];
  const published: IPost[] = publishedData || [];

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

  const truncateContent = (content: string, maxLength: number = 80) => {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="h-48 overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted transition-all hover:shadow-lg"
            >
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-4/5" />
                <Skeleton className="mt-1 h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (documents.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card
              key={doc._id?.toString()}
              className="h-48 cursor-pointer overflow-hidden rounded-xl border border-muted bg-gradient-to-br from-background to-muted transition-all hover:scale-[1.02] hover:shadow-lg"
              onClick={() =>
                router.push(
                  type === "drafts" ? `/editor/${doc._id}` : `/post/${doc._id}`,
                )
              }
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2 pr-2 text-base font-semibold">
                    {doc.title || "Untitled Document"}
                  </CardTitle>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    {type === "drafts" ? (
                      <FileText className="h-4 w-4 text-primary" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>
                    {doc.updated_at || doc.created_at
                      ? format(
                          new Date(doc.updated_at || doc.created_at),
                          "MMM d, yyyy",
                        )
                      : "Unknown date"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className="line-clamp-2 text-xs">
                  {truncateContent(doc.content || doc.description)}
                </CardDescription>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Edit3 className="mr-1 h-3 w-3" />
                    <span>
                      {doc.updated_at || doc.created_at
                        ? `${formatDistanceToNow(new Date(doc.updated_at || doc.created_at), { addSuffix: true })}`
                        : "Never"}
                    </span>
                  </div>
                  {type === "published" && (
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium text-green-800">
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {activeTab === "drafts" ? (
            <FileText className="h-8 w-8 text-muted-foreground" />
          ) : (
            <BookOpen className="h-8 w-8 text-muted-foreground" />
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
            >
              <Plus className="mr-2 h-4 w-4" />
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
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/30 p-1 backdrop-blur-sm">
              <TabsTrigger
                value="drafts"
                className="relative rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-300 before:content-[''] hover:bg-muted/50 hover:before:w-2/5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:before:w-4/5"
              >
                <FileText className="mr-2 h-4 w-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="relative rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 before:absolute before:bottom-0 before:left-1/2 before:h-0.5 before:w-0 before:-translate-x-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-300 before:content-[''] hover:bg-muted/50 hover:before:w-2/5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:before:w-4/5"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Published
              </TabsTrigger>
            </TabsList>
            <TabsContent value="drafts" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Recent Drafts
              </h2>
              {renderDocumentGrid(drafts, isLoadingDrafts, "drafts")}
            </TabsContent>
            <TabsContent value="published" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Published Documents
              </h2>
              {renderDocumentGrid(published, isLoadingPublished, "published")}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentPageClient;
