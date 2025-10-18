"use client";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { generateNativeShareData } from "@/utils/referral.utils";

const generateLink = (slug: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/en/post/${slug}`;
};

const ShareButton = ({ slug, title }: { slug: string; title?: string }) => {
  const { referralCode } = useAuth();

  const handleShare = async () => {
    const baseUrl = generateLink(slug);
    const shareData = generateNativeShareData(
      title || "Check out this article",
      baseUrl,
      referralCode,
    );

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        // You could add a toast notification here if needed
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <Button variant="unstyled" className="p-0" onClick={handleShare}>
      <Share2 className="text-muted-alt" />
    </Button>
  );
};

export default ShareButton;
