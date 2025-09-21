"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "@/app/_components/useRouter";

interface NewDocumentRedirectorProps {
  newDocumentId: string | null;
}

export default function NewDocumentRedirector({
  newDocumentId,
}: NewDocumentRedirectorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (newDocumentId) {
      queryClient.invalidateQueries({
        queryKey: ["documents", { type: "drafts" }],
      });
      router.replace(`/editor/${newDocumentId}`);
    } else {
      console.error("CLIENT: No new document ID provided for redirection.");
    }
  }, [newDocumentId, router, queryClient]);

  return <></>;
}
