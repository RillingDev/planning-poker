import { render, screen } from "@testing-library/react";
import { Role, RoomMember } from "../../../main/react/api";
import { MemberList } from "../../../main/react/components/MemberList";


const noop = () => {
	// noop
};

describe("MemberList", () => {
	it("shows members", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: null}, {username: "Alice", role: Role.VOTER, vote: null}];

		render(<MemberList members={members} onAction={noop}/>);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Alice")).toBeInTheDocument();
	});

	it("shows role", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: null}, {
			username: "Alice",
			role: Role.OBSERVER,
			vote: null
		}];

		render(<MemberList members={members} onAction={noop}/>);

		expect(screen.getByText("VOTER")).toBeInTheDocument();
		expect(screen.getByText("OBSERVER")).toBeInTheDocument();
	});

	it("shows vote", () => {
		const members: RoomMember[] = [{username: "John Doe", role: Role.VOTER, vote: {name: "Coffee", value: 1}}, {
			username: "Alice",
			role: Role.OBSERVER,
			vote: {name: "?", value: null}
		}];

		render(<MemberList members={members} onAction={noop}/>);

		expect(screen.getByText("Coffee")).toBeInTheDocument();
		expect(screen.getByText("?")).toBeInTheDocument();
	});
});
