import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { AppContext, createContextState } from "./AppContext";
import { Header } from "./components/Header";
import "./index.css";
import { router } from "./router";

createContextState()
  .then((ctx) => {
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <AppContext.Provider value={ctx}>
          <Header />
          <RouterProvider router={router} />
        </AppContext.Provider>
      </React.StrictMode>,
    );
  })
  .catch(console.error);
