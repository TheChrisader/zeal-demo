"use client";
import { Share2 } from "lucide-react";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const generateLink = (slug: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/en/post/${slug}`;
};

const ShareButton = ({ slug }: { slug: string }) => {
  return (
    <Button
      variant="unstyled"
      className="p-0"
      onClick={async () => {
        // navigator.clipboard.writeText(link);
        // toast.success("Link copied to clipboard");
        // console.log(generateLink(id));
        await navigator.share({ url: generateLink(slug) });
      }}
    >
      <Share2 className="text-muted-alt" />
    </Button>
  );
};

export default ShareButton;
