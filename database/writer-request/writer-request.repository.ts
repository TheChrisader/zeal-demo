import { Id } from "@/lib/database";

import { IWriterRequest } from "@/types/writer-request.type";
import WriterRequestModel from "./writer-request.model";

export const createWriterRequest = async (writerRequest: IWriterRequest) => {
  try {
    const newWriterRequest = await WriterRequestModel.create(writerRequest);
    return newWriterRequest.toObject();
  } catch (error) {
    throw error;
  }
};

export const deleteWriterRequestById = async (id: Id) => {
  try {
    const deletedWriterRequest = await WriterRequestModel.findByIdAndDelete(id);
    return deletedWriterRequest?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
