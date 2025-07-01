import React from "react";

function NavigationMenu({ className = "", children, ...props }) {
  return (
    <nav className={`navigation-menu ${className}`} {...props}>
      {children}
    </nav>
  );
}

function NavigationMenuList({ className = "", children, ...props }) {
  return (
    <ul className={`navigation-menu-list ${className}`} {...props}>
      {children}
    </ul>
  );
}

function NavigationMenuItem({ className = "", children, ...props }) {
  return (
    <li className={`navigation-menu-item ${className}`} {...props}>
      {children}
    </li>
  );
}

function NavigationMenuLink({ className = "", children, ...props }) {
  return (
    <a className={`navigation-menu-link ${className}`} {...props}>
      {children}
    </a>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
};
