"use client";
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
import Image from "next/image";
import QRCode from "react-qr-code";
import { useState } from "react";

interface TwoFAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string;
  onVerify: (code: string) => Promise<void>;
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

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      await onVerify(verificationCode);
      onOpenChange(false);
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
              {/* <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" /> */}
            </div>
            <p>Enter the 6-digit code from your authenticator app to verify:</p>
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
              onClick={() => onOpenChange(false)}
              className="w-full rounded-full"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-full rounded-full"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
