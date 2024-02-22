import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { AppContext, createContextState } from "./AppContext.ts";
import "./index.css";
import { router } from "./router.tsx";

createContextState()
  .then((ctx) => {
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <AppContext.Provider value={ctx}>
          <RouterProvider router={router} />
        </AppContext.Provider>
      </React.StrictMode>,
    );
  })
  .catch(console.error);
