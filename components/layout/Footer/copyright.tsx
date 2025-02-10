export function Copyright() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>© {currentYear} Zeal News Africa. All Rights Reserved.</p>
      <p>
        {/* Zeal Sans ™ & */} © {currentYear} Zeal News Network.
      </p>
    </div>
  );
}
