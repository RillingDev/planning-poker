import { render, screen } from "@testing-library/react";
import { Role, RoomMember } from "../api";
import { MemberList } from "./MemberList";


describe("MemberList", () => {
	it("shows members", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: null}, {username: "Alice", role: Role.VOTER, vote: null}];

		render(<MemberList members={members} onAction={() => ({})}/>);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Alice")).toBeInTheDocument();
	});

	it("shows role", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: null}, {
			username: "Alice",
			role: Role.OBSERVER,
			vote: null
		}];

		render(<MemberList members={members} onAction={() => ({})}/>);

		expect(screen.getByText("VOTER")).toBeInTheDocument();
		expect(screen.getByText("OBSERVER")).toBeInTheDocument();
	});

	it("shows vote", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: {name: "Coffee", value: 1, description: null}}, {
			username: "Alice",
			role: Role.OBSERVER,
			vote: {name: "?", value: null, description: null}
		}];

		render(<MemberList members={members} onAction={() => ({})}/>);

		expect(screen.getByText("Coffee")).toBeInTheDocument();
		expect(screen.getByText("?")).toBeInTheDocument();
	});
});
