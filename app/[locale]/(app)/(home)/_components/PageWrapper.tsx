import React, { forwardRef, ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ children }, ref) => {
    return (
      <div className="px-[100px] max-[1024px]:px-7 max-[500px]:px-0" ref={ref}>
        {children}
      </div>
    );
  },
);

PageWrapper.displayName = "PageWrapper";

export default PageWrapper;
