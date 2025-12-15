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
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-lg transition-all duration-300">
            <Users className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-foreground/90">
              Recent Referrals
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              See who has recently signed up using your referral code
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {referrals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-muted-foreground/5 to-muted-foreground/0 p-6">
              <Users className="size-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-medium text-muted-foreground/60">
              No referrals yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground/50">
              Start sharing your referral code to see results here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => (
              <div
                key={referral.id as string}
                className={`group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10 ${index === 0 ? "ring-2 ring-primary/5" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="size-12 border-2 border-background shadow-sm">
                      <AvatarImage
                        src={referral.avatar || undefined}
                        alt={referral.display_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 font-semibold text-primary">
                        {referral.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 shadow-lg">
                        <div className="size-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground/90">
                        {referral.display_name}
                      </p>
                      {index === 0 && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                          Newest
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm text-muted-foreground/70">
                      @{referral.username}
                    </p>
                  </div>

                  <div className="hidden items-center gap-2 text-sm text-muted-foreground/60 sm:flex">
                    <Calendar className="size-4" />
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(referral.created_at))}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {referrals.length >= 10 && (
              <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground/60">
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
