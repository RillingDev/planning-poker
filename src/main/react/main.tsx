import "vite/modulepreload-polyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, } from "react-router-dom";
import { loader as rootLoader, RoomList } from "./routes/RoomList";
import { Room } from "./routes/Room";

import "./index.css";

const router = createHashRouter([
	{
		path: "/",
		element: <RoomList/>,
		loader: rootLoader,
	},
	{
		path: "/rooms/:roomName",
		element: <Room/>,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<header>
			<h1>Untitled Planing Poker Tool</h1>
		</header>
		<RouterProvider router={router}/>
	</React.StrictMode>
);
