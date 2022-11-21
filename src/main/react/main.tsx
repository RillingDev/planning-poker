import "vite/modulepreload-polyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import "./index.css";
import { Root } from "./routes/Root";
import { Room } from "./routes/Room";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root/>,
	},
	{
		path: "rooms/:roomName",
		element: <Room/>,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>
);
