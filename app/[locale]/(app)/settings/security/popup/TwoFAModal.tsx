"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TwoFAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string;
  onVerify: (
    code: string,
  ) => Promise<{ success: boolean; backupCodes?: string[] }>;
}

export default function TwoFAModal({
  open,
  onOpenChange,
  qrCode,
  onVerify,
}: TwoFAModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      const result = await onVerify(verificationCode);
      // Check if response contains backup codes
      if (result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
        // Don't close modal yet, show backup codes first
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupCodesDone = () => {
    setShowBackupCodes(false);
    setBackupCodes([]);
    setVerificationCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!showBackupCodes ? (
          <>
            <DialogHeader className="space-y-4">
              <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
              <Separator />
              <DialogDescription className="space-y-4">
                <p>
                  Scan the QR code below with your authenticator app (Google
                  Authenticator, Microsoft Authenticator, etc.) to set up 2FA.
                </p>
                <div className="flex justify-center py-4">
                  {qrCode ? <QRCode value={qrCode} /> : <p>Loading...</p>}
                </div>
                <p>
                  Enter the 6-digit code from your authenticator app to verify:
                </p>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-wider"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className="w-full rounded-full transition-all duration-200 hover:scale-[1.02]"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="w-full rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-4">
              <DialogTitle>Save Your Backup Codes</DialogTitle>
              <Separator />
              <DialogDescription className="space-y-4">
                <div className="space-y-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    These codes won&apos;t be shown again. Store them securely
                    for account recovery.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="rounded border border-border bg-background p-2 text-center font-mono text-xs"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join("\n"));
                  setCodesCopied(true);
                  toast.success("Backup codes copied to clipboard!");
                  setTimeout(() => setCodesCopied(false), 2000);
                }}
                className={`group/btn flex-1 transition-all duration-200 ${
                  codesCopied
                    ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                    : ""
                }`}
              >
                {codesCopied ? (
                  <>
                    <Check className="mr-2 size-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 size-4 text-muted-foreground transition-colors group-hover/btn:text-foreground" />
                    Copy All Codes
                  </>
                )}
              </Button>
              <Button onClick={handleBackupCodesDone} className="flex-1">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
