import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mocked, vi } from "vitest";
import { createMockRoom } from "../../test/dataFactory";
import { DeleteRoomModal } from "./DeleteRoomModal";

describe("DeleteRoomModal", () => {
  it("shows room name", () => {
    const room = createMockRoom({ name: "My Room" });

    render(
      <DeleteRoomModal
        show={true}
        onSubmit={() => ({})}
        onHide={() => ({})}
        room={room}
      />
    );

    expect(screen.getByText("Delete Room 'My Room'")).toBeInTheDocument();
  });

  it("submits", async () => {
    const onSubmit: Mocked<() => void> = vi.fn();
    const room = createMockRoom({ name: "My Room" });

    render(
      <DeleteRoomModal
        show={true}
        onSubmit={onSubmit}
        onHide={() => ({})}
        room={room}
      />
    );

    await userEvent.click(screen.getByText("Permanently Delete This Room"));

    expect(onSubmit).toHaveBeenCalled();
  });
});
