import { redirect as nextRedirect } from "@/i18n/routing";
import { UserRole } from "@/types/user.type";
import { buildError } from "@/utils/error";
import { FORBIDDEN_ERROR, UNAUTHORIZED_ERROR } from "@/utils/error/error-codes";
import { validateRequest } from "./auth";

export interface ProtectionOptions {
  rolesWhiteList?: UserRole[];
  redirect?: string | boolean;
}

export const serverAuthGuard = async (options?: ProtectionOptions) => {
  const { user, session } = await validateRequest();

  const { rolesWhiteList = [], redirect = false } = options || {
    rolesWhiteList: [],
    redirect: false,
  };

  if (!user || !session) {
    if (redirect) {
      return nextRedirect({
        href: typeof redirect === "boolean" ? "/" : redirect,
        locale: "en",
      });
    }
    throw buildError({
      code: UNAUTHORIZED_ERROR,
      message: "Unauthorized.",
      status: 401,
    });
  }

  // console.log(rolesWhiteList?.includes(user.role!), user, user.role);

  if (rolesWhiteList.length > 0 && !rolesWhiteList?.includes(user.role!)) {
    if (redirect) {
      return nextRedirect({
        href: typeof redirect === "boolean" ? "/" : redirect,
        locale: "en",
      });
    }

    throw buildError({
      code: FORBIDDEN_ERROR,
      message: "Forbidden.",
      status: 403,
    });
  }

  return { user, session };
};
