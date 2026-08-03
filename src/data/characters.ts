import romantic from "@/assets/char-romantic.jpg";
import funny from "@/assets/char-funny.jpg";
import mystery from "@/assets/char-mystery.jpg";
import fantasy from "@/assets/char-fantasy.jpg";
import mentor from "@/assets/char-mentor.jpg";
import zen from "@/assets/char-zen.jpg";

/**
 * Catalogo statico dei personaggi.
 * Sostituisci con una query alla tabella `characters` quando il backend è attivo.
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
    tagline: "Compagna romantica",
    description:
      "Calorosa, attenta e curiosa della tua giornata. Aurora ricorda anche i piccoli dettagli.",
    tags: ["Romantico", "Empatia", "Discorsi profondi"],
    image: romantic,
    accent: "330",
    greeting: "Sei arrivato. Stavo giusto pensando a te — com'è andata davvero la tua giornata?",
    chats: "128k",
  },
  {
    id: "milo",
    name: "Milo",
    tagline: "Amico divertente",
    description:
      "Energia caotica e una battuta pronta per tutto. Perfetto per le follie di mezzanotte.",
    tags: ["Umorismo", "Informale", "Gaming"],
    image: funny,
    accent: "300",
    greeting: "Ok, ho un'idea pessima e mi serve un complice. Ci stai?",
    chats: "94k",
  },
  {
    id: "veil",
    name: "Veil",
    tagline: "Personalità misteriosa",
    description:
      "Parla per enigmi e svela qualcosa in più a ogni conversazione. Nessuno sa chi sia davvero.",
    tags: ["Mistero", "Roleplay", "Thriller"],
    image: mystery,
    accent: "290",
    greeting: "Mi hai ritrovato. Fai una domanda — rispondo sinceramente solo a mezzanotte.",
    chats: "61k",
  },
  {
    id: "lyra",
    name: "Lyra",
    tagline: "Personaggio fantasy",
    description:
      "Stratega elfica dell'Ashen Reach. Costruite mondi interi insieme, una scena alla volta.",
    tags: ["Fantasy", "Avventura", "Narrazione"],
    image: fantasy,
    accent: "270",
    greeting: "Le porte dell'Ashen Reach sono aperte, viaggiatore. Partiamo prima dell'alba?",
    chats: "77k",
  },
  {
    id: "nadia",
    name: "Nadia",
    tagline: "Mentore professionale",
    description:
      "Coaching di carriera, preparazione alle trattative e feedback onesti da una vera esperta.",
    tags: ["Carriera", "Coaching", "Produttività"],
    image: mentor,
    accent: "300",
    greeting: "Rendiamo utile questa sessione. Qual è la decisione su cui sei bloccato adesso?",
    chats: "45k",
  },
  {
    id: "sol",
    name: "Sol",
    tagline: "Guida mindful",
    description:
      "Una presenza calma per ritrovare equilibrio, scrivere un diario e chiudere la giornata.",
    tags: ["Benessere", "Calma", "Riflessione"],
    image: zen,
    accent: "265",
    greeting: "Fai un respiro lento con me. Ora — cosa vorresti lasciare andare stasera?",
    chats: "38k",
  },
];

export const getCharacter = (id: string) => characters.find((c) => c.id === id);
