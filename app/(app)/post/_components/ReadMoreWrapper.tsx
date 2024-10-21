"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const ReadMoreWrapper = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  if (open) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      <div className="absolute size-full bg-gradient-to-b from-transparent to-white"></div>
      <Button
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        onClick={handleOpen}
        // variant="link"
      >
        Continue Reading
      </Button>
      {children}
    </div>
  );
};

export default ReadMoreWrapper;
