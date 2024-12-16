import { Dock, EllipsisVertical, Smartphone } from "lucide-react";
import React, { SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AddToHomescreen = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Install app</DialogTitle>
          <DialogDescription>
            This site has app capabilities. Add it to your home screen for an
            extensive experience and easy access.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex w-full flex-col gap-3 text-muted-foreground">
          <li className="flex items-center gap-4">
            <EllipsisVertical className="min-w-6" />
            <span className="text-xs">
              1) Open the menu next to the url bar.
            </span>
          </li>
          <li className="flex items-center gap-4">
            <Smartphone className="min-w-6" />
            <span className="text-xs">
              2) You&apos;ll see an option, &quot;Add to Home screen&quot;, or
              something similar. Select that and follow the prompts.
            </span>
          </li>
          <li className="flex items-center gap-4">
            <Dock className="min-w-6" />
            <span className="text-xs">
              3) The app should be automatically installed on your home screen.
            </span>
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default AddToHomescreen;
