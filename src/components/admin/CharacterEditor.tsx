import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Eye, Loader2, Plus, Save, ShieldQuestion, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCharacter, updateCharacter } from "@/lib/api";
import type { CharacterRecord } from "@/types/database";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CharacterPreview } from "./CharacterPreview";
import {
  GENDERS,
  LANGUAGES,
  MESSAGE_LENGTHS,
  STATUSES,
  SUGGESTED_INTERESTS,
  TRAITS,
  emptyForm,
  formFromRecord,
  slugify,
  toPayload,
  type CharacterFormState,
  type TraitKey,
} from "./character-form";

const tabTrigger =
  "shrink-0 rounded-full border border-border/70 bg-transparent px-4 py-2 text-xs font-medium text-muted-foreground data-[state=active]:border-transparent data-[state=active]:bg-[image:var(--gradient-primary)] data-[state=active]:text-primary-foreground";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function TraitSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5 rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="rounded-md bg-secondary px-2 py-0.5 font-display text-xs font-semibold text-primary">
          {value}
        </span>
      </div>
      <Slider min={0} max={10} step={1} value={[value]} onValueChange={([v]) => onChange(v ?? 0)} />
    </div>
  );
}

function MemoryRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ChipInput({
  values,
  onChange,
  placeholder,
  suggestions,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          className="border-border/70 bg-background/60"
        />
        <Button type="button" variant="glass" size="icon" onClick={() => add(draft)} aria-label="Aggiungi">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge key={v} className="gap-1 rounded-full border-primary/30 bg-primary/10 text-primary">
              {v}
              <button
                type="button"
                aria-label={`Rimuovi ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="rounded-full hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {suggestions && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()))
            .slice(0, 10)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/** Editor completo del personaggio, usato sia per creare che per modificare. */
export function CharacterEditor({ initial }: { initial?: CharacterRecord }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CharacterFormState>(() =>
    initial ? formFromRecord(initial) : emptyForm(),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = <K extends keyof CharacterFormState>(key: K, value: CharacterFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setTrait = (key: TraitKey, value: number) =>
    setForm((f) => ({ ...f, traits: { ...f.traits, [key]: value } }));

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = toPayload(form);
      return initial ? updateCharacter(initial.id, payload) : createCharacter(payload);
    },
    onSuccess: () => {
      toast.success(initial ? "Personaggio aggiornato" : "Personaggio creato");
      void queryClient.invalidateQueries({ queryKey: ["admin-characters"] });
      void queryClient.invalidateQueries({ queryKey: ["public-characters"] });
      navigate({ to: "/admin/characters" });
    },
    onError: (e) => toast.error(e.message),
  });

  const onSave = () => {
    if (!form.name.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Barra superiore */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="glass" size="icon" asChild aria-label="Torna alla lista">
            <Link to="/admin/characters">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <CharacterAvatar
              src={form.avatar || null}
              name={form.name || "?"}
              className="h-10 w-10 rounded-xl text-sm"
            />
            <div>
              <h1 className="font-display text-xl font-semibold">
                {initial ? `Modifica ${initial.name}` : "Nuovo personaggio"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {initial ? `/${initial.slug}` : "Compila le sezioni e salva quando sei pronto"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" /> Anteprima
          </Button>
          <Button variant="hero" onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salva
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identita">
        <TabsList className="flex h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 [scrollbar-width:none]">
          <TabsTrigger value="identita" className={tabTrigger}>Identità</TabsTrigger>
          <TabsTrigger value="aspetto" className={tabTrigger}>Aspetto</TabsTrigger>
          <TabsTrigger value="personalita" className={tabTrigger}>Personalità</TabsTrigger>
          <TabsTrigger value="conversazione" className={tabTrigger}>Conversazione</TabsTrigger>
          <TabsTrigger value="interessi" className={tabTrigger}>Interessi</TabsTrigger>
          <TabsTrigger value="memoria" className={tabTrigger}>Memoria</TabsTrigger>
          <TabsTrigger value="prompt" className={tabTrigger}>Prompt IA</TabsTrigger>
          <TabsTrigger value="stato" className={tabTrigger}>Stato</TabsTrigger>
        </TabsList>

        {/* 1 — Identità */}
        <TabsContent value="identita" className="mt-6">
          <div className="surface-card grid gap-5 rounded-3xl p-6 sm:grid-cols-2 sm:p-8">
            <Field label="Nome *">
              <Input
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="Aurora"
                className="border-border/70 bg-background/60"
              />
            </Field>
            <Field label="Nome visualizzato" hint="Se diverso dal nome (es. con emoji)">
              <Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Slug" hint="Identificativo nell'URL della chat">
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className="border-border/70 bg-background/60 font-mono text-xs"
              />
            </Field>
            <Field label="Tagline" hint="Breve sottotitolo mostrato nelle card">
              <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Compagna romantica" className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Età">
              <Input type="number" min={18} max={99} value={form.age} onChange={(e) => set("age", e.target.value)} className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Genere">
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className="border-border/70 bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nazionalità">
              <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} placeholder="Italiana" className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Lingua">
              <Select value={form.language} onValueChange={(v) => set("language", v)}>
                <SelectTrigger className="border-border/70 bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Professione">
              <Input value={form.profession} onChange={(e) => set("profession", e.target.value)} className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Saluto iniziale" hint="Primo messaggio che l'utente riceve in chat">
              <Textarea value={form.greeting} onChange={(e) => set("greeting", e.target.value)} rows={2} className="border-border/70 bg-background/60" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Biografia" hint="Descrizione completa del personaggio">
                <Textarea value={form.biography} onChange={(e) => set("biography", e.target.value)} rows={3} className="border-border/70 bg-background/60" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Descrizione breve" hint="Mostrata nelle card del marketplace">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="border-border/70 bg-background/60" />
              </Field>
            </div>
          </div>
        </TabsContent>

        {/* 2 — Aspetto */}
        <TabsContent value="aspetto" className="mt-6">
          <div className="surface-card grid gap-5 rounded-3xl p-6 sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <Field label="URL avatar" hint="Percorso pubblico (es. /avatars/aurora.jpg) o URL completo">
                <div className="flex items-center gap-3">
                  <CharacterAvatar src={form.avatar || null} name={form.name || "?"} className="h-14 w-14 shrink-0 rounded-xl" />
                  <Input value={form.avatar} onChange={(e) => set("avatar", e.target.value)} placeholder="/avatars/nuovo.jpg" className="border-border/70 bg-background/60 font-mono text-xs" />
                </div>
              </Field>
            </div>
            <Field label="Colore dei capelli">
              <Input value={form.hair_color} onChange={(e) => set("hair_color", e.target.value)} placeholder="Castani" className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Colore degli occhi">
              <Input value={form.eye_color} onChange={(e) => set("eye_color", e.target.value)} placeholder="Verdi" className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Altezza (cm)">
              <Input type="number" min={120} max={230} value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} className="border-border/70 bg-background/60" />
            </Field>
            <Field label="Stile di abbigliamento">
              <Input value={form.clothing_style} onChange={(e) => set("clothing_style", e.target.value)} placeholder="Elegante casual" className="border-border/70 bg-background/60" />
            </Field>
          </div>
        </TabsContent>

        {/* 3 — Personalità */}
        <TabsContent value="personalita" className="mt-6">
          <div className="surface-card rounded-3xl p-6 sm:p-8">
            <p className="mb-5 text-sm text-muted-foreground">
              Cursori da 0 a 10: definiscono il tono del personaggio e alimenteranno i prompt IA.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRAITS.map((t) => (
                <TraitSlider key={t.key} label={t.label} value={form.traits[t.key]} onChange={(v) => setTrait(t.key, v)} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 4 — Stile di conversazione */}
        <TabsContent value="conversazione" className="mt-6">
          <div className="surface-card space-y-5 rounded-3xl p-6 sm:p-8">
            <Field label="Lunghezza media dei messaggi">
              <Select value={form.style_message_length} onValueChange={(v) => set("style_message_length", v as CharacterFormState["style_message_length"])}>
                <SelectTrigger className="max-w-xs border-border/70 bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESSAGE_LENGTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TraitSlider label="Utilizzo di emoji" value={form.style_emoji_usage} onChange={(v) => set("style_emoji_usage", v)} />
              <TraitSlider label="Utilizzo di GIF" value={form.style_gif_usage} onChange={(v) => set("style_gif_usage", v)} />
              <TraitSlider label="Utilizzo di nickname" value={form.style_nickname_usage} onChange={(v) => set("style_nickname_usage", v)} />
              <TraitSlider label="Molte domande" value={form.style_asks_questions} onChange={(v) => set("style_asks_questions", v)} />
              <TraitSlider label="Velocità di scrittura" value={form.style_typing_speed} onChange={(v) => set("style_typing_speed", v)} />
              <TraitSlider label="Livello di formalità" value={form.style_formality} onChange={(v) => set("style_formality", v)} />
            </div>
          </div>
        </TabsContent>

        {/* 5 — Interessi */}
        <TabsContent value="interessi" className="mt-6">
          <div className="surface-card space-y-6 rounded-3xl p-6 sm:p-8">
            <Field label="Interessi" hint="Aggiungi interessi illimitati: Invio o il pulsante +">
              <ChipInput values={form.interests} onChange={(v) => set("interests", v)} placeholder="Es. Cinema, Viaggi…" suggestions={SUGGESTED_INTERESTS} />
            </Field>
            <Field label="Tag" hint="Categorie mostrate come filtri nel marketplace">
              <ChipInput values={form.tags} onChange={(v) => set("tags", v)} placeholder="Es. Romantico, Fantasy…" />
            </Field>
          </div>
        </TabsContent>

        {/* 6 — Memoria */}
        <TabsContent value="memoria" className="mt-6">
          <div className="surface-card space-y-3 rounded-3xl p-6 sm:p-8">
            <p className="mb-2 text-sm text-muted-foreground">
              Cosa il personaggio ricorderà da una conversazione all'altra.
            </p>
            <MemoryRow label="Nome utente" description="Ricorda come si chiama l'utente" checked={form.memory_user_name} onChange={(v) => set("memory_user_name", v)} />
            <MemoryRow label="Conversazioni precedenti" description="Riprende i discorsi passati" checked={form.memory_past_conversations} onChange={(v) => set("memory_past_conversations", v)} />
            <MemoryRow label="Preferenze" description="Cosa piace e non piace all'utente" checked={form.memory_preferences} onChange={(v) => set("memory_preferences", v)} />
            <MemoryRow label="Compleanni" description="Ricorda le date importanti" checked={form.memory_birthdays} onChange={(v) => set("memory_birthdays", v)} />
            <MemoryRow label="Argomenti preferiti" description="I temi di cui l'utente parla più volentieri" checked={form.memory_favorite_topics} onChange={(v) => set("memory_favorite_topics", v)} />
          </div>
        </TabsContent>

        {/* 7 — Prompt IA */}
        <TabsContent value="prompt" className="mt-6">
          <div className="surface-card space-y-5 rounded-3xl p-6 sm:p-8">
            <div className="flex gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm">
              <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                Questi campi alimenteranno l'integrazione con il modello linguistico (es. OpenAI).
                Non sono mai esposti pubblicamente: solo gli admin possono leggerli.
              </p>
            </div>
            <Field label="Suggerimenti di sistema" hint="Prompt di sistema: il comportamento di base del modello">
              <Textarea value={form.system_prompt} onChange={(e) => set("system_prompt", e.target.value)} rows={4} className="border-border/70 bg-background/60 font-mono text-xs" />
            </Field>
            <Field label="Istruzioni per il personaggio" hint="Come deve parlare e comportarsi">
              <Textarea value={form.character_instructions} onChange={(e) => set("character_instructions", e.target.value)} rows={4} className="border-border/70 bg-background/60 font-mono text-xs" />
            </Field>
            <Field label="Esempi di conversazione" hint="Scambi di esempio per guidare il tono">
              <Textarea value={form.conversation_examples} onChange={(e) => set("conversation_examples", e.target.value)} rows={4} className="border-border/70 bg-background/60 font-mono text-xs" />
            </Field>
            <Field label="Comportamenti proibiti" hint="Cosa il personaggio non deve mai fare o dire">
              <Textarea value={form.forbidden_behaviors} onChange={(e) => set("forbidden_behaviors", e.target.value)} rows={3} className="border-border/70 bg-background/60 font-mono text-xs" />
            </Field>
            <Field label="Istruzioni interne nascoste" hint="Note riservate, mai incluse nei prompt visibili">
              <Textarea value={form.hidden_instructions} onChange={(e) => set("hidden_instructions", e.target.value)} rows={3} className="border-border/70 bg-background/60 font-mono text-xs" />
            </Field>
          </div>
        </TabsContent>

        {/* 8 — Stato */}
        <TabsContent value="stato" className="mt-6">
          <div className="surface-card space-y-5 rounded-3xl p-6 sm:p-8">
            <Field label="Stato di pubblicazione">
              <Select value={form.status} onValueChange={(v) => set("status", v as CharacterFormState["status"])}>
                <SelectTrigger className="max-w-xs border-border/70 bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <MemoryRow label="Nascosto" description="Attivo ma non visibile nel marketplace" checked={form.is_hidden} onChange={(v) => set("is_hidden", v)} />
              <MemoryRow label="In evidenza" description="Mostrato nella home page" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
              <MemoryRow label="Premium" description="Riservato agli abbonati" checked={form.is_premium} onChange={(v) => set("is_premium", v)} />
              <MemoryRow label="Nuovo" description="Badge 'Nuovo' sulla card" checked={form.is_new} onChange={(v) => set("is_new", v)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Barra azioni inferiore */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/85 p-3 backdrop-blur-xl">
        <p className="px-2 text-xs text-muted-foreground">
          {initial ? "Le modifiche sono subito visibili agli utenti." : "Il nuovo personaggio sarà in bozza finché non lo attivi."}
        </p>
        <div className="flex gap-2">
          <Button variant="glass" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" /> Anteprima
          </Button>
          <Button variant="hero" onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {initial ? "Salva modifiche" : "Crea personaggio"}
          </Button>
        </div>
      </div>

      <CharacterPreview open={previewOpen} onOpenChange={setPreviewOpen} state={form} />
    </div>
  );
}
