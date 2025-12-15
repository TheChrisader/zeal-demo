"use client";

import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-lg transition-all duration-300">
            <Gift className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-foreground/90">
              Your Referral Code
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Share this code with friends to earn rewards when they sign up
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Referral Code
            </label>
            <div className="h-px flex-1 bg-border/30" />
          </div>
          <div className="group relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  value={referralCode}
                  readOnly
                  className="h-14 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 pr-12 text-center font-mono text-xl font-bold tracking-wider text-primary shadow-none transition-all duration-200 focus:border-primary/40 focus:bg-muted/10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-muted-foreground/50">
                  Code
                </div>
              </div>
              <Button
                onClick={handleCopyCode}
                className={`group/btn relative size-14 shrink-0 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-muted/10 ${codeCopied ? "border-green-500/30 bg-green-500/5" : ""}`}
                variant="outline"
              >
                {codeCopied ? (
                  <Check className="size-5 text-green-600" />
                ) : (
                  <Copy className="size-5 text-muted-foreground/70 transition-colors group-hover/btn:text-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {referralLink && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Referral Link
              </label>
              <div className="h-px flex-1 bg-border/30" />
            </div>
            <div className="group relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    value={referralLink}
                    readOnly
                    className="h-14 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 pr-12 font-mono text-sm shadow-none transition-all duration-200 focus:border-primary/40 focus:bg-muted/10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-muted-foreground/50">
                    Link
                  </div>
                </div>
                <Button
                  onClick={handleCopyLink}
                  className={`group/btn relative size-14 shrink-0 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-muted/10 ${linkCopied ? "border-green-500/30 bg-green-500/5" : ""}`}
                  variant="outline"
                >
                  {linkCopied ? (
                    <Check className="size-5 text-green-600" />
                  ) : (
                    <Copy className="size-5 text-muted-foreground/70 transition-colors group-hover/btn:text-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-blue-500/5 to-blue-500/0 p-4 transition-all duration-200 hover:border-blue-500/20 hover:bg-blue-500/5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 transition-all duration-200 group-hover:bg-blue-500/20">
              <Gift className="size-4 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground/90">
                How it works
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                Share your code or link with friends. When they sign up using
                your referral, you'll earn rewards!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCodeCard;
