import { render, screen } from "@testing-library/react";
import { ErrorPanel } from "./ErrorPanel";

describe("ErrorPanel", () => {
	it("shows error message", () => {
		const error = new Error("oh no!");

		render(<ErrorPanel error={error} onClose={() => ({})}/>);

		expect(screen.getByText("oh no!")).toBeInTheDocument();
	});
});