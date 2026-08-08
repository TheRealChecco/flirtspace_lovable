/**
 * Tipi applicativi puliti derivati dallo schema del database.
 * Usa questi tipi nei componenti invece di `Database["public"]["Tables"][...]`.
 */
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];
type Enums = Database["public"]["Enums"];

export type SubscriptionTier = Enums["subscription_tier"];
export type CharacterStatus = Enums["character_status"];
export type MessageSender = Enums["message_sender"];
export type CreditTransactionType = Enums["credit_transaction_type"];
export type AppRole = Enums["app_role"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileUpdate = Tables["profiles"]["Update"];

/** Riga completa del personaggio (tutti i campi, inclusi i prompt IA — solo admin). */
export type CharacterRecord = Tables["characters"]["Row"];
export type CharacterInsert = Tables["characters"]["Insert"];
export type CharacterUpdate = Tables["characters"]["Update"];

/**
 * Personaggio pubblico: sottoinsieme di colonne sicure esposto dalla vista
 * `public_characters` (nessun prompt IA, solo personaggi attivi e non nascosti).
 */
export type PublicCharacter = Views["public_characters"]["Row"];

export type Conversation = Tables["conversations"]["Row"];
export type Message = Tables["messages"]["Row"];
export type Favorite = Tables["favorites"]["Row"];
export type CreditTransaction = Tables["credit_transactions"]["Row"];
export type UserRole = Tables["user_roles"]["Row"];

/** Conversazione con il personaggio collegato (join sulla vista pubblica). */
export type ConversationWithCharacter = Conversation & {
  character: PublicCharacter;
};

/** Preferito con il personaggio collegato (join sulla vista pubblica). */
export type FavoriteWithCharacter = Favorite & {
  character: PublicCharacter;
};
