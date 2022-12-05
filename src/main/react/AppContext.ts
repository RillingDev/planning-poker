import { createContext } from "react";
import { CardSet, User } from "./api";

interface AppContextState {
	user: User;
	cardSets: ReadonlyArray<CardSet>;
	extensions: ReadonlyArray<string>;
}

export const AppContext = createContext<AppContextState>({user: {username: "Anonymous"}, cardSets: [], extensions: []});
