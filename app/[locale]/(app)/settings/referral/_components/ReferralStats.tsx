"use client";

import { TrendingUp, Users } from "lucide-react";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          Your Stats
        </CardTitle>
        <CardDescription>Track your referral performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Referrals</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {totalReferrals}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Referral Code</span>
            <span className="font-mono font-medium">{referralCode}</span>
          </div>
        </div>

        {totalReferrals > 0 && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            <strong>Great job!</strong> You've successfully referred{" "}
            {totalReferrals} friend{totalReferrals !== 1 ? "s" : ""}!
          </div>
        )}

        {totalReferrals === 0 && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-muted-foreground">
            Start sharing your referral code to earn rewards!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralStats;
