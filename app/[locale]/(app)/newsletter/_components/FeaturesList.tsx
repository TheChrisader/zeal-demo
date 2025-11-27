"use client";

export function FeaturesList() {
  return (
    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
      <div className="rounded-lg bg-secondary/30 p-3">
        <div className="font-bold text-primary">Weekly</div>
        <div className="text-xs text-muted-foreground">Updates</div>
      </div>
      <div className="rounded-lg bg-secondary/30 p-3">
        <div className="font-bold text-primary">Curated</div>
        <div className="text-xs text-muted-foreground">Content</div>
      </div>
      <div className="rounded-lg bg-secondary/30 p-3">
        <div className="font-bold text-primary">Unlimited</div>
        <div className="text-xs text-muted-foreground">Access</div>
      </div>
    </div>
  );
}