import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedObject, vi } from "vitest";
import { createRoom, createVoteSummary } from "../../test/dataFactory";
import { ahaExtension } from "./AhaExtension";
import { AhaSubmitButton } from "./AhaSubmitButton";
import type { AhaClient } from "./api";

vi.mock("./AhaExtension");

describe("AhaSubmissionModal", () => {

	let ahaClient: MockedObject<AhaClient>;
	beforeEach(async () => {
		ahaClient = vi.mocked(await ahaExtension.getClient());
	});

	it("shows button", () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.5})}
		/>);

		expect(screen.getByText("Save to Aha!")).toBeInTheDocument();

		// Hidden by default
		expect(screen.queryByText("Submit")).not.toBeInTheDocument();
	});

	it("hides button if topic is not in the right syntax", () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "X"})}
			voteSummary={createVoteSummary({average: 10.5})}
		/>);

		expect(screen.getByText("Save to Aha!")).not.toBeVisible();
	});

	it("shows modal", async () => {
		render(<AhaSubmitButton
			room={createRoom({topic: "ABC-I-123"})}
			voteSummary={createVoteSummary({average: 10.5})}
		/>);

		await userEvent.click(screen.getByText("Save to Aha!"));

		expect(screen.getByText("Submit")).toBeInTheDocument();
	});
});
