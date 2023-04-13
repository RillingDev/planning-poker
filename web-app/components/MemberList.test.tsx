import { render, screen } from "@testing-library/react";
import { Role } from "../model";
import { createMockCard, createMockRoomMember } from "../test/dataFactory";
import { MemberList } from "./MemberList";

describe("MemberList", () => {
  it("shows members", () => {
    const roomMember1 = createMockRoomMember({ username: "John Doe" });
    const roomMember2 = createMockRoomMember({ username: "Alice" });

    render(
      <MemberList members={[roomMember1, roomMember2]} onAction={() => ({})} />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows role", () => {
    const roomMember1 = createMockRoomMember({
      username: "John Doe",
      role: Role.VOTER,
    });
    const roomMember2 = createMockRoomMember({
      username: "Alice",
      role: Role.OBSERVER,
    });

    render(
      <MemberList members={[roomMember1, roomMember2]} onAction={() => ({})} />
    );

    expect(screen.getByText("Voter")).toBeInTheDocument();
    expect(screen.getByText("Observer")).toBeInTheDocument();
  });

  it("shows vote", () => {
    const roomMember1 = createMockRoomMember({
      username: "John Doe",
      vote: createMockCard({ name: "Coffee" }),
    });
    const roomMember2 = createMockRoomMember({
      username: "Alice",
      vote: createMockCard({ name: "?" }),
    });

    render(
      <MemberList members={[roomMember1, roomMember2]} onAction={() => ({})} />
    );

    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
