"use client";

// shadcn/ui Accordion (Radix), adaptado à identidade OMOPLATA:
// abre com grid-template-rows (sem medir altura) e o ícone são camadas
// do logo que se separam ao abrir.
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-current/15 last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center justify-between gap-6 py-6 text-left text-h3 outline-none transition-colors hover:text-violet-300 focus-visible:text-violet-300",
          className,
        )}
        {...props}
      >
        {children}
        <span aria-hidden className="relative grid size-9 shrink-0 place-items-center">
          <span className="absolute size-9 rounded-[34%] border border-current opacity-40 transition-transform duration-500 ease-expo-out group-data-[state=open]:scale-110" />
          <span className="absolute size-5 rounded-[34%] border border-current transition-transform duration-500 ease-expo-out group-data-[state=open]:rotate-45 group-data-[state=open]:scale-75" />
          <span className="absolute size-1.5 rounded-[34%] bg-current transition-transform duration-500 ease-expo-out group-data-[state=open]:scale-0" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount
      className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-expo-out data-[state=open]:grid-rows-[1fr] data-[state=closed]:[&>div]:invisible"
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("max-w-[60ch] pb-7 text-body opacity-80", className)}>{children}</div>
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
