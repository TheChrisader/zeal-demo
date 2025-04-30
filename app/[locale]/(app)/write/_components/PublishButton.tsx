"use client";
import { Button } from "@/components/ui/button";
import useActionHandler from "../_context/action-handler/useActionHandler";
import ConfirmationModal from "./ConfirmationModal";

const PublishButton = ({ className }: { className?: string }) => {
  const { publishRef, isPublishLoading, publishError } = useActionHandler(); // Get specific publish loading/error state

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
        disabled={isPublishLoading} // Disable button when publishing
      >
        {isPublishLoading ? "Publishing..." : "Publish"}{" "}
        {/* Show loading text */}
      </Button>
      {/* {publishError && (
          <p className="mt-1 text-sm text-red-500">{publishError}</p>
        )}{" "} */}
      {/* Display publish error */}
    </ConfirmationModal>
  );
};

export default PublishButton;
