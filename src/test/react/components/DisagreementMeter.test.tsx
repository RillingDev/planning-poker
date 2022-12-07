import { render, screen } from "@testing-library/react";
import { DisagreementMeter } from "../../../main/react/components/DisagreementMeter";


describe("DisagreementMeter", () => {
	it("shows low disagreement", () => {
		render(<DisagreementMeter offset={0}/>);
		expect(screen.getByText("Low")).toBeInTheDocument();
	});

	it("shows medium disagreement", () => {
		render(<DisagreementMeter offset={2}/>);
		expect(screen.getByText("Medium")).toBeInTheDocument();
	});

	it("shows high disagreement", () => {
		render(<DisagreementMeter offset={100}/>);
		expect(screen.getByText("High")).toBeInTheDocument();
	});
});
