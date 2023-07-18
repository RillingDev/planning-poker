import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mocked, vi } from "vitest";
import { AppContext } from "../../AppContext";
import { Room, RoomCreationOptions } from "../../model";
import {
  createMockCardSet,
  createMockContextState,
  createMockRoom,
} from "../../test/dataFactory";
import { CreateRoomModal } from "./CreateRoomModal";

describe("CreateRoomModal", () => {
  it("shows card sets", () => {
    const cardSet1 = createMockCardSet({ name: "Set 1" });
    const cardSet2 = createMockCardSet({ name: "Set 2" });

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet1, cardSet2] })}
      >
        <CreateRoomModal
          show={true}
          existingRooms={[]}
          onSubmit={() => ({})}
          onHide={() => ({})}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );

    expect(screen.getByText("Set 1")).toBeInTheDocument();
    expect(screen.getByText("Set 2")).toBeInTheDocument();
  });

  it("blocks bad room name characters", async () => {
    const onSubmit = vi.fn();
    const cardSet = createMockCardSet({ name: "Set 1" });

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet] })}
      >
        <CreateRoomModal
          show={true}
          existingRooms={[]}
          onSubmit={onSubmit}
          onHide={() => ({})}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );
    const nameInput = screen.getByLabelText<HTMLInputElement>("Room Name");
    await userEvent.type(nameInput, "Room!%;");
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(nameInput.checkValidity()).toBe(false);
  });

  it("blocks duplicate room name", async () => {
    const onSubmit = vi.fn();
    const cardSet = createMockCardSet({ name: "Set 1" });
    const room = createMockRoom({ name: "My Room" });

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet] })}
      >
        <CreateRoomModal
          show={true}
          existingRooms={[room]}
          onSubmit={onSubmit}
          onHide={() => ({})}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );
    const nameInput = screen.getByLabelText<HTMLInputElement>("Room Name");
    await userEvent.type(nameInput, room.name);
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(nameInput.checkValidity()).toBe(false);
  });

  it("submits", async () => {
    const onSubmit: Mocked<
      (roomName: string, options: RoomCreationOptions) => void
    > = vi.fn();
    const cardSet = createMockCardSet({ name: "Set 1" });

    render(
      <AppContext.Provider
        value={createMockContextState({ cardSets: [cardSet] })}
      >
        <CreateRoomModal
          show={true}
          existingRooms={[]}
          onSubmit={onSubmit}
          onHide={() => ({})}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Room Name"), "My Room");
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));

    expect(onSubmit).toHaveBeenCalledWith("My Room", { cardSetName: "Set 1" });
  });

  it("resets contents", async () => {
    const onSubmit = () => ({});
    const onHide = () => ({});
    const existingRooms: Room[] = [];
    const cardSet = createMockCardSet({ name: "Set 1" });
    const contextState = createMockContextState({ cardSets: [cardSet] });

    const { rerender } = render(
      <AppContext.Provider value={contextState}>
        <CreateRoomModal
          show={true}
          existingRooms={existingRooms}
          onSubmit={onSubmit}
          onHide={onHide}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Room Name"), "My Room");
    await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 1");
    await userEvent.click(screen.getByText("Create"));
    rerender(
      <AppContext.Provider value={contextState}>
        <CreateRoomModal
          show={false}
          existingRooms={existingRooms}
          onSubmit={onSubmit}
          onHide={onHide}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );
    rerender(
      <AppContext.Provider value={contextState}>
        <CreateRoomModal
          show={true}
          existingRooms={existingRooms}
          onSubmit={onSubmit}
          onHide={onHide}
          ariaLabelledBy="someId"
        />
      </AppContext.Provider>,
    );

    expect(screen.getByLabelText("Room Name")).toHaveValue("");
    expect(screen.getByLabelText("Card Set")).toHaveValue("");
  });
});
