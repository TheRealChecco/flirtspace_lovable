import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/flirtspace-logo.png.asset.json";

const nav = [
  { to: "/characters", label: "Personaggi" },
  { to: "/pricing", label: "Prezzi" },
  { to: "/dashboard", label: "Area personale" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img
            src={logo.url}
            alt="Logo FlirtSpace"
            width={512}
            height={512}
            className="h-9 w-9 shrink-0 rounded-xl object-cover"
          />
          <span className="truncate font-display text-lg font-semibold">
            Flirt<span className="text-gradient">Space</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
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
            <Link to="/characters">Inizia a chattare</Link>
          </Button>
        </div>

        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Apri menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border/60 bg-background/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Button variant="hero" className="mt-2" asChild>
              <Link to="/characters" onClick={() => setOpen(false)}>
                Inizia a chattare
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
