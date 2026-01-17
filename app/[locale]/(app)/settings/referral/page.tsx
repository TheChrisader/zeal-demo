"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import {
  copyReferralCode,
  copyReferralLink,
  generateReferralCode,
} from "@/services/referral.services";
import { useReferralAnalytics } from "@/hooks/useReferralAnalytics";
import EmailVerificationPrompt from "./_components/EmailVerificationPrompt";
import GetStartedPrompt from "./_components/GetStartedPrompt";
import ReferralCodeCard from "./_components/ReferralCodeCard";
import ReferralHistory from "./_components/ReferralHistory";
import ReferralStats from "./_components/ReferralStats";
import SocialShareButtons from "./_components/SocialShareButtons";

const ReferralPage = () => {
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { analytics, isLoading } = useReferralAnalytics({
    enabled: !loading && isAuthenticated && !!user?.referral_code,
    referralCode: user?.referral_code || null,
  });

  const handleGenerateReferralCode = async () => {
    if (!user) return;

    setIsGeneratingCode(true);
    try {
      const result = await generateReferralCode(user.id);
      toast.success(result.message);
      refresh();
    } catch (error) {
      console.error("Failed to generate referral code:", error);
      toast.error("Failed to generate referral code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p>Please sign in to access referral features.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-4 p-4 sm:mx-auto sm:max-w-4xl sm:space-y-6 sm:p-0">
        <Card className="w-full border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-4 p-0 pb-4 sm:pb-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-foreground/80 sm:text-2xl">
                  Referral Program
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  Invite friends and earn rewards when they sign up
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!user.referral_code ? (
          !user.has_email_verified ? (
            <EmailVerificationPrompt />
          ) : (
            <GetStartedPrompt
              isGeneratingCode={isGeneratingCode}
              onGenerateCode={handleGenerateReferralCode}
            />
          )
        ) : (
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardContent className="space-y-6 p-0 sm:space-y-8">
              <ReferralCodeCard
                referralCode={user.referral_code}
                referralLink={analytics?.referral_link || null}
                onCopyCode={copyReferralCode}
                onCopyLink={copyReferralLink}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <ReferralStats
                  totalReferrals={analytics?.total_referrals || 0}
                  referralCode={user.referral_code}
                />

                {analytics?.referral_link && (
                  <SocialShareButtons referralLink={analytics.referral_link} />
                )}
              </div>

              <ReferralHistory referrals={analytics?.recent_referrals || []} />
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ReferralPage;
