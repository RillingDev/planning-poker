import { render, screen } from "@testing-library/react";
import { AppContext } from "../AppContext";
import { ExtensionManager } from "../extension/ExtensionManager";
import { Header } from "./Header";


describe("Header", () => {
	it("title is visible", () => {
		render(<AppContext.Provider value={{
			user: {username: "John Doe"},
			cardSets: [],
			extensionManager: new ExtensionManager([])
		}}><Header/></AppContext.Provider>);
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});
});