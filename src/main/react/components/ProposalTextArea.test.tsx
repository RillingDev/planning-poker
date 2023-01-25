import { fireEvent, render, screen } from "@testing-library/react";
import { ProposalTextArea } from "./ProposalTextArea";


describe("ProposalTextArea", () => {
	it("delegates input", () => {
		let actualNewValue;
		render(<ProposalTextArea
			value={"foo"}
			onChange={(newValue) => actualNewValue = newValue}
			loadProposals={() => Promise.resolve([])}
		/>);

		const input = screen.getByText("foo");
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue("foo");

		fireEvent.change(input, {target: {value: "bar"}});

		expect(input).toHaveValue("bar");
		expect(actualNewValue).toBe("bar");
	});

	it("loads suggestion", async () => {
		const loadProposals = () => Promise.resolve([{key: "a", content: "bar"}, {key: "b", content: "bazz"}]);
		render(<ProposalTextArea
			value={"foo"}
			onChange={() => ({})}
			loadProposals={loadProposals}
		/>);

		fireEvent.change(screen.getByText("foo"), {target: {value: "b"}});

		await screen.findByText("bar");

		expect(screen.getByText("bar")).toBeInTheDocument();
		expect(screen.getByText("bazz")).toBeInTheDocument();
	});

	it("allows clicking suggestion", async () => {
		let actualNewValue;
		const loadProposals = () => Promise.resolve([{key: "a", content: "bar"}, {key: "b", content: "bazz"}]);
		render(<ProposalTextArea
			value={"foo"}
			onChange={(newValue) => actualNewValue = newValue}
			loadProposals={loadProposals}
		/>);

		fireEvent.change(screen.getByText("foo"), {target: {value: "b"}});

		await screen.findByText("bar");

		fireEvent.click(screen.getByText("bar"));

		expect(actualNewValue).toBe("bar");

		expect(screen.queryByText("bazz")).not.toBeInTheDocument();
	});
});
