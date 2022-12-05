import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { loadCardSets, loadExtensions, loadIdentity } from "./api";
import { AppContext } from "./AppContext";
import { Header } from "./components/Header";

import "./index.css";
import { loader as roomListLoader, RoomListView } from "./routes/RoomListView";
import { loader as roomLoader, RoomView } from "./routes/RoomView";

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

Promise.all([loadIdentity(), loadExtensions(), loadCardSets()]).then(([user, extensions, cardSets]) => {
	createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<AppContext.Provider value={{user, cardSets, extensions}}>
				<Header/>
				<RouterProvider router={router}/>
			</AppContext.Provider>
		</React.StrictMode>,
	);
}).catch(console.error);

