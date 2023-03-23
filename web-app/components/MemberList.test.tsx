import { render, screen } from "@testing-library/react";
import { Role } from "../model";
import { createCard, createRoomMember } from "../test/dataFactory";
import { MemberList } from "./MemberList";


describe("MemberList", () => {
	it("shows members", () => {
		const roomMember1 = createRoomMember({username: "John Doe"});
		const roomMember2 = createRoomMember({username: "Alice"});

		render(<MemberList members={[roomMember1, roomMember2]} onAction={() => ({})}/>);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Alice")).toBeInTheDocument();
	});

	it("shows role", () => {
		const roomMember1 = createRoomMember({username: "John Doe", role: Role.VOTER});
		const roomMember2 = createRoomMember({username: "Alice", role: Role.OBSERVER});

		render(<MemberList members={[roomMember1, roomMember2]} onAction={() => ({})}/>);

		expect(screen.getByText("VOTER")).toBeInTheDocument();
		expect(screen.getByText("OBSERVER")).toBeInTheDocument();
	});

	it("shows vote", () => {
		const roomMember1 = createRoomMember({username: "John Doe", vote: createCard({name: "Coffee"})});
		const roomMember2 = createRoomMember({username: "Alice", vote: createCard({name: "?"})});

		render(<MemberList members={[roomMember1, roomMember2]} onAction={() => ({})}/>);

		expect(screen.getByText("Coffee")).toBeInTheDocument();
		expect(screen.getByText("?")).toBeInTheDocument();
	});
});
