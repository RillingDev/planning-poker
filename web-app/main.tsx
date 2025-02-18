import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppContext, createContextState } from "./AppContext.ts";
import "./index.css";
import { router } from "./router.tsx";

createContextState()
  .then((ctx) => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <AppContext.Provider value={ctx}>
          <RouterProvider router={router} />
        </AppContext.Provider>
      </StrictMode>,
    );
  })
  .catch(console.error);
