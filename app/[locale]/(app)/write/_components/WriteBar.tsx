"use client";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useActionHandler from "../_context/action-handler/useActionHandler";
import ConfirmationModal from "./ConfirmationModal";

const WriteBar = () => {
  const { draftRef, isLoading } = useActionHandler(); // Get isLoading from context
  return (
    <div>
      <div className="my-3 flex w-full items-center gap-5 px-[100px] max-[1024px]:px-7 max-[500px]:px-2">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-foreground-alt text-2xl font-bold">Write</h1>
        </div>
        <div className="h-8">
          <Separator orientation="vertical" />
        </div>
        <ConfirmationModal type="draft">
          <Button
            className=""
            variant="outline"
            onClick={() => {
              if (draftRef) {
                draftRef.click();
              }
            }}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Saving..." : "Save to drafts"}{" "}
            {/* Show loading text */}
          </Button>
        </ConfirmationModal>
      </div>
      <Separator />
    </div>
  );
};

export default WriteBar;
