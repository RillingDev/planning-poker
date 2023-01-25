import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { loadCardSets, loadExtensions, loadIdentity } from "./api";
import { AppContext, AppContextState } from "./AppContext";
import { Header } from "./components/Header";
import { AhaExtension } from "./extension/aha/AhaExtension";
import "./index.css";
import { router } from "./router";

const AVAILABLE_EXTENSIONS = [new AhaExtension()];

async function createContextState(): Promise<AppContextState> {
	const [user, enabledExtensionKeys, cardSets] = await Promise.all([loadIdentity(), loadExtensions(), loadCardSets()]);

	const extensions = AVAILABLE_EXTENSIONS.filter(availableExtension => enabledExtensionKeys.includes(availableExtension.key));
	await Promise.all(extensions.map(extension => extension.initialize()));

	return {
		cardSets,
		user,
		extensions,
	};
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

