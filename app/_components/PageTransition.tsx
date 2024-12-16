"use client";

import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "@/i18n/routing";
import { useContext, useEffect, useMemo, useRef } from "react";

const FrozenRouter = ({
  depth = 1,
  ...props
}: {
  children: React.ReactNode;
  depth?: number;
}) => {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context);

  useEffect(() => {
    if (depth > 1) {
      frozen.current = context;
    }
  }, [context, depth]);

  if (!frozen.current || context?.url === frozen?.current?.url) {
    return <>{props.children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen?.current}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
};

const defaultVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const PageTransition = ({
  children,
  depth = 1,
  slot = "div",
  variants = defaultVariants,
  transition = { ease: "easeInOut", duration: 0.25 },
  mode = "popLayout",
  className,
}: {
  children: React.ReactNode;
  depth?: number;
  slot?: string;
  variants?: Variants;
  transition?: Transition;
  mode?: "wait" | "popLayout" | "sync";
  className?: string;
}) => {
  const key = usePathname();
  const MotionElement = useMemo(() => motion(slot), [slot]);

  if (key.split("/").length - 1 !== depth) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode={mode}>
      <MotionElement
        // @ts-expect-error TODO
        className={className}
        key={key}
        animate="animate"
        exit="exit"
        initial="initial"
        transition={transition}
        variants={variants}
      >
        <FrozenRouter depth={depth}>{children}</FrozenRouter>
      </MotionElement>
    </AnimatePresence>
  );
};

export default PageTransition;
