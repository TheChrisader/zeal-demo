import { Category, extractPath } from "@/categories";
import { Link } from "@/i18n/routing";
import React from "react";

interface NavbarProps {
  items: Category[];
  activeItem?: string;
  onItemClick?: (item: Category) => void;
}

// Generate a consistent muted color based on the item name
const getColorForItem = (name: string) => {
  const colors = [
    "bg-slate-100 text-slate-600",
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-600",
    "bg-rose-100 text-rose-600",
    "bg-cyan-100 text-cyan-600",
    "bg-indigo-100 text-indigo-600",
  ];

  // Create a simple hash from the name to get consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const Navbar: React.FC<NavbarProps> = ({ items, activeItem, onItemClick }) => {
  const handleItemClick = (item: Category) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className="mt-5 flex w-full justify-center px-4 max-[600px]:hidden">
      <div className="flex items-center gap-2 rounded-full bg-card-alt-bg p-2 shadow-sm">
        {items.map((item) => {
          const isActive = activeItem === item.name || activeItem === item.path;
          const colorClasses = getColorForItem(item.name);

          return (
            <Link
              href={extractPath(item.name)}
              key={item.path}
              //   onClick={() => handleItemClick(item)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? `${colorClasses} shadow-sm`
                  : "text-card-foreground hover:bg-background-alt/70 hover:text-primary hover:shadow-sm"
              } `}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
