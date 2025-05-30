import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { IFile } from "@/types/file.type";
import { generateUniqueNameFromFileName } from "@/utils/file.utils";
import { validateRequest } from "./auth/auth";

const config = {
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY as string,
  },
  region: process.env.BUCKET_REGION as string,
  // apiVersion: process.env.BUCKET_POLICY_VERSION as string,
};

const bucket = new S3Client(config);

export const getFileFromKey = async (file: IFile) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME as string,
    Key: file.key,
  });
  const res = await bucket.send(command);
  const fileBuffer = await res.Body?.transformToByteArray();
  return fileBuffer
    ? `data:${file.mimetype};base64,${Buffer.from(fileBuffer).toString(
        "base64",
      )}`
    : null;
};

export const getMultipleFiles = (files: IFile[]) => {
  const retrievedFiles = files.map(async (file) => {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME as string,
      Key: file.key,
    });
    const fileData = await bucket.send(command);
    const fileBuffer = await fileData.Body?.transformToByteArray();
    return {
      fileString: fileBuffer
        ? `data:${file.mimetype};base64,${Buffer.from(fileBuffer).toString(
            "base64",
          )}`
        : null,
      key: file.key,
    };
  });
  return Promise.all(retrievedFiles);
};

export const deleteFileFromKey = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME as string,
      Key: key,
    });
    await bucket.send(command);
    return;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleFilesFromKey = async (keys: string[]) => {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.BUCKET_NAME as string,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    });
    await bucket.send(command);
    return;
  } catch (error) {
    throw error;
  }
};

export const uploadImageToS3 = async (
  file: Blob & { name: string },
  folderPath = "",
): Promise<string> => {
  const generatedFileName = await generateUniqueNameFromFileName(file.name);

  const fileBufferArray = await file.arrayBuffer();

  const params = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: `${folderPath}${generatedFileName}`,
    Body: Buffer.from(fileBufferArray),
    ContentType: file.type,
  };

  const command = new PutObjectCommand(params);
  await bucket.send(command);

  return `${folderPath}${generatedFileName}`;
};

export const getFieldSignedURL = async (
  key: string,
  expires = 60 * 60 * 24 * 7,
) => {
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
  });
  const url = await getSignedUrl(bucket, command, { expiresIn: expires });
  return url;
};

export const generatePresignedPutUrl = async (
  key: string,
  fileType: string,
  metadata: { userId: string },
  expires: number = 60 * 10,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    ContentType: fileType,
    Metadata: metadata,
  });

  return await getSignedUrl(bucket, command, { expiresIn: expires });
};

export default bucket;
