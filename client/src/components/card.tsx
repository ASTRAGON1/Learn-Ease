import React from "react";

// Simple utility to combine classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children, ...props }) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }) {
  return (
    <div className={cn("font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </div>
  );
}

function CardDescription({ className = "", children, ...props }) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

function CardContent({ className = "", children, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className = "", children, ...props }) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
