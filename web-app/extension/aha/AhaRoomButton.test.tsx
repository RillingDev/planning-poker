import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedObject, vi } from "vitest";
import { createRoom } from "../../test/dataFactory";
import { Extension } from "../Extension";
import { ahaExtension } from "./AhaExtension";
import { AhaRoomButton } from "./AhaRoomButton";
import type { AhaClient } from "./api";

type MockClient = MockedObject<AhaClient>;

vi.mock("./AhaExtension", () => {
	class MockAhaExtension implements Extension {
		key = "aha";
		label = "Aha!";

		#client = {
			getIdea: vi.fn(),
			getIdeasForProduct: vi.fn(),
			putIdeaScore: vi.fn()
		};

		RoomComponent = vi.fn();
		SubmitComponent = vi.fn();

		getClient(): Promise<MockClient> {
			return Promise.resolve(this.#client);
		}

		static extractIdeaId(val: string): string | null {
			if (val.startsWith("X")) {
				return null;
			}
			return val;
		}
	}

	const mockAhaExtension = new MockAhaExtension();

	return {ahaExtension: mockAhaExtension, AhaExtension: MockAhaExtension};
});

describe("AhaRoomButton", () => {

	let ahaClient: MockClient;
	beforeEach(async () => {
		ahaClient = vi.mocked(await ahaExtension.getClient());
	});

	it("shows button", () => {
		render(<AhaRoomButton
			room={createRoom({})}
			onChange={vi.fn()}
		/>);

		expect(screen.getByText("Load from Aha!")).toBeInTheDocument();

		// Hidden by default
		expect(screen.queryByText("Import Idea")).not.toBeInTheDocument();
	});

	it("shows modal", async () => {
		render(<AhaRoomButton
			room={createRoom({})}
			onChange={vi.fn()}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		expect(screen.getByText("Import Idea")).toBeInTheDocument();
	});

	it("validates to have a valid ID", async () => {
		render(<AhaRoomButton
			room={createRoom({})}
			onChange={vi.fn()}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
		await userEvent.type(input, "X");

		expect(input.validity.valid).toBe(false);
		expect(input.validity.customError).toBe(true);
		expect(ahaClient.getIdea).not.toBeCalled();
	});

	it("validates that a matching idea exists", async () => {
		ahaClient.getIdea.mockResolvedValue(null);

		render(<AhaRoomButton
			room={createRoom({})}
			onChange={vi.fn()}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
		await userEvent.type(input, "ABC-I-123");

		await waitFor(() => expect(screen.getByText("Loading Idea")).not.toBeVisible());

		expect(screen.getByText("Preview")).not.toBeVisible();
		expect(input.validity.valid).toBe(false);
		expect(input.validity.customError).toBe(true);
		expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", ["name", "reference_num"]);
	});

	it("shows matching idea", async () => {
		vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockImplementation(ideaId => {
			if (ideaId === "ABC-I-123") {
				return Promise.resolve({
					idea: {
						id: "123", product_id: "456", reference_num: "ABC-I-123", name: "Foo"
					}
				});
			}
			return Promise.resolve(null);
		});

		render(<AhaRoomButton
			room={createRoom({})}
			onChange={vi.fn()}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
		await userEvent.type(input, "ABC-I-123");

		await waitFor(() => expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument());

		expect(screen.getByText("Preview")).toBeVisible();
		expect(screen.getByText("Loading Idea")).not.toBeVisible();
		expect(input.validity.valid).toBe(true);
		expect(ahaClient.getIdea).toHaveBeenCalledWith("ABC-I-123", ["name", "reference_num"]);
	});

	it("submits idea", async () => {
		vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockImplementation(ideaId => {
			if (ideaId === "ABC-I-123") {
				return Promise.resolve({
					idea: {
						id: "123", product_id: "456", reference_num: "ABC-I-123", name: "Foo"
					}
				});
			}
			return Promise.resolve(null);
		});

		const onChange = vi.fn();
		render(<AhaRoomButton
			room={createRoom({})}
			onChange={onChange}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
		await userEvent.type(input, "ABC-I-123");

		await waitFor(() => expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument());

		await userEvent.click(screen.getByText("Import Idea"));

		expect(onChange).toHaveBeenCalledWith({topic: "ABC-I-123: Foo"});
	});


	it("clears idea after submit", async () => {
		vi.mocked(ahaClient.getIdea<"name" | "reference_num">).mockImplementation(ideaId => {
			if (ideaId === "ABC-I-123") {
				return Promise.resolve({
					idea: {
						id: "123", product_id: "456", reference_num: "ABC-I-123", name: "Foo"
					}
				});
			}
			return Promise.resolve(null);
		});

		const onChange = vi.fn();
		render(<AhaRoomButton
			room={createRoom({})}
			onChange={onChange}
		/>);

		await userEvent.click(screen.getByText("Load from Aha!"));

		const input = screen.getByLabelText<HTMLInputElement>("Aha! URL/ID");
		await userEvent.type(input, "ABC-I-123");

		await waitFor(() => expect(screen.getByText("ABC-I-123: Foo")).toBeInTheDocument());

		await userEvent.click(screen.getByText("Import Idea"));

		await userEvent.click(screen.getByText("Load from Aha!"));

		expect(input.value).toBe("");
		expect(screen.getByText("Loading Idea")).not.toBeVisible();
		expect(screen.getByText("Preview")).not.toBeVisible();
	});
});
