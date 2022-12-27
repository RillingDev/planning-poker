import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { loadCardSets, loadExtensions, loadIdentity } from "./api";
import { AppContext, AppContextState } from "./AppContext";
import { Header } from "./components/Header";
import { ahaExtension } from "./extension/aha";
import "./index.css";
import { router } from "./router";

const AVAILABLE_EXTENSIONS = [ahaExtension];

async function createContextState() {
	const [user, extensions, cardSets] = await Promise.all([loadIdentity(), loadExtensions(), loadCardSets()]);
	return {
		cardSets,
		user,
		extensions: AVAILABLE_EXTENSIONS.filter(availableExtension => extensions.includes(availableExtension.id)),
	} as AppContextState;
}

createContextState().then(ctx => {
	createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<AppContext.Provider value={ctx}>
				<Header/>
				<RouterProvider router={router}/>
			</AppContext.Provider>
		</React.StrictMode>,
	);
}).catch(console.error);

