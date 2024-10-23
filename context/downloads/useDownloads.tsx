import { useContext } from "react";

import DownloadsContext from ".";

const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (context === null) {
    throw new Error(
      "useDownloads must be used within a DownloadsContextProvider",
    );
  }
  return context;
};

export default useDownloads;
