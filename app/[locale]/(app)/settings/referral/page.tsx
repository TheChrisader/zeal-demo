"use client";

import { Copy, ExternalLink, Gift, Loader2, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  copyReferralCode,
  copyReferralLink,
  generateReferralCode,
  getReferralAnalytics,
} from "@/services/referral.services";
import { IReferralAnalytics } from "@/types/referral.type";
import ReferralCodeCard from "./_components/ReferralCodeCard";
import ReferralHistory from "./_components/ReferralHistory";
import ReferralStats from "./_components/ReferralStats";

const ReferralPage = () => {
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const [analytics, setAnalytics] = useState<IReferralAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const loadAnalytics = async () => {
        try {
          // If user has a referral code, load analytics
          if (user?.referral_code) {
            const analyticsData = await getReferralAnalytics();
            setAnalytics(analyticsData);
          }
        } catch (error) {
          console.error("Failed to load referral analytics:", error);
          toast.error("Failed to load referral analytics");
        } finally {
          setIsLoading(false);
        }
      };

      loadAnalytics();
    } else if (!loading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [loading, isAuthenticated, user?.referral_code]);

  const handleGenerateReferralCode = async () => {
    if (!user) return;

    setIsGeneratingCode(true);
    try {
      const result = await generateReferralCode(user.id);
      toast.success(result.message);

      // Reload analytics data (user data will be updated through auth context)
      if (result.referral_code) {
        const analyticsData = await getReferralAnalytics();
        setAnalytics(analyticsData);
        refresh();
      }
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards when they sign up.
        </p>
      </div>

      <Separator />

      {!user.referral_code ? (
        <Card className="border-dashed">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="size-8 text-primary" />
            </div>
            <CardTitle className="text-xl">
              Invite Friends, Earn Rewards
            </CardTitle>
            <CardDescription className="text-base">
              Get your unique referral code and start earning when friends join
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Users className="mr-2 size-4" />
                <span>Share with friends</span>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Gift className="mr-2 size-4" />
                <span>Earn rewards when they sign up</span>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Share2 className="mr-2 size-4" />
                <span>Track your referrals</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateReferralCode}
              disabled={isGeneratingCode}
              size="lg"
              className="w-full text-primary sm:w-auto"
            >
              {isGeneratingCode ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Code...
                </>
              ) : (
                <>
                  <Gift className="mr-2 size-4" />
                  Get My Referral Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="size-5" />
                  Share Your Referral
                </CardTitle>
                <CardDescription>
                  Share your referral link on social media or directly with
                  friends.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.referral_link && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        window.open(
                          `https://twitter.com/intent/tweet?text=Check out this amazing platform! Join using my referral link: ${analytics.referral_link}`,
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Share on Twitter
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${analytics.referral_link}`,
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Share on Facebook
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${analytics.referral_link}`,
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="mr-2 size-4" />
                      Share on LinkedIn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <ReferralHistory referrals={analytics?.recent_referrals || []} />
        </>
      )}
    </div>
  );
};

export default ReferralPage;
