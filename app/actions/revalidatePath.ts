"use server";

import { revalidatePath } from "next/cache";

export default async function revalidatePathAction(
  path: string,
  option?: "page" | "layout",
) {
  revalidatePath(path, option);
}
