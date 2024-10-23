"use client";
import { useState } from "react";
import DownloadsContext, { DownloadsContextValue } from ".";

const DownloadsProvider = ({ children }: { children: React.ReactNode }) => {
  const [postID, setPostID] = useState<string | null>(null);
  return (
    <DownloadsContext.Provider
      value={{
        postID,
        setPostID,
      }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
export default DownloadsProvider;
