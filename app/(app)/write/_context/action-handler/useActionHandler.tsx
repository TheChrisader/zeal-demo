import { useContext } from "react";

import ActionHandlerContext from ".";

const useActionHandler = () => {
  const context = useContext(ActionHandlerContext);
  if (context === null) {
    throw new Error("useActionHandler is null");
  }
  if (context === undefined) {
    throw new Error("useActionHandler was used outside of its Provider");
  }
  return context;
};

export default useActionHandler;
