import { createContext } from "react";

export type DownloadsContextValue = {
  postID: string | null;
  setPostID: React.Dispatch<React.SetStateAction<string | null>>;
};

const DownloadsContext = createContext<DownloadsContextValue | null>(null);
export default DownloadsContext;
