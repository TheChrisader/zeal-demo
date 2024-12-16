"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReportArticle } from "@/hooks/useReportArticle";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Flag } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const reasons = [
  "spam",
  "harassment",
  "violence",
  "hate",
  "misinformation",
  "other",
] as const;

const ReportDialog = ({ articleId }: { articleId: string }) => {
  const {
    isOpen,
    setIsOpen,
    stage,
    reason,
    openReport,
    description,
    closeReport,
    selectReason,
    setDescription,
    submitReport,
  } = useReportArticle(articleId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={openReport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Article</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <RadioGroup
            value={reason || ""}
            onValueChange={(value) =>
              selectReason(value as (typeof reasons)[number])
            }
          >
            {reasons.map((r) => (
              <div key={r} className="mb-2 flex items-center space-x-2">
                <RadioGroupItem value={r} id={r} />
                <Label
                  htmlFor={r}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <AnimatePresence>
          {reason === "other" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                placeholder="Please provide more details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!reason) return;
              submitReport(articleId, reason, description);
            }}
            disabled={!reason || (reason === "other" && !description.trim())}
            className="mt-4 w-full"
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
