import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedObject, vi } from "vitest";
import { getExtensionRoomConfig } from "../../api";
import { createRoom, createVoteSummary } from "../../test/dataFactory";
import { ahaExtension } from "./AhaExtension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import type { AhaClient } from "./api";
import { AhaRoomConfig } from "./api";

vi.mock("./AhaExtension");

vi.mock("../../api", () => {
	return {
		getExtensionRoomConfig: vi.fn(),
		editExtensionRoomConfig: vi.fn(),
	};
});

describe("AhaSubmissionModal", () => {

	let ahaClient: MockedObject<AhaClient>;
	beforeEach(async () => {
		ahaClient = vi.mocked(await ahaExtension.getClient());
	});

	it("shows button", () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.9})}
		/>);

		expect(screen.getByText("Save to Aha!")).toBeInTheDocument();

		// Hidden by default
		expect(screen.queryByText("Submit")).not.toBeInTheDocument();
	});

	it("hides button if topic is not in the right syntax", () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "X"})}
			voteSummary={createVoteSummary({average: 10.9})}
		/>);

		expect(screen.getByText("Save to Aha!")).not.toBeVisible();
	});

	it("shows modal", async () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.9})}
		/>);

		await userEvent.click(screen.getByText("Save to Aha!"));

		expect(screen.getByText("Submit")).toBeInTheDocument();
	});


	it("shows error when idea loading fails", async () => {
		vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue(null);

		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.9})}
		/>);

		await userEvent.click(screen.getByText("Save to Aha!"));

		await waitFor(() => expect(screen.getByText("Loading Idea")).not.toBeVisible());

		expect(screen.getByText("Could not find idea 'ABC-I-123'.")).toBeInTheDocument();
		expect(screen.getByText("Submit")).toBeDisabled();
	});

	it("loads idea", async () => {
		vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockResolvedValue({
			idea: {
				id: "123", product_id: "456", reference_num: "ABC-I-123", name: "Foo"
			}
		});
		vi.mocked(ahaClient.getIdeasForProduct<"score_facts">).mockResolvedValue({
			ideas: [],
			pagination: {
				total_records: 0,
				total_pages: 0,
				current_page: 1,
			}
		});
		vi.mocked(getExtensionRoomConfig<AhaRoomConfig>).mockResolvedValue({scoreFactName: null});

		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.9})}
		/>);

		await userEvent.click(screen.getByText("Save to Aha!"));

		await waitFor(() => expect(screen.getByText("Loading Idea")).not.toBeVisible());

		expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument();
		// Rounded score
		expect(screen.getAllByDisplayValue("11")).toBeInTheDocument();
		expect(screen.getByText("Submit")).toBeEnabled();
	});


});
