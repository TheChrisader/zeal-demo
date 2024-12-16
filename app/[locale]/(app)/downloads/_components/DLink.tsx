import { AnchorHTMLAttributes, DetailedHTMLProps } from "react";

type DLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  to: string;
};

export const EVENT = {
  PUSHSTATE: "pushstate",
  POPSTATE: "popstate",
};

export function navigate(href: string) {
  window.history.pushState({}, "", href);
  const navigationEvent = new Event(EVENT.PUSHSTATE);
  window.dispatchEvent(navigationEvent);
}

function DLink({ target, to, ...props }: DLinkProps) {
  const handlerClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (to === window.location.pathname) {
      return;
    }

    const isMainEvent = event.button === 0;
    const isModifiedEvent =
      event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
    const isManageableEvent = target === undefined || target === "_self";

    if (isMainEvent && isManageableEvent && !isModifiedEvent) {
      event.preventDefault();
      navigate(to);
    }
  };

  if (to.trim()[0] === "/") {
    to = window.location.pathname + to;
  }

  return <a onClick={handlerClick} href={to} target={target} {...props} />;
}

export default DLink;
