// To fix "Warning: Only plain objects can be passed to Client Components from Server Components"
export const cleanObject = <T>(response: T) => {
  return JSON.parse(JSON.stringify(response));
};
