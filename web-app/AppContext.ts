import { createContext } from "react";
import { CardSet, User } from "./model";
import { getCardSets, getExtensions, getIdentity } from "./api.ts";
import { getEnabledExtensions } from "./extension/extensions.ts";
import { Extension } from "./extension/Extension.ts";

// TODO: check if something like SWR/react-query, or going all-in on react-router can replace this.
export interface AppContextState {
  user: User;
  cardSets: readonly CardSet[];
  enabledExtensions: readonly Extension[];
}

export const AppContext = createContext<AppContextState>({
  user: { username: "Anonymous" },
  cardSets: [],
  enabledExtensions: [],
});

export async function createContextState(): Promise<AppContextState> {
  const [user, enabledExtensionKeys, cardSets] = await Promise.all([
    getIdentity(),
    getExtensions(),
    getCardSets(),
  ]);

  return {
    cardSets,
    user,
    enabledExtensions: getEnabledExtensions(enabledExtensionKeys),
  };
}
