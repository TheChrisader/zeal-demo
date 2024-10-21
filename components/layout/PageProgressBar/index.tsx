"use client";

import { AppProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const PageProgressBar = () => {
  const { theme } = useTheme();
  const [color, setColor] = useState("#2F7830");

  useEffect(() => {
    setColor(theme === "dark" ? "#73f775" : "#2F7830");
  }, [theme]);

  return (
    <AppProgressBar
      color={color}
      height="3px"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
};

export default PageProgressBar;
