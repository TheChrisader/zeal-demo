"use client";
import { Button } from "@/components/ui/button";
import useActionHandler from "../_context/action-handler/useActionHandler";
import ConfirmationModal from "./ConfirmationModal";

const PublishButton = ({ className }: { className?: string }) => {
  const { publishRef } = useActionHandler();

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
      >
        Publish
      </Button>
    </ConfirmationModal>
  );
};

export default PublishButton;
