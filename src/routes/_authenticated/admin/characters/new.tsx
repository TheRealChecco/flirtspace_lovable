import { createFileRoute } from "@tanstack/react-router";
import { CharacterEditor } from "@/components/admin/CharacterEditor";

export const Route = createFileRoute("/_authenticated/admin/characters/new")({
  head: () => ({
    meta: [{ title: "Nuovo personaggio — FlirtSpace Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <CharacterEditor />,
});
