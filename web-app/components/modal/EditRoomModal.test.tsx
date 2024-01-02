import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, Mocked, vi } from "vitest";
import { AppContext } from "../../AppContext.ts";
import { RoomEditOptions } from "../../model.ts";
import {
  createMockCardSet,
  createMockContextState,
  createMockExtension,
  createMockRoom,
} from "../../test/dataFactory.tsx";
import { EditRoomModal } from "./EditRoomModal.tsx";

describe("EditRoomModal", () => {
  it("shows card sets", () => {
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const cardSet2 = createMockCardSet({ name: "Set 2" });
    const room = createMockRoom({ name: "Room", cardSetName: cardSet1.name });

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet1, cardSet2] })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={() => ({})}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );

    expect(screen.getByText("Set 1")).toBeInTheDocument();
    expect(screen.getByText("Set 2")).toBeInTheDocument();
  });

  it("prefills current", () => {
    const extension = createMockExtension({
      key: "mockExtension",
      label: "Mock Extension",
    });
    const cardSet = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({
      name: "Room",
      cardSetName: cardSet.name,
      topic: "Foo!",
      extensions: ["mockExtension"],
    });

    render(
      <AppContext.Provider
        value={createMockContextState({
          cardSets: [cardSet],
          enabledExtensions: [extension],
        })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={() => ({})}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );

    expect(screen.getByLabelText("Card Set")).toHaveValue("Set 1");
    expect(screen.getByLabelText("Topic")).toHaveValue("Foo!");
    expect(screen.getByLabelText("Mock Extension")).toBeChecked();
  });

  it("changes card sets", async () => {
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const cardSet2 = createMockCardSet({ name: "Set 2" });
    const room = createMockRoom({ name: "Room", cardSetName: cardSet1.name });
    const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet1, cardSet2] })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 2");
    await userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      cardSetName: "Set 2",
      extensions: undefined,
      topic: undefined,
    });
  });

  it("changes topic", async () => {
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({ name: "Room", cardSetName: cardSet1.name });
    const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet1] })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Topic"), "Bar?");
    await userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      cardSetName: undefined,
      extensions: undefined,
      topic: "Bar?",
    });
  });

  it("enables extensions", async () => {
    const extension = createMockExtension({
      key: "mockExtension",
      label: "Mock Extension",
    });
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({
      name: "Room",
      cardSetName: cardSet1.name,
      extensions: [],
    });
    const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

    render(
      <AppContext.Provider
        value={createMockContextState({
          cardSets: [cardSet1],
          enabledExtensions: [extension],
        })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );
    const extensionCheckbox =
      screen.getByLabelText<HTMLInputElement>("Mock Extension");
    expect(extensionCheckbox).not.toBeChecked();
    await userEvent.click(extensionCheckbox);
    expect(extensionCheckbox).toBeChecked();
    await userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      cardSetName: undefined,
      extensions: ["mockExtension"],
      topic: undefined,
    });
  });

  it("disables extensions", async () => {
    const extension = createMockExtension({
      key: "mockExtension",
      label: "Mock Extension",
    });
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({
      name: "Room",
      cardSetName: cardSet1.name,
      extensions: ["mockExtension"],
    });
    const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

    render(
      <AppContext.Provider
        value={createMockContextState({
          cardSets: [cardSet1],
          enabledExtensions: [extension],
        })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );
    const extensionCheckbox =
      screen.getByLabelText<HTMLInputElement>("Mock Extension");
    expect(extensionCheckbox).toBeChecked();
    await userEvent.click(extensionCheckbox);
    expect(extensionCheckbox).not.toBeChecked();
    await userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      cardSetName: undefined,
      extensions: [],
      topic: undefined,
    });
  });

  it("changes multiple", async () => {
    const extension = createMockExtension({
      key: "mockExtension",
      label: "Mock Extension",
    });
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({
      name: "Room",
      cardSetName: cardSet1.name,
      extensions: [],
    });
    const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

    render(
      <AppContext.Provider
        value={createMockContextState({
          cardSets: [cardSet1],
          enabledExtensions: [extension],
        })}
      >
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={() => ({})}
        />
      </AppContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Topic"), "Bar?");
    await userEvent.click(
      screen.getByLabelText<HTMLInputElement>("Mock Extension"),
    );
    await userEvent.click(screen.getByText("Submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      cardSetName: undefined,
      extensions: ["mockExtension"],
      topic: "Bar?",
    });
  });

  it("resets contents upon open", async () => {
    const extension = createMockExtension({
      key: "mockExtension",
      label: "Mock Extension",
    });
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const contextState = createMockContextState({
      cardSets: [cardSet1],
      enabledExtensions: [extension],
    });
    const room = createMockRoom({
      name: "Room",
      cardSetName: cardSet1.name,
      topic: "Foo!",
    });
    const onSubmit = () => ({});
    const onHide = () => ({});

    const { rerender } = render(
      <AppContext.Provider value={contextState}>
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={onHide}
        />
      </AppContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Topic"), "Bar?");

    rerender(
      <AppContext.Provider value={contextState}>
        <EditRoomModal
          show={false}
          room={room}
          onSubmit={onSubmit}
          onHide={onHide}
        />
      </AppContext.Provider>,
    );
    rerender(
      <AppContext.Provider value={contextState}>
        <EditRoomModal
          show={true}
          room={room}
          onSubmit={onSubmit}
          onHide={onHide}
        />
      </AppContext.Provider>,
    );

    expect(screen.getByLabelText("Topic")).toHaveValue("Foo!");
  });
});
