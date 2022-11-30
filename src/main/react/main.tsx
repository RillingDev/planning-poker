import "vite/modulepreload-polyfill";

import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { loader as roomListLoader, RoomListView } from "./routes/RoomListView";
import { loader as roomLoader, RoomView } from "./routes/RoomView";
import { AppContext } from "./AppContext";
import { loadCardSets, loadIdentity } from "./api";
import { Header } from "./components/Header";

import "./index.css";

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

Promise.all([loadIdentity(), loadCardSets()]).then(([user, cardSets]) => {
	createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<AppContext.Provider value={{user, cardSets}}>
				<Header/>
				<RouterProvider router={router}/>
			</AppContext.Provider>
		</React.StrictMode>,
	);
}).catch(console.error);

