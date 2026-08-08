import { cn } from "@/lib/utils";

/**
 * Avatar del personaggio con fallback: se manca l'immagine mostra l'iniziale
 * su sfondo gradiente del brand.
 */
export function CharacterAvatar({
  src,
  name,
  className,
  alt,
}: {
  src: string | null | undefined;
  name: string;
  className?: string;
  alt?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        loading="lazy"
        width={640}
        height={640}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "grid place-items-center bg-[image:var(--gradient-primary)] font-display font-semibold text-primary-foreground",
        className,
      )}
    >
      {name.trim().slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}
