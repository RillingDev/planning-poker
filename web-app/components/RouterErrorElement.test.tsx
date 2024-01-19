import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { RouterErrorElement } from "./RouterErrorElement.tsx";

const CrashComponent: React.FC = () => {
  throw new Error("Beep Boop");
};

describe("RouterErrorElement", () => {
  it("handles errors", () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <CrashComponent />,
        errorElement: <RouterErrorElement />,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Beep Boop")).toBeInTheDocument();
    expect(screen.getByText("Back to Room List")).toBeInTheDocument();
  });
});
