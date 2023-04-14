import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { createRoom, deleteRoom, editRoom, getRooms } from "../api";
import {
  createMockCardSet,
  createMockContextState,
  createMockRoom,
} from "../test/dataFactory";
import { loader, RoomListView } from "./RoomListView";
import {
  createMemoryRouter,
  RouteObject,
  RouterProvider,
  useParams,
} from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { AppContext } from "../AppContext";
import { FC } from "react";

vi.mock("../api");

const TEST_ROUTES: RouteObject[] = [
  {
    path: "/",
    element: <RoomListView />,
    loader: loader,
  },
];

function waitForLoaderResolved(): Promise<unknown> {
  return waitFor(() => screen.getByText("Rooms"));
}

describe("RoomListView", () => {
  it("lists rooms", async () => {
    vi.mocked(getRooms).mockResolvedValue([
      createMockRoom({ name: "My Room" }),
      createMockRoom({ name: "Some Other Room" }),
    ]);

    const router = createMemoryRouter(TEST_ROUTES);
    render(<RouterProvider router={router} />);
    await waitForLoaderResolved();

    expect(screen.getByText("My Room")).toBeInTheDocument();
    expect(screen.getByText("Some Other Room")).toBeInTheDocument();
  });

  it("opens creation modal", async () => {
    vi.mocked(getRooms).mockResolvedValue([]);

    const router = createMemoryRouter(TEST_ROUTES);
    render(<RouterProvider router={router} />);
    await waitForLoaderResolved();

    expect(screen.queryByText("Create a New Room")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Create Room"));

    expect(screen.getByText("Create a New Room")).toBeVisible();
  });

  it("handles room creation", async () => {
    const cardSet = createMockCardSet({ name: "Set 1" });
    const contextState = createMockContextState({ cardSets: [cardSet] });

    let roomCreated = false;
    vi.mocked(getRooms).mockImplementation(() =>
      Promise.resolve(roomCreated ? [createMockRoom({ name: "My Room" })] : [])
    );
    vi.mocked(createRoom).mockImplementation(() => {
      roomCreated = true;
      return Promise.resolve();
    });

    const router = createMemoryRouter(TEST_ROUTES);
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.queryByText("My Room")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Create Room"));

    await userEvent.type(screen.getByLabelText("Room Name"), "My Room");
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));

    expect(screen.queryByText("Create a New Room")).not.toBeInTheDocument();
    expect(createRoom).toHaveBeenCalledWith("My Room", {
      cardSetName: "Set 1",
    });
    expect(screen.getByText("My Room")).toBeInTheDocument();
  });

  it("opens edit modal", async () => {
    const cardSet = createMockCardSet({ name: "Set 1" });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({ name: "My Room" });

    vi.mocked(getRooms).mockResolvedValue([room]);

    const router = createMemoryRouter(TEST_ROUTES);
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.queryByText("Edit Room 'My Room'")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Edit Room"));

    expect(screen.getByText("Edit Room 'My Room'")).toBeVisible();
  });

  it("handles room editing", async () => {
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const cardSet2 = createMockCardSet({ name: "Set 2" });
    const contextState = createMockContextState({
      cardSets: [cardSet1, cardSet2],
    });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet1.name,
    });

    vi.mocked(getRooms).mockResolvedValue([room]);
    vi.mocked(editRoom).mockImplementation(() => Promise.resolve());

    const router = createMemoryRouter(TEST_ROUTES);
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    await userEvent.click(screen.getByText("Edit Room"));

    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 2");
    await userEvent.click(screen.getByText("Edit"));

    expect(screen.queryByText("Edit Room 'My Room'")).not.toBeInTheDocument();
    expect(editRoom).toHaveBeenCalledWith("My Room", {
      cardSetName: "Set 2",
    });
  });

  it("opens deletion modal", async () => {
    const room = createMockRoom({ name: "My Room" });

    vi.mocked(getRooms).mockResolvedValue([room]);

    const router = createMemoryRouter(TEST_ROUTES);
    render(<RouterProvider router={router} />);
    await waitForLoaderResolved();

    expect(screen.queryByText("Delete Room 'My Room'")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Delete Room"));

    expect(screen.getByText("Delete Room 'My Room'")).toBeVisible();
  });

  it("handles room deletion", async () => {
    const room = createMockRoom({ name: "My Room" });

    let roomDeleted = false;
    vi.mocked(getRooms).mockImplementation(() =>
      Promise.resolve(roomDeleted ? [] : [room])
    );
    vi.mocked(deleteRoom).mockImplementation(() => {
      roomDeleted = true;
      return Promise.resolve();
    });

    const router = createMemoryRouter(TEST_ROUTES);
    render(<RouterProvider router={router} />);
    await waitForLoaderResolved();

    expect(screen.getByText("My Room")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Delete Room"));

    await userEvent.click(screen.getByText("Permanently Delete This Room"));

    expect(screen.queryByText("Delete Room 'My Room'")).not.toBeInTheDocument();
    expect(deleteRoom).toHaveBeenCalledWith("My Room");
    expect(screen.queryByText("My Room")).not.toBeInTheDocument();
  });

  it("joins room", async () => {
    const room = createMockRoom({ name: "My Room 😁" });

    vi.mocked(getRooms).mockResolvedValue([room]);

    const MockRoomView: FC = () => {
      const { roomName } = useParams();

      return <span>Welcome to: {roomName}</span>;
    };
    const router = createMemoryRouter([
      ...TEST_ROUTES,
      {
        path: "/rooms/:roomName",
        element: <MockRoomView />,
      },
    ]);
    render(<RouterProvider router={router} />);
    await waitForLoaderResolved();

    await userEvent.click(screen.getByText("My Room 😁"));

    expect(screen.getByText("Welcome to: My Room 😁")).toBeVisible();
  });
});
