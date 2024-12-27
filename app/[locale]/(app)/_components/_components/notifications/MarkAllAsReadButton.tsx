import { Button } from "@/components/ui/button";

interface MarkAllAsReadButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function MarkAllAsReadButton({
  onClick,
  disabled,
}: MarkAllAsReadButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
      Mark all as read
    </Button>
  );
}
