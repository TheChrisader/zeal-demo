import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, XCircle, Image as ImageIcon } from "lucide-react";
import { validateThumbnailAspectRatio, ImageValidationError } from "@/utils/file.utils";
import { toast } from "sonner";

interface ImageUploadPreviewProps {
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onReset: () => void;
  label?: string;
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  currentImageUrl = null,
  onFileSelect,
  onReset,
  label = "Thumbnail Image",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validate aspect ratio before proceeding
        await validateThumbnailAspectRatio(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        onFileSelect(file);
      } catch (error) {
        if (error instanceof ImageValidationError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to validate image. Please try again.");
        }
        // Reset the file input to allow re-selection
        event.target.value = '';
      }
    }
  };

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        try {
          // Validate aspect ratio before proceeding
          await validateThumbnailAspectRatio(file);

          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
          onFileSelect(file);
        } catch (error) {
          if (error instanceof ImageValidationError) {
            toast.error(error.message);
          } else {
            toast.error("Failed to validate image. Please try again.");
          }
        }
      } else {
        // Handle invalid file type, maybe show a toast
        toast.warn("Invalid file type dropped. Please select an image file.");
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    [],
  );

  const handleResetClick = () => {
    setPreviewUrl(currentImageUrl || null); // Reset preview to original or nothing
    onFileSelect(null); // Clear any selected file
    onReset(); // Propagate reset to parent
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        className={`cursor-pointer rounded-md border-2 border-dashed p-6 text-center ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-gray-400"
        } transition-colors duration-200 ease-in-out`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-upload-input")?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUrl ? (
          <div className="group relative flex h-32 w-full items-center justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-full max-w-full rounded-md object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="text-white hover:text-red-400"
              >
                <XCircle className="mr-1 h-5 w-5" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
            <UploadCloud className="h-12 w-12" />
            <p className="text-sm">
              Drag & drop an image here, or click to select a file.
            </p>
          </div>
        )}
      </div>
      {(previewUrl !== currentImageUrl || (currentImageUrl && !previewUrl)) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetClick}
          className="mt-1 p-1 text-xs"
        >
          Reset to Original
        </Button>
      )}
    </div>
  );
};

export default ImageUploadPreview;
