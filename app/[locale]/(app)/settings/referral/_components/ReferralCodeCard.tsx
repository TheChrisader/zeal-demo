"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Gift } from "lucide-react";
import { toast } from "sonner";

interface ReferralCodeCardProps {
  referralCode: string;
  referralLink: string | null;
  onCopyCode: (code: string) => Promise<boolean>;
  onCopyLink: (link: string) => Promise<boolean>;
}

const ReferralCodeCard = ({
  referralCode,
  referralLink,
  onCopyCode,
  onCopyLink,
}: ReferralCodeCardProps) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      const success = await onCopyCode(referralCode);
      if (success) {
        setCodeCopied(true);
        toast.success("Referral code copied to clipboard!");
        setTimeout(() => setCodeCopied(false), 2000);
      }
    } catch (error) {
      toast.error("Failed to copy referral code");
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      const success = await onCopyLink(referralLink);
      if (success) {
        setLinkCopied(true);
        toast.success("Referral link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (error) {
      toast.error("Failed to copy referral link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Your Referral Code
        </CardTitle>
        <CardDescription>
          Share this code with friends to earn rewards when they sign up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Referral Code</label>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-center text-lg font-bold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {codeCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {referralLink && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <strong>How it works:</strong> Share your code or link with friends. When they sign up using your referral, you'll earn rewards!
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCodeCard;