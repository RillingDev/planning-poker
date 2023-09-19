import { render, screen } from "@testing-library/react";
import { AppContext } from "../AppContext";
import { createMockContextState } from "../test/dataFactory";
import { Header } from "./Header";
import { describe, expect, it } from "vitest";

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
