import images from "@/lib/images.json";
import { cn } from "@/lib/utils";

export type ImageName = keyof typeof images;

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "alt" | "className">;

/** <picture> com AVIF + WebP responsivos. Gerados por scripts/otimizar-imagens.mjs */
export function Picture({ name, alt, sizes, className, imgClassName, priority, ...rest }: Props) {
  const meta = images[name];
  const set = (ext: string) => meta.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(", ");
  const largest = meta.widths[meta.widths.length - 1];
  return (
    <picture className={className} style={{ backgroundColor: meta.color }}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/img/${name}-${largest}.webp`}
        alt={alt}
        width={meta.w}
        height={meta.h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("block h-full w-full object-cover", imgClassName)}
        {...rest}
      />
    </picture>
  );
}
