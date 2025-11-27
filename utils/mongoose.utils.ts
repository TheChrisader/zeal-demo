export function isMongooseDuplicateKeyError(err: unknown) {
  if (err && typeof err === "object" && "code" in err && err.code === 11000) {
    return true;
  }
  return false;
}
