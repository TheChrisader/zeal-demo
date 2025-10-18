"use client";

import { Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IReferralUser } from "@/types/referral.type";
import { formatDistanceToNow } from "@/utils/time.utils";

interface ReferralHistoryProps {
  referrals: IReferralUser[];
}

const ReferralHistory = ({ referrals }: ReferralHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          Recent Referrals
        </CardTitle>
        <CardDescription>
          See who has recently signed up using your referral code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 size-12 opacity-50" />
            <p>No referrals yet</p>
            <p className="text-sm">
              Start sharing your referral code to see results here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id as string}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={referral.avatar || undefined}
                    alt={referral.display_name}
                  />
                  <AvatarFallback>
                    {referral.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {referral.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{referral.username}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>
                    {formatDistanceToNow(new Date(referral.created_at))}
                  </span>
                </div>
              </div>
            ))}

            {referrals.length >= 10 && (
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing 10 most recent referrals
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralHistory;
