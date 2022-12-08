import { render, screen } from "@testing-library/react";
import { AppContext } from "../AppContext";
import { Header } from "./Header";


describe("Header", () => {
	it("title is visible", () => {
		render(<AppContext.Provider value={{user: {username: "John Doe"}, cardSets: [], extensions: []}}><Header/></AppContext.Provider>);
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});
});