import { Link } from "@tanstack/react-router";
import { Sparkle } from "lucide-react";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Characters", to: "/characters" as const },
      { label: "Pricing", to: "/pricing" as const },
      { label: "Dashboard", to: "/dashboard" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" as const },
      { label: "Careers", to: "/" as const },
      { label: "Blog", to: "/" as const },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/" as const },
      { label: "Terms", to: "/" as const },
      { label: "Safety", to: "/" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[image:var(--gradient-primary)]">
              <Sparkle className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Lumina</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Personalized AI companions with memory, personality and presence — available whenever
            you need them.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold">{group.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-5 py-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumina AI. All conversations are private and encrypted.
        </p>
      </div>
    </footer>
  );
}
