import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { loadCardSets, loadExtensions, loadIdentity } from "./api";
import { AppContext, AppContextState } from "./AppContext";
import { Header } from "./components/Header";
import { ahaExtension } from "./extension/aha";
import "./index.css";
import { loader as roomListLoader, RoomListView } from "./routes/RoomListView";
import { loader as roomLoader, RoomView } from "./routes/RoomView";

const AVAILABLE_EXTENSIONS = [ahaExtension];

async function createContextState() {
	const [user, extensions, cardSets] = await Promise.all([loadIdentity(), loadExtensions(), loadCardSets()]);
	return {
		cardSets,
		user,
		extensions: AVAILABLE_EXTENSIONS.filter(availableExtension => extensions.includes(availableExtension.id)),
	} as AppContextState;
}

const router = createHashRouter([
	{
		path: "/",
		element: <RoomListView/>,
		loader: roomListLoader
	},
	{
		path: "/rooms/:roomName",
		element: <RoomView/>,
		loader: roomLoader
	},
]);

createContextState().then(ctx => {
	createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<AppContext.Provider value={ctx}>
				<Header/>
				<RouterProvider router={router}/>
			</AppContext.Provider>
		</React.StrictMode>,
	);
}).catch(console.error);

