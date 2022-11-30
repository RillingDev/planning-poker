import { render, screen } from "@testing-library/react";
import { AppContext } from "../../../main/react/AppContext";
import { Header } from "../../../main/react/components/Header";

describe("Simple working test", () => {
	it("the title is visible", () => {
		render(<AppContext.Provider value={{user: {username: "John Doe"}, cardSets: []}}><Header/></AppContext.Provider>);
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});
});
