import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { ErrorElement } from "./router.tsx";
import React from "react";
import { describe, expect, it } from "vitest";

const CrashComponent: React.FC = () => {
  throw new Error("Beep Boop");
};

describe("router", () => {
  it("handles errors", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <CrashComponent />,
        errorElement: <ErrorElement />,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Beep Boop")).toBeInTheDocument();
    expect(screen.getByText("Back to Room List")).toBeInTheDocument();
  });
});
