import React from "react";

// Simple button with variant and size support using className
function Button({ 
  children, 
  className = "", 
  variant = "default", 
  size = "default", 
  ...props 
}) {
  // Simple classes for variants and sizes
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-400 bg-white text-black",
    secondary: "bg-gray-200 text-black",
    ghost: "bg-transparent hover:bg-gray-100",
    link: "text-blue-600 underline hover:text-blue-800",
  };
  const sizes = {
    default: "h-9 px-4 py-2 text-sm rounded-md",
    sm: "h-8 px-3 py-1 text-xs rounded-md",
    lg: "h-10 px-8 py-3 text-base rounded-md",
    icon: "h-9 w-9 flex items-center justify-center rounded-full",
  };
  // Combine all classes
  const btnClass = `${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`;

  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}

export { Button };
