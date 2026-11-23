"use client";

import { cn } from "@/lib/utils";
import { DOORS, ctaData, wa, type Service } from "@/lib/site";

/**
 * Invólucro estático dos CTAs (sem seguir o cursor, a pedido do cliente).
 * Mantém só o nome "Magnetic" para não mexer em todo lugar que o usa;
 * o hover de troca de texto continua, por ser um detalhe parado, não um
 * botão que persegue o mouse.
 */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

export function WhatsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

type DoorProps = {
  service: Exclude<Service, "presente">;
  section: string;
  variant?: "solid" | "ghost" | "light" | "violet";
  size?: "md" | "lg" | "xl";
  className?: string;
  label?: string;
  message?: string;
  detail?: string;
};

/** Uma "porta" de agendamento: link real para o WhatsApp, magnético, rastreável. */
export function Door({ service, section, variant = "solid", size = "md", className, label, message, detail }: DoorProps) {
  const door = DOORS[service];
  const styles = {
    solid: "bg-violet-500 text-white hover:bg-violet-400 hover:text-petrol-950",
    ghost: "border border-bone/35 text-bone hover:border-violet-300 bg-petrol-950/75",
    light: "bg-petrol-950 text-bone hover:bg-petrol-700",
    violet: "bg-bone text-petrol-950 hover:bg-white",
  }[variant];
  const sizes = {
    md: "h-14 px-6 text-[0.95rem] gap-3",
    lg: "h-16 px-7 text-base gap-4",
    xl: "min-h-24 px-8 py-6 text-lg md:text-xl gap-5 w-full justify-between",
  }[size];
  return (
    <Magnetic className={cn(size === "xl" && "block w-full", className)}>
      <a
        href={wa(message ?? door.message)}
        target="_blank"
        rel="noopener"
        {...ctaData(section, service, detail)}
        className={cn(
          "group relative inline-flex items-center overflow-hidden rounded-pill font-semibold tracking-[-0.01em] transition-colors duration-500 ease-expo-out",
          styles,
          sizes,
        )}
      >
        <span data-magnetic-inner className="relative flex items-center gap-[inherit]">
          <span className="relative block overflow-hidden">
            <span className="block transition-transform duration-500 ease-expo-out group-hover:-translate-y-full">
              {label ?? door.label}
            </span>
            <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-expo-out group-hover:translate-y-0">
              {label ?? door.label}
            </span>
          </span>
        </span>
        <span className="relative grid size-8 shrink-0 place-items-center rounded-[34%] bg-current/10 transition-transform duration-500 ease-expo-out group-hover:rotate-12">
          <WhatsIcon className="size-[1.05rem]" />
        </span>
        <span className="sr-only"> (abre o WhatsApp)</span>
      </a>
    </Magnetic>
  );
}
