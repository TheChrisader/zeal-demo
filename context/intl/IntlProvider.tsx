import { usePathname } from "next/navigation";
import { IntlProvider as NextIntlProvider } from "next-intl";

export default function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <NextIntlProvider
      locale={pathname.split("/")[1] || "en"}
      messages={require(`../../locales/${pathname.split("/")[1] || "en"}`)}
      onError={(error) => {
        console.log(error);
      }}
    >
      {children}
    </NextIntlProvider>
  );
}
