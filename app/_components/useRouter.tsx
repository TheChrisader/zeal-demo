"use client";

import {
  NavigateOptions,
  PrefetchOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useLocale } from "next-intl";
import {
  useRouter as progressUseRouter,
  RouterNProgressOptions,
} from "next-nprogress-bar";

export type Router = ReturnType<typeof progressUseRouter>;

export const useRouter = (): Router => {
  const router = progressUseRouter();
  const locale = useLocale();

  const push = (
    href: string,
    options?: NavigateOptions,
    NProgressOptions?: RouterNProgressOptions,
  ) => {
    let url: string;
    if (href.trim().startsWith("/")) {
      url = `/${locale}${href}`;
    } else {
      url = `/${locale}/${href}`;
    }

    return router.push(url, options, NProgressOptions);
  };

  const replace = (
    href: string,
    options?: NavigateOptions,
    NProgressOptions?: RouterNProgressOptions,
  ) => {
    let url: string;
    if (href.trim().startsWith("/")) {
      url = `/${locale}${href}`;
    } else {
      url = `/${locale}/${href}`;
    }

    return router.replace(url, options, NProgressOptions);
  };

  const prefetch = (href: string, options?: PrefetchOptions) => {
    let url: string;
    if (href.trim().startsWith("/")) {
      url = `/${locale}${href}`;
    } else {
      url = `/${locale}/${href}`;
    }

    return router.prefetch(url, options);
  };

  return { ...router, push, replace, prefetch };
};
