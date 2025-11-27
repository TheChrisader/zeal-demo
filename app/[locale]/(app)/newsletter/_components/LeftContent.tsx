"use client";

import { Mail, Star, TrendingUp } from "lucide-react";

export function LeftContent() {
  return (
    <div className="hidden flex-col items-center justify-center space-y-8 lg:flex">
      {/* Main visual card with enhanced design */}
      <div className="group relative">
        {/* Animated background gradient */}
        <div className="absolute -inset-1 animate-pulse rounded-3xl bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 opacity-75 blur-lg transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>

        {/* Main content card */}
        <div className="relative flex size-80 flex-col items-center justify-center rounded-3xl border border-border/50 bg-gradient-to-br from-background via-card to-background/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Floating elements for visual interest */}
          <div className="absolute right-4 top-4 size-3 animate-bounce rounded-full bg-primary/40"></div>
          <div className="absolute bottom-6 left-6 size-2 animate-ping rounded-full bg-purple-400/40"></div>
          <div
            className="absolute left-8 top-12 size-4 animate-spin rounded-full border-2 border-primary/30"
            style={{ animationDuration: "8s" }}
          ></div>

          {/* Enhanced icon container */}
          <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/10 p-6 shadow-lg">
            <div className="relative">
              <Mail className="size-8 text-primary" />
              <div className="absolute -right-1 -top-1 size-3 animate-pulse rounded-full bg-green-400"></div>
            </div>
          </div>

          <h2 className="mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-center text-xl font-bold text-transparent">
            Stay Connected
          </h2>
          <p className="text-center leading-relaxed text-muted-foreground">
            Exclusive insights and expert analysis delivered weekly
          </p>

          {/* Value proposition */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="size-3 text-yellow-500" />
              <span>Quality Content</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Mail className="size-3 text-blue-500" />
              <span>Weekly Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced marketing copy */}
      <div className="max-w-md space-y-4 text-center">
        <h2 className="bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text text-2xl font-bold leading-tight text-transparent">
          Stay Ahead of the Curve
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Get curated insights, expert analysis, and exclusive content delivered
          fresh to your inbox
        </p>

        {/* Feature highlights */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[
            { icon: Star, label: "Quality Content", color: "text-yellow-500" },
            {
              icon: TrendingUp,
              label: "Industry Trends",
              color: "text-green-500",
            },
            { icon: Mail, label: "Weekly Updates", color: "text-blue-500" },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 backdrop-blur-sm"
            >
              <feature.icon className={`size-4 ${feature.color}`} />
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Call to action */}
        {/* <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Be among the first to join our growing community</span>
        </div> */}
      </div>
    </div>
  );
}
