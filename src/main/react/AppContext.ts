import { createContext } from "react";
import { CardSet, User } from "./api";
import { ExtensionManager } from "./extension/ExtensionManager";

export interface AppContextState {
	user: User;
	cardSets: ReadonlyArray<CardSet>;
	extensionManager: ExtensionManager;
}

export const AppContext = createContext<AppContextState>({
	user: {username: "Anonymous"},
	cardSets: [],
	extensionManager: new ExtensionManager([])
});
