import { createContext } from "react";
import { CardSet, User } from "./api";

interface AppContextState {
	user: User;
	cardSets: ReadonlyArray<CardSet>;
}

export const AppContext = createContext<AppContextState>({user: {username: "Anonymous"}, cardSets: []});
