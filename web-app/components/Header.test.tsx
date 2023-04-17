import { render, screen } from "@testing-library/react";
import { AppContext } from "../AppContext";
import { createMockContextState } from "../test/dataFactory";
import { Header } from "./Header";

describe("Header", () => {
  it("title is visible", () => {
    render(
      <AppContext.Provider
        value={createMockContextState({ user: { username: "John Doe" } })}
      >
        <Header />
      </AppContext.Provider>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
