import { extractIdeaId } from "./utils";

describe("extractIdeaId", () => {
	it("extracts", () => {
		expect(extractIdeaId("foo")).toBeNull();
		expect(extractIdeaId("ABC-1")).toBe("ABC-1");
		expect(extractIdeaId("ABC-I-6790")).toBe("ABC-I-6790");
		expect(extractIdeaId("A1-I-108")).toBe("A1-I-108");
		expect(extractIdeaId("https://example.aha.io/features/ABC-I-108")).toBe("ABC-I-108");
		expect(extractIdeaId("https://example.aha.io/ideas/ideas/ABC-I-645")).toBe("ABC-I-645");
		expect(extractIdeaId("https://example.aha.io/reports/saved/all")).toBeNull();
	});
});
