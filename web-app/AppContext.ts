import { createContext } from "react";
import { ExtensionManager } from "./extension/ExtensionManager";
import { CardSet, User } from "./model";

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
