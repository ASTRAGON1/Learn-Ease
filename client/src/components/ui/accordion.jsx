import * as React from "react";

const Accordion = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`accordion ${className}`} {...props} />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`accordion-item ${className}`} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className = "", ...props }, ref) => (
  <button ref={ref} className={`accordion-trigger ${className}`} {...props} />
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`accordion-content ${className}`} {...props} />
));
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
}; 