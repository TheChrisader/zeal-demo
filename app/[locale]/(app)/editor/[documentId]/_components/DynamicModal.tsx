import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { createContext, useContext, useState } from "react";

interface IModalConfig {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  size?: "default" | "sm" | "lg" | "xl";
  closable?: boolean;
  onClose?: () => void;
}

interface IModalContext {
  openModal: (modalConfig: IModalConfig) => string;
  closeModal: (id: string) => void;
  closeTopModal: () => void;
}

// Context for managing modal stack
const ModalContext = createContext<IModalContext | null>(null);

// Modal provider to manage multiple modals
export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modals, setModals] = useState<IModalConfig[]>([]);

  const openModal = (modalConfig: IModalConfig) => {
    const id = Date.now().toString();
    setModals((prev) => [...prev, { ...modalConfig, id }]);
    return id;
  };

  const closeModal = (id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id));
  };

  const closeTopModal = () => {
    setModals((prev) => prev.slice(0, -1));
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeTopModal }}>
      {children}
      {modals.map((modal) => (
        <DynamicModal key={modal.id} {...modal} />
      ))}
    </ModalContext.Provider>
  );
};

// Hook to use modal functions
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

// The main dynamic modal component
const DynamicModal = ({
  id,
  title,
  description,
  content,
  footer,
  size = "default",
  closable = true,
  onClose,
}: IModalConfig) => {
  const { closeModal } = useModal();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    closeModal(id);
    if (onClose) onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && closable) {
      handleClose();
    }
  };

  // Render content based on type
  const renderContent = (contentData: React.ReactNode) => {
    if (React.isValidElement(contentData)) {
      return contentData;
    }

    if (typeof contentData === "string") {
      return <div dangerouslySetInnerHTML={{ __html: contentData }} />;
    }

    if (Array.isArray(contentData)) {
      return (
        <div className="space-y-4">
          {contentData.map((item, index) => (
            <div key={index}>{renderContent(item)}</div>
          ))}
        </div>
      );
    }

    if (typeof contentData === "object" && contentData !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(contentData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="mb-1 text-sm font-medium text-gray-600">
                {key}:
              </span>
              <div>{renderContent(value)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <div>{String(contentData)}</div>;
  };

  const sizeClasses: Record<string, string> = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="py-4">{renderContent(content)}</div>

        {footer && <DialogFooter>{renderContent(footer)}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

// Button component that can spawn modals
export const ModalButton = ({
  children,
  modalConfig,
  variant = "default",
  ...buttonProps
}: ButtonProps & { modalConfig: IModalConfig }) => {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(modalConfig);
  };

  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";

  return (
    <Button
      className={`${baseClasses}`}
      onClick={handleClick}
      variant={variant}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};
