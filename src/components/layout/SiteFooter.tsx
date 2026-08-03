import { Link } from "@tanstack/react-router";
import logo from "@/assets/flirtspace-logo.png.asset.json";

const groups = [
  {
    title: "Prodotto",
    links: [
      { label: "Personaggi", to: "/characters" as const },
      { label: "Prezzi", to: "/pricing" as const },
      { label: "Area personale", to: "/dashboard" as const },
    ],
  },
  {
    title: "Azienda",
    links: [
      { label: "Chi siamo", to: "/" as const },
      { label: "Lavora con noi", to: "/" as const },
      { label: "Blog", to: "/" as const },
    ],
  },
  {
    title: "Legale",
    links: [
      { label: "Privacy", to: "/" as const },
      { label: "Termini", to: "/" as const },
      { label: "Sicurezza", to: "/" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={logo.url}
              alt="Logo FlirtSpace"
              width={512}
              height={512}
              loading="lazy"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="font-display text-lg font-semibold">
              Flirt<span className="text-gradient">Space</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Compagni AI personalizzati con memoria, personalità e presenza — disponibili ogni volta
            che ne hai bisogno.
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
          © {new Date().getFullYear()} FlirtSpace. Tutte le conversazioni sono private e criptate.
        </p>
      </div>
    </footer>
  );
}
