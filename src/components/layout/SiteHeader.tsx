import { Link } from "@tanstack/react-router";
import { Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/flirtspace-logo.png.asset.json";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/characters", label: "Personaggi" },
  { to: "/pricing", label: "Prezzi" },
  { to: "/dashboard", label: "Area personale" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border/60 bg-background/80 shadow-[0_8px_30px_-20px_oklch(0_0_0/90%)] backdrop-blur-xl"
          : "border-transparent bg-background/40 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 transition-all duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <img
            src={logo.url}
            alt="Logo FlirtSpace"
            width={512}
            height={512}
            className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-border/70 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="truncate font-display text-lg font-semibold tracking-tight">
            Flirt<span className="text-gradient">Space</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[image:var(--gradient-primary)] after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100"
              activeProps={{ className: "text-foreground after:scale-x-100" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Accedi</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/characters">
              <Sparkles className="h-4 w-4" /> Inizia gratis
            </Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/50 backdrop-blur transition-colors hover:border-primary/50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-pop-in rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Button variant="hero" size="lg" className="mt-3" asChild>
              <Link to="/characters" onClick={() => setOpen(false)}>
                <Sparkles className="h-4 w-4" /> Inizia gratis
              </Link>
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              50 crediti gratuiti · nessuna carta richiesta
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
