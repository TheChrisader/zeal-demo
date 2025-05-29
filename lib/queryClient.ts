// lib/getQueryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// cache() ensures that an instance is created only once per request.
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // Default staleTime for server-fetched queries
        },
      },
    }),
);
export default getQueryClient;
