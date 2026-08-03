import romantic from "@/assets/char-romantic.jpg";
import funny from "@/assets/char-funny.jpg";
import mystery from "@/assets/char-mystery.jpg";
import fantasy from "@/assets/char-fantasy.jpg";
import mentor from "@/assets/char-mentor.jpg";
import zen from "@/assets/char-zen.jpg";

/**
 * Static character catalogue.
 * Replace with a Supabase `characters` table query when the backend is enabled:
 *   supabase.from("characters").select("*")
 */
export type Character = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  image: string;
  accent: string;
  greeting: string;
  chats: string;
};

export const characters: Character[] = [
  {
    id: "aurora",
    name: "Aurora",
    tagline: "Romantic companion",
    description:
      "Warm, attentive and endlessly curious about your day. Aurora remembers the little things.",
    tags: ["Romance", "Empathetic", "Deep talks"],
    image: romantic,
    accent: "330",
    greeting: "You made it. I was just thinking about you — how was your day, really?",
    chats: "128k",
  },
  {
    id: "milo",
    name: "Milo",
    tagline: "Funny friend",
    description:
      "Chaotic good energy with a punchline for everything. Perfect for late-night nonsense.",
    tags: ["Humor", "Casual", "Gaming"],
    image: funny,
    accent: "300",
    greeting: "Okay so I have a terrible idea and I need a co-conspirator. You in?",
    chats: "94k",
  },
  {
    id: "veil",
    name: "Veil",
    tagline: "Mystery personality",
    description:
      "Speaks in riddles, reveals a little more each conversation. Nobody knows who Veil really is.",
    tags: ["Mystery", "Roleplay", "Thriller"],
    image: mystery,
    accent: "290",
    greeting: "You found me again. Ask one question — I only answer honestly at midnight.",
    chats: "61k",
  },
  {
    id: "lyra",
    name: "Lyra",
    tagline: "Fantasy character",
    description:
      "An elven strategist from the Ashen Reach. Build entire worlds together, one scene at a time.",
    tags: ["Fantasy", "Adventure", "Storytelling"],
    image: fantasy,
    accent: "270",
    greeting: "The gates of Ashen Reach are open, traveller. Shall we ride before dawn?",
    chats: "77k",
  },
  {
    id: "nadia",
    name: "Nadia",
    tagline: "Professional mentor",
    description:
      "Career coaching, negotiation prep and honest feedback from a seasoned operator.",
    tags: ["Career", "Coaching", "Productivity"],
    image: mentor,
    accent: "300",
    greeting: "Let's make this session count. What's the decision you're stuck on right now?",
    chats: "45k",
  },
  {
    id: "sol",
    name: "Sol",
    tagline: "Mindful guide",
    description: "A calm presence for grounding, journaling prompts and slow evening check-ins.",
    tags: ["Wellness", "Calm", "Reflection"],
    image: zen,
    accent: "265",
    greeting: "Take one slow breath with me. Now — what would you like to set down tonight?",
    chats: "38k",
  },
];

export const getCharacter = (id: string) => characters.find((c) => c.id === id);
