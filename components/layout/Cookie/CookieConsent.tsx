"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [strictlyNecessary, setStrictlyNecessary] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const cookieChoice = localStorage.getItem("cookieChoice");
    if (!cookieChoice) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieChoice", "accepted");
    setShowBanner(false);
    setShowDialog(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookieChoice", "rejected");
    setStrictlyNecessary(false);
    setShowBanner(false);
    setShowDialog(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookieChoice", "customized");
    localStorage.setItem("strictlyNecessary", String(strictlyNecessary));
    setShowDialog(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 w-[380px] rounded-lg bg-white p-6 shadow-lg max-[450px]:right-0 max-[450px]:w-full max-[450px]:px-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#2F2D32]">
                We use cookies!
              </h2>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Hi, this website uses essential cookies to ensure its proper
              operation and tracking cookies to understand how you interact with
              it.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleAcceptAll}
                className="w-full rounded bg-gray-900 py-3 text-xs font-medium text-[#fff] hover:bg-gray-800"
              >
                Accept all
              </button>
              <button
                onClick={handleRejectAll}
                className="w-full rounded border border-gray-300 bg-white py-3 text-xs font-medium text-[#2F2D32] hover:bg-gray-50"
              >
                Reject all
              </button>
              <button
                onClick={() => setShowDialog(true)}
                className="w-full rounded bg-gray-100 py-3 text-xs font-medium text-gray-900 hover:bg-gray-200"
              >
                Manage preferences
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex max-h-screen w-full max-w-xl flex-col rounded-lg bg-white p-6 shadow-lg"
            >
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#2F2D32]">
                    Cookie Settings
                  </h2>
                  <button
                    onClick={() => setShowDialog(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <Separator />
              </div>

              <div className="mb-6">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                  <Volume2 className="size-5" />
                  Cookie usage
                </h3>
                <p className="text-xs text-muted-foreground">
                  I use cookies to ensure the basic functionalities of the
                  website and to enhance your online experience. You can choose
                  for each category to opt-in/out whenever you want. For more
                  details relative to cookies and other sensitive data, please
                  read the full{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    privacy policy
                  </a>
                  .
                </p>
              </div>
              <div className="mb-6 flex flex-col rounded-lg border border-solid border-gray-300">
                <div className="">
                  <div
                    className={`flex w-full items-center justify-between border-0 border-gray-300 p-3 ${expanded ? "border-b" : ""}`}
                  >
                    <button
                      className="flex items-center gap-2"
                      onClick={() => setExpanded(!expanded)}
                    >
                      <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="size-5" />
                      </motion.div>
                      <h3 className="text-sm font-semibold text-accent-foreground">
                        Strictly necessary cookies
                      </h3>
                    </button>

                    <div
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        strictlyNecessary ? "bg-green-500" : "bg-gray-200",
                      )}
                    >
                      <motion.div
                        className="absolute left-1 top-1 size-4 rounded-full bg-white"
                        animate={{ x: strictlyNecessary ? 20 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 700,
                          damping: 30,
                        }}
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3">
                          <p className="mb-2 text-xs text-muted-foreground">
                            These cookies are essential for the proper
                            functioning of the website. Without these cookies,
                            the website would not work properly
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-accent-foreground">
                  More information
                </h3>
                <p className="text-xs text-muted-foreground">
                  For any queries in relation to our policy on cookies and your
                  choices, please{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    contact us
                  </a>
                  .
                </p>
              </div>
              <div className="flex justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="rounded bg-gray-900 px-4 py-2 text-xs font-medium text-[#fff] hover:bg-gray-800"
                  >
                    Accept all
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-[#2F2D32] hover:bg-gray-50"
                  >
                    Reject all
                  </button>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="rounded bg-gray-100 px-4 py-2 text-xs font-medium text-gray-900 hover:bg-gray-200"
                >
                  Save settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
