"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import React from "react";
import HTMLParserRenderer from "@/components/custom/ArticleDisplay";
import { IDraft, IPost } from "@/types";

interface PreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: IDraft | IPost | null;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({ isOpen, onClose, document }) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] max-h-[900px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Eye className="size-5" />
            Preview: {document.title || "Untitled Document"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{document.title}</h1>
              {document.description && (
                <p className="text-lg text-muted-foreground">{document.description}</p>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              {document.content && (
                <HTMLParserRenderer
                  htmlString={document.content}
                  category={document.category || []}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;