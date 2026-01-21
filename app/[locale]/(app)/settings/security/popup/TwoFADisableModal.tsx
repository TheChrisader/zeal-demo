"use client";
import { AlertCircle, ShieldX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TwoFADisableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisable: (code: string) => Promise<void>;
}

export default function TwoFADisableModal({
  open,
  onOpenChange,
  onDisable,
}: TwoFADisableModalProps) {
  const [code, setCode] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsDisabling(true);
    setError("");
    try {
      await onDisable(code);
      setCode("");
      onOpenChange(false);
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setIsDisabling(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2">
            <ShieldX className="size-5 text-orange-500" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <Separator />
          <DialogDescription className="space-y-4">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                Are you sure you want to disable 2FA? This will make your
                account less secure.
              </p>
            </div>
            <p className="text-sm">
              Enter your current 2FA code to confirm:
            </p>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-wider"
              autoFocus
            />
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle className="size-4" />
                {error}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDisabling}
            className="rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={isDisabling}
            className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isDisabling ? "Disabling..." : "Disable 2FA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
