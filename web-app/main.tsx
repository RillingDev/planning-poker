import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "vite/modulepreload-polyfill";
import { getCardSets, getExtensions, getIdentity } from "./api";
import { AppContext, AppContextState } from "./AppContext";
import { Header } from "./components/Header";
import { ExtensionManager } from "./extension/ExtensionManager";
import "./index.css";
import { router } from "./router";

async function createContextState(): Promise<AppContextState> {
  const [user, enabledExtensionKeys, cardSets] = await Promise.all([
    getIdentity(),
    getExtensions(),
    getCardSets(),
  ]);

  const extensionManager = new ExtensionManager(enabledExtensionKeys);

  return {
    cardSets,
    user,
    extensionManager,
  };
}

createContextState()
  .then((ctx) => {
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <AppContext.Provider value={ctx}>
          <Header />
          <RouterProvider router={router} />
        </AppContext.Provider>
      </React.StrictMode>
    );
  })
  .catch(console.error);
