"use client";

import { Gift, Loader2, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Step {
  icon: typeof Users;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const steps: Step[] = [
  {
    icon: Users,
    label: "Share",
    description: "Invite friends easily",
    iconBg: "bg-blue-500/5 group-hover:bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Gift,
    label: "Earn",
    description: "Get rewards for signups",
    iconBg: "bg-green-500/5 group-hover:bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: TrendingUp,
    label: "Track",
    description: "Monitor your progress",
    iconBg: "bg-purple-500/5 group-hover:bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

interface GetStartedPromptProps {
  isGeneratingCode: boolean;
  onGenerateCode: () => void;
}

const GetStartedPrompt = ({
  isGeneratingCode,
  onGenerateCode,
}: GetStartedPromptProps) => {
  return (
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
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10"
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`rounded-lg p-2.5 transition-all duration-200 ${step.iconBg}`}
                  >
                    <Icon className={`size-5 ${step.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/80">
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          onClick={onGenerateCode}
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
  );
};

export default GetStartedPrompt;
