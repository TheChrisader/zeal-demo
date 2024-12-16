import { useState } from "react";

type ReportReason =
  | "spam"
  | "harassment"
  | "violence"
  | "hate"
  | "misinformation"
  | "other";

export function useReportArticle(articleId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<1 | 2>(1);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");

  const openReport = () => {
    setIsOpen(true);
    setStage(1);
    setReason(null);
    setDescription("");
  };

  const closeReport = () => {
    setIsOpen(false);
  };

  const selectReason = (selectedReason: ReportReason) => {
    setReason(selectedReason);
    if (selectedReason === "other") {
      setStage(2);
    }
  };

  const submitReport = async (
    articleId: string,
    finalReason: ReportReason,
    finalDescription?: string,
  ) => {
    // Here you would typically send the report to your backend
    console.log("Submitting report:", {
      articleId,
      reason: finalReason,
      description: finalDescription,
    });
    await fetch("/api/v1/report", {
      method: "POST",
      body: JSON.stringify({
        postID: articleId,
        reason,
        description,
      }),
    });
    closeReport();
  };

  return {
    isOpen,
    setIsOpen,
    stage,
    reason,
    description,
    openReport,
    closeReport,
    selectReason,
    setDescription,
    submitReport,
  };
}
