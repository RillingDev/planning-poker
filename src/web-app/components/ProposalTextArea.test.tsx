import { fireEvent, render, screen } from "@testing-library/react";
import { ProposalTextArea } from "./ProposalTextArea";


describe("ProposalTextArea", () => {
	it("delegates input", () => {
		let value = "foo";
		const component = <ProposalTextArea
			value={value}
			onChange={(newValue) => value = newValue}
			loadProposals={() => Promise.resolve([])}
		/>;
		render(component);

		const input = screen.getByText("foo");
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue("foo");

		fireEvent.change(input, {target: {value: "bar"}});

		expect(value).toBe("bar");
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
		let value = "foo";
		const loadProposals = () => Promise.resolve([{key: "a", content: "bar"}, {key: "b", content: "bazz"}]);
		render(<ProposalTextArea
			value={value}
			onChange={(newValue) => value = newValue}
			loadProposals={loadProposals}
		/>);

		fireEvent.change(screen.getByText("foo"), {target: {value: "b"}});

		await screen.findByText("bar");

		fireEvent.click(screen.getByText("bar"));

		expect(value).toBe("bar");

		expect(screen.queryByText("bazz")).not.toBeInTheDocument();
	});
});
