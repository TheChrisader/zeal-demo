import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EditorStoreProvider from "@/context/editorStore/editorStore.provider";
import {
  createInitialDraft,
  getDraftsByUserId,
} from "@/database/draft/draft.repository";
import { getPostsByAuthorId } from "@/database/post/post.repository";
import { redirect } from "@/i18n/routing";
import { validateRequest } from "@/lib/auth/auth";
import getQueryClient from "@/lib/queryClient";
import { findPostOrDraftById } from "@/utils/findPostOrDraft";
import EditorWorkspace from "./_components/EditorWorkspace";
import NewDocumentRedirector from "./_components/NewDocumentRedirector";

interface EditorPageProps {
  params: {
    documentId: string;
  };
}

const fetchDocument = async (documentId?: string) => {
  try {
    if (!documentId) return null;
    return await findPostOrDraftById(documentId);
  } catch (error) {
    return null;
  }
};

const EditorPage = async ({ params }: EditorPageProps) => {
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

  const documentId = params?.documentId?.[0];
  let newDocumentId: string | null = null;
  let shouldRedirectOnClient = false;

  const queryClient = getQueryClient(); // Get a new or cached instance for this request

  if (!documentId) {
    const newDraft = await createInitialDraft(user.id);
    if (newDraft) newDocumentId = newDraft._id.toString();

    shouldRedirectOnClient = !!newDocumentId;
  } else {
    await queryClient.prefetchQuery({
      queryKey: ["document", documentId], // Unique key for this document
      queryFn: () => fetchDocument(documentId),
    });
  }

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
      {shouldRedirectOnClient && (
        <NewDocumentRedirector newDocumentId={newDocumentId} />
      )}
      <EditorStoreProvider activeDocumentId={documentId}>
        <EditorWorkspace />
      </EditorStoreProvider>
    </HydrationBoundary>
  );
};

export default EditorPage;
