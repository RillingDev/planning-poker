import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  clearVotes,
  createVote,
  editMember,
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
  createMockExtension,
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
import { FC } from "react";
import { ExtensionManager } from "../extension/ExtensionManager";
import { EditAction, Role } from "../model";

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
      members: [createMockRoomMember({ username: "Bob" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
    );
    await waitForLoaderResolved();

    expect(joinRoom).toHaveBeenCalledWith("My Room");
    expect(getRoom).toHaveBeenCalledWith("My Room");
    expect(screen.getByText("My Room")).toBeInTheDocument();
    expect(screen.getByText("My Topic")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows placeholder for empty topic", async () => {
    const cardSet = createMockCardSet({ name: "My Set" });
    const contextState = createMockContextState({ cardSets: [cardSet] });
    const room = createMockRoom({
      name: "My Room",
      topic: "",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "Bob" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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
      members: [createMockRoomMember({ username: "Bob" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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
      members: [createMockRoomMember({ username: "Bob" })],
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
      </AppContext.Provider>,
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
      members: [createMockRoomMember({ username: "Bob" })],
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
      },
    );
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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

    let votingOpen = false;
    vi.mocked(clearVotes).mockImplementation(() => {
      votingOpen = true;
      return Promise.resolve();
    });
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          cardSetName: cardSet.name,
          votingClosed: !votingOpen,
          members: [createMockRoomMember({ username: "Bob" })],
        }),
      ),
    );

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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
      members: [createMockRoomMember({ username: "Bob" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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
    vi.mocked(editRoom).mockImplementation(() => {
      roomEdited = true;
      return Promise.resolve();
    });
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          topic: roomEdited ? "Custom Topic" : "",
          cardSetName: (roomEdited ? cardSet2 : cardSet1).name,
          votingClosed: false,
          members: [createMockRoomMember({ username: "Bob" })],
        }),
      ),
    );

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
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
    const MockRoomComponent: FC = () => {
      return <span>Mock Extension Room Component</span>;
    };
    const extension = createMockExtension({
      RoomComponent: MockRoomComponent,
      key: "mockExtension",
    });
    const extensionManager = new ExtensionManager([extension]);

    const cardSet = createMockCardSet({ name: "My Set" });
    const contextState = createMockContextState({
      cardSets: [cardSet],
      extensionManager,
    });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: false,
      extensions: ["mockExtension"],
      members: [createMockRoomMember({ username: "Bob" })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
    );
    await waitForLoaderResolved();

    expect(
      screen.getByText("Mock Extension Room Component"),
    ).toBeInTheDocument();
  });

  it("handles member actions", async () => {
    const cardSet = createMockCardSet({ name: "My Set" });
    const contextState = createMockContextState({
      cardSets: [cardSet],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());

    let memberEdited = false;
    vi.mocked(editMember).mockImplementation(() => {
      memberEdited = true;
      return Promise.resolve();
    });
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          cardSetName: cardSet.name,
          votingClosed: false,
          members: [
            createMockRoomMember({
              username: "Bob",
              role: memberEdited ? Role.VOTER : Role.OBSERVER,
            }),
          ],
        }),
      ),
    );

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
    );
    await waitForLoaderResolved();

    expect(screen.queryByText("Voter")).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Edit Member"));
    await userEvent.click(screen.getByText("Set to Voter"));

    expect(editMember).toHaveBeenCalledWith(
      "My Room",
      "Bob",
      EditAction.SET_VOTER,
    );
    expect(screen.getByText("Voter")).toBeInTheDocument();
  });

  it("handles clicking a card", async () => {
    const card = createMockCard({ name: "My Card" });
    const cardSet = createMockCardSet({
      name: "My Set",
      cards: [card],
    });
    const contextState = createMockContextState({
      cardSets: [cardSet],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());

    let voteCreated = false;
    vi.mocked(createVote).mockImplementation(() => {
      voteCreated = true;
      return Promise.resolve();
    });
    vi.mocked(getRoom).mockImplementation(() =>
      Promise.resolve(
        createMockRoom({
          name: "My Room",
          cardSetName: cardSet.name,
          votingClosed: false,
          members: [
            createMockRoomMember({
              username: "Bob",
              role: Role.VOTER,
              vote: voteCreated ? card : null,
            }),
          ],
        }),
      ),
    );

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
    );
    await waitForLoaderResolved();

    const myCard = screen.getByText("My Card");
    expect(myCard).toBeEnabled();
    expect(myCard).not.toHaveClass("active");

    await userEvent.click(myCard);

    expect(createVote).toHaveBeenCalledWith("My Room", "My Card");
    expect(myCard).toHaveClass("active");
  });

  it("disables clicking a card for observer", async () => {
    const cardSet = createMockCardSet({
      name: "My Set",
      cards: [createMockCard({ name: "My Card" })],
    });
    const contextState = createMockContextState({
      cardSets: [cardSet],
    });
    const room = createMockRoom({
      name: "My Room",
      cardSetName: cardSet.name,
      votingClosed: false,
      members: [createMockRoomMember({ username: "Bob", role: Role.OBSERVER })],
    });
    vi.mocked(joinRoom).mockImplementation(() => Promise.resolve());
    vi.mocked(getRoom).mockResolvedValue(room);

    const router = createMemoryRouter(TEST_ROUTES, {
      initialEntries: ["/rooms/My Room"],
    });
    render(
      <AppContext.Provider value={contextState}>
        <RouterProvider router={router} />
      </AppContext.Provider>,
    );
    await waitForLoaderResolved();

    expect(screen.getByText("My Card")).toBeDisabled();
  });
});
