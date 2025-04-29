"use client";
import { Button } from "@/components/ui/button";
import useActionHandler from "../_context/action-handler/useActionHandler";
import ConfirmationModal from "./ConfirmationModal";

const PublishButton = ({ className }: { className?: string }) => {
  const { publishRef, isLoading } = useActionHandler(); // Get isLoading from context

  return (
    <ConfirmationModal type="publish">
      <Button
        className={className}
        variant="outline"
        onClick={async () => {
          if (publishRef) {
            publishRef.click();
          }
        }}
        disabled={isLoading} // Disable button when loading
      >
        {isLoading ? "Publishing..." : "Publish"} {/* Show loading text */}
      </Button>
    </ConfirmationModal>
  );
};

export default PublishButton;
