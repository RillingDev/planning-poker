import { createContext } from "react";
import { User } from "./api";

interface AppContextState {
	user: User;
}

export const AppContext = createContext<AppContextState>({user: {username: "Anonymous"}});
