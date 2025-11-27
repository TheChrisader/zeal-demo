export function LoadingScreen() {
  return (
    <div className="flex min-h-[calc(100vh-62px)] items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
