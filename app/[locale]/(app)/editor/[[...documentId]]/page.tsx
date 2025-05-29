import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createInitialDraft,
  getDraftsByUserId,
} from "@/database/draft/draft.repository";
import {
  getPostById,
  getPostsByAuthorId,
} from "@/database/post/post.repository";
import { validateRequest } from "@/lib/auth/auth";
import getQueryClient from "@/lib/queryClient";
import EditorWorkspace from "./_components/EditorWorkspace";
import { findPostOrDraftById } from "@/utils/findPostOrDraft";
import NewDocumentRedirector from "./_components/NewDocumentRedirector";
import EditorStoreProvider from "@/context/editorStore/editorStore.provider";
import { redirect } from "@/i18n/routing";

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

  await queryClient.prefetchQuery({
    queryKey: ["documents", { type: "drafts" }],
    queryFn: () => getDraftsByUserId(user.id),
  });
  await queryClient.prefetchQuery({
    queryKey: ["documents", { type: "published" }],
    queryFn: () => getPostsByAuthorId(user.id),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {shouldRedirectOnClient && (
        <NewDocumentRedirector newDocumentId={newDocumentId} />
      )}
      <EditorStoreProvider activeDocumentId={documentId}>
        <EditorWorkspace activeDocumentId={documentId} />
      </EditorStoreProvider>
    </HydrationBoundary>
  );
};

export default EditorPage;
