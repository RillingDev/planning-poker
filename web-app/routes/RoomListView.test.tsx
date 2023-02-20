import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData } from "react-router";
import { vi } from "vitest";
import { getRooms } from "../api";
import { createRoom } from "../test/dataFactory";
import { loader, RoomListView } from "./RoomListView";

// Could probably be avoided by setting up a test-router, but that seems to not work in node ATM.
vi.mock("react-router", async (importOriginal) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mod: any = await importOriginal();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return {
		...mod,
		useLoaderData: vi.fn(),
	};
});

vi.mock("../api");


describe("RoomListView", () => {

	it("loader loads", async () => {
		const room1 = createRoom({name: "My Room"});
		const room2 = createRoom({name: "Some Other Room"});
		vi.mocked(getRooms).mockResolvedValue([room1, room2]);

		const loaderResult = await loader();
		expect(loaderResult.rooms).toEqual([room1, room2]);
	});

	it("lists rooms", () => {
		const room1 = createRoom({name: "My Room"});
		const room2 = createRoom({name: "Some Other Room"});
		vi.mocked(useLoaderData).mockReturnValue({rooms: [room1, room2]});

		render(<RoomListView/>, {wrapper: MemoryRouter});

		expect(screen.getByText("My Room")).toBeInTheDocument();
		expect(screen.getByText("Some Other Room")).toBeInTheDocument();
	});
});
