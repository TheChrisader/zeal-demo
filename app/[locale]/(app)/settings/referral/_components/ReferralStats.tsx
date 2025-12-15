"use client";

import { Award, TrendingUp, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReferralStatsProps {
  totalReferrals: number;
  referralCode: string;
}

const ReferralStats = ({
  totalReferrals,
  referralCode,
}: ReferralStatsProps) => {
  const getReferralLevel = () => {
    if (totalReferrals >= 50)
      return {
        level: "Elite",
        color: "from-purple-500 to-purple-600",
        icon: Award,
        bgColor: "from-purple-500/10 to-purple-500/5",
      };
    if (totalReferrals >= 20)
      return {
        level: "Pro",
        color: "from-blue-500 to-blue-600",
        icon: TrendingUp,
        bgColor: "from-blue-500/10 to-blue-500/5",
      };
    if (totalReferrals >= 5)
      return {
        level: "Rising",
        color: "from-green-500 to-green-600",
        icon: Zap,
        bgColor: "from-green-500/10 to-green-500/5",
      };
    if (totalReferrals >= 1)
      return {
        level: "Starter",
        color: "from-yellow-500 to-yellow-600",
        icon: Users,
        bgColor: "from-yellow-500/10 to-yellow-500/5",
      };
    return {
      level: "Beginner",
      color: "from-muted-foreground to-muted-foreground/80",
      icon: Users,
      bgColor: "from-muted-foreground/5 to-muted-foreground/0",
    };
  };

  const { level, color, icon: Icon, bgColor } = getReferralLevel();

  return (
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg bg-gradient-to-br ${bgColor} p-3 shadow-lg transition-all duration-300`}
          >
            <Icon
              className={`size-6 bg-gradient-to-br ${color} bg-clip-text text-transparent`}
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-foreground/90">
              Referral Stats
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Track your referral performance and rewards
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <div className="grid gap-4">
          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/5 p-2.5 transition-all duration-200 group-hover:bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {totalReferrals}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`h-fit bg-gradient-to-r ${color} border-0 text-white shadow-lg`}
              >
                {level}
              </Badge>
            </div>
          </div>

          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/5 p-2.5 transition-all duration-200 group-hover:bg-blue-500/10">
                  <span className="font-mono text-lg font-bold text-blue-500">
                    #
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Referral Code
                  </p>
                  <p className="font-mono text-lg font-semibold text-foreground/80">
                    {referralCode}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-blue-500/10 px-3 py-1">
                <span className="text-xs font-medium text-blue-600">ID</span>
              </div>
            </div>
          </div>
        </div>

        {totalReferrals > 0 && (
          <div className="group relative rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/5 to-green-500/0 p-4 transition-all duration-200 hover:border-green-500/40 hover:bg-green-500/5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-500/10 p-2 transition-all duration-200 group-hover:bg-green-500/20">
                <Award className="size-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Congratulations!
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground/80">
                  You've successfully referred {totalReferrals} friend
                  {totalReferrals !== 1 ? "s" : ""}! Keep sharing to unlock more
                  rewards.
                </p>
              </div>
            </div>
          </div>
        )}

        {totalReferrals === 0 && (
          <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-500/5 p-2 transition-all duration-200 group-hover:bg-blue-500/10">
                <Zap className="size-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground/90">
                  Ready to Start?
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground/80">
                  Start sharing your referral code with friends to earn rewards
                  and climb the referral ranks!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralStats;
