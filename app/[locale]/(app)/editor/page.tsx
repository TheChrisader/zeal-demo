import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createInitialDraft,
  getDraftsByUserId,
} from "@/database/draft/draft.repository";
import { getPostsByAuthorId } from "@/database/post/post.repository";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import getQueryClient from "@/lib/queryClient";
import NewDocumentPageClient from "./_components/NewDocumentPageClient";

const NewDocumentPage = async () => {
  const { user } = await validateRequest();
  if (!user)
    return redirect({
      href: `/`,
      locale: "en",
    });

  if (user.role === "user")
    return redirect({
      href: `/`,
      locale: "en",
    });

  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["documents", { type: "drafts" }],
    queryFn: () => getDraftsByUserId(user.id),
    initialPageParam: 0,
  });
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["documents", { type: "published" }],
    queryFn: () => getPostsByAuthorId(user.id),
    initialPageParam: 0,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <NewDocumentPageClient />
    </HydrationBoundary>
  );
};

export default NewDocumentPage;