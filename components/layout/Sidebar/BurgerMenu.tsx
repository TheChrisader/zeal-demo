import React from "react";
import { Menu, X } from "lucide-react";

interface BurgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
  isOpen,
  onToggle,
  className = "",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative rounded-xl p-3 overflow-hidden
        text-gray-600 dark:text-gray-400
        hover:text-gray-900 dark:hover:text-white
        bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950
        hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10
        shadow-lg hover:shadow-xl shadow-black/5 dark:shadow-black/20
        transition-all duration-300 hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
        group
        ${className}
      `}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300"></div>
      {isOpen ? (
        <X className="relative size-6 transition-all duration-300 rotate-0 group-hover:rotate-90" />
      ) : (
        <Menu className="relative size-6 transition-all duration-300 group-hover:scale-110" />
      )}
    </button>
  );
};