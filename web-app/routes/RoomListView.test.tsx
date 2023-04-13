import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { createRoom, getRooms } from "../api";
import {
  createMockCardSet,
  createMockContextState,
  createMockRoom,
} from "../test/dataFactory";
import { loader, RoomListView } from "./RoomListView";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { AppContext } from "../AppContext";

vi.mock("../api");

function createTestRouter() {
  return createMemoryRouter(
    [
      {
        path: "/",
        element: <RoomListView />,
        loader: loader,
      },
    ],
    {
      initialEntries: ["/"],
      initialIndex: 0,
    }
  );
}

describe("RoomListView", () => {
  it("lists rooms", async () => {
    vi.mocked(getRooms).mockResolvedValue([
      createMockRoom({ name: "My Room" }),
      createMockRoom({ name: "Some Other Room" }),
    ]);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => screen.getByText("Rooms"));

    expect(screen.getByText("My Room")).toBeInTheDocument();
    expect(screen.getByText("Some Other Room")).toBeInTheDocument();
  });

  it("opens creation modal", async () => {
    vi.mocked(getRooms).mockResolvedValue([]);

    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    await waitFor(() => screen.getByText("Rooms"));

    await userEvent.click(screen.getByText("Create Room"));

    expect(screen.getByLabelText("Room Name")).toBeVisible();
  });

  it("handles room creation", async () => {
    const cardSet = createMockCardSet({ name: "Set 1" });
    const contextState = createMockContextState({ cardSets: [cardSet] });

    vi.mocked(getRooms).mockResolvedValue([]);
    vi.mocked(createRoom).mockImplementation(() => Promise.resolve());

    const router = createTestRouter();
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );

    await waitFor(() => screen.getByText("Rooms"));

    await userEvent.click(screen.getByText("Create Room"));

    await userEvent.type(screen.getByLabelText("Room Name"), "My Room");
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));

    expect(screen.queryByLabelText("Room Name")).not.toBeInTheDocument();
    expect(createRoom).toHaveBeenCalledWith("My Room", {
      cardSetName: "Set 1",
    });
  });
});
