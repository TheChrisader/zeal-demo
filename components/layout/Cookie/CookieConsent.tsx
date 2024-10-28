"use client";
import { useEffect } from "react";
import * as CC from "vanilla-cookieconsent";
import pluginConfig from "./CookieConsentConfig";

import "vanilla-cookieconsent/dist/cookieconsent.css";

const CookieConsentComponent = () => {
  useEffect(() => {
    /**
     * useEffect is executed twice (React 18+),
     * make sure the plugin is initialized and executed once
     */
    if (!document.getElementById("cc--main")) {
      CC.run(pluginConfig);
    }
  }, []);

  return null;
};

export default CookieConsentComponent;
