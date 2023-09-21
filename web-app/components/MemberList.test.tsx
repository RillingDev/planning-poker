import { render, screen } from "@testing-library/react";
import { EditAction, Role } from "../model";
import {
  createMockCard,
  createMockContextState,
  createMockRoomMember,
} from "../test/dataFactory";
import { MemberList } from "./MemberList";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { AppContext } from "../AppContext";

describe("MemberList", () => {
  it("shows members", () => {
    const roomMember1 = createMockRoomMember({ username: "Bob" });
    const roomMember2 = createMockRoomMember({ username: "Alice" });

    render(
      <MemberList members={[roomMember1, roomMember2]} onAction={() => ({})} />,
    );

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows voter role", () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.VOTER,
    });
    render(<MemberList members={[roomMember]} onAction={() => ({})} />);

    expect(screen.getByText("Voter")).toBeInTheDocument();
  });

  it("shows observer role", () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.OBSERVER,
    });
    render(<MemberList members={[roomMember]} onAction={() => ({})} />);

    expect(screen.getByText("Observer")).toBeInTheDocument();
  });

  it("shows vote", () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      vote: createMockCard({ name: "Coffee" }),
    });

    render(<MemberList members={[roomMember]} onAction={() => ({})} />);

    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  it("sets to observer", async () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.VOTER,
    });

    const onAction = vi.fn();

    render(<MemberList members={[roomMember]} onAction={onAction} />);

    await userEvent.click(screen.getByLabelText("Edit Member"));

    const setObserverButton = screen.getByText("Set to Observer");
    expect(setObserverButton).not.toHaveClass("disabled");
    await userEvent.click(setObserverButton);

    expect(onAction).toHaveBeenCalledWith(roomMember, EditAction.SET_OBSERVER);
  });

  it("blocks setting to observer if already observer", async () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.OBSERVER,
    });

    render(<MemberList members={[roomMember]} onAction={() => ({})} />);

    await userEvent.click(screen.getByLabelText("Edit Member"));

    expect(screen.getByText("Set to Observer")).toHaveClass("disabled");
  });

  it("sets to voter", async () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.OBSERVER,
    });

    const onAction = vi.fn();

    render(<MemberList members={[roomMember]} onAction={onAction} />);

    await userEvent.click(screen.getByLabelText("Edit Member"));

    const setVoterButton = screen.getByText("Set to Voter");
    expect(setVoterButton).not.toHaveClass("disabled");
    await userEvent.click(setVoterButton);

    expect(onAction).toHaveBeenCalledWith(roomMember, EditAction.SET_VOTER);
  });

  it("blocks setting to voter if already voter", async () => {
    const roomMember = createMockRoomMember({
      username: "Bob",
      role: Role.VOTER,
    });

    render(<MemberList members={[roomMember]} onAction={() => ({})} />);

    await userEvent.click(screen.getByLabelText("Edit Member"));

    expect(screen.getByText("Set to Voter")).toHaveClass("disabled");
  });

  it("kicking member", async () => {
    const otherMember = createMockRoomMember({
      username: "Bob",
      role: Role.VOTER,
    });

    const onAction = vi.fn();

    const appContextState = createMockContextState({
      user: { username: "Me" }, // Not part of members in this case to make testing easier.
    });
    render(
      <AppContext.Provider value={appContextState}>
        <MemberList members={[otherMember]} onAction={onAction} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByLabelText("Edit Member"));

    const kickButton = screen.getByText("Kick");
    expect(kickButton).not.toHaveClass("disabled");
    await userEvent.click(kickButton);

    expect(onAction).toHaveBeenCalledWith(otherMember, EditAction.KICK);
  });

  it("blocks kicking yourself", async () => {
    const thisMember = createMockRoomMember({
      username: "Me",
      role: Role.VOTER,
    });

    const appContextState = createMockContextState({
      user: { username: thisMember.username },
    });
    render(
      <AppContext.Provider value={appContextState}>
        <MemberList members={[thisMember]} onAction={() => ({})} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByLabelText("Edit Member"));

    expect(screen.getByText("Kick")).toHaveClass("disabled");
  });
});
