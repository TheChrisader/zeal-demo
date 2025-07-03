"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucia";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"; // Example icons
import React, { useEffect, useState } from "react"; // Added useState
import { useEditorStore } from "@/context/editorStore/useEditorStore";
import { useResizeDelta } from "@/hooks/useResizeDelta";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";

import LeftSidebar from "./LeftSidebar";
import MainContentArea from "./MainContentArea";
import RightSidebar from "./RightSidebar";
import Topbar from "./Topbar";

interface EditorWorkspaceProps {
  activeDocumentId?: string;
}

const EditorWorkspace = ({ activeDocumentId }: EditorWorkspaceProps) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { delta } = useResizeDelta();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleLeftSidebar = () => setIsLeftSidebarOpen(!isLeftSidebarOpen);
  const toggleRightSidebar = () => setIsRightSidebarOpen(!isRightSidebarOpen);

  useEffect(() => {
    const handleSidebars = () => {
      if (window.innerWidth < 1000 && isLeftSidebarOpen && delta.width < 0)
        toggleLeftSidebar();
      if (window.innerWidth < 850 && isRightSidebarOpen && delta.width < 0)
        toggleRightSidebar();
      if (window.innerWidth > 1000 && !isLeftSidebarOpen && delta.width > 0)
        toggleLeftSidebar();
      if (window.innerWidth > 850 && !isRightSidebarOpen && delta.width > 0)
        toggleRightSidebar();
    };

    window.addEventListener("resize", handleSidebars);
    return () => window.removeEventListener("resize", handleSidebars);
  }, [delta]);

  const sidebarVariants = {
    open: (isLeft: boolean) => ({
      width: isMobile ? "80%" : isLeft ? 256 : 256, // md:w-64, lg:w-64, xl:w-72
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
      ...(isMobile && !isLeft && { right: 0 }), // For right sidebar on mobile
      ...(isMobile && isLeft && { left: 0 }), // For left sidebar on mobile
    }),
    closed: (isLeft: boolean) => ({
      width: 0,
      opacity: 0,
      x: isLeft ? "-100%" : "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    }),
  };

  const mobileBackdropVariants = {
    open: { opacity: 0.5, display: "block" },
    closed: { opacity: 0, transitionEnd: { display: "none" } },
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
      />
      <div className="relative flex flex-1 overflow-hidden">
        {" "}
        {/* Added relative for backdrop positioning */}
        {/* Mobile Backdrop for Left Sidebar */}
        {isMobile && (
          <AnimatePresence>
            {isLeftSidebarOpen && (
              <motion.div
                className="fixed inset-0 z-30 bg-black/50 md:hidden"
                variants={mobileBackdropVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={toggleLeftSidebar}
              />
            )}
          </AnimatePresence>
        )}
        {/* Left Sidebar */}
        <AnimatePresence>
          {(isLeftSidebarOpen || !isMobile) && (
            <motion.aside
              custom={true} // true for left
              variants={sidebarVariants}
              initial={isMobile ? "closed" : "open"} // Start closed on mobile if initially open
              animate={isLeftSidebarOpen ? "open" : "closed"}
              exit="closed"
              className={`shrink-0 border-r border-border bg-background-alt md:flex md:flex-col ${isMobile ? "fixed left-0 top-0 z-40 h-full shadow-xl" : "relative"}`}
              style={{ overflow: "hidden" }} // Prevents content spill during animation
            >
              <LeftSidebar
                toggleSidebar={toggleLeftSidebar}
                isOpen={isLeftSidebarOpen}
                isMobile={isMobile}
              />
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Main Content Area */}
        <motion.main
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
          // animate={{
          //   marginLeft: !isMobile && isLeftSidebarOpen ? 256 : 0, // md:w-64
          //   marginRight: !isMobile && isRightSidebarOpen ? 256 : 0, // lg:w-64, xl:w-72 (adjust if widths differ)
          // }}
          // transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <MainContentArea />
        </motion.main>
        {/* Mobile Backdrop for Right Sidebar */}
        {isMobile && (
          <AnimatePresence>
            {isRightSidebarOpen && (
              <motion.div
                className="fixed inset-0 z-30 bg-black/50 md:hidden"
                variants={mobileBackdropVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={toggleRightSidebar}
              />
            )}
          </AnimatePresence>
        )}
        {/* Right Sidebar */}
        <AnimatePresence>
          {(isRightSidebarOpen || !isMobile) && (
            <motion.aside
              custom={false} // false for right
              variants={sidebarVariants}
              initial={isMobile ? "closed" : "open"} // Start closed on mobile if initially open
              animate={isRightSidebarOpen ? "open" : "closed"}
              exit="closed"
              className={`shrink-0 border-l border-border bg-background-alt lg:flex lg:flex-col ${isMobile ? "fixed right-0 top-0 z-40 h-full shadow-xl" : "relative"} xl:w-72`}
              style={{ overflow: "hidden" }} // Prevents content spill during animation
            >
              <RightSidebar
                toggleSidebar={toggleRightSidebar}
                isOpen={isRightSidebarOpen}
                isMobile={isMobile}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditorWorkspace;
