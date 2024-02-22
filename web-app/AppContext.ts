import { createContext } from "react";
import { getCardSets, getExtensions } from "./api.ts";
import { getEnabledExtensions } from "./extension/extensions.ts";
import { Extension } from "./extension/Extension.ts";
import { CardSet, User } from "./model.ts";

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
  const username = document
    .querySelector("meta[name='_username']")!
    .getAttribute("content")!;

  const [enabledExtensionKeys, cardSets] = await Promise.all([
    getExtensions(),
    getCardSets(),
  ]);

  return {
    cardSets,
    user: { username },
    enabledExtensions: getEnabledExtensions(enabledExtensionKeys),
  };
}
