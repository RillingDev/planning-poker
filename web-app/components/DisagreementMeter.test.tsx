import { render, screen } from "@testing-library/react";
import { DisagreementMeter } from "./DisagreementMeter";


describe("DisagreementMeter", () => {
	it("shows none disagreement", () => {
		render(<DisagreementMeter offset={0}/>);

		expect(screen.getByText("None! 🎉")).toBeInTheDocument();
	});

	it("shows low disagreement", () => {
		render(<DisagreementMeter offset={1}/>);

		expect(screen.getByText("Low")).toBeInTheDocument();
	});


	it("shows medium disagreement", () => {
		render(<DisagreementMeter offset={2}/>);

		expect(screen.getByText("Medium")).toBeInTheDocument();
	});

	it("shows high disagreement", () => {
		render(<DisagreementMeter offset={3}/>);

		expect(screen.getByText("High")).toBeInTheDocument();
	});
});
