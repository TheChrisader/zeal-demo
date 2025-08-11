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
        raw.toString("hex") + "-" + path.basename(filename).replace(/\s/g, "");
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

export class ImageValidationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
