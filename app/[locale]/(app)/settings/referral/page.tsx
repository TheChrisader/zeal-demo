"use client";

import {
  Award,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
          <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-300 hover:scale-105 sm:size-24">
                <Gift className="size-10 text-primary sm:size-12" />
              </div>
              <CardTitle className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Start Earning Rewards
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground/80">
                Get your unique referral code and earn rewards when friends join
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <div className="mb-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
                <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-lg bg-blue-500/5 p-2.5 transition-all duration-200 group-hover:bg-blue-500/10">
                      <Users className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/80">
                        Share
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Invite friends easily
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-lg bg-green-500/5 p-2.5 transition-all duration-200 group-hover:bg-green-500/10">
                      <Gift className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/80">
                        Earn
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Get rewards for signups
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-lg bg-purple-500/5 p-2.5 transition-all duration-200 group-hover:bg-purple-500/10">
                      <TrendingUp className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/80">
                        Track
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Monitor your progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleGenerateReferralCode}
                disabled={isGeneratingCode}
                size="lg"
                className="relative h-12 min-w-[200px] gap-2 overflow-hidden bg-gradient-to-r from-primary to-primary/90 px-8 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-primary/90 hover:to-primary hover:shadow-xl sm:h-14"
              >
                {isGeneratingCode ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Generating Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    <span>Get My Referral Code</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
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

                <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <div className="rounded-lg bg-primary/5 p-2">
                        <Share2 className="size-5 text-primary" />
                      </div>
                      Share Your Referral
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground/80">
                      Share your referral link on social media or directly with
                      friends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-0">
                    {analytics?.referral_link && (
                      <>
                        <Button
                          variant="outline"
                          className="group relative h-11 w-full justify-start gap-3 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 transition-all duration-200 hover:scale-[1.02] hover:border-primary/30 hover:bg-muted/10"
                          onClick={() => {
                            window.open(
                              `https://twitter.com/intent/tweet?text=Check out this amazing platform! Join using my referral link: ${analytics.referral_link}`,
                              "_blank",
                            );
                          }}
                        >
                          <div className="rounded-lg bg-blue-500/5 p-2 transition-all duration-200 group-hover:bg-blue-500/10">
                            <svg
                              className="size-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </div>
                          <span className="font-medium">Share on Twitter</span>
                          <ExternalLink className="ml-auto size-4 text-muted-foreground/50" />
                        </Button>
                        <Button
                          variant="outline"
                          className="group relative h-11 w-full justify-start gap-3 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 transition-all duration-200 hover:scale-[1.02] hover:border-primary/30 hover:bg-muted/10"
                          onClick={() => {
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${analytics.referral_link}`,
                              "_blank",
                            );
                          }}
                        >
                          <div className="rounded-lg bg-blue-600/5 p-2 transition-all duration-200 group-hover:bg-blue-600/10">
                            <svg
                              className="size-4 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </div>
                          <span className="font-medium">Share on Facebook</span>
                          <ExternalLink className="ml-auto size-4 text-muted-foreground/50" />
                        </Button>
                        <Button
                          variant="outline"
                          className="group relative h-11 w-full justify-start gap-3 border-border/40 bg-gradient-to-r from-background/80 to-muted/5 transition-all duration-200 hover:scale-[1.02] hover:border-primary/30 hover:bg-muted/10"
                          onClick={() => {
                            window.open(
                              `https://www.linkedin.com/sharing/share-offsite/?url=${analytics.referral_link}`,
                              "_blank",
                            );
                          }}
                        >
                          <div className="rounded-lg bg-blue-700/5 p-2 transition-all duration-200 group-hover:bg-blue-700/10">
                            <svg
                              className="size-4 text-blue-700"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </div>
                          <span className="font-medium">Share on LinkedIn</span>
                          <ExternalLink className="ml-auto size-4 text-muted-foreground/50" />
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
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
