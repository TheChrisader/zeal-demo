import imageCompression from "browser-image-compression";
import crypto from "crypto";
import path from "path";

import { uploadImageToS3 } from "@/lib/bucket";
import { IFile, ImageMimetype } from "../types/file.type";

const imageMimetypes: string[] = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as ImageMimetype[];

export const AUTHORIZED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const AUTHORIZED_IMAGE_SIZE = 1024 * 1024 * 5; // 5 MB

export const getFileExtension = (fileName: string) => fileName.split(".").pop();

export const generateUniqueNameFromFileName = (
  filename: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) {
        return reject(err);
      }
      const generatedName =
        raw.toString("hex") +
        "-" +
        path.basename(filename ? "" : "").replace(/\s/g, "");
      resolve(generatedName);
    });
  });
};

export const convertFileRequestObjetToModel = (
  fileObj: File | (Blob & { name: string }),
  fileKey: string,
): Omit<
  IFile,
  "id" | "created_by" | "created_at" | "updated_at" | "updated_by"
> => {
  const file = {
    original_name: fileObj.name,
    custom_name: fileObj.name,
    mimetype: fileObj.type,
    extension: getFileExtension(fileObj.name),
    size: fileObj.size,
    key: fileKey,
  };
  return file;
};

export const checkIfFileIsAnImage = (
  fileType: string,
): fileType is ImageMimetype => {
  return typeof fileType === "string" && imageMimetypes.includes(fileType);
};

type ImageOptimizationOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
};

export const optimizeImage = async (
  fileImage: File,
  options?: ImageOptimizationOptions,
): Promise<File> => {
  try {
    const compressedFile = await imageCompression(fileImage, {
      maxSizeMB: options?.maxSizeMB || 0.512,
      maxWidthOrHeight: options?.maxWidthOrHeight || 500,
    });

    return compressedFile;
  } catch (error) {
    throw error;
  }
};

export const getKeyFromUrl = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const urlObj = new URL(url);

  const path = urlObj.pathname;

  const key = path.startsWith("/") ? path.slice(1) : path;

  return key;
};

// Aspect ratio configuration
export const REQUIRED_ASPECT_RATIO = 16 / 9; // 1.777...
export const ASPECT_RATIO_TOLERANCE = 0.01; // Allow small variations

export class ImageValidationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const validateImageAspectRatio = (
  file: File,
): Promise<{ width: number; height: number; aspectRatio: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;

      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);

      resolve({ width, height, aspectRatio });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageValidationError("Failed to load image for validation.", 422));
    };

    img.src = objectUrl;
  });
};

export const validateThumbnailAspectRatio = async (file: File): Promise<void> => {
  try {
    const { aspectRatio } = await validateImageAspectRatio(file);

    const difference = Math.abs(aspectRatio - REQUIRED_ASPECT_RATIO);

    if (difference > ASPECT_RATIO_TOLERANCE) {
      throw new ImageValidationError(
        `Image aspect ratio (${aspectRatio.toFixed(2)}) does not match required ratio (${REQUIRED_ASPECT_RATIO.toFixed(2)}). Please use an image with a 16:9 aspect ratio.`,
        422
      );
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      throw error;
    }
    throw new ImageValidationError("Failed to validate image aspect ratio.", 422);
  }
};

export const validateAndUploadImage = async (
  file: Blob & { name: string },
  path: string,
): Promise<string> => {
  if (!AUTHORIZED_IMAGE_MIME_TYPES.includes(file.type)) {
    throw new ImageValidationError("Wrong file format.", 422);
  }

  if (file.size > AUTHORIZED_IMAGE_SIZE) {
    throw new ImageValidationError("File size is too large.", 422);
  }

  const photoKey = await uploadImageToS3(file, path);

  if (!photoKey) {
    throw new ImageValidationError("Failed to upload image.", 500);
  }

  return photoKey;
};
