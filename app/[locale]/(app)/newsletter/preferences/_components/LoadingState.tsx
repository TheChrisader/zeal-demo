"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="size-12 text-primary" />
        </motion.div>
        <p className="text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  );
}