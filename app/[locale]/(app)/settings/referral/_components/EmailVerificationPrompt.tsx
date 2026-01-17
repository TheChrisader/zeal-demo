"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EmailVerificationPrompt = () => {
  return (
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-lg transition-all duration-300 hover:scale-105 sm:size-24">
          <Mail className="size-10 text-amber-500 sm:size-12" />
        </div>
        <CardTitle className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/80">
          Verify your email to start earning rewards with referrals
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 text-center">
        <p className="mb-6 text-sm text-muted-foreground/70">
          Email verification is required before generating a referral code. This
          helps us maintain a secure and trustworthy referral program.
        </p>
        <Button
          onClick={() => (window.location.href = "/verify-email")}
          size="lg"
          className="relative h-12 min-w-[200px] gap-2 overflow-hidden bg-gradient-to-r from-amber-600 to-amber-600/90 px-8 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-amber-600/90 hover:to-amber-600 hover:shadow-xl sm:h-14"
        >
          <Mail className="size-5" />
          <span>Verify Email First</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationPrompt;
