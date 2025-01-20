import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Newspaper className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">No posts yet</h2>
      <p className="mb-4 max-w-sm text-muted-foreground">
        Follow more people to see their posts in your feed. You can also explore
        trending topics to find interesting content.
      </p>
      {/* <Button>Explore Topics</Button> */}
    </div>
  );
}

export default EmptyFeed;
