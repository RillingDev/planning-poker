import "vite/modulepreload-polyfill";

import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, } from "react-router-dom";
import { loader as rootLoader, Root } from "./routes/Root";
import { Room } from "./routes/Room";

import "modern-normalize";
import "./index.css";

const router = createHashRouter([
	{
		path: "/",
		element: <Root/>,
		loader: rootLoader,
	},
	{
		path: "/rooms/:roomName",
		element: <Room/>,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router}/>
	</React.StrictMode>
);
