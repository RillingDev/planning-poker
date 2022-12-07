import { render, screen } from "@testing-library/react";
import { Card, VoteSummary } from "../../../main/react/api";
import { DisagreementMeter } from "../../../main/react/components/DisagreementMeter";


const card: Card = {name: "Foo", value: 1};

describe("DisagreementMeter", () => {
	it("shows low disagreement", () => {
		const voteSummary: VoteSummary = {
			average: 0,
			highestVote: card,
			highestVoters: [],
			lowestVote: card,
			lowestVoters: [],
			nearestCard: card,
			offset: 0
		};
		render(<DisagreementMeter voteSummary={voteSummary}/>);
		expect(screen.getByText("Low")).toBeInTheDocument();
	});

	it("shows medium disagreement", () => {
		const voteSummary: VoteSummary = {
			average: 0,
			highestVote: card,
			highestVoters: [],
			lowestVote: card,
			lowestVoters: [],
			nearestCard: card,
			offset: 2
		};
		render(<DisagreementMeter voteSummary={voteSummary}/>);
		expect(screen.getByText("Medium")).toBeInTheDocument();
	});

	it("shows high disagreement", () => {
		const voteSummary: VoteSummary = {
			average: 0,
			highestVote: card,
			highestVoters: [],
			lowestVote: card,
			lowestVoters: [],
			nearestCard: card,
			offset: 100
		};
		render(<DisagreementMeter voteSummary={voteSummary}/>);
		expect(screen.getByText("High")).toBeInTheDocument();
	});
});
