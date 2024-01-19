import { render, screen } from "@testing-library/react";
import { AppContext } from "../AppContext.ts";
import { createMockContextState } from "../test/dataFactory.ts";
import { describe, expect, it } from "vitest";
import { Header } from "./Header.tsx";

describe("Header", () => {
  it("title is visible", () => {
    render(
      <AppContext.Provider
        value={createMockContextState({ user: { username: "Bob" } })}
      >
        <Header />
      </AppContext.Provider>,
    );

    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
