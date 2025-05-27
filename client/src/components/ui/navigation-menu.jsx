import * as React from "react";

const NavigationMenu = React.forwardRef(({ className = "", ...props }, ref) => (
  <nav ref={ref} className={`navigation-menu ${className}`} {...props} />
));
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef(({ className = "", ...props }, ref) => (
  <ul ref={ref} className={`navigation-menu-list ${className}`} {...props} />
));
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <li ref={ref} className={`navigation-menu-item ${className}`} {...props} />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

const NavigationMenuLink = React.forwardRef(({ className = "", ...props }, ref) => (
  <a ref={ref} className={`navigation-menu-link ${className}`} {...props} />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
}; 