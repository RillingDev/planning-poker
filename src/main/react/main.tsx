import "vite/modulepreload-polyfill";

import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { RoomList } from "./routes/RoomList";
import { Room } from "./routes/Room";
import { AppContext } from "./AppContext";
import { loadIdentity } from "./api";
import { Header } from "./components/Header";

import "./index.css";

const router = createHashRouter([
	{
		path: "/",
		element: <RoomList/>,
	},
	{
		path: "/rooms/:roomName",
		element: <Room/>,
	},
]);

loadIdentity().then(user => {
	createRoot(document.getElementById("root") as HTMLElement).render(
		<React.StrictMode>
			<AppContext.Provider value={{user: user}}>
				<Header/>
				<RouterProvider router={router}/>
			</AppContext.Provider>
		</React.StrictMode>,
	);
}).catch(console.error);

