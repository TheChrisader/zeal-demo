/**
 * Converts a JSON object to FormData
 * @param json - The JSON object to convert
 * @returns The resulting FormData object
 */
export function jsonToFormData(json: Record<string, unknown>): FormData {
  const formData = new FormData();

  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      const value = json[key];

      // Handle arrays (for multiple values under same key)
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, convertValueToString(item));
        });
      }
      // Handle objects (excluding File instances)
      else if (
        typeof value === "object" &&
        value !== null &&
        !(value instanceof File)
      ) {
        // Convert nested objects to JSON strings
        formData.append(key, JSON.stringify(value));
      }
      // Handle all other values except Files and Blobs
      else {
        if (value instanceof File) {
          continue;
        }
        formData.append(
          key,
          convertValueToString(value as boolean | number | string),
        );
      }
    }
  }

  return formData;
}

/**
 * Helper function to convert values to FormData-compatible format
 */
function convertValueToString(value: boolean | number | string): string {
  // Convert booleans to strings
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  // Convert numbers to strings
  if (typeof value === "number") {
    return value.toString();
  }
  // Return as-is for File, Blob, string, etc.
  return value;
}

export function formDataToJson<T = Record<string, unknown>>(
  formData: FormData,
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // If the key already exists
    if (result.hasOwnProperty(key)) {
      // Convert to array if it isn't already
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      // Push the new value
      if (value instanceof File) {
        // (result[key] as File[]).push({
        //   name: value.name,
        //   size: value.size,
        //   type: value.type,
        //   lastModified: value.lastModified,
        // });
      } else {
        (result[key] as unknown[]).push(value);
      }
    } else {
      // New key
      if (value instanceof File) {
        // result[key] = {
        //   name: value.name,
        //   size: value.size,
        //   type: value.type,
        //   lastModified: value.lastModified,
        // };
      } else {
        if (value === "null") {
          result[key] = null;
        } else {
          result[key] = value;
        }
      }
    }
  }

  return result as T;
}
