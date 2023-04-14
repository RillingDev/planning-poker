import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import {
  clearVotes,
  editRoom,
  getRoom,
  getSummary,
  joinRoom,
  leaveRoom,
} from "../api";
import {
  createMockCard,
  createMockCardSet,
  createMockContextState,
  createMockRoom,
  createMockRoomMember,
  createMockVoteSummary,
} from "../test/dataFactory";
import { loader, RoomView } from "./RoomView";
import {
  createMemoryRouter,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { AppContext } from "../AppContext";
import userEvent from "@testing-library/user-event";

vi.mock("../api");

const TEST_ROUTES: RouteObject[] = [
  {
    path: "/rooms/:roomName",
    element: <RoomView />,
    loader: loader,
  },
];

function waitForLoaderResolved(): Promise<unknown> {
  return waitFor(() => screen.getByText("My Room"));
}

describe("RoomView", () => {
  it("shows room", async () => {
    const cardSet = createMockCardSet({ name: "My Set" });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      topic: "My Topic",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(joinRoom).toHaveBeenCalledWith("My Room");
    expect(getRoom).toHaveBeenCalledWith("My Room");
    expect(screen.getByText("My Room")).toBeInTheDocument();
    expect(screen.getByText("My Topic")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows placeholder for empty topic", async () => {
    const cardSet = createMockCardSet({ name: "My Set" });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      topic: null,
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("shows voting elements if voting is open", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
      cards: [createMockCard({ name: "Card 1" })],
    });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(getSummary).not.toHaveBeenCalled();
    expect(screen.queryByText("Nearest Card:")).not.toBeInTheDocument();
  });

  it("shows summary elements if voting is not open", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
      cards: [createMockCard({ name: "Card 1" })],
    });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: true,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);
    vi.mocked(getSummary).mockResolvedValue({
      votes: createMockVoteSummary({}),
    });

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.queryByText("Card 1")).not.toBeInTheDocument();
    expect(getSummary).toHaveBeenCalledWith("My Room");
    expect(screen.getByText("Nearest Card:")).toBeInTheDocument();
  });

  it("leaves room", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
    });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(leaveRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(
      [
        ...TEST_ROUTES,
        {
          path: "/",
          element: <h1>Home Page</h1>,
        },
      ],
      {
        initialEntries: ["/rooms/My Room"],
      }
    );
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    await userEvent.click(screen.getByText("Back to Room List"));

    expect(leaveRoom).toHaveBeenCalledWith("My Room");
    expect(screen.getByText("Home Page")).toBeVisible();
  });

  it("restarts voting", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
      cards: [createMockCard({ name: "Card 1" })],
    });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getSummary).mockResolvedValue({
      votes: createMockVoteSummary({}),
    });

    let votingClosed = true;
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          cardSetName: cardSet.name,
          votingClosed: votingClosed,
          members: [createMockRoomMember({ username: "John Doe" })],
        })
      )
    );
    vi.mocked(clearVotes).mockImplementation(() => {
      votingClosed = false;
      return Promise.resolve();
    });

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.getByText("Nearest Card:")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Restart"));

    expect(clearVotes).toHaveBeenCalledWith("My Room");
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.queryByText("Nearest Card:")).not.toBeInTheDocument();
  });

  it("opens edit modal", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
    });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "John Doe" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
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
    const cardSet1 = createMockCardSet({
      name: "Set 1",
      cards: [createMockCard({ name: "Card 1" })],
    });
    const cardSet2 = createMockCardSet({
      name: "Set 2",
      cards: [createMockCard({ name: "Card 2" })],
    });
    const contextState = createMockContextState({
      cardSets: [cardSet1, cardSet2],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());

    let roomEdited = false;
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          topic: roomEdited ? "Custom Topic" : null,
          cardSetName: (roomEdited ? cardSet2 : cardSet1).name,
          votingClosed: false,
          members: [createMockRoomMember({ username: "John Doe" })],
        })
      )
    );
    vi.mocked(editRoom).mockImplementation(() => {
      roomEdited = true;
      return Promise.resolve();
    });

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>
    );
    await waitForLoaderResolved();

    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.queryByText("Card 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Custom Topic")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Edit Room"));

    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 2");
    await userEvent.type(screen.getByLabelText("Topic"), "Custom Topic");
    await userEvent.click(screen.getByText("Edit"));

    expect(screen.queryByText("Edit Room 'My Room'")).not.toBeInTheDocument();
    expect(editRoom).toHaveBeenCalledWith("My Room", {
      cardSetName: "Set 2",
      topic: "Custom Topic",
    });
    expect(screen.queryByText("Card 1")).not.toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
    expect(screen.getByText("Custom Topic")).toBeInTheDocument();
  });

  it("shows extensions", async () => {
    // TODO
  });

  it("handles member actions", async () => {
    // TODO
  });

  it("handles clicking a card", async () => {
    // TODO
  });

  it("disables clicking a card for observer", async () => {
    // TODO
  });
});
