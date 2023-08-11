import { createContext } from "react";
import { ExtensionManager } from "./extension/ExtensionManager";
import { CardSet, User } from "./model";
import { getCardSets, getExtensions, getIdentity } from "./api.ts";
import { AVAILABLE_EXTENSIONS } from "./extension/extensions.ts";

export interface AppContextState {
  user: User;
  cardSets: readonly CardSet[];
  extensionManager: ExtensionManager;
}

export const AppContext = createContext<AppContextState>({
  user: { username: "Anonymous" },
  cardSets: [],
  extensionManager: new ExtensionManager([]),
});

export async function createContextState(): Promise<AppContextState> {
  const [user, enabledExtensionKeys, cardSets] = await Promise.all([
    getIdentity(),
    getExtensions(),
    getCardSets(),
  ]);

  const extensionManager = new ExtensionManager(
    AVAILABLE_EXTENSIONS.filter((availableExtension) =>
      enabledExtensionKeys.includes(availableExtension.key),
    ),
  );

  return {
    cardSets,
    user,
    extensionManager,
  };
}
