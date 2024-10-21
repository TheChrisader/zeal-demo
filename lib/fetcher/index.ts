type FetcherOptions = RequestInit & {
  hasPageCached?: boolean;
};

export const fetcher = async (
  input: RequestInfo | URL,
  options?: FetcherOptions,
) => {
  try {
    const response = await fetch(input, {
      ...options,
      headers: {
        ...options?.headers,
        "Has-Page-Cached": options?.hasPageCached ? "true" : "false",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
