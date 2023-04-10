import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Level } from "./Level.js";
import { Start } from "./Start.js";
import { Editor } from "./Editor.js";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Start />,
	},
	{ path: "/level/:levelName", element: <Level /> },
	{ path: "/editor", element: <Editor /> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
