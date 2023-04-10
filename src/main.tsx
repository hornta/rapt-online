import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Level } from "./Level.js";
import { Start } from "./Start.js";
import { Editor } from "./Editor.js";
import { ClerkProvider } from "@clerk/clerk-react";

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
		<ClerkProvider
			publishableKey={import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY}
		>
			<RouterProvider router={router} />
		</ClerkProvider>
	</React.StrictMode>
);
