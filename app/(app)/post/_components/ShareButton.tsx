"use client";
import { Share2 } from "lucide-react";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const generateLink = (id: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/post/${id}`;
};

const ShareButton = ({ id }: { id: string }) => {
  return (
    <Button
      variant="unstyled"
      onClick={async () => {
        // navigator.clipboard.writeText(link);
        // toast.success("Link copied to clipboard");
        // console.log(generateLink(id));
        await navigator.share({ url: generateLink(id) });
      }}
    >
      <Share2 className="text-[#696969]" />
    </Button>
  );
};

export default ShareButton;
