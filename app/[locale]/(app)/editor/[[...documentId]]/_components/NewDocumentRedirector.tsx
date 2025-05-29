"use client";

import { useRouter } from "@/app/_components/useRouter";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface NewDocumentRedirectorProps {
  newDocumentId: string | null; // Can be null if creation failed and handled by parent
}

export default function NewDocumentRedirector({
  newDocumentId,
}: NewDocumentRedirectorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (newDocumentId) {
      console.log(
        `CLIENT: New document ID ${newDocumentId} received, replacing URL.`,
      );

      // Invalidate drafts list query so it picks up the new "Untitled" document
      // This ensures that if the user quickly navigates back to a dashboard or list,
      // the new document is already there or will be fetched soon.
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts" }],
      });
      // You might also pre-populate the cache for this new document if the server didn't
      // but if it was created with defaults, the main /editor/[id] page will fetch it.

      // Replace the current URL with the new document's URL
      // 'replace' does not add an entry to the history stack.
      router.replace(`/editor/${newDocumentId}`);
    } else {
      // Handle case where newDocumentId might be null (e.g., creation failed upstream)
      // This might involve showing an error message or redirecting to a safe page.
      // router.replace('/dashboard?error=new_doc_failed');
      console.error("CLIENT: No new document ID provided for redirection.");
    }
  }, [newDocumentId, router, queryClient]);

  // Render a loading indicator or nothing while redirecting
  //   return (
  //     <div>
  //       <p>Preparing your new document...</p>
  //       {/* You can add a spinner or a more elaborate loading UI here */}
  //     </div>
  //   );
  return <></>;
}
