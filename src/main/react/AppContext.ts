import { createContext } from "react";
import { CardSet, User } from "./api";
import { Extension } from "./extension/Extension";

export interface AppContextState {
	user: User;
	cardSets: ReadonlyArray<CardSet>;
	extensions: ReadonlyArray<Extension>;
}

export const AppContext = createContext<AppContextState>({user: {username: "Anonymous"}, cardSets: [], extensions: []});
