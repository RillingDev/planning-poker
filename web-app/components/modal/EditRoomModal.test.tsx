import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mocked, vi } from "vitest";
import { RoomEditOptions } from "../../api";
import { AppContext } from "../../AppContext";
import { ExtensionManager } from "../../extension/ExtensionManager";
import { createCardSet, createContextState, createRoom } from "../../test/dataFactory";
import { EditRoomModal } from "./EditRoomModal";


describe("EditRoomModal", () => {
	it("shows card sets", () => {
		const cardSet1 = createCardSet({name: "Set 1"});
		const cardSet2 = createCardSet({name: "Set 2"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name});

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1, cardSet2]})}>
				<EditRoomModal show={true} room={room} onSubmit={() => ({})} onHide={() => ({})}/>
			</AppContext.Provider>
		);

		expect(screen.getByText("Set 1")).toBeInTheDocument();
		expect(screen.getByText("Set 2")).toBeInTheDocument();
	});

	it("prefills current", () => {
		const extensionManager = new ExtensionManager(["aha"]);
		const cardSet = createCardSet({name: "Set 1"});
		const room = createRoom({name: "Room", cardSetName: cardSet.name, topic: "Foo!", extensions: ["aha"]});

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet], extensionManager: extensionManager})}>
				<EditRoomModal show={true} room={room} onSubmit={() => ({})} onHide={() => ({})}/>
			</AppContext.Provider>
		);

		expect(screen.getByLabelText("Card Set")).toHaveValue("Set 1");
		expect(screen.getByLabelText("Topic")).toHaveValue("Foo!");
		expect(screen.getByLabelText("Aha!")).toBeChecked();
	});

	it("changes card sets", async () => {
		const cardSet1 = createCardSet({name: "Set 1"});
		const cardSet2 = createCardSet({name: "Set 2"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name});
		const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1, cardSet2]})}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={() => ({})}/>
			</AppContext.Provider>
		);
		await userEvent.selectOptions(screen.getByLabelText("Card Set"), "Set 2");
		await userEvent.click(screen.getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith({cardSetName: "Set 2", extensions: undefined, topic: undefined});
	});

	it("changes topic", async () => {
		const cardSet1 = createCardSet({name: "Set 1"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name});
		const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1]})}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={() => ({})}/>
			</AppContext.Provider>
		);
		await userEvent.type(screen.getByLabelText("Topic"), "Bar?");
		await userEvent.click(screen.getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith({cardSetName: undefined, extensions: undefined, topic: "Bar?"});
	});

	it("enables extensions", async () => {
		const extensionManager = new ExtensionManager(["aha"]);
		const cardSet1 = createCardSet({name: "Set 1"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name, extensions: []});
		const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1], extensionManager})}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={() => ({})}/>
			</AppContext.Provider>
		);
		const ahaCheckbox = screen.getByLabelText<HTMLInputElement>("Aha!");
		expect(ahaCheckbox).not.toBeChecked();
		await userEvent.click(ahaCheckbox);
		expect(ahaCheckbox).toBeChecked();
		await userEvent.click(screen.getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith({cardSetName: undefined, extensions: ["aha"], topic: undefined});
	});

	it("disables extensions", async () => {
		const extensionManager = new ExtensionManager(["aha"]);
		const cardSet1 = createCardSet({name: "Set 1"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name, extensions: ["aha"]});
		const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1], extensionManager})}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={() => ({})}/>
			</AppContext.Provider>
		);
		const ahaCheckbox = screen.getByLabelText<HTMLInputElement>("Aha!");
		expect(ahaCheckbox).toBeChecked();
		await userEvent.click(ahaCheckbox);
		expect(ahaCheckbox).not.toBeChecked();
		await userEvent.click(screen.getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith({cardSetName: undefined, extensions: [], topic: undefined});
	});


	it("changes multiple", async () => {
		const extensionManager = new ExtensionManager(["aha"]);
		const cardSet1 = createCardSet({name: "Set 1"});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name, extensions: []});
		const onSubmit: Mocked<(changes: RoomEditOptions) => void> = vi.fn();

		render(
			<AppContext.Provider value={createContextState({cardSets: [cardSet1], extensionManager})}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={() => ({})}/>
			</AppContext.Provider>
		);
		await userEvent.type(screen.getByLabelText("Topic"), "Bar?");
		await userEvent.click(screen.getByLabelText<HTMLInputElement>("Aha!"));
		await userEvent.click(screen.getByText("Update"));

		expect(onSubmit).toHaveBeenCalledWith({cardSetName: undefined, extensions: ["aha"], topic: "Bar?"});
	});


	it("resets contents upon open", async () => {
		const extensionManager = new ExtensionManager(["aha"]);
		const cardSet1 = createCardSet({name: "Set 1"});
		const contextState = createContextState({cardSets: [cardSet1], extensionManager});
		const room = createRoom({name: "Room", cardSetName: cardSet1.name, topic: "Foo!"});
		const onSubmit = () => ({});
		const onHide = () => ({});

		const {rerender} = render(
			<AppContext.Provider value={contextState}>
				<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={onHide}/>
			</AppContext.Provider>
		);
		await userEvent.type(screen.getByLabelText("Topic"), "Bar?");

		rerender(<AppContext.Provider value={contextState}>
			<EditRoomModal show={false} room={room} onSubmit={onSubmit} onHide={onHide}/>
		</AppContext.Provider>);
		rerender(<AppContext.Provider value={contextState}>
			<EditRoomModal show={true} room={room} onSubmit={onSubmit} onHide={onHide}/>
		</AppContext.Provider>);

		expect(screen.getByLabelText("Topic")).toHaveValue("Foo!");
	});
});
